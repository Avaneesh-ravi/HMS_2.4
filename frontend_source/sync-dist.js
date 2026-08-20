import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distDir = path.resolve(__dirname, 'dist');
const frontendDir = path.resolve(__dirname, '../frontend');
const apiFrontendDir = path.resolve(__dirname, '../api/frontend');
const publicDir = path.resolve(__dirname, '../public');

if (!fs.existsSync(distDir)) {
  console.error('Error: dist directory does not exist. Run vite build first.');
  process.exit(1);
}

function cleanHashedAssets(targetAssetsDir) {
  if (!fs.existsSync(targetAssetsDir)) {
    fs.mkdirSync(targetAssetsDir, { recursive: true });
    return;
  }
  
  const files = fs.readdirSync(targetAssetsDir);
  for (const file of files) {
    const fullPath = path.join(targetAssetsDir, file);
    const stat = fs.statSync(fullPath);
    if (!stat.isDirectory()) {
      if (/^index-.*\.(js|css|map|svg|png|jpg|jpeg|webp)$/i.test(file)) {
        fs.unlinkSync(fullPath);
        console.log('Cleaned stale asset: ' + file + ' from ' + path.relative(process.cwd(), targetAssetsDir));
      }
    }
  }
}

function copyRecursive(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      copyRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// Clean old hashed assets
cleanHashedAssets(path.join(frontendDir, 'assets'));
cleanHashedAssets(path.join(apiFrontendDir, 'assets'));
cleanHashedAssets(path.join(publicDir, 'assets'));

// Copy fresh assets
const distAssets = path.join(distDir, 'assets');
if (fs.existsSync(distAssets)) {
  copyRecursive(distAssets, path.join(frontendDir, 'assets'));
  copyRecursive(distAssets, path.join(apiFrontendDir, 'assets'));
  copyRecursive(distAssets, path.join(publicDir, 'assets'));
  console.log('Copied fresh assets to frontend/assets, api/frontend/assets, and public/assets');
}

// Copy dist/index.html
const distIndexHtml = path.join(distDir, 'index.html');
if (fs.existsSync(distIndexHtml)) {
  fs.copyFileSync(distIndexHtml, path.join(frontendDir, 'index.html'));
  fs.copyFileSync(distIndexHtml, path.join(publicDir, 'index.html'));
  console.log('Updated frontend/index.html and public/index.html from dist/index.html');
}

console.log('Frontend sync completed successfully.');
