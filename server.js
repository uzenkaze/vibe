const http = require('http');
const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
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

const server = http.createServer(async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // Parse URL to get file path
  let parsedUrl = new URL(req.url, `http://${req.headers.host}`);
  const pathname = parsedUrl.pathname;

  // 1. API: Save Asset data (기존 API 유지)
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

  // 2. API: CarRep - Get reports list
  if (req.method === 'GET' && pathname === '/api/carrep/reports') {
    try {
      const reports = await prisma.report.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
          repairItems: true,
          attachedImages: true
        }
      });
      
      // format to match client structure
      const formatted = reports.map(r => ({
        id: isNaN(Number(r.id)) ? r.id : Number(r.id),
        createdAt: r.createdAt,
        vehicleInfo: {
          maker: r.maker,
          model: r.model,
          year: r.year,
          mileage: r.mileage || '',
          repairDate: r.repairDate || '',
          shopName: r.shopName || ''
        },
        repairItems: r.repairItems.map(it => ({
          id: isNaN(Number(it.id)) ? it.id : Number(it.id),
          name: it.name,
          category: it.category,
          partsCost: it.partsCost || '',
          laborCost: it.laborCost || '',
          note: it.note || ''
        })),
        attachedImages: r.attachedImages.map(img => ({
          id: isNaN(Number(img.id)) ? img.id : Number(img.id),
          name: img.name,
          dataUrl: img.dataUrl
        }))
      }));

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(formatted));
    } catch (e) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: e.message }));
    }
    return;
  }

  // 3. API: CarRep - Save report (Create or Update)
  if (req.method === 'POST' && pathname === '/api/carrep/reports') {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', async () => {
      try {
        const payload = JSON.parse(body);
        const { id, vehicleInfo, repairItems, attachedImages } = payload;

        if (!id || !vehicleInfo) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Missing report id or vehicle info' }));
          return;
        }

        const reportIdStr = id.toString();

        // Transaction: delete old report details if exists, then recreate everything
        await prisma.$transaction([
          prisma.repairItem.deleteMany({ where: { reportId: reportIdStr } }),
          prisma.attachedImage.deleteMany({ where: { reportId: reportIdStr } }),
          prisma.report.deleteMany({ where: { id: reportIdStr } }),
          prisma.report.create({
            data: {
              id: reportIdStr,
              maker: vehicleInfo.maker,
              model: vehicleInfo.model,
              year: Number(vehicleInfo.year),
              mileage: vehicleInfo.mileage ? Number(vehicleInfo.mileage) : null,
              repairDate: vehicleInfo.repairDate || null,
              shopName: vehicleInfo.shopName || null,
              repairItems: {
                create: (repairItems || []).map(it => ({
                  id: it.id.toString(),
                  name: it.name,
                  category: it.category,
                  partsCost: Number(it.partsCost || 0),
                  laborCost: Number(it.laborCost || 0),
                  note: it.note || null
                }))
              },
              attachedImages: {
                create: (attachedImages || []).map(img => ({
                  id: img.id.toString(),
                  name: img.name,
                  dataUrl: img.dataUrl
                }))
              }
            }
          })
        ]);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, message: 'Report saved successfully' }));
      } catch (e) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: e.message }));
      }
    });
    return;
  }

  // 4. API: CarRep - Delete report
  if (req.method === 'DELETE' && pathname.startsWith('/api/carrep/reports/')) {
    try {
      const reportId = pathname.substring('/api/carrep/reports/'.length);
      if (!reportId) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Report ID required' }));
        return;
      }
      
      // Cascade delete is handled by database foreign key constraint onDelete: Cascade
      await prisma.report.delete({
        where: { id: reportId.toString() }
      });

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, message: 'Report deleted successfully' }));
    } catch (e) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: e.message }));
    }
    return;
  }

  // 5. API: CarRep - Get my car profile
  if (req.method === 'GET' && pathname === '/api/carrep/mycar') {
    try {
      const myCar = await prisma.myCar.findUnique({
        where: { id: 1 }
      });
      
      if (!myCar) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(null));
        return;
      }

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        maker: myCar.maker,
        model: myCar.model,
        year: myCar.year,
        mileage: myCar.mileage || ''
      }));
    } catch (e) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: e.message }));
    }
    return;
  }

  // 6. API: CarRep - Save my car profile
  if (req.method === 'POST' && pathname === '/api/carrep/mycar') {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', async () => {
      try {
        const payload = JSON.parse(body);
        const { maker, model, year, mileage } = payload;
        
        if (!maker || !model || !year) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Maker, model and year are required' }));
          return;
        }

        const myCar = await prisma.myCar.upsert({
          where: { id: 1 },
          update: {
            maker,
            model,
            year: Number(year),
            mileage: mileage ? Number(mileage) : null
          },
          create: {
            id: 1,
            maker,
            model,
            year: Number(year),
            mileage: mileage ? Number(mileage) : null
          }
        });

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, myCar }));
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
