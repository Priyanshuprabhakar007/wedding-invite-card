/**
 * Isha & Sagar Luxury Wedding Invitation Engine
 * Layered Envelope Unsealing & Full Celebration Experience
 */
(function () {
  "use strict";

  var data = window.WEDDING_CONFIG || {};
  var byId = function (id) { return document.getElementById(id); };
  var audioCtx = null;
  var isMusicPlaying = false;
  var isEnvelopeOpened = false;

  // -------------------------------------------------------------
  // 1. DATA BINDING
  // -------------------------------------------------------------
  function bindData(cfg) {
    if (!cfg) return;

    // Couple & Date
    if (byId("partnerOne")) byId("partnerOne").textContent = cfg.couple.partnerOne || "Isha";
    if (byId("connector")) byId("connector").textContent = cfg.couple.connector || "&";
    if (byId("partnerTwo")) byId("partnerTwo").textContent = cfg.couple.partnerTwo || "Sagar";
    if (byId("heroDate")) byId("heroDate").textContent = cfg.event.dateDisplay || "18.12.2026";
    if (byId("weddingDay")) byId("weddingDay").textContent = cfg.copy.weddingDay || "The Wedding Celebration";
    if (byId("subGreeting")) byId("subGreeting").textContent = cfg.couple.subGreeting || "Together with their families";
    if (byId("heroVenueTag")) byId("heroVenueTag").textContent = cfg.event.city || "Jaipur, Rajasthan";

    // Welcome Letter
    if (byId("letterTitle")) byId("letterTitle").textContent = cfg.copy.dearFriends;
    if (byId("letterOne")) byId("letterOne").textContent = cfg.copy.letterOne;
    if (byId("letterTwo")) byId("letterTwo").textContent = cfg.copy.letterTwo;

    // Countdown & Schedule
    if (byId("countdownTitle")) byId("countdownTitle").textContent = cfg.copy.countdownTitle;
    if (byId("scheduleTitle")) byId("scheduleTitle").textContent = cfg.copy.scheduleTitle;

    // Location
    if (byId("locationTitle")) byId("locationTitle").textContent = cfg.copy.locationTitle;
    if (byId("venueName")) byId("venueName").textContent = cfg.event.venue;
    if (byId("venueAddress")) byId("venueAddress").textContent = cfg.event.address;
    if (byId("mapButton") && cfg.event.googleMapsUrl) {
      byId("mapButton").href = cfg.event.googleMapsUrl;
    }

    // Dress code
    if (byId("dressTitle")) byId("dressTitle").textContent = cfg.copy.dressCodeTitle;
    if (byId("dressIntro")) byId("dressIntro").textContent = cfg.copy.dressIntro;
    if (byId("gentlemenLabel")) byId("gentlemenLabel").textContent = cfg.copy.gentlemen;
    if (byId("gentlemenText")) byId("gentlemenText").textContent = cfg.copy.gentlemenText;
    if (byId("ladiesLabel")) byId("ladiesLabel").textContent = cfg.copy.ladies;
    if (byId("ladiesText")) byId("ladiesText").textContent = cfg.copy.ladiesText;

    // Details & Contact
    if (byId("detailsTitle")) byId("detailsTitle").textContent = cfg.copy.detailsTitle;
    if (byId("contactCopy")) byId("contactCopy").textContent = cfg.copy.contactCopy;
    if (byId("organizerName")) byId("organizerName").textContent = cfg.copy.organizerName;
    if (byId("organizerPhone")) {
      byId("organizerPhone").textContent = cfg.copy.organizerPhone;
      byId("organizerPhone").href = "tel:" + cfg.copy.organizerPhone.replace(/[^+\d]/g, "");
    }
    if (byId("giftCopy")) byId("giftCopy").textContent = cfg.copy.giftCopy;

    // RSVP Section
    if (byId("rsvpIntro")) byId("rsvpIntro").textContent = cfg.copy.rsvpIntro;
    if (byId("rsvpTitle")) byId("rsvpTitle").textContent = cfg.copy.rsvpTitle;
    if (byId("rsvpButton")) byId("rsvpButton").textContent = cfg.copy.rsvpButton;
    if (byId("signoff")) byId("signoff").textContent = cfg.copy.signoff;
    if (byId("closingNames")) byId("closingNames").textContent = cfg.copy.closingNames;

    renderTimeline(cfg.events || []);
    buildRsvpForm(cfg);
  }

  // -------------------------------------------------------------
  // 2. TIMELINE RENDERER
  // -------------------------------------------------------------
  function renderTimeline(events) {
    var host = byId("eventTimeline");
    if (!host) return;
    host.innerHTML = "";

    events.forEach(function (ev) {
      var item = document.createElement("div");
      item.className = "timeline-item motion-reveal";

      item.innerHTML =
        '<div class="timeline-time-col">' +
          '<div class="timeline-time">' + (ev.time || "") + '</div>' +
          (ev.date ? '<div class="timeline-date-small">' + ev.date + '</div>' : '') +
        '</div>' +
        '<div class="timeline-dot-col"><div class="timeline-dot"></div></div>' +
        '<div class="timeline-content">' +
          '<div class="timeline-name">' + (ev.name || "") + '</div>' +
          (ev.venue ? '<div class="timeline-venue">📍 ' + ev.venue + '</div>' : '') +
          (ev.attire ? '<div class="timeline-attire">👗 ' + ev.attire + '</div>' : '') +
        '</div>';

      host.appendChild(item);
    });
  }

  // -------------------------------------------------------------
  // 3. COUNTDOWN TIMER
  // -------------------------------------------------------------
  function startCountdown(targetDateStr) {
    var target = new Date(targetDateStr).getTime();
    var host = byId("countdown");
    if (!host) return;

    function tick() {
      var now = Date.now();
      var distance = Math.max(0, target - now);

      var days = Math.floor(distance / (1000 * 60 * 60 * 24));
      var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      var seconds = Math.floor((distance % (1000 * 60)) / 1000);

      host.innerHTML =
        '<div class="countdown-unit"><span class="countdown-value">' + String(days).padStart(2, "0") + '</span><span class="countdown-label">Days</span></div>' +
        '<span class="countdown-separator">:</span>' +
        '<div class="countdown-unit"><span class="countdown-value">' + String(hours).padStart(2, "0") + '</span><span class="countdown-label">Hours</span></div>' +
        '<span class="countdown-separator">:</span>' +
        '<div class="countdown-unit"><span class="countdown-value">' + String(minutes).padStart(2, "0") + '</span><span class="countdown-label">Mins</span></div>' +
        '<span class="countdown-separator">:</span>' +
        '<div class="countdown-unit"><span class="countdown-value">' + String(seconds).padStart(2, "0") + '</span><span class="countdown-label">Secs</span></div>';
    }

    tick();
    setInterval(tick, 1000);
  }

  // -------------------------------------------------------------
  // 4. MUSIC & SOUND SYNTHESIZER
  // -------------------------------------------------------------
  function initAudio() {
    try {
      var AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      audioCtx = new AudioContext();
    } catch (e) {
      console.log("Audio not available", e);
    }
  }

  function playUnsealSound() {
    if (!audioCtx) initAudio();
    if (!audioCtx) return;
    if (audioCtx.state === 'suspended') audioCtx.resume();

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
  }

  function playWeddingMelody() {
    if (!audioCtx) initAudio();
    if (!audioCtx) return;
    if (audioCtx.state === 'suspended') audioCtx.resume();

    var notes = [
      523.25, 587.33, 659.25, 783.99, 880.00, 1046.50,
      659.25, 783.99, 880.00, 1046.50, 1174.66, 1318.51
    ];
    var noteIndex = 0;

    function playPluck() {
      if (!isMusicPlaying) return;
      var osc = audioCtx.createOscillator();
      var gain = audioCtx.createGain();

      osc.type = "sine";
      var freq = notes[noteIndex % notes.length];
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

      gain.gain.setValueAtTime(0.001, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.1, audioCtx.currentTime + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 2.2);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + 2.3);

      noteIndex = (noteIndex + 1);
      setTimeout(playPluck, 650 + (noteIndex % 3 === 0 ? 800 : 250));
    }

    playPluck();
  }

  function toggleMusic() {
    var btn = byId("musicToggle");
    if (!audioCtx) initAudio();

    if (isMusicPlaying) {
      isMusicPlaying = false;
      if (btn) {
        btn.classList.remove("is-playing");
        btn.innerHTML = "▶";
      }
      if (audioCtx && audioCtx.state === 'running') audioCtx.suspend();
    } else {
      isMusicPlaying = true;
      if (btn) {
        btn.classList.add("is-playing");
        btn.innerHTML = "⏸";
      }
      if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
      playWeddingMelody();
    }
  }

  // -------------------------------------------------------------
  // 5. STEP-BY-STEP LUXURY ENVELOPE OPENING ANIMATION
  // -------------------------------------------------------------
  function setupEnvelopeOpening() {
    var scene = byId("envelopeScene");
    var wrapper = byId("envelopeWrapper");
    var enterCta = byId("enterCtaWrap");
    var enterBtn = byId("enterCelebrationBtn");
    var heroVideo = byId("heroVideo");

    if (!scene || !wrapper) return;

    // After entrance animation completes (1100ms), start subtle float
    setTimeout(function () {
      if (!isEnvelopeOpened) scene.classList.add("is-idle");
    }, 1100);

    var unsealBtn = byId("unsealHitBtn");
    var cardEl = byId("invitationCard");

    function startOpeningSequence() {
      if (isEnvelopeOpened) return;
      isEnvelopeOpened = true;
      scene.classList.remove("is-idle");
      wrapper.setAttribute("aria-expanded", "true");

      // Play soft unseal pop sound
      playUnsealSound();

      // STEP 1 — SEAL PRESS (0ms - 180ms)
      scene.classList.add("is-pressing");

      // STEP 2 — SEAL RELEASE & BOTTOM POCKET SLIDES DOWN (180ms)
      setTimeout(function () {
        scene.classList.remove("is-pressing");
        scene.classList.add("is-opening");
      }, 180);

      // STEP 3 — FULL PRISTINE CARD PROUDLY REVEALED & CENTERED (850ms)
      setTimeout(function () {
        scene.classList.add("is-opened");
        if (enterCta) {
          enterCta.classList.add("is-visible");
        }
      }, 850);
    }

    if (unsealBtn) {
      unsealBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        startOpeningSequence();
      });
    }

    if (cardEl) {
      cardEl.addEventListener("click", function (e) {
        if (isEnvelopeOpened) {
          e.stopPropagation();
          scrollToCelebration();
        }
      });
    }

    var openInviteScreen = setupInviteCodeScreen(startOpeningSequence);

    // Click on envelope wrapper (or image) -> Opens Invite Code Screen
    wrapper.addEventListener("click", function (e) {
      if (!isEnvelopeOpened) {
        if (typeof openInviteScreen === "function") {
          openInviteScreen();
        } else {
          startOpeningSequence();
        }
      } else {
        // If already opened, clicking card/envelope smoothly scrolls to celebration
        scrollToCelebration();
      }
    });

    // Keyboard navigation (Enter or Space)
    wrapper.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        if (!isEnvelopeOpened) {
          if (typeof openInviteScreen === "function") {
            openInviteScreen();
          } else {
            startOpeningSequence();
          }
        } else {
          scrollToCelebration();
        }
      }
    });

    function scrollToCelebration() {
      document.body.classList.remove("envelope-closed-state");
      toggleMusic(); // Start background music if not playing
      if (heroVideo) {
        heroVideo.play().catch(function () {});
      }

      var celebrationHero = byId("celebrationHero");
      if (celebrationHero) {
        celebrationHero.scrollIntoView({ behavior: "smooth" });
      }
    }

    // Enter Celebration Button click -> Smooth Scroll to Full Website & Auto-start Music
    if (enterBtn) {
      enterBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        scrollToCelebration();
      });
    }
  }

  // -------------------------------------------------------------
  // 5b. FULL-SCREEN INVITE CODE SCREEN (ANDROID / MOBILE OPTIMIZED)
  // -------------------------------------------------------------
  function setupInviteCodeScreen(onUnlock) {
    var triggerBtn = byId("inviteCodeBtn");
    var envelopeScene = byId("envelopeScene");
    var screen = byId("inviteCodeScreen");
    var backBtn = byId("inviteCodeBackBtn");
    var cardWrap = byId("inviteCardBgWrap");
    var form = byId("inviteCodeScreenForm");
    var input = byId("inviteCodeScreenInput");
    var errorMsg = byId("inviteCodeErrorMsg");
    var submitBtn = byId("inviteScreenSubmitBtn");
    var successOverlay = byId("inviteScreenSuccessOverlay");

    if (!screen) return function () {};

    function openInviteScreen() {
      if (isEnvelopeOpened) return;

      // Step 1: Smooth fade out envelope (350ms)
      if (envelopeScene) envelopeScene.classList.add("is-faded-out");

      setTimeout(function () {
        screen.hidden = false;
        screen.classList.remove("is-screen-fading-out");
        if (successOverlay) successOverlay.hidden = true;
        if (errorMsg) {
          errorMsg.hidden = true;
          errorMsg.textContent = "";
        }
        if (input) input.value = "";
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.classList.remove("is-pressed");
        }

        // Force browser layout reflow before triggering staged animation
        if (cardWrap) {
          void cardWrap.offsetHeight;
          // Step 2, 3, 4: Staged entrance animation
          cardWrap.classList.add("is-animated-in");
        }

        // Focus text input after card animation
        setTimeout(function () {
          if (input) input.focus();
        }, 350);
      }, 300);
    }

    function closeInviteScreen(callback) {
      screen.classList.add("is-screen-fading-out");
      setTimeout(function () {
        screen.hidden = true;
        screen.classList.remove("is-screen-fading-out");
        if (cardWrap) cardWrap.classList.remove("is-animated-in");
        if (envelopeScene) envelopeScene.classList.remove("is-faded-out");
        if (typeof callback === "function") callback();
      }, 350);
    }

    if (triggerBtn) {
      triggerBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        openInviteScreen();
      });
    }

    if (backBtn) {
      backBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        closeInviteScreen();
      });
    }

    if (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var rawCode = (input ? input.value : "").trim();
        var code = rawCode.toUpperCase();

        // Validation 1: Empty input
        if (!code) {
          if (errorMsg) {
            errorMsg.textContent = "Please enter your invite code.";
            errorMsg.hidden = false;
          }
          if (input) input.focus();
          return;
        }

        // Validation 2: Check code validity (length check)
        if (code.length < 2) {
          if (errorMsg) {
            errorMsg.textContent = "That invite code doesn’t seem to match. Please try again.";
            errorMsg.hidden = false;
          }
          if (input) input.focus();
          return;
        }

        // Code is valid
        if (errorMsg) errorMsg.hidden = true;
        if (input) input.blur();

        // Button press animation feedback (1.0 -> 0.97 -> 1.0)
        if (submitBtn) {
          submitBtn.classList.add("is-pressed");
          submitBtn.disabled = true;
        }

        // Save access in localStorage
        localStorage.setItem("wedding_guest_code", code);

        // Directly and smoothly fade out invite screen and unseal envelope
        setTimeout(function () {
          closeInviteScreen(function () {
            if (typeof onUnlock === "function") {
              onUnlock();
            }
          });
        }, 180);
      });
    }

    return openInviteScreen;
  }

  // -------------------------------------------------------------
  // 6. SCROLL REVEAL ANIMATIONS
  // -------------------------------------------------------------
  function setupScrollAnimations() {
    var elements = document.querySelectorAll(".motion-reveal");
    var frames = document.querySelectorAll(".frame");

    if (!("IntersectionObserver" in window)) {
      elements.forEach(function (el) { el.classList.add("is-visible"); });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
        }
      });
    }, { threshold: 0.15 });

    elements.forEach(function (el) { observer.observe(el); });

    var frameObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var frame = entry.target;
          var isLeft = frame.classList.contains("frame-one");
          frame.style.animation = (isLeft ? "swingLeft" : "swingRight") + " 3.5s ease-in-out infinite alternate";
        }
      });
    }, { threshold: 0.2 });

    frames.forEach(function (f) { frameObserver.observe(f); });
  }

  // -------------------------------------------------------------
  // 7. LUXURY WEDDING PETAL SHOWER (PNG ASSETS + SLOW GLITCH-FREE 3D)
  // -------------------------------------------------------------
  function setupPetals() {
    var container = byId("petalShower");
    if (!container) return;

    // Direct web-safe paths to prepared transparent PNG petal assets
    var PETAL_ASSETS = [
      "assets/images/Petal Shower/petal-1.png",
      "assets/images/Petal Shower/petal-2.png",
      "assets/images/Petal Shower/petal-3.png",
      "assets/images/Petal Shower/petal-4.png",
      "assets/images/Petal Shower/petal-5.png",
      "assets/images/Petal Shower/petal-6.png",
      "assets/images/Petal Shower/petal-7.png",
      "assets/images/Petal Shower/petal-8.png"
    ];

    container.innerHTML = "";

    var isMobile = window.innerWidth <= 768;
    // Mobile: 14 petals, Desktop: 24 petals
    var count = isMobile ? 14 : 24;

    function rand(min, max) {
      return Math.random() * (max - min) + min;
    }

    for (var i = 0; i < count; i++) {
      var item = document.createElement("div");
      var inner = document.createElement("div");

      // Pick random asset
      var asset = PETAL_ASSETS[i % PETAL_ASSETS.length];
      inner.className = "petal-inner";
      inner.style.backgroundImage = 'url("' + asset + '")';

      // Visual depth layer & slow durations
      var layerRand = Math.random();
      var layerClass = "layer-mid";
      var size, fallDuration, tumbleDuration, scale;

      if (layerRand < 0.35) {
        // Background Layer: small, soft, ultra slow fall
        layerClass = "layer-bg";
        size = isMobile ? rand(18, 26) : rand(22, 32);
        fallDuration = rand(26.0, 36.0); // 26s - 36s ultra slow
        tumbleDuration = rand(9.0, 14.0);
        scale = rand(0.8, 0.95);
      } else if (layerRand < 0.80) {
        // Midground Layer: standard size, very slow gentle fall
        layerClass = "layer-mid";
        size = isMobile ? rand(26, 36) : rand(32, 46);
        fallDuration = rand(21.0, 28.0); // 21s - 28s slow
        tumbleDuration = rand(8.0, 12.0);
        scale = rand(0.95, 1.1);
      } else {
        // Foreground Layer: majestic larger petals, slow graceful fall
        layerClass = "layer-fg";
        size = isMobile ? rand(36, 46) : rand(48, 62);
        fallDuration = rand(17.0, 23.0); // 17s - 23s slow
        tumbleDuration = rand(7.0, 10.0);
        scale = rand(1.1, 1.3);
      }

      item.className = "petal-item " + layerClass;
      item.style.left = rand(0, 96).toFixed(1) + "vw";

      // Set dimensions on inner element
      inner.style.width = size.toFixed(0) + "px";
      inner.style.height = size.toFixed(0) + "px";

      // Gentle horizontal sway offsets
      var drift1 = (rand(-20, 20) + (Math.random() > 0.5 ? 15 : -15)).toFixed(1) + "px";
      var drift2 = (rand(-35, 35)).toFixed(1) + "px";
      var drift3 = (rand(-25, 25) + (Math.random() > 0.5 ? -15 : 15)).toFixed(1) + "px";
      var driftEnd = (rand(-40, 40)).toFixed(1) + "px";

      item.style.setProperty("--x-drift-1", drift1);
      item.style.setProperty("--x-drift-2", drift2);
      item.style.setProperty("--x-drift-3", drift3);
      item.style.setProperty("--x-drift-end", driftEnd);

      // Subtle, gentle 3D rotations on inner element
      inner.style.setProperty("--rot-x-1", rand(-15, 15).toFixed(1) + "deg");
      inner.style.setProperty("--rot-y-1", rand(-20, 20).toFixed(1) + "deg");
      inner.style.setProperty("--rot-z-1", rand(-30, 30).toFixed(1) + "deg");

      inner.style.setProperty("--rot-x-2", rand(-18, 18).toFixed(1) + "deg");
      inner.style.setProperty("--rot-y-2", rand(-22, 22).toFixed(1) + "deg");
      inner.style.setProperty("--rot-z-2", rand(-20, 20).toFixed(1) + "deg");

      inner.style.setProperty("--rot-x-3", rand(-15, 15).toFixed(1) + "deg");
      inner.style.setProperty("--rot-y-3", rand(-20, 20).toFixed(1) + "deg");
      inner.style.setProperty("--rot-z-3", rand(-40, 40).toFixed(1) + "deg");

      inner.style.setProperty("--petal-scale", scale.toFixed(2));

      // Timings: negative delay spreads petals instantly across viewport on load without pops
      item.style.animationDuration = fallDuration.toFixed(2) + "s";
      item.style.animationDelay = (-rand(0, fallDuration)).toFixed(2) + "s";

      inner.style.animationDuration = tumbleDuration.toFixed(2) + "s";
      inner.style.animationDelay = (-rand(0, tumbleDuration)).toFixed(2) + "s";

      item.appendChild(inner);
      container.appendChild(item);
    }

    // Gracefully handle screen resize / orientation changes
    var resizeTimer;
    window.addEventListener("resize", function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        var newIsMobile = window.innerWidth <= 768;
        if (newIsMobile !== isMobile) {
          setupPetals();
        }
      }, 300);
    });
  }

  // -------------------------------------------------------------
  // 8. RSVP MODAL & SUBMISSIONS (WhatsApp & Local)
  // -------------------------------------------------------------
  function buildRsvpForm(cfg) {
    var modal = byId("rsvpModal");
    var openBtn = byId("rsvpButton");
    var closeBtn = byId("modalClose");
    var form = byId("rsvpForm");
    var formContainer = byId("formView");
    var successView = byId("successView");
    var doneBtn = byId("successDone");

    if (!modal || !openBtn || !form) return;

    openBtn.addEventListener("click", function () {
      modal.hidden = false;
      document.body.style.overflow = "hidden";
    });

    function closeModal() {
      modal.hidden = true;
      document.body.style.overflow = "";
      if (formContainer && successView) {
        formContainer.hidden = false;
        successView.hidden = true;
      }
    }

    if (closeBtn) closeBtn.addEventListener("click", closeModal);
    if (doneBtn) doneBtn.addEventListener("click", closeModal);
    modal.addEventListener("click", function (e) {
      if (e.target === modal) closeModal();
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var formData = new FormData(form);
      var name = formData.get("guestName") || "Guest";
      var count = formData.get("familyGuestCount") || "1";
      var attendance = formData.get("attendance") || "Yes";
      var msg = formData.get("message") || "";

      var responses = JSON.parse(localStorage.getItem("wedding_rsvps") || "[]");
      responses.push({
        name: name,
        guests: count,
        attendance: attendance,
        message: msg,
        timestamp: new Date().toISOString()
      });
      localStorage.setItem("wedding_rsvps", JSON.stringify(responses));

      formContainer.hidden = true;
      successView.hidden = false;
    });

    var whatsappBtn = byId("rsvpWhatsappBtn");
    if (whatsappBtn) {
      whatsappBtn.addEventListener("click", function () {
        var formData = new FormData(form);
        var name = formData.get("guestName") || "";
        var count = formData.get("familyGuestCount") || "1";
        var attendance = formData.get("attendance") || "Joyfully Accept";
        var msg = formData.get("message") || "";

        var text = "✨ *Wedding RSVP for Isha & Sagar's Wedding* ✨\n\n" +
          "👤 *Name:* " + (name || "Family & Friends") + "\n" +
          "✅ *Attendance:* " + attendance + "\n" +
          "👥 *Number of Guests:* " + count + "\n" +
          (msg ? ("💌 *Message:* " + msg + "\n") : "") +
          "\nLooking forward to celebrating with you!";

        var phone = cfg.copy.organizerWhatsapp || "919876543210";
        var url = "https://wa.me/" + phone + "?text=" + encodeURIComponent(text);
        window.open(url, "_blank");
      });
    }
  }

  // -------------------------------------------------------------
  // 9. INITIALIZE ON DOM READY
  // -------------------------------------------------------------
  document.addEventListener("DOMContentLoaded", function () {
    bindData(data);
    startCountdown(data.event.countdownDate || "2026-12-18T17:00:00+05:30");
    setupEnvelopeOpening();
    setupScrollAnimations();
    setupPetals();

    var musicBtn = byId("musicToggle");
    if (musicBtn) {
      musicBtn.addEventListener("click", toggleMusic);
    }
  });

})();
