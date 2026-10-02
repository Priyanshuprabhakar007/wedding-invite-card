const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, '..', 'styles.css');
let css = fs.readFileSync(cssPath, 'utf8');

const unsealHitCss = `
/* Unseal Hit Target Button */
.unseal-hit-btn {
  position: absolute;
  left: var(--seal-x, 50%);
  top: var(--seal-y);
  transform: translate(-50%, -50%);
  width: clamp(100px, 8vw, 130px);
  height: clamp(100px, 8vw, 130px);
  z-index: 70;
  background: transparent;
  border: none;
  cursor: pointer;
  outline: none;
  pointer-events: auto;
}

@media (max-width: 600px) {
  .unseal-hit-btn {
    width: 96px;
    height: 96px;
  }
}

.envelope-scene.state-closed .unseal-hit-btn {
  display: block !important;
  pointer-events: auto !important;
}

.envelope-scene.state-opening .unseal-hit-btn,
.envelope-scene.state-code-entry .unseal-hit-btn,
.envelope-scene.state-unlocking .unseal-hit-btn,
.envelope-scene.state-complete .unseal-hit-btn {
  display: none !important;
  pointer-events: none !important;
}
`;

if (!css.includes('.unseal-hit-btn {')) {
  css = css.replace('.wax-seal-wrapper {', unsealHitCss + '\n.wax-seal-wrapper {');
  fs.writeFileSync(cssPath, css, 'utf8');
  console.log('Added .unseal-hit-btn styles to styles.css');
} else {
  console.log('.unseal-hit-btn styles already present in styles.css');
}
