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

// 2. Build React/Vite Apps
function buildApp(dir) {
  const nodeModulesDir = path.join(dir, 'node_modules');
  if (!fs.existsSync(nodeModulesDir)) {
    console.log(`> Installing dependencies in ${dir}...`);
    runCommand('npm install --legacy-peer-deps --no-audit --no-fund', dir);
  }
  runCommand('npm run build', dir);
}

try {
  buildApp(path.join(rootDir, 'learn'));
} catch (e) { console.error('learn build failed:', e.message); }

try {
  buildApp(path.join(rootDir, 'asset', 'asset-react'));
} catch (e) { console.error('asset-react build failed:', e.message); }

try {
  buildApp(path.join(rootDir, 'carrep'));
} catch (e) { console.error('carrep build failed:', e.message); }

// 3. Copy Learn dist (and sync compiled index.html to root learn folder for Vercel static router)
console.log('> Copying learn...');
if (fs.existsSync(path.join(rootDir, 'learn', 'docs'))) {
  copyRecursiveSync(path.join(rootDir, 'learn', 'docs'), path.join(deployDir, 'learn', 'docs'));
}
if (fs.existsSync(path.join(rootDir, 'learn', 'data.json'))) {
  fs.copyFileSync(path.join(rootDir, 'learn', 'data.json'), path.join(deployDir, 'learn', 'data.json'));
}
if (fs.existsSync(path.join(rootDir, 'learn', 'dist'))) {
  copyRecursiveSync(path.join(rootDir, 'learn', 'dist'), path.join(deployDir, 'learn'));
  if (fs.existsSync(path.join(rootDir, 'learn', 'dist', 'index.html'))) {
    fs.copyFileSync(path.join(rootDir, 'learn', 'dist', 'index.html'), path.join(rootDir, 'learn', 'index.html'));
  }
}

// 4. Copy CarRep dist (and sync compiled index.html to root carrep folder for Vercel static router)
console.log('> Copying carrep...');
if (fs.existsSync(path.join(rootDir, 'carrep', 'data'))) {
  copyRecursiveSync(path.join(rootDir, 'carrep', 'data'), path.join(deployDir, 'carrep', 'data'));
}
if (fs.existsSync(path.join(rootDir, 'carrep', 'avatars'))) {
  copyRecursiveSync(path.join(rootDir, 'carrep', 'avatars'), path.join(deployDir, 'carrep', 'avatars'));
}
if (fs.existsSync(path.join(rootDir, 'carrep', 'dist'))) {
  copyRecursiveSync(path.join(rootDir, 'carrep', 'dist'), path.join(deployDir, 'carrep'));
  if (fs.existsSync(path.join(rootDir, 'carrep', 'dist', 'index.html'))) {
    fs.copyFileSync(path.join(rootDir, 'carrep', 'dist', 'index.html'), path.join(rootDir, 'carrep', 'index.html'));
  }
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

// Ensure livetv-app/index.html also points to index.html if Vercel serves livetv-app root
if (fs.existsSync(path.join(rootDir, 'livetv-app'))) {
  fs.copyFileSync(path.join(rootDir, 'index.html'), path.join(rootDir, 'livetv-app', 'index.html'));
}

// Copy API folder to deploy_dist if serverless needed or Vercel handles root api
if (fs.existsSync(path.join(rootDir, 'livetv-app', 'api'))) {
  copyRecursiveSync(path.join(rootDir, 'livetv-app', 'api'), path.join(deployDir, 'api'));
}

fs.writeFileSync(path.join(deployDir, '.nojekyll'), '');
console.log('>>> Cross-platform Build Completed Successfully!');
