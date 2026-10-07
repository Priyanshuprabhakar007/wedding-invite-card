const fs = require('fs');
const path = require('path');

const html = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8').replace(/\r\n/g, '\n');
const css = fs.readFileSync(path.join(__dirname, '../styles.css'), 'utf8').replace(/\r\n/g, '\n');
const js = fs.readFileSync(path.join(__dirname, '../script.js'), 'utf8').replace(/\r\n/g, '\n');

console.log("==================================================");
console.log("IOS SAFARI COMPATIBILITY HARDENING VERIFICATION");
console.log("==================================================");

let passed = 0;
let total = 0;

function check(phase, name, condition, details = "") {
  total++;
  if (condition) {
    passed++;
    console.log(`✅ [${phase}] ${name} ${details ? '(' + details + ')' : ''}`);
  } else {
    console.error(`❌ [${phase}] ${name} FAILED! ${details ? details : ''}`);
  }
}

// PHASE 1: Viewport & Safe Area Variables
check("PHASE 1", "Root safe-area CSS variables defined",
  css.includes("--safe-top: env(safe-area-inset-top, 0px)") &&
  css.includes("--safe-bottom: env(safe-area-inset-bottom, 0px)") &&
  css.includes("--safe-left: env(safe-area-inset-left, 0px)") &&
  css.includes("--safe-right: env(safe-area-inset-right, 0px)")
);
check("PHASE 1", "--app-height defined with dvh fallback",
  css.includes("--app-height: 100dvh") &&
  css.includes("--app-height-px: 100dvh")
);

// PHASE 2: Locked Body
check("PHASE 2", "body.invitation-locked replaced with iOS safe rules",
  css.includes("body.invitation-locked") &&
  !css.includes("body.invitation-locked {\n  overflow: hidden !important;\n  height: 100vh !important;\n  touch-action: none;\n}") &&
  css.includes("min-height: 100%")
);
check("PHASE 2", "touch-action: manipulation on buttons and inputs",
  css.includes("button, input, textarea, select {\n  font: inherit;\n  touch-action: manipulation;\n}")
);

// PHASE 3: Envelope Fullscreen Height
check("PHASE 3", ".envelope-scene uses proper height order (100vh, 100svh, 100dvh)",
  css.includes("height: 100vh;\n  height: 100svh;\n  height: 100dvh;") &&
  css.includes("min-height: 100vh;\n  min-height: 100svh;\n  min-height: 100dvh;")
);

// PHASE 4: Safe Areas / Notch / Home Indicator
check("PHASE 4", "Modal uses safe area insets",
  css.includes("calc(16px + var(--safe-top))") &&
  css.includes("calc(16px + var(--safe-bottom))")
);
check("PHASE 4", "Footer uses safe-bottom",
  css.includes("calc(22px + var(--safe-bottom))")
);

// PHASE 5: Input Auto-Zoom Fix
check("PHASE 5", "Mobile form controls forced to >= 16px to prevent iOS auto-zoom",
  css.includes("font-size: 16px !important;") &&
  css.includes(".card-invite-code-input") &&
  css.includes("#rsvpForm input")
);

// PHASE 6: Text Size Adjust
check("PHASE 6", "html has text-size-adjust: 100% and -webkit-text-size-adjust: 100%",
  css.includes("-webkit-text-size-adjust: 100%") &&
  css.includes("text-size-adjust: 100%")
);

// PHASE 7: Visual Viewport Support in Script
check("PHASE 7", "updateAppViewportHeight() helper in script.js",
  js.includes("function updateAppViewportHeight()") &&
  js.includes("window.visualViewport") &&
  js.includes("--app-height-px")
);

// PHASE 8: Invite Code Card in Visual Viewport
check("PHASE 8", "Envelope wrapper respects visual viewport with keyboard open",
  css.includes(".envelope-scene.state-code-entry .envelope-wrapper") &&
  css.includes("var(--app-height-px, 100dvh)")
);

