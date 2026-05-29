/**
 * Copy livetv-app to deploy_dist/livetv with UTF-8 and cache bust.
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const srcDir = path.join(root, 'livetv-app');
const destDir = path.join(root, 'deploy_dist', 'livetv');
const timestamp = process.env.CACHE_BUST || new Date().toISOString().replace(/[-:T.Z]/g, '').slice(0, 14);

fs.mkdirSync(destDir, { recursive: true });
fs.mkdirSync(path.join(destDir, 'src'), { recursive: true });

for (const name of ['index.html', 'youtube.html', 'ytmusic.html']) {
  const src = path.join(srcDir, name);
  const dest = path.join(destDir, name);
  let text = fs.readFileSync(src, 'utf8');
  text = text.replace(/CACHE_BUST/g, timestamp);
  fs.writeFileSync(dest, text, 'utf8');
  const ok = fs.readFileSync(dest, 'utf8').includes('홈') || fs.readFileSync(dest, 'utf8').includes('유튜브');
  console.log(name, ok ? 'OK' : 'WARN', `(v=${timestamp})`);
}

const fav = path.join(srcDir, 'favicon.png');
if (fs.existsSync(fav)) {
  fs.copyFileSync(fav, path.join(destDir, 'favicon.png'));
}

function copyDirUtf8(fromDir, toDir) {
  fs.mkdirSync(toDir, { recursive: true });
  for (const name of fs.readdirSync(fromDir)) {
    const from = path.join(fromDir, name);
    const to = path.join(toDir, name);
    const stat = fs.statSync(from);
    if (stat.isDirectory()) {
      copyDirUtf8(from, to);
      continue;
    }
    if (/\.(js|css|html)$/.test(name)) {
      fs.writeFileSync(to, fs.readFileSync(from, 'utf8'), 'utf8');
    } else {
      fs.copyFileSync(from, to);
    }
  }
}

copyDirUtf8(path.join(srcDir, 'src'), path.join(destDir, 'src'));

console.log('livetv UTF-8 deploy copy done', timestamp);
