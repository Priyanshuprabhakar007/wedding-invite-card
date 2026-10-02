const fs = require('fs');
const path = require('path');

const scriptPath = path.join(__dirname, '..', 'script.js');
let script = fs.readFileSync(scriptPath, 'utf8');

// 1. Add debug logs to setupUnifiedInvitationExperience
if (!script.includes('[Envelope] setupUnifiedInvitationExperience started')) {
  script = script.replace(
    'function setupUnifiedInvitationExperience() {',
    'function setupUnifiedInvitationExperience() {\n    console.log("[Envelope] setupUnifiedInvitationExperience started");'
  );
}

if (!script.includes('[Envelope elements]')) {
  script = script.replace(
    'if (!scene || !wrapper) return;',
    'console.log("[Envelope elements]", {\n      scene: !!scene,\n      wrapper: !!wrapper,\n      unsealBtn: !!unsealBtn\n    });\n    if (!scene || !wrapper) return;'
  );
}

if (!script.includes('[Envelope] opening')) {
  script = script.replace(
    'function handleTapToOpen() {',
    'function handleTapToOpen() {\n      console.log("[Envelope] opening", currentState);'
  );
}

if (!script.includes('[Envelope] seal clicked')) {
  script = script.replace(
    'unsealBtn.addEventListener("click", function (e) {\n        e.stopPropagation();\n        handleTapToOpen();',
    'unsealBtn.addEventListener("click", function (e) {\n        e.preventDefault();\n        e.stopPropagation();\n        console.log("[Envelope] seal clicked");\n        handleTapToOpen();'
  );
}

// 2. Cut off everything from 8b onwards and replace cleanly
const cutMarker = '// -------------------------------------------------------------\n  // 8b. HASH, SCROLL RESTORATION & NAVIGATION GUARD';
const cutIndex = script.indexOf('// 8b. HASH, SCROLL RESTORATION & NAVIGATION GUARD');
if (cutIndex === -1) {
  console.error('Could not find section 8b');
  process.exit(1);
}

// Find the line beginning before 8b
const beforeCut = script.substring(0, script.lastIndexOf('\n', cutIndex) + 1);

