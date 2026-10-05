const fs = require('fs');

const oldFiles = [
  'assets/images/invite-btn-pill.png',
  'assets/images/invite-input-pill.png',
  'assets/images/invite-card-bg.png',
  'assets/images/seal.png',
  'assets/images/envelope-seal.png',
  'assets/images/ganesh-hero.png',
  'assets/images/corner-ornament.png',
  'assets/images/hero-burgundy-bg.png',
  'assets/images/branch-gold.png',
  'assets/images/envelope-flap-ornate.png',
  'assets/images/marriage.png',
  'assets/images/mehendi.png',
  'assets/images/reception.png',
  'assets/images/rose-ivory.jpg',
  'assets/images/peony-red.jpg'
];

const sourceCode = [
  fs.readFileSync('index.html', 'utf8'),
  fs.readFileSync('styles.css', 'utf8'),
  fs.readFileSync('script.js', 'utf8'),
  fs.readFileSync('wedding-data.js', 'utf8')
].join('\n');

let removed = 0;
let bytes = 0;

oldFiles.forEach(file => {
  if (fs.existsSync(file)) {
    if (sourceCode.includes(file)) {
      console.warn('STILL REFERENCED, NOT DELETING:', file);
    } else {
      const s = fs.statSync(file).size;
      bytes += s;
      fs.unlinkSync(file);
      removed++;
      console.log(`Deleted (${(s/1024).toFixed(1)} KB): ${file}`);
    }
  }
});

console.log(`\nDeleted ${removed} superseded original image files (${(bytes/(1024*1024)).toFixed(2)} MB saved).`);
