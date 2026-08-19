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

function buildApp(appName, dir) {
  const sourceIndexPath = path.join(dir, 'index.html');
  const distIndexPath = path.join(dir, 'dist', 'index.html');

  // If source index.html was synced with compiled dist/index.html in a previous build,
  // we must check if vite build will fail due to pre-existing asset script links.
  // Replacing with clean dev script tag ONLY IF compiled asset is present.
  if (fs.existsSync(sourceIndexPath)) {
    let content = fs.readFileSync(sourceIndexPath, 'utf-8');
    if (content.includes('/assets/index') || content.includes('assets/index') || content.includes('./assets/')) {
      console.log(`> Restoring dev script tag in ${sourceIndexPath} before build...`);
      if (appName === 'learn') {
        content = content.replace(/<script type="module" crossorigin src="[^"]+"><\/script>/, '<script type="module" src="/src/main.tsx"></script>')
                         .replace(/<link rel="stylesheet" crossorigin href="[^"]+">/, '');
      } else {
        content = content.replace(/<script type="module" crossorigin src="[^"]+"><\/script>/, '<script type="module" src="/src/main.jsx"></script>')
                         .replace(/<link rel="stylesheet" crossorigin href="[^"]+">/, '');
      }
      fs.writeFileSync(sourceIndexPath, content, 'utf-8');
    }
  }

  const nodeModulesDir = path.join(dir, 'node_modules');
  if (!fs.existsSync(nodeModulesDir)) {
    console.log(`> Installing dependencies in ${dir}...`);
    runCommand('npm install --no-audit --no-fund', dir);
  }
  
  // Run Vite build
  runCommand('npm run build', dir);

  // Keep source index.html intact with dev script tag (/src/main.jsx or /src/main.tsx)
}

// Execute builds
buildApp('learn', path.join(rootDir, 'learn'));
buildApp('asset-react', path.join(rootDir, 'asset', 'asset-react'));
const assetReactDistIndex = path.join(rootDir, 'asset', 'asset-react', 'dist', 'index.html');
const assetRootIndex = path.join(rootDir, 'asset', 'index.html');
if (fs.existsSync(assetReactDistIndex)) {
  fs.copyFileSync(assetReactDistIndex, assetRootIndex);
  console.log(`> Synced ${assetReactDistIndex} -> ${assetRootIndex}`);
}
buildApp('carrep', path.join(rootDir, 'carrep'));

// 3. Copy Learn dist
console.log('> Copying learn...');
if (fs.existsSync(path.join(rootDir, 'learn', 'docs'))) {
  copyRecursiveSync(path.join(rootDir, 'learn', 'docs'), path.join(deployDir, 'learn', 'docs'));
}
if (fs.existsSync(path.join(rootDir, 'learn', 'dist'))) {
  copyRecursiveSync(path.join(rootDir, 'learn', 'dist'), path.join(deployDir, 'learn'));
}
if (fs.existsSync(path.join(rootDir, 'learn', 'data.json'))) {
  fs.copyFileSync(path.join(rootDir, 'learn', 'data.json'), path.join(deployDir, 'learn', 'data.json'));
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
const deployAssetDir = path.join(deployDir, 'asset');
if (!fs.existsSync(deployAssetDir)) fs.mkdirSync(deployAssetDir, { recursive: true });

if (fs.existsSync(path.join(rootDir, 'asset', 'data'))) {
  copyRecursiveSync(path.join(rootDir, 'asset', 'data'), path.join(deployAssetDir, 'data'));
}
['favicon.svg', 'favicon.png', 'asset_character.jpg'].forEach(f => {
  const p = path.join(rootDir, 'asset', f);
  if (fs.existsSync(p)) fs.copyFileSync(p, path.join(deployAssetDir, f));
});

if (fs.existsSync(path.join(rootDir, 'asset', 'asset-react', 'dist'))) {
  copyRecursiveSync(path.join(rootDir, 'asset', 'asset-react', 'dist'), deployAssetDir);
  copyRecursiveSync(path.join(rootDir, 'asset', 'asset-react', 'dist'), path.join(deployAssetDir, 'asset-react', 'dist'));
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
const rootFiles = ['index.html', 'home.html', '404.html', 'README.md', 'asset_character.jpg'];
rootFiles.forEach(file => {
  const srcPath = path.join(rootDir, file);
  if (!fs.existsSync(srcPath)) {
    // Check inside asset/ directory as fallback
    const assetFallback = path.join(rootDir, 'asset', file);
    if (fs.existsSync(assetFallback)) {
      fs.copyFileSync(assetFallback, path.join(deployDir, file));
    }
  } else {
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

console.log('>>> Cross-platform Build Completed Successfully!');
