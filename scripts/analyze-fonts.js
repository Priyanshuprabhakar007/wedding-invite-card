const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');
const css = fs.readFileSync('styles.css', 'utf8');

const fontLinks = html.match(/https:\/\/fonts\.googleapis\.com\/css2\?[^"]+/g);
console.log('=== FONT LINKS IN HTML ===');
console.log(fontLinks);

const varMatches = css.match(/--font-[^:]+:[^;]+/g);
console.log('\n=== FONT CSS VARIABLES IN CSS ===');
console.log(varMatches);

const fontMatches = css.match(/font-family:[^;]+/g);
const families = {};
if (fontMatches) {
  fontMatches.forEach(f => {
    families[f.trim()] = (families[f.trim()] || 0) + 1;
  });
}
console.log('\n=== FONT-FAMILY USAGE COUNTS IN CSS ===');
console.log(JSON.stringify(families, null, 2));
