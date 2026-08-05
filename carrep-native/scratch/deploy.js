import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const rootDir = 'd:\\VibeCoding\\livetv-app';
const tempDir = path.join(rootDir, 'temp-deploy');
const targetAppDir = path.join(tempDir, 'livetv-app');
const targetVercelDir = path.join(tempDir, '.vercel');

function copyRecursiveSync(src, dest) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();
  if (isDirectory) {
    fs.mkdirSync(dest, { recursive: true });
    fs.readdirSync(src).forEach((childItemName) => {
      copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName));
    });
  } else {
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(src, dest);
  }
}

try {
  console.log('1. Cleaning old temp-deploy...');
  if (fs.existsSync(tempDir)) {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }

  console.log('2. Creating temp-deploy layout...');
  fs.mkdirSync(targetAppDir, { recursive: true });
  fs.mkdirSync(targetVercelDir, { recursive: true });

  console.log('3. Copying project files for deployment...');
  
  // .vercel은 부모 폴더(tempDir)의 .vercel로 복사
  const vercelSrc = path.join(rootDir, '.vercel');
  if (fs.existsSync(vercelSrc)) {
    console.log('Copying .vercel to temp-deploy/.vercel...');
    copyRecursiveSync(vercelSrc, targetVercelDir);
  }

  // 다른 코드 폴더 및 파일들은 temp-deploy/livetv-app 로 복사
  const foldersToCopy = ['api', 'src', 'public'];
  const filesToCopy = [
    'index.html', 'youtube.html', 'ytmusic.html',
    'package.json', 'package-lock.json', 'vercel.json', 'vite.config.js',
    'kr.m3u', 'urls.json'
  ];

  foldersToCopy.forEach(folder => {
    const srcPath = path.join(rootDir, folder);
    const destPath = path.join(targetAppDir, folder);
    if (fs.existsSync(srcPath)) {
      console.log(`Copying folder ${folder} to temp-deploy/livetv-app...`);
      copyRecursiveSync(srcPath, destPath);
    }
  });

  filesToCopy.forEach(file => {
    const srcPath = path.join(rootDir, file);
    const destPath = path.join(targetAppDir, file);
    if (fs.existsSync(srcPath)) {
      console.log(`Copying file ${file} to temp-deploy/livetv-app...`);
      fs.copyFileSync(srcPath, destPath);
    }
  });

  console.log('4. Running Vercel deployment in temp-deploy (linked via .vercel)...');
  execSync('npx vercel --prod --yes', {
    cwd: tempDir,
    stdio: 'inherit'
  });

  console.log('5. Vercel deployment completed successfully!');
} catch (err) {
  console.error('Deployment script failed:', err.message);
  process.exit(1);
} finally {
  console.log('6. Cleaning up temp-deploy directory...');
  if (fs.existsSync(tempDir)) {
    try {
      fs.rmSync(tempDir, { recursive: true, force: true });
      console.log('Cleanup finished.');
    } catch (cleanupErr) {
      console.warn('Failed to cleanup temp-deploy:', cleanupErr.message);
    }
  }
}
