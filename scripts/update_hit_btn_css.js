const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, '..', 'styles.css');
let css = fs.readFileSync(cssPath, 'utf8');

const targetRule = `.unseal-hit-btn {
  position: absolute;
  left: var(--seal-x, 50%);
  top: var(--seal-y);
  transform: translate(-50%, -50%);
  width: clamp(88px, 6vw, 110px);
  height: clamp(88px, 6vw, 110px);
  border-radius: 50%;
  z-index: 70;
  background: transparent;
  border: none;
  cursor: pointer;
  outline: none;
  padding: 0;
  margin: 0;
  pointer-events: auto;
  -webkit-tap-highlight-color: transparent;
}

.envelope-scene.state-closed .unseal-hit-btn {
  display: block !important;
  pointer-events: auto !important;
}`;

css = css.replace(/\.unseal-hit-btn\s*\{[\s\S]*?-webkit-tap-highlight-color:\s*transparent;\s*\}/, targetRule);
fs.writeFileSync(cssPath, css, 'utf8');
console.log('Updated .unseal-hit-btn in styles.css');
