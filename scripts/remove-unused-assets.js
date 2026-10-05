const fs = require('fs');
const path = require('path');

const filesToRemove = [
  'assets/1.mp4',
  'assets/images/1 (2).png',
  'assets/images/2 (2).png',
  'assets/images/3 (2).png',
  'assets/images/4 (2).png',
  'assets/images/5 (2).png',
  'assets/images/card.png',
  'assets/images/ChatGPT Image Sep 26, 2026, 01_25_56 PM-4.png',
  'assets/images/ChatGPT Image Sep 26, 2026, 06_39_52 PM.png',
  'assets/images/ChatGPT Image Sep 26, 2026, 06_39_57 PM.png',
  'assets/images/closed envelop.png',
  'assets/images/envelope-seal-is-backup.png',
  'assets/images/full card.png',
  'assets/images/ganesh-hero.png.png',
  'assets/images/glow.png',
  'assets/images/invite-btn-bg.png',
  'assets/images/invite-card-bg.backup.png',
  'assets/images/invite-input-bg.png',
  'assets/images/left part.png',
  'assets/images/marriage.jpg',
  'assets/images/mehendi.jpg',
  'assets/images/open envelop.png',
  'assets/images/Petal Shower/ChatGPT Image Sep 26, 2026, 07_01_35 PM-1.png',
  'assets/images/Petal Shower/ChatGPT Image Sep 26, 2026, 07_01_37 PM-2.png',
  'assets/images/Petal Shower/ChatGPT Image Sep 26, 2026, 07_01_39 PM-3.png',
  'assets/images/Petal Shower/ChatGPT Image Sep 26, 2026, 07_01_40 PM-4.png',
  'assets/images/Petal Shower/ChatGPT Image Sep 26, 2026, 07_01_42 PM-5.png',
  'assets/images/Petal Shower/ChatGPT Image Sep 26, 2026, 07_01_43 PM-6.png',
  'assets/images/Petal Shower/ChatGPT Image Sep 26, 2026, 07_01_45 PM-7.png',
  'assets/images/Petal Shower/ChatGPT Image Sep 26, 2026, 07_01_46 PM-8.png',
  'assets/images/reception.jpg',
  'assets/images/right part.png',
  'assets/images/seal break.png',
  'assets/images/top part.png',
  'assets/images/wax-seal.svg',
  'assets/images/wedding-card.png',
  // Old large PNG petals (replaced by WebP petals)
  'assets/images/Petal Shower/petal-1.png',
  'assets/images/Petal Shower/petal-2.png',
  'assets/images/Petal Shower/petal-3.png',
  'assets/images/Petal Shower/petal-4.png',
  'assets/images/Petal Shower/petal-5.png',
  'assets/images/Petal Shower/petal-6.png',
  'assets/images/Petal Shower/petal-7.png',
  'assets/images/Petal Shower/petal-8.png',
  // Old large gallery JPEGs (replaced by WebP gallery)
  'assets/images/gallery/1.jpeg',
  'assets/images/gallery/2.jpeg',
  'assets/images/gallery/4.jpeg',
  'assets/images/gallery/5.jpeg',
  'assets/images/gallery/6.jpeg',
  'assets/images/gallery/7.jpeg',
  'assets/images/gallery/9.jpeg',
  'assets/images/gallery/10.jpeg',
  'assets/images/gallery/11.jpeg',
  'assets/images/gallery/14.jpeg',
  'assets/images/gallery/15.jpeg',
  'assets/images/gallery/16.jpeg',
  'assets/images/gallery/17.jpeg',
  'assets/images/gallery/18.jpeg',
  'assets/images/gallery/19.jpeg',
  'assets/images/gallery/20.jpeg',
  'assets/images/gallery/21.jpeg',
  'assets/images/gallery/25.jpeg',
  'assets/images/gallery/27.jpeg',
  'assets/images/gallery/28.jpeg',
  'assets/images/gallery/30.jpeg',
  'assets/images/gallery/31.jpeg',
  'assets/images/gallery/32.jpeg',
  'assets/images/gallery/36.jpeg',
  'assets/images/gallery/37.jpeg',
  'assets/images/gallery/38.jpeg',
  'assets/images/gallery/39.jpeg',
  'assets/images/gallery/40.jpeg',
  'assets/images/gallery/41.jpeg',
  'assets/images/gallery/42.jpeg',
  'assets/images/gallery/43.jpeg',
  'assets/images/gallery/44.jpeg',
  'assets/images/gallery/45.jpeg',
  'assets/images/gallery/46.jpeg'
];

let removedCount = 0;
let totalReclaimedBytes = 0;

filesToRemove.forEach(file => {
  if (fs.existsSync(file)) {
    const size = fs.statSync(file).size;
    totalReclaimedBytes += size;
    fs.unlinkSync(file);
    removedCount++;
    console.log(`Deleted (${(size / 1024).toFixed(1)} KB): ${file}`);
  }
});

console.log(`\nRemoved ${removedCount} files.`);
console.log(`Total space saved: ${(totalReclaimedBytes / (1024 * 1024)).toFixed(2)} MB`);
