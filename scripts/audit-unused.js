const fs = require('fs');
const path = require('path');

function getFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      getFiles(filePath, fileList);
    } else {
      fileList.push(filePath);
    }
  });
  return fileList;
}

const sourceCode = [
  fs.readFileSync('index.html', 'utf8'),
  fs.readFileSync('styles.css', 'utf8'),
  fs.readFileSync('script.js', 'utf8'),
  fs.readFileSync('wedding-data.js', 'utf8'),
  fs.existsSync('admin/index.html') ? fs.readFileSync('admin/index.html', 'utf8') : '',
  fs.existsSync('admin/admin.css') ? fs.readFileSync('admin/admin.css', 'utf8') : '',
  fs.existsSync('admin/admin.js') ? fs.readFileSync('admin/admin.js', 'utf8') : ''
].join('\n');

const allAssetFiles = getFiles('assets');

const unusedCandidates = [];

allAssetFiles.forEach(file => {
  const relPath = file.replace(/\\/g, '/');
  const baseName = path.basename(file);
  const ext = path.extname(file).toLowerCase();
  
  // Exclude webp versions of gallery and petals which we know will be used
  const isWebp = ext === '.webp';
  const isReferencedByPath = sourceCode.includes(relPath) || sourceCode.includes(encodeURI(relPath));
  const isReferencedByName = sourceCode.includes(baseName) || sourceCode.includes(encodeURI(baseName));
  
  if (!isReferencedByPath && !isReferencedByName) {
    unusedCandidates.push({
      path: relPath,
      sizeKB: (fs.statSync(file).size / 1024).toFixed(1),
      sizeBytes: fs.statSync(file).size
    });
  }
});

console.log('Unused candidates count:', unusedCandidates.length);
let totalBytes = 0;
unusedCandidates.forEach(c => {
  totalBytes += c.sizeBytes;
  console.log(c.sizeKB.padStart(8) + ' KB | ' + c.path);
});
console.log('Total reclaimable:', (totalBytes / (1024 * 1024)).toFixed(2), 'MB');
