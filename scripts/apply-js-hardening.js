const fs = require('fs');
const path = require('path');

let js = fs.readFileSync(path.join(__dirname, '../script.js'), 'utf8');

// 1. Add Visual Viewport Helper at top of script
const topHelper = `  // -------------------------------------------------------------
  // IOS SAFARI VIEWPORT & SCREEN ORIENTATION HELPER
  // -------------------------------------------------------------
  function updateAppViewportHeight() {
    var viewportHeight =
      window.visualViewport && window.visualViewport.height
        ? window.visualViewport.height
        : window.innerHeight;

    document.documentElement.style.setProperty(
      "--app-height-px",
      viewportHeight + "px"
    );
  }

  updateAppViewportHeight();

  window.addEventListener("resize", updateAppViewportHeight, { passive: true });

  window.addEventListener("orientationchange", function () {
    setTimeout(updateAppViewportHeight, 100);
    setTimeout(updateAppViewportHeight, 400);
  });

  if (window.visualViewport) {
    window.visualViewport.addEventListener(
      "resize",
      updateAppViewportHeight,
      { passive: true }
    );
  }
`;

if (!js.includes('updateAppViewportHeight()')) {
  js = js.replace(/var activeInvitation = null;\s*/, `var activeInvitation = null;\n\n${topHelper}\n`);
  console.log("Added updateAppViewportHeight helper in script.js");
}

// 2. Fix setupPetals() duplicate resize listeners bug (Phase 16)
const oldPetalsResize = /\/\/ Gracefully handle screen resize \/ orientation changes\s*var resizeTimer;\s*window\.addEventListener\("resize",\s*function\s*\(\)\s*\{[\s\S]*?setupPetals\(\);\s*initCoupleGallery\(\);[\s\S]*?\}\);\s*\}/;
if (!oldPetalsResize.test(js)) {
  console.error("Could not find old setupPetals resize listener");
} else {
  js = js.replace(oldPetalsResize, `// Petals initialized for current viewport\n  }`);
  console.log("Removed recursive resize listener from setupPetals() in script.js");
}

// 3. Update Audio functions with safe try-catch handlers
const oldPlayUnsealSound = /function playUnsealSound\(\)\s*\{[\s\S]*?osc\.stop\(audioCtx\.currentTime \+ 0\.36\);\s*\}/;
if (!oldPlayUnsealSound.test(js)) {
  console.error("Could not find playUnsealSound");
} else {
  js = js.replace(oldPlayUnsealSound, `function playUnsealSound() {
    try {
      if (!audioCtx) initAudio();
      if (!audioCtx) return;
      if (audioCtx.state === 'suspended') {
        audioCtx.resume().catch(function () {});
      }

      // Soft realistic wax pop + paper chime
      var osc = audioCtx.createOscillator();
      var gain = audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(440, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.15);

      gain.gain.setValueAtTime(0.001, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.08, audioCtx.currentTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.35);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + 0.36);
    } catch (e) {
      console.log("Audio unseal sound bypassed", e);
    }
  }`);
  console.log("Updated playUnsealSound with try-catch safety in script.js");
}

// 4. Update Gallery touch gesture swipe threshold and horizontal-priority check
const oldGalleryTouch = /carousel\.addEventListener\("touchend",\s*function\s*\(\)\s*\{[\s\S]*?var diffX = touchEndX - touchStartX;\s*var diffY = touchEndY - touchStartY;\s*if\s*\(Math\.abs\(diffX\)\s*>\s*Math\.abs\(diffY\)\s*&&\s*Math\.abs\(diffX\)\s*>\s*45\)\s*\{[\s\S]*?pauseAndResumeGalleryAutoplay\(\);\s*\}\);/;
if (!oldGalleryTouch.test(js)) {
  console.error("Could not find gallery touchend listener");
} else {
  js = js.replace(oldGalleryTouch, `carousel.addEventListener("touchend", function () {
      if (!isSwiping) return;
      isSwiping = false;
      var diffX = touchEndX - touchStartX;
      var diffY = touchEndY - touchStartY;

      // Only change slide when horizontal motion clearly dominates vertical scroll
      if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 40) {
        if (diffX < 0) {
          nextGallerySlide();
        } else {
          prevGallerySlide();
        }
      }

      isGalleryHoveredOrInteracting = false;
      pauseAndResumeGalleryAutoplay();
    });`);
  console.log("Updated gallery touchend handler in script.js");
}

// 5. Update Lightbox touchend
const oldLightboxTouch = /lightbox\.addEventListener\("touchend",\s*function\s*\(\)\s*\{[\s\S]*?if\s*\(Math\.abs\(diffX\)\s*>\s*Math\.abs\(diffY\)\s*&&\s*Math\.abs\(diffX\)\s*>\s*45\)\s*\{[\s\S]*?\}\s*\}\);/;
if (!oldLightboxTouch.test(js)) {
  console.error("Could not find lightbox touchend listener");
} else {
  js = js.replace(oldLightboxTouch, `lightbox.addEventListener("touchend", function () {
        var diffX = lbTouchEndX - lbTouchStartX;
        var diffY = lbTouchEndY - lbTouchStartY;
        if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 40) {
          if (diffX < 0) {
            nextGallerySlide();
          } else {
            prevGallerySlide();
          }
        }
      });`);
  console.log("Updated lightbox touchend handler in script.js");
}

// 6. Scratch cards redraw on orientationchange as well as resize
const oldScratchResize = /var resizeTimeout = null;\s*window\.addEventListener\("resize",\s*function\s*\(\)\s*\{[\s\S]*?drawFoilCover\(canvas,\s*unitName\);\s*\}\s*\}\);\s*\}, 150\);\s*\}\);/;
if (!oldScratchResize.test(js)) {
  console.error("Could not find scratch resize listener");
} else {
  js = js.replace(oldScratchResize, `var resizeTimeout = null;
      function redrawUnscratchedCards() {
        if (resizeTimeout) clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(function () {
          units.forEach(function (unit) {
            if (unit.dataset.revealed === "true" || unit.dataset.revealing === "true") {
              return;
            }
            var canvas = unit.querySelector(".scratch-overlay");
            var unitName = unit.getAttribute("data-unit") || "days";
            if (canvas && canvas.style.display !== "none" && !canvas.classList.contains("is-dissolving")) {
              drawFoilCover(canvas, unitName);
            }
          });
        }, 150);
      }
      window.addEventListener("resize", redrawUnscratchedCards, { passive: true });
      window.addEventListener("orientationchange", function () {
        setTimeout(redrawUnscratchedCards, 120);
        setTimeout(redrawUnscratchedCards, 350);
      });`);
  console.log("Updated scratch cards resize/orientation listener in script.js");
}

fs.writeFileSync(path.join(__dirname, '../script.js'), js, 'utf8');
console.log("Successfully hardened script.js for iOS Safari!");
