const fs = require('fs');
const path = require('path');

// 1. UPDATE styles.css
let css = fs.readFileSync(path.join(__dirname, '../styles.css'), 'utf8');

// A. Update :root with safe-area variables and app-height
const oldRootMatch = /:root\s*\{[\s\S]*?--crimson:\s*#66021f;/;
if (!oldRootMatch.test(css)) {
  console.error("Could not find :root start");
} else {
  css = css.replace(oldRootMatch, `:root {
  --safe-top: env(safe-area-inset-top, 0px);
  --safe-right: env(safe-area-inset-right, 0px);
  --safe-bottom: env(safe-area-inset-bottom, 0px);
  --safe-left: env(safe-area-inset-left, 0px);

  --app-height: 100dvh;
  --app-height-px: 100dvh;

  --crimson: #66021f;`);
  console.log("Updated :root variables in styles.css");
}

// B. Update html and body with text-size-adjust and overflow-x: clip
const oldHtmlBody = /html\s*\{[\s\S]*?body\.envelope-closed-state\s*\{\s*overflow:\s*hidden;\s*\}/;
if (!oldHtmlBody.test(css)) {
  console.error("Could not find html / body block");
} else {
  css = css.replace(oldHtmlBody, `html {
  background: var(--champagne-bg);
  scroll-behavior: smooth;
  width: 100%;
  max-width: 100%;
  overflow-x: clip;
  scrollbar-gutter: stable;
  -webkit-text-size-adjust: 100%;
  text-size-adjust: 100%;
}

body {
  margin: 0;
  width: 100%;
  max-width: 100%;
  background: var(--champagne-bg);
  color: var(--ink);
  font-family: var(--font-serif);
  overflow-x: clip;
  -webkit-font-smoothing: antialiased;
}

@supports not (overflow: clip) {
  html,
  body {
    overflow-x: hidden;
  }
}

body.envelope-closed-state {
  overflow: hidden;
}`);
  console.log("Updated html and body in styles.css");
}

// C. Update body.invitation-locked and interactive button/input touch-action
const oldLockedBody = /body\.invitation-locked\s*\{\s*overflow:\s*hidden\s*!important;\s*height:\s*100vh\s*!important;\s*touch-action:\s*none;\s*\}/;
if (!oldLockedBody.test(css)) {
  console.error("Could not find body.invitation-locked");
} else {
  css = css.replace(oldLockedBody, `body.invitation-locked {
  overflow: hidden !important;
  width: 100%;
  min-height: 100%;
}`);
  console.log("Updated body.invitation-locked in styles.css");
}

// Update global button, input, textarea, select touch-action
css = css.replace(/button,\s*input,\s*textarea,\s*select\s*\{\s*font:\s*inherit;\s*\}/, `button, input, textarea, select {
  font: inherit;
  touch-action: manipulation;
}`);

// D. Update .envelope-scene height fallback order
const oldEnvelopeScene = /\.envelope-scene\s*\{\s*position:\s*fixed;\s*inset:\s*0;\s*width:\s*100%;\s*height:\s*100dvh;\s*height:\s*100svh;/;
if (!oldEnvelopeScene.test(css)) {
  console.error("Could not find .envelope-scene height block");
} else {
  css = css.replace(oldEnvelopeScene, `.envelope-scene {
  position: fixed;
  inset: 0;
  width: 100%;
  max-width: 100vw;
  height: 100vh;
  height: 100svh;
  height: 100dvh;
  min-height: 100vh;
  min-height: 100svh;
  min-height: 100dvh;`);
  console.log("Updated .envelope-scene in styles.css");
}

// E. Update .top-flap-viewport with contain: paint and max-width
const oldTopFlap = /\.top-flap-viewport\s*\{\s*position:\s*absolute;\s*inset:\s*0\s+0\s+auto\s+0;\s*height:\s*var\(--seal-y\);\s*overflow:\s*hidden;\s*z-index:\s*24;\s*pointer-events:\s*none;\s*\}/;
if (!oldTopFlap.test(css)) {
  console.error("Could not find .top-flap-viewport");
} else {
  css = css.replace(oldTopFlap, `.top-flap-viewport {
  position: absolute;
  inset: 0 0 auto 0;
  height: var(--seal-y);
  width: 100%;
  max-width: 100%;
  overflow: hidden;
  contain: paint;
  z-index: 24;
  pointer-events: none;
}`);
  console.log("Updated .top-flap-viewport in styles.css");
}

// F. Update .envelope-wrapper max-height and state-code-entry
const oldEnvelopeWrapper = /\.envelope-wrapper\s*\{\s*position:\s*relative;\s*width:\s*min\(88vw,\s*470px\);\s*max-height:\s*88svh;/;
if (!oldEnvelopeWrapper.test(css)) {
  console.error("Could not find .envelope-wrapper");
} else {
  css = css.replace(oldEnvelopeWrapper, `.envelope-wrapper {
  position: relative;
  width: min(88vw, 470px);
  max-height: min(88svh, calc(var(--app-height-px, 100dvh) - var(--safe-top) - var(--safe-bottom) - 20px));`);
  console.log("Updated .envelope-wrapper in styles.css");
}

// Add state-code-entry .envelope-wrapper rule if not present
if (!css.includes('.envelope-scene.state-code-entry .envelope-wrapper')) {
  css = css.replace(/\.envelope-scene\.state-code-entry\s*\.code-card-layer\s*\{/, `.envelope-scene.state-code-entry .envelope-wrapper {
  max-height: calc(
    var(--app-height-px, 100dvh)
    - var(--safe-top)
    - var(--safe-bottom)
    - 20px
  );
}

.envelope-scene.state-code-entry .code-card-layer {`);
  console.log("Added .envelope-scene.state-code-entry .envelope-wrapper in styles.css");
}

// G. Update .card-invite-code-input to avoid iOS zoom and handle pill styling
const oldCardInput = /\.card-invite-code-input\s*\{[\s\S]*?font-size:\s*clamp\(12\.5px,\s*2\.8vw,\s*15px\)\s*!important;[\s\S]*?box-sizing:\s*border-box;\s*\}/;
if (!oldCardInput.test(css)) {
  console.error("Could not find .card-invite-code-input");
} else {
  css = css.replace(oldCardInput, `.card-invite-code-input {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  padding-left: 18%;
  padding-right: 6%;
  background: transparent !important;
  border: none !important;
  outline: none !important;
  box-shadow: none !important;
  color: #4a0116;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: clamp(13px, 2.8vw, 15px);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  text-align: center;
  box-sizing: border-box;
  -webkit-appearance: none;
  border-radius: 0;
  touch-action: manipulation;
}`);
  console.log("Updated .card-invite-code-input in styles.css");
}

// H. Update .hero height declarations
const oldHero = /\.hero\s*\{\s*position:\s*relative;\s*min-height:\s*100dvh;\s*min-height:\s*100svh;/;
if (!oldHero.test(css)) {
  console.error("Could not find .hero height block");
} else {
  css = css.replace(oldHero, `.hero {
  position: relative;
  min-height: 100vh;
  min-height: 100svh;
  min-height: 100dvh;`);
  console.log("Updated .hero in styles.css");
}

// I. Update .gallery-carousel and .gallery-stage touch-action, and .gallery-nav min 44px
css = css.replace(/\.gallery-carousel\s*\{([\s\S]*?)outline:\s*none;\s*\}/, `.gallery-carousel {$1outline: none;\n  touch-action: pan-y pinch-zoom;\n}`);
css = css.replace(/\.gallery-stage\s*\{([\s\S]*?)-webkit-user-select:\s*none;\s*\}/, `.gallery-stage {$1-webkit-user-select: none;\n  touch-action: pan-y pinch-zoom;\n}`);

// Ensure gallery-nav has min 44px
css = css.replace(/\.gallery-nav\s*\{\s*position:\s*relative;\s*z-index:\s*5;\s*width:\s*48px;\s*height:\s*48px;/, `.gallery-nav {
  position: relative;
  z-index: 5;
  width: 48px;
  height: 48px;
  min-width: 44px;
  min-height: 44px;`);

// In mobile gallery-nav
css = css.replace(/@media\s*\(max-width:\s*600px\)\s*\{[\s\S]*?\.gallery-nav\s*\{\s*position:\s*absolute;\s*top:\s*50%;\s*transform:\s*translateY\(-50%\);\s*width:\s*40px;\s*height:\s*40px;/, function(match) {
  return match.replace(/width:\s*40px;\s*height:\s*40px;/, 'width: 44px;\n    height: 44px;\n    min-width: 44px;\n    min-height: 44px;');
});

// J. Update .lightbox-content and .lightbox-image-wrap for safe areas
const oldLightboxContent = /\.lightbox-content\s*\{[\s\S]*?max-height:\s*94vh;[\s\S]*?padding:\s*20px;\s*\}/;
if (!oldLightboxContent.test(css)) {
  console.error("Could not find .lightbox-content");
} else {
  css = css.replace(oldLightboxContent, `.lightbox-content {
  position: relative;
  z-index: 2;
  width: 100%;
  height: 100%;
  max-width: 1200px;
  max-height: calc(var(--app-height-px, 100dvh) - var(--safe-top) - var(--safe-bottom) - 20px);
  margin: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  padding-top: max(20px, var(--safe-top));
  padding-bottom: max(20px, var(--safe-bottom));
  padding-left: max(16px, var(--safe-left));
  padding-right: max(16px, var(--safe-right));
}`);
  console.log("Updated .lightbox-content in styles.css");
}

css = css.replace(/\.lightbox-close\s*\{\s*position:\s*absolute;\s*top:\s*20px;\s*right:\s*24px;/, `.lightbox-close {
  position: absolute;
  top: max(20px, calc(10px + var(--safe-top)));
  right: max(24px, calc(12px + var(--safe-right)));
  min-width: 44px;
  min-height: 44px;
  touch-action: manipulation;`);

css = css.replace(/\.lightbox-image-wrap\s*\{\s*position:\s*relative;\s*width:\s*min\(90vw,\s*900px\);\s*height:\s*min\(78vh,\s*700px\);/, `.lightbox-image-wrap {
  position: relative;
  width: min(90vw, 900px);
  max-width: calc(100vw - var(--safe-left) - var(--safe-right) - 32px);
  height: min(78vh, 700px);
  max-height: calc(
    var(--app-height-px, 100dvh)
    - var(--safe-top)
    - var(--safe-bottom)
    - 110px
  );`);

// K. Update .modal and .modal-card with safe-area padding and 100dvh order
const oldModal = /\.modal\s*\{\s*position:\s*fixed;\s*inset:\s*0;\s*z-index:\s*300;\s*display:\s*grid;\s*place-items:\s*center;\s*background:\s*rgba\(26,\s*2,\s*8,\s*0\.88\);\s*backdrop-filter:\s*blur\(8px\);\s*padding:\s*16px;\s*overflow-y:\s*auto;\s*\}/;
if (!oldModal.test(css)) {
  console.error("Could not find .modal");
} else {
  css = css.replace(oldModal, `.modal {
  position: fixed;
  inset: 0;
  z-index: 300;
  display: grid;
  place-items: center;
  background: rgba(26, 2, 8, 0.88);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  min-height: 100vh;
  min-height: 100svh;
  min-height: 100dvh;
  padding-top: calc(16px + var(--safe-top));
  padding-right: max(16px, var(--safe-right));
  padding-bottom: calc(16px + var(--safe-bottom));
  padding-left: max(16px, var(--safe-left));
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}`);
  console.log("Updated .modal in styles.css");
}

const oldModalCard = /\.modal-card\s*\{\s*position:\s*relative;\s*width:\s*min\(100%,\s*480px\);\s*max-height:\s*calc\(100dvh\s*-\s*40px\);[\s\S]*?box-shadow:\s*0\s*25px\s*80px\s*rgba\(0,\s*0,\s*0,\s*0\.6\);\s*\}/;
if (!oldModalCard.test(css)) {
  console.error("Could not find .modal-card");
} else {
  css = css.replace(oldModalCard, `.modal-card {
  position: relative;
  width: min(100%, 480px);
  max-height: calc(
    var(--app-height-px, 100dvh)
    - var(--safe-top)
    - var(--safe-bottom)
    - 32px
  );
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  background: var(--paper);
  color: var(--ink);
  padding: 40px 30px 32px;
  border-radius: 12px;
  border: 1px solid var(--gold);
  box-shadow: 0 25px 80px rgba(0, 0, 0, 0.6);
}`);
  console.log("Updated .modal-card in styles.css");
}

// L. Update .field input, .field textarea, .field select
const oldFieldInputs = /\.field\s+input,\s*\.field\s+textarea,\s*\.field\s+select\s*\{[\s\S]*?transition:\s*border-color\s*0\.2s\s*ease,\s*box-shadow\s*0\.2s\s*ease;\s*\}/;
if (!oldFieldInputs.test(css)) {
  console.error("Could not find .field inputs");
} else {
  css = css.replace(oldFieldInputs, `.field input, .field textarea, .field select {
  width: 100%;
  border: 1px solid #d5cbc3;
  border-radius: 8px;
  background-color: #ffffff;
  padding: 12px 14px;
  color: var(--ink);
  font-size: 16px;
  -webkit-appearance: none;
  appearance: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  touch-action: manipulation;
}

.field select {
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2366021f' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 14px center;
  background-size: 14px;
  padding-right: 38px;
}`);
  console.log("Updated .field input styles in styles.css");
}

// M. Update .site-footer with safe-area bottom
const oldSiteFooter = /\.site-footer\s*\{\s*display:\s*flex;\s*justify-content:\s*center;\s*align-items:\s*center;\s*gap:\s*8px;\s*padding:\s*22px\s*18px;\s*background:\s*#ffffff;\s*color:\s*#382c2f;\s*font-size:\s*14px;\s*\}/;
if (!oldSiteFooter.test(css)) {
  console.error("Could not find .site-footer");
} else {
  css = css.replace(oldSiteFooter, `.site-footer {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  padding: 22px 18px;
  padding-bottom: calc(22px + var(--safe-bottom));
  padding-left: max(18px, var(--safe-left));
  padding-right: max(18px, var(--safe-right));
  background: #ffffff;
  color: #382c2f;
  font-size: 14px;
}`);
  console.log("Updated .site-footer in styles.css");
}

// N. Add global iOS hardening responsive overrides block at end of CSS
const iosHardeningBlock = `
/* ========================================================
   IOS SAFARI COMPATIBILITY & FORM AUTO-ZOOM PREVENTION
   ======================================================== */
@media (max-width: 768px), (pointer: coarse) {
  .card-invite-code-input,
  .field input,
  .field textarea,
  .field select,
  #rsvpForm input,
  #rsvpForm textarea,
  #rsvpForm select {
    font-size: 16px !important;
  }

  .card-invite-code-input {
    letter-spacing: 0.04em;
    padding-left: 14%;
    padding-right: 6%;
  }

  .card-invite-code-input::placeholder {
    font-size: 11.5px;
    letter-spacing: 0.02em;
  }
}

@media (max-width: 540px) {
  .hero {
    min-height: 100vh;
    min-height: 100svh;
    min-height: 100dvh;
    padding-top: calc(50px + var(--safe-top));
    padding-bottom: calc(40px + var(--safe-bottom));
    padding-left: max(16px, var(--safe-left));
    padding-right: max(16px, var(--safe-right));
  }

  .modal-close {
    min-width: 44px;
    min-height: 44px;
    touch-action: manipulation;
  }
}

/* Prevent sticky hover on touch/mobile devices */
@media (hover: none) and (pointer: coarse) {
  .dress-card:hover,
  .hotel-card:hover,
  .hotel-booking-btn:hover,
  .rsvp-button:hover,
  .submit-button:hover,
  .gallery-nav:hover,
  .lightbox-close:hover,
  .lightbox-nav:hover {
    transform: none !important;
    box-shadow: inherit !important;
  }

  .hotel-booking-btn:active,
  .rsvp-button:active,
  .submit-button:active,
  .gallery-nav:active,
  .lightbox-close:active,
  .lightbox-nav:active {
    transform: scale(0.96) !important;
  }
}
`;

css += iosHardeningBlock;

fs.writeFileSync(path.join(__dirname, '../styles.css'), css, 'utf8');
console.log("Successfully hardened styles.css for iOS Safari!");
