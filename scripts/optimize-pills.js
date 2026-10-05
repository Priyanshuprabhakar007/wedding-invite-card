const fs = require('fs');
const sharp = require('sharp');

async function convertPills() {
  if (fs.existsSync('assets/images/invite-input-pill.png')) {
    await sharp('assets/images/invite-input-pill.png')
      .webp({ quality: 88, effort: 6 })
      .toFile('assets/images/invite-input-pill.webp');
    console.log('Converted invite-input-pill.png to webp');
  }
  if (fs.existsSync('assets/images/invite-btn-pill.png')) {
    await sharp('assets/images/invite-btn-pill.png')
      .webp({ quality: 88, effort: 6 })
      .toFile('assets/images/invite-btn-pill.webp');
    console.log('Converted invite-btn-pill.png to webp');
  }
}

convertPills();