const cleanTail = `  // -------------------------------------------------------------
  // 8b. HASH, SCROLL RESTORATION & NAVIGATION GUARD
  // -------------------------------------------------------------
  function enforceLockedScroll() {
    if (!accessGranted) {
      if ("scrollRestoration" in window.history) {
        try {
          window.history.scrollRestoration = "manual";
        } catch (e) {}
      }
      var hash = window.location.hash;
      if (hash && hash !== "#envelopeScene") {
        try {
          if (window.history && window.history.replaceState) {
            window.history.replaceState(null, "", window.location.pathname + window.location.search);
          }
        } catch (e) {}
      }
      window.scrollTo(0, 0);
    }
  }

  window.addEventListener("hashchange", enforceLockedScroll);
  window.addEventListener("popstate", enforceLockedScroll);
  window.addEventListener("load", enforceLockedScroll);

  // -------------------------------------------------------------
  // 8c. COUPLE PHOTO CAROUSEL — OUR JOURNEY TOGETHER (ISHA & SAJAN)
  // -------------------------------------------------------------
  var coupleGalleryImages = [
    "./assets/images/gallery/01.jpeg",
    "./assets/images/gallery/02.jpeg",
    "./assets/images/gallery/03.jpeg",
    "./assets/images/gallery/04.jpeg",
    "./assets/images/gallery/05.jpeg",
    "./assets/images/gallery/06.jpeg",
    "./assets/images/gallery/07.jpeg",
    "./assets/images/gallery/08.jpeg",
    "./assets/images/gallery/09.jpeg",
    "./assets/images/gallery/10.jpeg",
    "./assets/images/gallery/11.jpeg",
    "./assets/images/gallery/12.jpeg",
    "./assets/images/gallery/14.jpeg",
    "./assets/images/gallery/15.jpeg",
    "./assets/images/gallery/16.jpeg",
    "./assets/images/gallery/17.jpeg",
    "./assets/images/gallery/18.jpeg",
    "./assets/images/gallery/19.jpeg",
    "./assets/images/gallery/20.jpeg",
    "./assets/images/gallery/21.jpeg",
    "./assets/images/gallery/22.jpeg",
    "./assets/images/gallery/23.jpeg",
    "./assets/images/gallery/24.jpeg",
    "./assets/images/gallery/25.jpeg",
    "./assets/images/gallery/26.jpeg",
    "./assets/images/gallery/27.jpeg",
    "./assets/images/gallery/28.jpeg",
    "./assets/images/gallery/29.jpeg",
    "./assets/images/gallery/30.jpeg",
    "./assets/images/gallery/31.jpeg",
    "./assets/images/gallery/32.jpeg",
    "./assets/images/gallery/33.jpeg",
    "./assets/images/gallery/34.jpeg",
    "./assets/images/gallery/35.jpeg",
    "./assets/images/gallery/36.jpeg",
    "./assets/images/gallery/37.jpeg",
    "./assets/images/gallery/38.jpeg",
    "./assets/images/gallery/39.jpeg"
  ];

  function initCoupleGallery() {
    var mainImage = document.getElementById("galleryMainImage");
    var carousel = document.getElementById("coupleGalleryCarousel");

    if (!mainImage || !carousel) {
      console.warn("Gallery elements not found; gallery initialization skipped.");
      return;
    }

    if (!coupleGalleryImages || !coupleGalleryImages.length) {
      return;
    }

    var stage = document.getElementById("galleryStage");
    var prevBtn = document.getElementById("galleryPrevBtn");
    var nextBtn = document.getElementById("galleryNextBtn");
    var counterEl = document.getElementById("galleryCounter");
    var progressBar = document.getElementById("galleryProgressBar");
    var blurBg = document.getElementById("galleryBlurBg") || document.querySelector(".gallery-blur-bg");

    var lightbox = document.getElementById("galleryLightbox");
    var lightboxImg = document.getElementById("lightboxImage");
    var lightboxOverlay = document.getElementById("lightboxOverlay");
    var lightboxClose = document.getElementById("lightboxClose");
    var lightboxPrev = document.getElementById("lightboxPrev");
    var lightboxNext = document.getElementById("lightboxNext");
    var lightboxCounter = document.getElementById("lightboxCounter");

    var currentGalleryIndex = 0;
    var isGalleryTransitioning = false;
    var galleryAutoplayTimer = null;
    var galleryAutoplayInterval = 4500;
    var isGalleryHoveredOrInteracting = false;
    var isGalleryLightboxOpen = false;

    function formatGalleryNumber(n) {
      return n < 10 ? "0" + n : "" + n;
    }

    function updateGalleryCounter() {
      if (counterEl && coupleGalleryImages.length > 0) {
        counterEl.textContent = formatGalleryNumber(currentGalleryIndex + 1) + " / " + formatGalleryNumber(coupleGalleryImages.length);
      }
      if (lightboxCounter && coupleGalleryImages.length > 0) {
        lightboxCounter.textContent = formatGalleryNumber(currentGalleryIndex + 1) + " / " + formatGalleryNumber(coupleGalleryImages.length);
      }
    }

    function updateGalleryProgress() {
      if (progressBar && coupleGalleryImages.length > 0) {
        var pct = ((currentGalleryIndex + 1) / coupleGalleryImages.length) * 100;
        progressBar.style.width = pct + "%";
      }
    }

    function updateGalleryBackground(src) {
      if (blurBg) {
        blurBg.style.setProperty("--gallery-current-image", 'url("' + src + '")');
        blurBg.style.backgroundImage = 'url("' + src + '")';
      }
    }

    function preloadGalleryNeighbors(index) {
      if (!coupleGalleryImages.length) return;
      var total = coupleGalleryImages.length;
      var nextIdx = (index + 1) % total;
      var prevIdx = (index - 1 + total) % total;
      var nextImg = new Image();
      nextImg.src = coupleGalleryImages[nextIdx];
      var prevImg = new Image();
      prevImg.src = coupleGalleryImages[prevIdx];
    }

    function applyGalleryImage(index, direction) {
      if (!coupleGalleryImages.length) return;

      if (index < 0) {
        index = coupleGalleryImages.length - 1;
      }
      if (index >= coupleGalleryImages.length) {
        index = 0;
      }
      if (isGalleryTransitioning) return;

      var src = coupleGalleryImages[index];
      var prefersReduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      if (!mainImage) return;

      if (!direction || prefersReduced) {
        currentGalleryIndex = index;
        mainImage.src = src;
        mainImage.alt = "Isha and Sajan – memory " + (currentGalleryIndex + 1);
        updateGalleryBackground(src);
        updateGalleryCounter();
        updateGalleryProgress();
        if (isGalleryLightboxOpen && lightboxImg) {
          lightboxImg.src = src;
        }
        preloadGalleryNeighbors(currentGalleryIndex);
        return;
      }

      isGalleryTransitioning = true;
      var preload = new Image();

      preload.onload = function () {
        var exitClass = direction === "next" ? "anim-exit-left" : "anim-exit-right";
        var enterPrepClass = direction === "next" ? "anim-enter-right-prep" : "anim-enter-left-prep";

        mainImage.className = "gallery-main-image " + exitClass;

        setTimeout(function () {
          currentGalleryIndex = index;
          mainImage.src = src;
          mainImage.alt = "Isha and Sajan – memory " + (currentGalleryIndex + 1);
          updateGalleryBackground(src);
          updateGalleryCounter();
          updateGalleryProgress();

          if (isGalleryLightboxOpen && lightboxImg) {
            lightboxImg.src = src;
          }

          mainImage.className = "gallery-main-image " + enterPrepClass;
          void mainImage.offsetWidth;
          mainImage.className = "gallery-main-image anim-active";

          setTimeout(function () {
            mainImage.className = "gallery-main-image";
            isGalleryTransitioning = false;
            preloadGalleryNeighbors(currentGalleryIndex);
          }, 700);
        }, 220);
      };

      preload.onerror = function () {
        console.error("Gallery image failed:", src);
        isGalleryTransitioning = false;
      };

      preload.src = src;
    }

    function nextGallerySlide() {
      applyGalleryImage(currentGalleryIndex + 1, "next");
    }

    function prevGallerySlide() {
      applyGalleryImage(currentGalleryIndex - 1, "prev");
    }

    function startGalleryAutoplay() {
      stopGalleryAutoplay();
      var prefersReduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (prefersReduced || isGalleryHoveredOrInteracting || isGalleryLightboxOpen) return;

      galleryAutoplayTimer = setInterval(function () {
        if (!isGalleryHoveredOrInteracting && !isGalleryLightboxOpen) {
          nextGallerySlide();
        }
      }, galleryAutoplayInterval);
    }

    function stopGalleryAutoplay() {
      if (galleryAutoplayTimer) {
        clearInterval(galleryAutoplayTimer);
        galleryAutoplayTimer = null;
      }
    }

    function pauseAndResumeGalleryAutoplay() {
      stopGalleryAutoplay();
      setTimeout(function () {
        startGalleryAutoplay();
      }, 3000);
    }

    // Diagnostic logging
    mainImage.addEventListener("load", function () {
      console.log("GALLERY IMAGE LOADED:", this.currentSrc || this.src);
    });

    mainImage.addEventListener("error", function () {
      console.error("GALLERY IMAGE FAILED:", this.getAttribute("src"), this.src);
    });

    // Step 7: Apply the first image immediately
    applyGalleryImage(0, null);

    // Prev / Next button clicks
    if (nextBtn) {
      nextBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        nextGallerySlide();
        pauseAndResumeGalleryAutoplay();
      });
    }

    if (prevBtn) {
      prevBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        prevGallerySlide();
        pauseAndResumeAutoplay();
      });
    }

    // Hover pauses autoplay
    carousel.addEventListener("mouseenter", function () {
      isGalleryHoveredOrInteracting = true;
      stopGalleryAutoplay();
    });

    carousel.addEventListener("mouseleave", function () {
      isGalleryHoveredOrInteracting = false;
      startGalleryAutoplay();
    });

    // Touch & Swipe gestures
    var touchStartX = 0;
    var touchStartY = 0;
    var touchEndX = 0;
    var touchEndY = 0;
    var isSwiping = false;

    carousel.addEventListener("touchstart", function (e) {
      if (e.touches.length === 1) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
        touchEndX = touchStartX;
        touchEndY = touchStartY;
        isSwiping = true;
        isGalleryHoveredOrInteracting = true;
        stopGalleryAutoplay();
      }
    }, { passive: true });

    carousel.addEventListener("touchmove", function (e) {
      if (isSwiping && e.touches.length === 1) {
        touchEndX = e.touches[0].clientX;
        touchEndY = e.touches[0].clientY;
      }
    }, { passive: true });

    carousel.addEventListener("touchend", function () {
      if (!isSwiping) return;
      isSwiping = false;
      var diffX = touchEndX - touchStartX;
      var diffY = touchEndY - touchStartY;

      if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 45) {
        if (diffX < 0) {
          nextGallerySlide();
        } else {
          prevGallerySlide();
        }
      }

      isGalleryHoveredOrInteracting = false;
      pauseAndResumeGalleryAutoplay();
    });

    // Keyboard navigation
    carousel.setAttribute("tabindex", "0");
    carousel.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight") {
        e.preventDefault();
        nextGallerySlide();
        pauseAndResumeGalleryAutoplay();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        prevGallerySlide();
        pauseAndResumeAutoplay();
      }
    });

    // Lightbox modal functions
    function openLightbox() {
      if (!lightbox || !lightboxImg) return;
      isGalleryLightboxOpen = true;
      stopGalleryAutoplay();
      lightbox.hidden = false;
      lightbox.removeAttribute("inert");
      lightbox.setAttribute("aria-hidden", "false");
      lightboxImg.src = coupleGalleryImages[currentGalleryIndex];
      updateGalleryCounter();
      document.body.style.overflow = "hidden";
    }

    function closeLightbox() {
      if (!lightbox) return;
      isGalleryLightboxOpen = false;
      lightbox.hidden = true;
      lightbox.setAttribute("inert", "");
      lightbox.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
      startGalleryAutoplay();
    }

    if (stage) {
      stage.addEventListener("click", function (e) {
        if (!e.target.closest(".gallery-nav")) {
          openLightbox();
        }
      });
    }

    if (lightboxClose) lightboxClose.addEventListener("click", closeLightbox);
    if (lightboxOverlay) lightboxOverlay.addEventListener("click", closeLightbox);

    if (lightboxNext) {
      lightboxNext.addEventListener("click", function (e) {
        e.stopPropagation();
        nextGallerySlide();
      });
    }

    if (lightboxPrev) {
      lightboxPrev.addEventListener("click", function (e) {
        e.stopPropagation();
        prevGallerySlide();
      });
    }

    if (lightbox) {
      var lbTouchStartX = 0;
      var lbTouchStartY = 0;
      var lbTouchEndX = 0;
      var lbTouchEndY = 0;

      lightbox.addEventListener("touchstart", function (e) {
        if (e.touches.length === 1) {
          lbTouchStartX = e.touches[0].clientX;
          lbTouchStartY = e.touches[0].clientY;
          lbTouchEndX = lbTouchStartX;
          lbTouchEndY = lbTouchStartY;
        }
      }, { passive: true });

      lightbox.addEventListener("touchmove", function (e) {
        if (e.touches.length === 1) {
          lbTouchEndX = e.touches[0].clientX;
          lbTouchEndY = e.touches[0].clientY;
        }
      }, { passive: true });

      lightbox.addEventListener("touchend", function () {
        var diffX = lbTouchEndX - lbTouchStartX;
        var diffY = lbTouchEndY - lbTouchStartY;
        if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 45) {
          if (diffX < 0) {
            nextGallerySlide();
          } else {
            prevGallerySlide();
          }
        }
      });
    }

    document.addEventListener("keydown", function (e) {
      if (isGalleryLightboxOpen) {
        if (e.key === "Escape") {
          closeLightbox();
        } else if (e.key === "ArrowRight") {
          nextGallerySlide();
        } else if (e.key === "ArrowLeft") {
          prevGallerySlide();
        }
      }
    });

    startGalleryAutoplay();
  }

  // -------------------------------------------------------------
  // 9. INITIALIZE ON DOM READY
  // -------------------------------------------------------------
  document.addEventListener("DOMContentLoaded", function () {
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
  });

  // Immediate guard on initial script execution
  enforceLockedScroll();

})();
`;

fs.writeFileSync(scriptPath, beforeCut + cleanTail, 'utf8');
console.log('script.js updated.');
