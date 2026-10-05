const fs = require('fs');
const path = require('path');

const filesToCheck = ['index.html', 'styles.css', 'script.js', 'wedding-data.js'];
let allContent = '';
filesToCheck.forEach(f => {
  allContent += '\n' + fs.readFileSync(f, 'utf8');
});

// Find all assets/ references
const matches = allContent.match(/assets\/[a-zA-Z0-9_\-\.\/ %]+/g) || [];
const uniquePaths = Array.from(new Set(matches.map(m => m.trim().replace(/^['"]|['"]$/g, ''))));

console.log(`Checking ${uniquePaths.length} unique asset references across source code:`);
let missing = 0;
uniquePaths.forEach(p => {
  // Decode URL encoded characters if any
  const decoded = decodeURI(p);
  if (!fs.existsSync(decoded)) {
    console.error('❌ MISSING ASSET:', decoded);
    missing++;
  } else {
    const stat = fs.statSync(decoded);
    console.log(`✅ [${(stat.size/1024).toFixed(1)} KB] ${decoded}`);
  }
});

if (missing === 0) {
  console.log('\n🎉 ALL ASSETS EXIST WITH ZERO BROKEN REFERENCES!');
} else {
  console.error(`\n⚠️ Found ${missing} missing asset references.`);
  process.exit(1);
}
