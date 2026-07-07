const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const PORT = 5500;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.mp3': 'audio/mpeg',
  '.mp4': 'video/mp4',
  '.m3u': 'text/plain; charset=utf-8',
  '.m3u8': 'application/vnd.apple.mpegurl',
  '.wav': 'audio/wav',
};

const DATA_DIR = path.join(__dirname, 'carrep', 'public', 'data');
const REPORTS_FILE = path.join(DATA_DIR, 'reports.json');
const MYCAR_FILE = path.join(DATA_DIR, 'mycar.json');

// Ensure data folder and empty JSON files exist
function ensureDataFiles() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(REPORTS_FILE)) {
    fs.writeFileSync(REPORTS_FILE, JSON.stringify([], null, 2), 'utf8');
  }
  if (!fs.existsSync(MYCAR_FILE)) {
    fs.writeFileSync(MYCAR_FILE, JSON.stringify(null, null, 2), 'utf8');
  }
}
ensureDataFiles();

// Helper to trigger Git sync and GitHub Pages deployment
function triggerGitSyncAndDeploy(message) {
  console.log('[Server] Triggering Git push & deploy for CarRep updates...');
  
  exec(`git add carrep/public/data/reports.json carrep/public/data/mycar.json && git commit -m "${message || 'chore(data): update CarRep JSON DB'}" && git push origin main`, (err, stdout, stderr) => {
    if (err) {
      console.error('[Server] Git sync error:', err);
    } else {
      console.log('[Server] Git sync success:', stdout);
    }
  });

  exec(`powershell -ExecutionPolicy Bypass -File ./deploy.ps1`, (err, stdout, stderr) => {
    if (err) {
      console.error('[Server] GitHub Pages deploy failed:', err);
    } else {
      console.log('[Server] GitHub Pages deploy successfully triggered');
    }
  });
}

const server = http.createServer((req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // Parse URL
  let parsedUrl = new URL(req.url, `http://${req.headers.host}`);
  const pathname = parsedUrl.pathname;

  // 1. API: Save Asset data (기존 API)
  if (req.method === 'POST' && pathname === '/api/save-asset') {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
      try {
        const payload = JSON.parse(body);
        const { year, data } = payload;
        if (!year || !data) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Missing year or data' }));
          return;
        }

        const dataDir = path.join(__dirname, 'asset', 'data');
        if (!fs.existsSync(dataDir)) {
          fs.mkdirSync(dataDir, { recursive: true });
        }
        
        const filePath = path.join(dataDir, `assetData_${year}.json`);
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
        console.log(`[Server] Saved asset data for ${year} to ${filePath}`);

        // git sync
        exec(`git add asset/data/assetData_${year}.json && git commit -m "chore(data): auto-update asset data for year ${year}" && git push origin main`, (err, stdout, stderr) => {
          if (err) console.error('[Server] Git sync error:', err);
        });

        // deploy
        exec(`powershell -ExecutionPolicy Bypass -File ./deploy.ps1`, (err, stdout, stderr) => {
          if (err) console.error('[Server] gh-pages deploy error:', err);
        });

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, message: 'Saved and syncing with git' }));
      } catch (e) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: e.message }));
      }
    });
    return;
  }

  // 2. API: CarRep - Get reports list from JSON File
  if (req.method === 'GET' && pathname === '/api/carrep/reports') {
    try {
      ensureDataFiles();
      const content = fs.readFileSync(REPORTS_FILE, 'utf8');
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(content);
    } catch (e) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: e.message }));
    }
    return;
  }

  // 3. API: CarRep - Save / Update report inside JSON File
  if (req.method === 'POST' && pathname === '/api/carrep/reports') {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
      try {
        ensureDataFiles();
        const newReport = JSON.parse(body);
        const { id, vehicleInfo } = newReport;

        if (!id || !vehicleInfo) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Missing report id or vehicle info' }));
          return;
        }

        const reports = JSON.parse(fs.readFileSync(REPORTS_FILE, 'utf8'));
        const idx = reports.findIndex(r => r.id === id);
        
        if (idx !== -1) {
          // Update
          reports[idx] = newReport;
        } else {
          // Create (Insert at start)
          reports.unshift(newReport);
        }

        fs.writeFileSync(REPORTS_FILE, JSON.stringify(reports, null, 2), 'utf8');
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, message: 'Report saved inside JSON database' }));

        triggerGitSyncAndDeploy(`chore(data): save repair report ${id}`);
      } catch (e) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: e.message }));
      }
    });
    return;
  }

  // 4. API: CarRep - Delete report from JSON File
  if (req.method === 'DELETE' && pathname.startsWith('/api/carrep/reports/')) {
    try {
      ensureDataFiles();
      const reportIdStr = pathname.substring('/api/carrep/reports/'.length);
      if (!reportIdStr) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Report ID required' }));
        return;
      }

      const targetId = isNaN(Number(reportIdStr)) ? reportIdStr : Number(reportIdStr);
      let reports = JSON.parse(fs.readFileSync(REPORTS_FILE, 'utf8'));
      const originalLen = reports.length;
      reports = reports.filter(r => r.id !== targetId);

      if (reports.length === originalLen) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Report not found' }));
        return;
      }

      fs.writeFileSync(REPORTS_FILE, JSON.stringify(reports, null, 2), 'utf8');
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, message: 'Report deleted from JSON database' }));

      triggerGitSyncAndDeploy(`chore(data): delete repair report ${targetId}`);
    } catch (e) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: e.message }));
    }
    return;
  }

  // 5. API: CarRep - Get my car profile from JSON File
  if (req.method === 'GET' && pathname === '/api/carrep/mycar') {
    try {
      ensureDataFiles();
      const content = fs.readFileSync(MYCAR_FILE, 'utf8');
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(content);
    } catch (e) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: e.message }));
    }
    return;
  }

  // 6. API: CarRep - Save my car profile to JSON File
  if (req.method === 'POST' && pathname === '/api/carrep/mycar') {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
      try {
        ensureDataFiles();
        const myCarData = JSON.parse(body);
        
        fs.writeFileSync(MYCAR_FILE, JSON.stringify(myCarData, null, 2), 'utf8');
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, myCar: myCarData }));

        triggerGitSyncAndDeploy('chore(data): update MyCar profile');
      } catch (e) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: e.message }));
      }
    });
    return;
  }

  // Static File Server
  let sanitizePath = path.normalize(pathname).replace(/^(\.\.[\/\\])+/, '');
  let filePath = path.join(__dirname, sanitizePath);
  
  fs.stat(filePath, (err, stats) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('404 Not Found');
      return;
    }

    if (stats.isDirectory()) {
      filePath = path.join(filePath, 'index.html');
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    fs.readFile(filePath, (error, content) => {
      if (error) {
        if (error.code === 'ENOENT') {
          res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
          res.end('404 Not Found');
        } else {
          res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
          res.end(`500 Internal Server Error: ${error.code}`);
        }
      } else {
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content, 'utf-8');
      }
    });
  });
});

server.listen(PORT, () => {
  console.log('\x1b[36m%s\x1b[0m', '==================================================');
  console.log('\x1b[32m%s\x1b[0m', `  Vibe Web Portal Server running at:`);
  console.log('\x1b[33m%s\x1b[0m', `  👉 http://localhost:${PORT}/`);
  console.log('\x1b[36m%s\x1b[0m', '==================================================');
});
