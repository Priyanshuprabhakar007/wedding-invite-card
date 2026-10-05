const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

async function optimizeImages() {
  console.log('Starting image optimization...');
  
  // 1. Process Floral Assets (pre-render transparency so client canvas is bypassed)
  // rose-ivory.jpg (black background -> transparent)
  // peony-red.jpg (black background -> transparent)
  // branch-gold.png (white background -> transparent)
  
  if (fs.existsSync('assets/images/rose-ivory.jpg')) {
    const { data, info } = await sharp('assets/images/rose-ivory.jpg')
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });
    
    // Apply same formula as client-side prepareFloralAssets
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i], g = data[i+1], b = data[i+2];
      const maxV = Math.max(r, g, b);
      if (maxV <= 12) {
        data[i+3] = 0;
      } else if (maxV < 45) {
        const a = (maxV - 12) / 33;
        data[i+3] = Math.round(a * 255);
        data[i] = Math.min(255, Math.round(r / a));
        data[i+1] = Math.min(255, Math.round(g / a));
        data[i+2] = Math.min(255, Math.round(b / a));
      }
    }
    
    await sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } })
      .webp({ quality: 85, effort: 6 })
      .toFile('assets/images/rose-ivory.webp');
    console.log('Created transparent assets/images/rose-ivory.webp');
  }

  if (fs.existsSync('assets/images/peony-red.jpg')) {
    const { data, info } = await sharp('assets/images/peony-red.jpg')
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });
    
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i], g = data[i+1], b = data[i+2];
      const maxV = Math.max(r, g, b);
      if (maxV <= 12) {
        data[i+3] = 0;
      } else if (maxV < 45) {
        const a = (maxV - 12) / 33;
        data[i+3] = Math.round(a * 255);
        data[i] = Math.min(255, Math.round(r / a));
        data[i+1] = Math.min(255, Math.round(g / a));
        data[i+2] = Math.min(255, Math.round(b / a));
      }
    }
    
    await sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } })
      .webp({ quality: 85, effort: 6 })
      .toFile('assets/images/peony-red.webp');
    console.log('Created transparent assets/images/peony-red.webp');
  }

  if (fs.existsSync('assets/images/branch-gold.png')) {
    const { data, info } = await sharp('assets/images/branch-gold.png')
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });
    
    for (let j = 0; j < data.length; j += 4) {
      const r2 = data[j], g2 = data[j+1], b2 = data[j+2];
      const minV = Math.min(r2, g2, b2);
      if (minV >= 246) {
        data[j+3] = 0;
      } else if (minV >= 205) {
        const a2 = (246 - minV) / 41;
        data[j+3] = Math.round(a2 * 255);
        data[j] = Math.max(0, Math.min(255, Math.round((r2 - (1 - a2) * 255) / a2)));
        data[j+1] = Math.max(0, Math.min(255, Math.round((g2 - (1 - a2) * 255) / a2)));
        data[j+2] = Math.max(0, Math.min(255, Math.round((b2 - (1 - a2) * 255) / a2)));
      }
    }
    
    await sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } })
      .webp({ quality: 85, effort: 6 })
      .toFile('assets/images/branch-gold.webp');
    console.log('Created transparent assets/images/branch-gold.webp');
  }

  // 2. Process Petal Shower (petal-1.png to petal-8.png)
  const petalDir = 'assets/images/Petal Shower';
  if (fs.existsSync(petalDir)) {
    for (let p = 1; p <= 8; p++) {
      const src = path.join(petalDir, `petal-${p}.png`);
      const dest = path.join(petalDir, `petal-${p}.webp`);
      if (fs.existsSync(src)) {
        await sharp(src)
          .webp({ quality: 85, effort: 6, alphaQuality: 90 })
          .toFile(dest);
        const origSize = (fs.statSync(src).size / 1024).toFixed(1);
        const newSize = (fs.statSync(dest).size / 1024).toFixed(1);
        console.log(`Petal ${p}: ${origSize} KB -> ${dest} (${newSize} KB)`);
      }
    }
  }

  // 3. Process Gallery Photos
  const galleryDir = 'assets/images/gallery';
  if (fs.existsSync(galleryDir)) {
    const galleryFiles = fs.readdirSync(galleryDir).filter(f => f.endsWith('.jpeg') || f.endsWith('.jpg') || f.endsWith('.png'));
    for (const file of galleryFiles) {
      const src = path.join(galleryDir, file);
      const destName = file.replace(/\.(jpeg|jpg|png)$/i, '.webp');
      const dest = path.join(galleryDir, destName);
      // Resize to max dimension 1600 for lightbox, high WebP quality
      await sharp(src)
        .resize({ width: 1600, height: 1600, fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 82, effort: 5 })
        .toFile(dest);
      const origSize = (fs.statSync(src).size / 1024).toFixed(1);
      const newSize = (fs.statSync(dest).size / 1024).toFixed(1);
      console.log(`Gallery ${file}: ${origSize} KB -> ${destName} (${newSize} KB)`);
    }
  }

  // 4. Process all referenced site images in assets/images/
  const mainImages = [
    'envelope-flap-ornate.png',
    'envelope-seal.png',
    'seal.png',
    'hero-burgundy-bg.png',
    'invite-card-bg.png',
    'marriage.png',
    'mehendi.png',
    'reception.png',
    'ganesh.png',
    'ganesh-hero.png',
    'ganesh-gold.png',
    'ganesh-circle.png',
    'ganesh-flower.png',
    'flower.png',
    'flower-left.png',
    'flower-right.png',
    'corner.png',
    'corner-ornament.png',
    'invitation-card.png',
    'ring.png',
    'card-top.png',
    'card-bottom.png',
    'card-left.png',
    'card-right.png'
  ];

  for (const imgName of mainImages) {
    const src = path.join('assets/images', imgName);
    if (fs.existsSync(src)) {
      const dest = src.replace(/\.(png|jpg|jpeg)$/i, '.webp');
      await sharp(src)
        .webp({ quality: 85, effort: 6, alphaQuality: 90 })
        .toFile(dest);
      const origSize = (fs.statSync(src).size / 1024).toFixed(1);
      const newSize = (fs.statSync(dest).size / 1024).toFixed(1);
      console.log(`Image ${imgName}: ${origSize} KB -> ${path.basename(dest)} (${newSize} KB)`);
    }
  }

  console.log('All image optimizations completed successfully!');
}

optimizeImages().catch(err => {
  console.error('Error optimizing images:', err);
  process.exit(1);
});
