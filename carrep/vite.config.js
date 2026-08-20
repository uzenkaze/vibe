import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

function localDataServerPlugin() {
  return {
    name: 'carrep-local-data-server',
    configureServer(server) {
      server.middlewares.use('/api/carrep-data', (req, res, next) => {
        const url = new URL(req.url, `http://${req.headers.host}`);
        const filePathParam = url.searchParams.get('path');
        
        if (!filePathParam) {
          res.statusCode = 400;
          return res.end(JSON.stringify({ error: 'path parameter required' }));
        }

        const fileName = path.basename(filePathParam);
        const projectRootDir = path.resolve(__dirname, '..');
        const targetPath1 = path.resolve(__dirname, 'data', fileName);
        const targetPath2 = path.resolve(__dirname, 'public', 'data', fileName);
        const targetPath3 = path.resolve(projectRootDir, 'carrep', 'data', fileName);
        const targetPath4 = path.resolve(projectRootDir, 'deploy_dist', 'carrep', 'data', fileName);

        if (req.method === 'GET') {
          const checkPaths = [targetPath1, targetPath2, targetPath3, targetPath4];
          for (const p of checkPaths) {
            if (fs.existsSync(p)) {
              res.setHeader('Content-Type', 'application/json; charset=utf-8');
              return res.end(fs.readFileSync(p, 'utf-8'));
            }
          }
          res.statusCode = 404;
          return res.end(JSON.stringify({ error: 'file not found' }));
        }

        if (req.method === 'POST' || req.method === 'PUT') {
          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', () => {
            try {
              const parsed = JSON.parse(body);
              const formatted = JSON.stringify(parsed, null, 2);
              
              [targetPath1, targetPath2, targetPath3, targetPath4].forEach(p => {
                const dir = path.dirname(p);
                if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
                fs.writeFileSync(p, formatted, 'utf-8');
              });

              console.log(`[Local API] Successfully saved ${fileName} to local disk.`);
              res.setHeader('Content-Type', 'application/json; charset=utf-8');
              res.end(JSON.stringify({ success: true, path: fileName }));
            } catch (e) {
              res.statusCode = 500;
              res.end(JSON.stringify({ error: e.message }));
            }
          });
          return;
        }

        next();
      });
    }
  }
}

export default defineConfig({
  plugins: [react(), localDataServerPlugin()],
  base: './',
  build: {
    outDir: 'dist',
  }
})
