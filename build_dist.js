const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Recursion Guard: Prevent infinite build loop if Vercel or child processes invoke build_dist.js again
if (process.env.BUILD_DIST_RUNNING) {
  console.log('>>> build_dist.js is already running, skipping recursive invocation.');
  process.exit(0);
}
process.env.BUILD_DIST_RUNNING = 'true';

const rootDir = __dirname;
const deployDir = path.join(rootDir, 'deploy_dist');

console.log('>>> Vercel / Cross-platform Integrated Build Start');

// 1. Clean deploy_dist
if (fs.existsSync(deployDir)) {
  fs.rmSync(deployDir, { recursive: true, force: true });
}
fs.mkdirSync(deployDir, { recursive: true });

function runCommand(cmd, cwd) {
  console.log(`> Running "${cmd}" in ${cwd}...`);
  execSync(cmd, { cwd, stdio: 'inherit' });
}

function copyRecursiveSync(src, dest) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();
  if (isDirectory) {
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    fs.readdirSync(src).forEach((childItemName) => {
      if (['node_modules', '.git', '.vscode', '.expo', 'temp-deploy'].includes(childItemName)) return;
      copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName));
    });
  } else if (exists) {
    const parentDir = path.dirname(dest);
    if (!fs.existsSync(parentDir)) fs.mkdirSync(parentDir, { recursive: true });
    fs.copyFileSync(src, dest);
  }
}

// 2. Templates for dev source index.html
const DEV_INDEX_TEMPLATES = {
  learn: `<!doctype html>
<html lang="ko">
<head>
  <script type="text/javascript">
    if (window.location.port === '5500' && window.self === window.top) {
      window.location.replace('/?p=learn/');
    }
  </script>
  <meta charset="UTF-8" />
  <link rel="icon" type="image/png" href="/favicon.png" />
  <link rel="apple-touch-icon" href="/favicon.png" />
  <meta name="theme-color" content="#0f1117" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
  <meta http-equiv="Pragma" content="no-cache" />
  <meta http-equiv="Expires" content="0" />
  <meta name="description" content="배움과 지식을 체계적으로 정리하고 관리하는 지식 관리 플랫폼" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
  <title>Hans's Knowledge</title>
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/src/main.tsx"></script>
</body>
</html>`,
  carrep: `<!doctype html>
<html lang="ko">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🔧</text></svg>" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
    <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
    <meta http-equiv="Pragma" content="no-cache" />
    <meta http-equiv="Expires" content="0" />
    <meta name="description" content="차량 정비 내역을 입력하면 수리 부위를 시각화하고 보고서를 자동 생성해주는 서비스입니다." />
    <title>CarRep — 차량 정비 보고서</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700;900&family=Inter:wght@400;600;700&family=Outfit:wght@400;700;900&display=swap" rel="stylesheet">
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>`,
  'asset-react': `<!doctype html>
<html lang="ko">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
    <meta http-equiv="Pragma" content="no-cache" />
    <meta http-equiv="Expires" content="0" />
    <title>Asset React</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>`
};

function ensureDevSourceIndexHtml(appName, dir) {
  const indexPath = path.join(dir, 'index.html');
  const template = DEV_INDEX_TEMPLATES[appName];
  if (!template) return;
  
  let needsReset = false;
  if (!fs.existsSync(indexPath)) {
    needsReset = true;
  } else {
    const content = fs.readFileSync(indexPath, 'utf-8');
    // If it contains compiled bundle references (e.g. index-XXXX.js), it is corrupted
    if (/index-[A-Za-z0-9_-]+\.(js|css)/.test(content) || !content.includes('/src/main.')) {
      needsReset = true;
    }
  }

  if (needsReset) {
    console.log(`> Resetting ${indexPath} to clean dev entry point...`);
    fs.writeFileSync(indexPath, template, 'utf-8');
  }
}

function buildApp(appName, dir) {
  ensureDevSourceIndexHtml(appName, dir);

  const nodeModulesDir = path.join(dir, 'node_modules');
  if (!fs.existsSync(nodeModulesDir)) {
    console.log(`> Installing dependencies in ${dir}...`);
    runCommand('npm install --no-audit --no-fund', dir);
  }
  
  // Run Vite build
  runCommand('npm run build', dir);

  // Restore dev source index.html after build so source repo stays clean
  ensureDevSourceIndexHtml(appName, dir);
}