// PHASE 9: RSVP Modal on iPhone
check("PHASE 9", "Modal and modal-card scrollable with touch momentum",
  css.includes("-webkit-overflow-scrolling: touch") &&
  css.includes("overflow-y: auto")
);

// PHASE 10: Form Inputs on iOS
check("PHASE 10", "index.html uses inputmode tel and numeric",
  html.includes('inputmode="tel"') &&
  html.includes('inputmode="numeric"')
);
check("PHASE 10", "CSS specifies appearance, border-radius, background-color",
  css.includes("-webkit-appearance: none;") &&
  css.includes("border-radius: 8px;") &&
  css.includes("background-color: #ffffff;")
);

// PHASE 11: Prevent Horizontal Overflow
check("PHASE 11", "html and body use overflow-x: clip with hidden fallback",
  css.includes("overflow-x: clip") &&
  css.includes("@supports not (overflow: clip)")
);

// PHASE 12: Top Flap Containment
check("PHASE 12", "top-flap-viewport uses contain: paint and max-width 100%",
  css.includes("contain: paint") &&
  css.includes(".top-flap-viewport")
);

// PHASE 13: Hero Section
check("PHASE 13", "Hero uses 100vh / 100svh / 100dvh min-height order",
  css.includes(".hero {\n  position: relative;\n  min-height: 100vh;\n  min-height: 100svh;\n  min-height: 100dvh;")
);

// PHASE 14: Gallery iPhone Fixes
check("PHASE 14", "Gallery touch-action pan-y pinch-zoom and min 44px buttons",
  css.includes("touch-action: pan-y pinch-zoom") &&
  css.includes("min-width: 44px;\n  min-height: 44px;")
);
check("PHASE 14", "Swipe gesture checks horizontal dominance before navigating",
  js.includes("Math.abs(diffX) > Math.abs(diffY)")
);

// PHASE 15 & 17: Scratch Cards on iOS
check("PHASE 15", "Scratch overlay uses touch-action: none solely on canvas",
  css.includes(".scratch-overlay {\n  position: absolute;\n  inset: 0;\n  width: 100%;\n  height: 100%;\n  z-index: 5;\n  display: block;\n  touch-action: none;")
);
check("PHASE 17", "Scratch cards redraw on orientationchange without resetting state",
  js.includes("window.addEventListener(\"orientationchange\"") &&
  js.includes("drawFoilCover")
);

// PHASE 16: Fix Resize Listener Bug
check("PHASE 16", "setupPetals does not recursively attach resize listeners",
  !js.includes("setupPetals();\n    initCoupleGallery();")
);

// PHASE 18 & 19: Fixed Elements & Lightbox
check("PHASE 18", "Fixed overlays and lightbox respect safe zones and dynamic height",
  css.includes(".lightbox-content") &&
  css.includes("max-height: calc(var(--app-height-px, 100dvh) - var(--safe-top) - var(--safe-bottom) - 20px);")
);

// PHASE 20: Webkit prefixes preserved
check("PHASE 20", "-webkit prefixes present",
  css.includes("-webkit-backdrop-filter") &&
  css.includes("-webkit-backface-visibility") &&
  css.includes("-webkit-font-smoothing")
);

// PHASE 21: Disable Sticky Mobile Hover
check("PHASE 21", "Hover transforms disabled on coarse pointers with :active states",
  css.includes("@media (hover: none) and (pointer: coarse)") &&
  css.includes("transform: none !important;")
);

// PHASE 24: Audio Safe Fail
check("PHASE 24", "Audio methods fail silently without breaking interactions",
  js.includes("playUnsealSound") &&
  js.includes("Audio unseal sound bypassed")
);

console.log("==================================================");
console.log(`RESULT: ${passed} / ${total} CHECKS PASSED`);
console.log("==================================================");

if (passed === total) {
  process.exit(0);
} else {
  process.exit(1);
}
