const fs = require('fs');
let css = fs.readFileSync('styles.css', 'utf8');

// Remove @import
css = css.replace(/@import\s+url\([^)]+\);\s*/g, '');

// Replace ceremony png with webp
css = css.replace(/assets\/images\/mehendi\.png/g, 'assets/images/mehendi.webp');
css = css.replace(/assets\/images\/marriage\.png/g, 'assets/images/marriage.webp');
css = css.replace(/assets\/images\/reception\.png/g, 'assets/images/reception.webp');

fs.writeFileSync('styles.css', css, 'utf8');
console.log('styles.css updated successfully!');
