const http = require('http');
const fs = require('fs');
const path = require('path');

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

const server = http.createServer((req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // Parse URL to get file path
  let parsedUrl = new URL(req.url, `http://${req.headers.host}`);
  
  // API handler for saving asset data
  if (req.method === 'POST' && parsedUrl.pathname === '/api/save-asset') {
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

        // git auto commit & push
        const { exec } = require('child_process');
        exec(`git add asset/data/assetData_${year}.json && git commit -m "chore(data): auto-update asset data for year ${year}" && git push origin main`, (err, stdout, stderr) => {
          if (err) {
            console.error('[Server] Git sync error:', err);
          } else {
            console.log('[Server] Git sync success:', stdout);
          }
        });

        // gh-pages deploy in background
        exec(`powershell -ExecutionPolicy Bypass -File ./deploy.ps1`, (err, stdout, stderr) => {
          if (err) {
            console.error('[Server] gh-pages deploy error:', err);
          } else {
            console.log('[Server] gh-pages deploy success');
          }
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

  let sanitizePath = path.normalize(parsedUrl.pathname).replace(/^(\.\.[\/\\])+/, '');
  
  // If requesting root or directory, fallback to index.html
  let filePath = path.join(__dirname, sanitizePath);
  
  fs.stat(filePath, (err, stats) => {
    if (err) {
      // Return 404
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
