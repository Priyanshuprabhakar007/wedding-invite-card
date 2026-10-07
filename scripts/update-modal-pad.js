const fs = require('fs');
const path = require('path');
const stylesPath = path.join(__dirname, '../styles.css');
let css = fs.readFileSync(stylesPath, 'utf8');

css = css.replace(
  'padding: calc(20px + var(--safe-top)) max(16px, var(--safe-right)) calc(20px + var(--safe-bottom)) max(16px, var(--safe-left));',
  'padding: calc(16px + var(--safe-top)) max(16px, var(--safe-right)) calc(16px + var(--safe-bottom)) max(16px, var(--safe-left));'
);

fs.writeFileSync(stylesPath, css, 'utf8');
console.log("Updated modal padding to calc(16px + var(--safe-top))");
