const fs = require('fs');
let code = fs.readFileSync('script.js', 'utf8');

// 1. Update PETAL_ASSETS to webp
code = code.replace(
  /var PETAL_ASSETS = \[\s*"assets\/images\/Petal Shower\/petal-1\.png"[\s\S]*?"assets\/images\/Petal Shower\/petal-8\.png"\s*\];/,
  `var PETAL_ASSETS = [
      "assets/images/Petal Shower/petal-1.webp",
      "assets/images/Petal Shower/petal-2.webp",
      "assets/images/Petal Shower/petal-3.webp",
      "assets/images/Petal Shower/petal-4.webp",
      "assets/images/Petal Shower/petal-5.webp",
      "assets/images/Petal Shower/petal-6.webp",
      "assets/images/Petal Shower/petal-7.webp",
      "assets/images/Petal Shower/petal-8.webp"
    ];`
);

// 2. Fix Petal Resize bug
const oldResizeBlock = `    // Gracefully handle screen resize / orientation changes
    var resizeTimer;
    window.addEventListener("resize", function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        var newIsMobile = window.innerWidth <= 768;
        if (newIsMobile !== isMobile) {
          setupPetals();
    initCoupleGallery();
        }
      }, 300);
    });`;

const newResizeBlock = `    // Handled by single global orientation/resize listener`;
code = code.replace(oldResizeBlock, newResizeBlock);

// 3. Update coupleGalleryImages to webp
code = code.replace(
  /var coupleGalleryImages = \[\s*"[\s\S]*?"\s*\];/,
  `var coupleGalleryImages = [
    "./assets/images/gallery/1.webp",
    "./assets/images/gallery/2.webp",
    "./assets/images/gallery/4.webp",
    "./assets/images/gallery/5.webp",
    "./assets/images/gallery/6.webp",
    "./assets/images/gallery/7.webp",
    "./assets/images/gallery/9.webp",
    "./assets/images/gallery/10.webp",
    "./assets/images/gallery/11.webp",
    "./assets/images/gallery/14.webp",
    "./assets/images/gallery/15.webp",
    "./assets/images/gallery/16.webp",
    "./assets/images/gallery/17.webp",
    "./assets/images/gallery/18.webp",
    "./assets/images/gallery/19.webp",
    "./assets/images/gallery/20.webp",
    "./assets/images/gallery/21.webp",
    "./assets/images/gallery/25.webp",
    "./assets/images/gallery/27.webp",
    "./assets/images/gallery/28.webp",
    "./assets/images/gallery/30.webp",
    "./assets/images/gallery/31.webp",
    "./assets/images/gallery/32.webp",
    "./assets/images/gallery/36.webp",
    "./assets/images/gallery/37.webp",
    "./assets/images/gallery/38.webp",
    "./assets/images/gallery/39.webp",
    "./assets/images/gallery/40.webp",
    "./assets/images/gallery/41.webp",
    "./assets/images/gallery/42.webp",
    "./assets/images/gallery/43.webp",
    "./assets/images/gallery/44.webp",
    "./assets/images/gallery/45.webp",
    "./assets/images/gallery/46.webp"
  ];`
);

// 4. Guard initCoupleGallery
code = code.replace(
  `  function initCoupleGallery() {`,
  `  var isGalleryInitialized = false;
  function initCoupleGallery() {
    if (isGalleryInitialized) return;`
);
code = code.replace(
  `    applyGalleryImage(0, null);`,
  `    isGalleryInitialized = true;
    applyGalleryImage(0, null);`
);

// 5. Add preloadHeroAssets on handleTapToOpen
const preloadHeroFn = `  function preloadHeroAssets() {
    var heroAssets = [
      "assets/images/hero-burgundy-bg.webp",
      "assets/images/branch-gold.webp",
      "assets/images/rose-ivory.webp",
      "assets/images/peony-red.webp",
      "assets/images/ganesh-hero.webp"
    ];
    heroAssets.forEach(function (src) {
      var img = new Image();
      img.src = src;
    });
  }
`;

code = code.replace(
  `    function handleTapToOpen() {`,
  preloadHeroFn + `\n    function handleTapToOpen() {\n      preloadHeroAssets();`
);

// 6. Optimize DOM ready to defer non-critical initialization with requestIdleCallback
const oldDomReady = `  document.addEventListener("DOMContentLoaded", function () {
    enforceLockedScroll();

    // CRITICAL — invitation opening must initialize first
    try {
      setupUnifiedInvitationExperience();
    } catch (err) {
      console.error("[CRITICAL] Envelope initialization failed:", err);
    }

    // Remaining features must not be allowed to break the envelope
    try {
      bindData(data);
    } catch (err) {
      console.error("[bindData]", err);
    }

    try {
      prepareFloralAssets();
    } catch (err) {
      console.error("[prepareFloralAssets]", err);
    }

    try {
      startCountdown(
        data.event && data.event.countdownDate
          ? data.event.countdownDate
          : "2026-11-20T15:30:00-05:00"
      );
    } catch (err) {
      console.error("[countdown]", err);
    }

    try {
      if (typeof initCoupleGallery === "function") {
        initCoupleGallery();
      }
    } catch (err) {
      console.error("[gallery]", err);
    }

    try {
      setupScrollAnimations();
    } catch (err) {
      console.error("[scroll animations]", err);
    }

    try {
      setupPetals();
    } catch (err) {
      console.error("[petals]", err);
    }

    var musicBtn = document.getElementById("musicToggle");
    if (musicBtn) {
      musicBtn.addEventListener("click", toggleMusic);
    }
  });`;

