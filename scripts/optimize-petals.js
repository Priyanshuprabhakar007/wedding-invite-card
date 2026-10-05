const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

async function optimizePetals() {
  const petalDir = 'assets/images/Petal Shower';
  if (fs.existsSync(petalDir)) {
    for (let p = 1; p <= 8; p++) {
      const src = path.join(petalDir, `petal-${p}.png`);
      const dest = path.join(petalDir, `petal-${p}.webp`);
      if (fs.existsSync(src)) {
        await sharp(src)
          .resize({ width: 300, height: 300, fit: 'inside', withoutEnlargement: true })
          .webp({ quality: 85, effort: 6, alphaQuality: 90 })
          .toFile(dest);
        const newSize = (fs.statSync(dest).size / 1024).toFixed(1);
        console.log(`Petal ${p}: optimized to ${newSize} KB`);
      }
    }
  }
}

optimizePetals();
