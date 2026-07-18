const fs = require('fs');
const path = require('path');

const srcDir = path.join('/Users/mac/Documents/sabilex', 'sabilex');
const destDir = '/Users/mac/Documents/sabilex';

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;
  content = content.replace(/SabiLex/g, 'SabiLex');
  content = content.replace(/sabilex/g, 'sabilex');
  content = content.replace(/Sabi<span/g, 'Sabi<span'); // For Navbar.tsx
  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${filePath}`);
  }
}

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    if (file === 'node_modules' || file === '.next' || file === '.git') continue;
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (stat.isFile() && !file.endsWith('.png') && !file.endsWith('.jpg') && !file.endsWith('.ico')) {
      replaceInFile(fullPath);
    }
  }
}

// 1. Replace contents
console.log('Replacing contents...');
processDirectory(srcDir);

// 2. Move files up
console.log('Moving files up to root...');
const items = fs.readdirSync(srcDir);
for (const item of items) {
  if (item === '.git') continue;
  const srcPath = path.join(srcDir, item);
  const destPath = path.join(destDir, item);
  
  if (fs.existsSync(destPath) && item !== '.git') {
    // If dest exists (e.g. maybe .env or .gitignore), we might need to overwrite or skip
    fs.rmSync(destPath, { recursive: true, force: true });
  }
  
  fs.renameSync(srcPath, destPath);
  console.log(`Moved ${item}`);
}

// 3. Remove the now-empty sabilex directory (except for .git if it was there)
const remaining = fs.readdirSync(srcDir);
if (remaining.length === 0) {
  fs.rmdirSync(srcDir);
  console.log('Removed empty sabilex directory.');
} else {
  console.log(`sabilex still contains: ${remaining.join(', ')}`);
}

console.log('Done!');