const newDomReady = `  document.addEventListener("DOMContentLoaded", function () {
    enforceLockedScroll();

    // CRITICAL — invitation opening must initialize first
    try {
      setupUnifiedInvitationExperience();
    } catch (err) {
      console.error("[CRITICAL] Envelope initialization failed:", err);
    }

    try {
      setupPetals();
    } catch (err) {
      console.error("[petals]", err);
    }

    var deferInit = window.requestIdleCallback || function (cb) { setTimeout(cb, 100); };
    deferInit(function () {
      try {
        bindData(data);
      } catch (err) {
        console.error("[bindData]", err);
      }

      try {
        startCountdown(
          data.event && data.event.countdownDate
            ? data.event.countdownDate
            : "2026-11-20T15:30:00-05:00"
        );
      } catch (err) {
        console.error("[countdown]", err);
      }

      try {
        if (typeof initCoupleGallery === "function") {
          initCoupleGallery();
        }
      } catch (err) {
        console.error("[gallery]", err);
      }

      try {
        setupScrollAnimations();
      } catch (err) {
        console.error("[scroll animations]", err);
      }

      var musicBtn = document.getElementById("musicToggle");
      if (musicBtn) {
        musicBtn.addEventListener("click", toggleMusic);
      }
    });

    // Single global resize handler for petals
    var globalResizeTimer;
    window.addEventListener("resize", function () {
      clearTimeout(globalResizeTimer);
      globalResizeTimer = setTimeout(function () {
        if (currentState === ANIM_STATES.CLOSED) {
          setupPetals();
        }
      }, 350);
    });
  });`;

code = code.replace(oldDomReady, newDomReady);

// 7. Simplify prepareFloralAssets to bypass canvas processing
const oldPrepareFloral = `  function prepareFloralAssets() {
    var images = document.querySelectorAll(".flower-asset");
    images.forEach(function (img) {
      var type = img.getAttribute("data-type");
      if (!type) return;

      var process = function () {
        try {
          var canvas = document.createElement("canvas");
          var w = img.naturalWidth || img.width;
          var h = img.naturalHeight || img.height;
          if (!w || !h) return;
          canvas.width = w;
          canvas.height = h;
          var ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0);
          var imgData = ctx.getImageData(0, 0, w, h);
          var d = imgData.data;

          if (type === "black") {
            // Peony & Rose (convert solid black background to clean transparent alpha)
            for (var i = 0; i < d.length; i += 4) {
              var r = d[i], g = d[i+1], b = d[i+2];
              var maxV = Math.max(r, g, b);
              if (maxV <= 12) {
                d[i+3] = 0;
              } else if (maxV < 45) {
                var a = (maxV - 12) / 33;
                d[i+3] = Math.round(a * 255);
                d[i] = Math.min(255, Math.round(r / a));
                d[i+1] = Math.min(255, Math.round(g / a));
                d[i+2] = Math.min(255, Math.round(b / a));
              }
            }
          } else if (type === "white") {
            // Gold & Ivory Branches (convert solid white background to clean transparent alpha)
            for (var j = 0; j < d.length; j += 4) {
              var r2 = d[j], g2 = d[j+1], b2 = d[j+2];
              var minV = Math.min(r2, g2, b2);
              if (minV >= 246) {
                d[j+3] = 0;
              } else if (minV >= 205) {
                var a2 = (246 - minV) / 41;
                d[j+3] = Math.round(a2 * 255);
                d[j] = Math.max(0, Math.min(255, Math.round((r2 - (1 - a2) * 255) / a2)));
                d[j+1] = Math.max(0, Math.min(255, Math.round((g2 - (1 - a2) * 255) / a2)));
                d[j+2] = Math.max(0, Math.min(255, Math.round((b2 - (1 - a2) * 255) / a2)));
              }
            }
          }
          ctx.putImageData(imgData, 0, 0);
          img.src = canvas.toDataURL("image/png");
          img.removeAttribute("data-type");
        } catch (err) {
          console.warn("[Floral Asset Processing]", err);
        }
      };

      if (img.complete && img.naturalWidth) {
        process();
      } else {
        img.addEventListener("load", process, { once: true });
      }
    });
  }`;

const newPrepareFloral = `  function prepareFloralAssets() {
    // Floral assets are pre-rendered as transparent WebP images during build,
    // avoiding heavy runtime canvas pixel processing on mobile CPUs.
  }`;

code = code.replace(oldPrepareFloral, newPrepareFloral);

fs.writeFileSync('script.js', code, 'utf8');
console.log('script.js updated successfully!');
