const fs = require('fs');
const path = require('path');

const scriptPath = path.join(__dirname, '../script.js');
const stylesPath = path.join(__dirname, '../styles.css');

// ============================================================================
// 1. UPDATE script.js
// ============================================================================
let js = fs.readFileSync(scriptPath, 'utf8');

// 1A. Robust updateRsvpFormEvents fallback
const oldUpdateRsvpEvents = /function updateRsvpFormEvents\(invitation\)\s*\{[\s\S]*?var eventsToDisplay = \(invitation && Array\.isArray\(invitation\.allowedEvents\)\)\s*\?\s*invitation\.allowedEvents\s*:\s*\[\];/;

const newUpdateRsvpEvents = `function updateRsvpFormEvents(invitation) {
    var container = byId("rsvpFunctionsList");
    var badge = byId("rsvpInvitationBadge");
    if (!container) return;

    var eventsToDisplay = (invitation && Array.isArray(invitation.allowedEvents) && invitation.allowedEvents.length > 0)
      ? invitation.allowedEvents
      : ((data && Array.isArray(data.events)) ? data.events : (window.WEDDING_CONFIG && Array.isArray(window.WEDDING_CONFIG.events) ? window.WEDDING_CONFIG.events : []));`;

if (oldUpdateRsvpEvents.test(js)) {
  js = js.replace(oldUpdateRsvpEvents, newUpdateRsvpEvents);
  console.log("✅ Updated updateRsvpFormEvents in script.js");
} else {
  console.warn("⚠️ Could not match oldUpdateRsvpEvents pattern, checking if already updated");
}

// 1B. Robust buildRsvpForm with iPhone Safari touch & modal handling
const oldBuildRsvpFormRegex = /function buildRsvpForm\(cfg\)\s*\{[\s\S]*?var openBtn = byId\("rsvpButton"\);[\s\S]*?if \(!modal \|\| !openBtn \|\| !form\) return;[\s\S]*?openBtn\.addEventListener\("click", function \(\) \{[\s\S]*?document\.body\.style\.overflow = "hidden";\s*\}\);[\s\S]*?function closeModal\(\) \{[\s\S]*?document\.body\.style\.overflow = "";[\s\S]*?if \(formContainer && successView\) \{[\s\S]*?\}\s*\}[\s\S]*?if \(closeBtn\) closeBtn\.addEventListener\("click", closeModal\);[\s\S]*?if \(doneBtn\) doneBtn\.addEventListener\("click", closeModal\);[\s\S]*?modal\.addEventListener\("click", function \(e\) \{[\s\S]*?if \(e\.target === modal\) closeModal\(\);[\s\S]*?\}\);/;

const newBuildRsvpFormChunk = `function buildRsvpForm(cfg) {
    var modal = byId("rsvpModal");
    var openBtn = byId("rsvpButton");
    var closeBtn = byId("modalClose");
    var form = byId("rsvpForm");
    var formContainer = byId("formView");
    var successView = byId("successView");
    var doneBtn = byId("successDone");

    if (!modal || !openBtn || !form) return;

    function openModal(e) {
      if (e) {
        if (typeof e.stopPropagation === "function") e.stopPropagation();
      }
      // Ensure functions list is populated
      var functionsContainer = byId("rsvpFunctionsList");
      if (!functionsContainer || functionsContainer.children.length === 0) {
        updateRsvpFormEvents(activeInvitation);
      }
      modal.hidden = false;
      modal.removeAttribute("inert");
      modal.setAttribute("aria-hidden", "false");
      document.body.classList.add("modal-open");
      document.body.style.overflow = "hidden";
    }

    function closeModal(e) {
      if (e && typeof e.stopPropagation === "function") {
        e.stopPropagation();
      }
      modal.hidden = true;
      modal.setAttribute("inert", "");
      modal.setAttribute("aria-hidden", "true");
      document.body.classList.remove("modal-open");
      document.body.style.overflow = "";
      if (formContainer && successView) {
        formContainer.hidden = false;
        successView.hidden = true;
      }
    }

    // iOS Safari responsive touch & click handlers
    openBtn.addEventListener("click", openModal);
    openBtn.addEventListener("touchend", function (e) {
      if (e.cancelable) {
        e.preventDefault();
      }
      openModal(e);
    }, { passive: false });

    if (closeBtn) {
      closeBtn.addEventListener("click", closeModal);
      closeBtn.addEventListener("touchend", function (e) {
        if (e.cancelable) e.preventDefault();
        closeModal(e);
      }, { passive: false });
    }

    if (doneBtn) {
      doneBtn.addEventListener("click", closeModal);
      doneBtn.addEventListener("touchend", function (e) {
        if (e.cancelable) e.preventDefault();
        closeModal(e);
      }, { passive: false });
    }

    modal.addEventListener("click", function (e) {
      var card = modal.querySelector(".modal-card");
      if (e.target === modal && (!card || !card.contains(e.target))) {
        closeModal(e);
      }
    });`;

if (oldBuildRsvpFormRegex.test(js)) {
  js = js.replace(oldBuildRsvpFormRegex, newBuildRsvpFormChunk);
  console.log("✅ Updated buildRsvpForm modal triggers & touch handlers in script.js");
} else {
  console.warn("⚠️ Could not match oldBuildRsvpFormRegex pattern directly");
}

fs.writeFileSync(scriptPath, js, 'utf8');

// ============================================================================
// 2. UPDATE styles.css
// ============================================================================
let css = fs.readFileSync(stylesPath, 'utf8');

// 2A. Remove content-visibility: auto from .rsvp-section to fix WebKit tap dropped events
css = css.replace(
  /\.details,\s*\.rsvp-section\s*\{\s*content-visibility:\s*auto;\s*contain-intrinsic-size:\s*500px;\s*\}/,
  `.details {\n  content-visibility: auto;\n  contain-intrinsic-size: 500px;\n}`
);
console.log("✅ Removed content-visibility: auto from .rsvp-section in styles.css");

// 2B. Remove content-visibility: auto from .wedding-registry-section
css = css.replace(
  /\.wedding-registry-section\s*\{[\s\S]*?content-visibility:\s*auto;\s*contain-intrinsic-size:\s*600px;\s*\}/,
  `.wedding-registry-section {\n  position: relative;\n  padding: 95px 24px 105px;\n  text-align: center;\n  overflow: hidden;\n}`
);
console.log("✅ Removed content-visibility: auto from .wedding-registry-section in styles.css");

// 2C. Ensure .rsvp-button has complete touch & iOS styling
css = css.replace(
  /\.rsvp-button\s*\{[\s\S]*?transition:\s*transform\s*0\.3s\s*ease,\s*box-shadow\s*0\.3s\s*ease;\s*\}/,
  `.rsvp-button {
  min-width: 200px;
  min-height: 48px;
  border: 0;
  border-radius: 999px;
  background: linear-gradient(135deg, var(--gold-light) 0%, var(--gold) 50%, var(--gold-dark) 100%);
  color: var(--crimson-darker);
  font-family: var(--font-display);
  font-size: 15px;
  font-weight: 700;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  padding: 16px 36px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.35), 0 0 20px rgba(223, 190, 118, 0.4);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
  user-select: none;
  -webkit-user-select: none;
  position: relative;
  z-index: 5;
}`
);
console.log("✅ Enhanced .rsvp-button styling in styles.css");

// 2D. Ensure .modal and .modal-card prevent scroll traps on iOS Safari
css = css.replace(
  /\.modal\s*\{[\s\S]*?overflow-y:\s*auto;\s*-webkit-overflow-scrolling:\s*touch;\s*\}\s*\.modal\[hidden\]\s*\{\s*display:\s*none;\s*\}/,
  `.modal {
  position: fixed;
  inset: 0;
  z-index: 300;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(26, 2, 8, 0.88);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  min-height: 100vh;
  min-height: 100svh;
  min-height: 100dvh;
  padding: calc(20px + var(--safe-top)) max(16px, var(--safe-right)) calc(20px + var(--safe-bottom)) max(16px, var(--safe-left));
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  box-sizing: border-box;
}

.modal[hidden] {
  display: none !important;
}`
);
console.log("✅ Enhanced .modal container styling in styles.css");

// 2E. Ensure .modal-card has clean box model and momentum scroll
css = css.replace(
  /\.modal-card\s*\{[\s\S]*?box-shadow:\s*0\s*25px\s*80px\s*rgba\(0,\s*0,\s*0,\s*0\.6\);\s*\}/,
  `.modal-card {
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
  box-sizing: border-box;
  margin: auto;
  touch-action: pan-y;
}`
);
console.log("✅ Enhanced .modal-card styling in styles.css");

// 2F. Ensure .modal-close is tap friendly
css = css.replace(
  /\.modal-close\s*\{[\s\S]*?display:\s*grid;\s*place-items:\s*center;\s*\}/,
  `.modal-close {
  position: absolute;
  right: 16px;
  top: 16px;
  width: 44px;
  height: 44px;
  min-width: 44px;
  min-height: 44px;
  border-radius: 50%;
  border: 1px solid #ddd;
  background: #ffffff;
  color: var(--ink);
  font-size: 18px;
  display: grid;
  place-items: center;
  cursor: pointer;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  z-index: 10;
}`
);
console.log("✅ Enhanced .modal-close styling in styles.css");

// 2G. Ensure .rsvp-function-item and checkboxes are touch friendly
css = css.replace(
  /\.rsvp-function-item\s*\{[\s\S]*?transition:\s*background\s*0\.2s\s*ease,\s*border-color\s*0\.2s\s*ease;\s*\}/,
  `.rsvp-function-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  min-height: 44px;
  background: #fdfaf7;
  border: 1px solid #ebdcd3;
  border-radius: 6px;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
  user-select: none;
  -webkit-user-select: none;
  transition: background 0.2s ease, border-color 0.2s ease;
}`
);

css = css.replace(
  /\.rsvp-function-item\s*input\[type="checkbox"\]\s*\{[\s\S]*?margin:\s*0;\s*\}/,
  `.rsvp-function-item input[type="checkbox"] {
  width: 20px;
  height: 20px;
  accent-color: var(--crimson);
  cursor: pointer;
  flex-shrink: 0;
  margin: 0;
  touch-action: manipulation;
}`
);

// 2H. Ensure .submit-button has proper tap target & appearance
css = css.replace(
  /\.submit-button\s*\{[\s\S]*?transition:\s*transform\s*0\.2s\s*ease,\s*box-shadow\s*0\.2s\s*ease;\s*\}/,
  `.submit-button {
  width: 100%;
  margin-top: 15px;
  padding: 14px 20px;
  min-height: 48px;
  border: 0;
  border-radius: 8px;
  background: linear-gradient(135deg, var(--crimson) 0%, var(--crimson-light) 100%);
  color: #ffffff;
  font-family: var(--font-display);
  font-size: 14px;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  font-weight: 600;
  box-shadow: 0 6px 20px rgba(102, 2, 31, 0.3);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  cursor: pointer;
  -webkit-appearance: none;
  appearance: none;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
  position: relative;
  z-index: 2;
}`
);
console.log("✅ Enhanced .submit-button styling in styles.css");

fs.writeFileSync(stylesPath, css, 'utf8');

console.log("\n=======================================================");
console.log("🎉 ALL IPHONE RSVP HARDENING APPLIED SUCCESSFULLY!");
console.log("=======================================================");