// Execute builds with strict failure propagation
buildApp('learn', path.join(rootDir, 'learn'));
buildApp('asset-react', path.join(rootDir, 'asset', 'asset-react'));
buildApp('carrep', path.join(rootDir, 'carrep'));

// 3. Copy Learn dist
console.log('> Copying learn...');
if (fs.existsSync(path.join(rootDir, 'learn', 'docs'))) {
  copyRecursiveSync(path.join(rootDir, 'learn', 'docs'), path.join(deployDir, 'learn', 'docs'));
}
if (fs.existsSync(path.join(rootDir, 'learn', 'data.json'))) {
  fs.copyFileSync(path.join(rootDir, 'learn', 'data.json'), path.join(deployDir, 'learn', 'data.json'));
}
if (fs.existsSync(path.join(rootDir, 'learn', 'dist'))) {
  copyRecursiveSync(path.join(rootDir, 'learn', 'dist'), path.join(deployDir, 'learn'));
}

// 4. Copy CarRep dist
console.log('> Copying carrep...');
if (fs.existsSync(path.join(rootDir, 'carrep', 'data'))) {
  copyRecursiveSync(path.join(rootDir, 'carrep', 'data'), path.join(deployDir, 'carrep', 'data'));
}
if (fs.existsSync(path.join(rootDir, 'carrep', 'avatars'))) {
  copyRecursiveSync(path.join(rootDir, 'carrep', 'avatars'), path.join(deployDir, 'carrep', 'avatars'));
}
if (fs.existsSync(path.join(rootDir, 'carrep', 'dist'))) {
  copyRecursiveSync(path.join(rootDir, 'carrep', 'dist'), path.join(deployDir, 'carrep'));
}

// 5. Copy Asset & Asset-React dist
console.log('> Copying asset & asset-react dist...');
copyRecursiveSync(path.join(rootDir, 'asset'), path.join(deployDir, 'asset'));
if (fs.existsSync(path.join(rootDir, 'asset', 'asset-react', 'dist'))) {
  copyRecursiveSync(path.join(rootDir, 'asset', 'asset-react', 'dist'), path.join(deployDir, 'asset'));
  copyRecursiveSync(path.join(rootDir, 'asset', 'asset-react', 'dist'), path.join(deployDir, 'asset', 'asset-react', 'dist'));
}

// 6. Copy other static folders
const staticFolders = ['task', 'hobby', 'livetv'];
staticFolders.forEach(folder => {
  const srcPath = path.join(rootDir, folder);
  if (fs.existsSync(srcPath)) {
    console.log(`> Copying static folder ${folder}...`);
    copyRecursiveSync(srcPath, path.join(deployDir, folder));
  }
});

// 7. Copy Root Files
const rootFiles = ['index.html', 'home.html', '404.html', 'README.md'];
rootFiles.forEach(file => {
  const srcPath = path.join(rootDir, file);
  if (fs.existsSync(srcPath)) {
    fs.copyFileSync(srcPath, path.join(deployDir, file));
  }
});

if (fs.existsSync(path.join(rootDir, 'livetv-app'))) {
  fs.copyFileSync(path.join(rootDir, 'index.html'), path.join(rootDir, 'livetv-app', 'index.html'));
}
if (fs.existsSync(path.join(rootDir, 'livetv-app', 'api'))) {
  copyRecursiveSync(path.join(rootDir, 'livetv-app', 'api'), path.join(deployDir, 'api'));
}

fs.writeFileSync(path.join(deployDir, '.nojekyll'), '');

// Strict Validation of final deployment artifacts
function verifyDeploymentIndex(subPath) {
  const targetHtml = path.join(deployDir, subPath, 'index.html');
  if (!fs.existsSync(targetHtml)) {
    throw new Error(`[DEPLOY VERIFICATION FAILED] Missing ${targetHtml}`);
  }
  const content = fs.readFileSync(targetHtml, 'utf-8');
  if (content.includes('/src/main.')) {
    throw new Error(`[DEPLOY VERIFICATION FAILED] Uncompiled /src/main entry found in ${targetHtml}`);
  }
  console.log(`> Verified compiled deployment HTML: ${subPath}/index.html`);
}

verifyDeploymentIndex('learn');
verifyDeploymentIndex('carrep');

console.log('>>> Cross-platform Build Completed Successfully!');
