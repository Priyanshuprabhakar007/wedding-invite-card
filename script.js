/**
 * Isha & Sajan Luxury Wedding Invitation Engine
 * Layered Envelope Unsealing & Full Celebration Experience
 */
(function () {
  "use strict";

  var data = window.WEDDING_CONFIG || {};
  var byId = function (id) { return document.getElementById(id); };
  var audioCtx = null;
  var isMusicPlaying = false;
  var isEnvelopeOpened = false;
  var accessGranted = false;
  var activeInvitation = null;

  // Memory-only authentication lifecycle: unconditionally purge any legacy persistent keys
  try {
    localStorage.removeItem("wedding_guest_code");
    sessionStorage.removeItem("wedding_guest_code");
    sessionStorage.removeItem("wedding_guest_session_code");
  } catch (e) {}

  // -------------------------------------------------------------
  // 0. DEFENSIVE VALIDATION & INVITATION ACCESS SYSTEM
  // -------------------------------------------------------------
  function validateWeddingConfig(cfg) {
    if (!cfg) {
      console.error("[Wedding Config Error] Missing WEDDING_CONFIG object.");
      return false;
    }
    var events = cfg.events || [];
    var bundles = cfg.invitationBundles || {};
    var codes = cfg.inviteCodes || {};
    var universal = cfg.universalEventIds || [];

    var eventIds = new Set();
    events.forEach(function (ev, idx) {
      if (!ev.id || typeof ev.id !== "string" || !ev.id.trim()) {
        console.error("[Wedding Config Error] Event at index " + idx + " is missing a valid id: ", ev);
      } else if (eventIds.has(ev.id)) {
        console.error("[Wedding Config Error] Duplicate event id found: \"" + ev.id + "\"");
      } else {
        eventIds.add(ev.id);
      }
    });

    Object.keys(bundles).forEach(function (bKey) {
      var list = bundles[bKey];
      if (!Array.isArray(list)) {
        console.error("[Wedding Config Error] Bundle \"" + bKey + "\" must be an array.");
      } else {
        list.forEach(function (eId) {
          if (!eventIds.has(eId)) {
            console.error("[Wedding Config Error] Bundle \"" + bKey + "\" references unknown event id: \"" + eId + "\".");
          }
        });
      }
    });

    Object.keys(codes).forEach(function (cKey) {
      var conf = codes[cKey];
      if (!conf || !conf.bundle || !bundles[conf.bundle]) {
        console.error("[Wedding Config Error] Invite code \"" + cKey + "\" references missing bundle: \"" + (conf ? conf.bundle : "undefined") + "\".");
      }
    });

    return true;
  }

  function resolveInvitation(rawCode) {
    if (!rawCode || typeof rawCode !== "string") return null;
    var code = rawCode.trim().toUpperCase();
    var cfg = window.WEDDING_CONFIG || data || {};
    var inviteCodes = cfg.inviteCodes || {};
    var bundles = cfg.invitationBundles || {};
    var allEvents = cfg.events || [];

    if (!Object.prototype.hasOwnProperty.call(inviteCodes, code)) {
      return null;
    }

    var codeConfig = inviteCodes[code] || {};
    var bundleName = codeConfig.bundle;
    var bundleEventIds = (bundles && Array.isArray(bundles[bundleName])) ? bundles[bundleName] : [];

    var allowedIdsSet = new Set(bundleEventIds);

    // Filter against cfg.events preserving original chronological order
    var allowedEvents = allEvents.filter(function (ev) {
      return allowedIdsSet.has(ev.id);
    });

    var allowedEventIds = allowedEvents.map(function (ev) {
      return ev.id;
    });

    return {
      code: code,
      label: codeConfig.label || "",
      bundle: bundleName,
      allowedEventIds: allowedEventIds,
      allowedEvents: allowedEvents
    };
  }

  // -------------------------------------------------------------
  // CENTRALIZED INVITATION UNLOCK GATEWAY
  // -------------------------------------------------------------
  function unlockInvitation(invitation) {
    if (!invitation || typeof invitation !== "object") {
      console.warn("[Access Control] unlockInvitation called with empty or invalid payload.");
      return false;
    }
    if (!invitation.code || typeof invitation.code !== "string") {
      console.warn("[Access Control] unlockInvitation rejected: missing invitation code.");
      return false;
    }
    if (!invitation.bundle || typeof invitation.bundle !== "string") {
      console.warn("[Access Control] unlockInvitation rejected: missing bundle reference.");
      return false;
    }
    if (!Array.isArray(invitation.allowedEvents) || invitation.allowedEvents.length === 0) {
      console.warn("[Access Control] unlockInvitation rejected: no allowed events resolved.");
      return false;
    }

    // 1. Authoritative access state
    accessGranted = true;
    activeInvitation = invitation;
    window.accessGranted = true;
    window.activeInvitation = invitation;

    // 2. Render only the allowed dynamic content
    renderTimeline(invitation.allowedEvents);
    renderCeremonySections(invitation.allowedEvents);
    updateRsvpFormEvents(invitation);

    // 3. Keep invite input field synchronized
    var screenInput = byId("cardInviteCodeInput") || byId("inviteCodeScreenInput");
    if (screenInput) {
      screenInput.value = invitation.code;
    }

    // 4. Reveal protected main invitation shell in DOM
    var mainSite = byId("mainSite");
    if (mainSite) {
      mainSite.removeAttribute("hidden");
      mainSite.removeAttribute("inert");
      mainSite.setAttribute("aria-hidden", "false");
    }

    // 5. Remove locked CSS class from body
    document.body.classList.remove("invitation-locked");

    if ("scrollRestoration" in window.history) {
      try {
        window.history.scrollRestoration = "auto";
      } catch (e) {}
    }

    // Authorization is strictly memory-only: purge any legacy persistent keys
    try {
      localStorage.removeItem("wedding_guest_code");
      sessionStorage.removeItem("wedding_guest_code");
      sessionStorage.removeItem("wedding_guest_session_code");
    } catch (e) {}

    return true;
  }

  function applyInvitation(invitation) {
    return unlockInvitation(invitation);
  }

  function updateRsvpFormEvents(invitation) {
    var container = byId("rsvpFunctionsList");
    var badge = byId("rsvpInvitationBadge");
    if (!container) return;

    var eventsToDisplay = (invitation && Array.isArray(invitation.allowedEvents)) ?
      invitation.allowedEvents :
      [];

    if (badge) {
      if (invitation && invitation.label) {
        badge.textContent = "✨ " + invitation.label;
        badge.hidden = false;
      } else {
        badge.hidden = true;
      }
    }

    container.innerHTML = "";
    eventsToDisplay.forEach(function (ev) {
      var label = document.createElement("label");
      label.className = "rsvp-function-item";

      var checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.name = "attendingEvent";
      checkbox.value = ev.name;
      checkbox.checked = true;

      var textSpan = document.createElement("span");
      textSpan.className = "func-name";
      textSpan.textContent = ev.name;

      label.appendChild(checkbox);
      label.appendChild(textSpan);
      container.appendChild(label);
    });
  }

  // Expose for testing & global inspection
  window.resolveInvitation = resolveInvitation;
  window.unlockInvitation = unlockInvitation;
  window.applyInvitation = applyInvitation;
  window.accessGranted = false;
  window.activeInvitation = null;

  // -------------------------------------------------------------
  // 1. DATA BINDING
  // -------------------------------------------------------------
  function bindData(cfg) {
    if (!cfg) return;

    // Couple & Date
    if (byId("partnerOne")) byId("partnerOne").textContent = cfg.couple.partnerOne || "Isha";
    if (byId("connector")) byId("connector").textContent = cfg.couple.connector || "&";
    if (byId("partnerTwo")) byId("partnerTwo").textContent = cfg.couple.partnerTwo || "Sajan";
    if (byId("heroDate")) byId("heroDate").textContent = cfg.event.dateDisplay || "NOVEMBER 2026";
    if (byId("weddingDay")) byId("weddingDay").textContent = cfg.copy.weddingDay || "The Wedding Celebration";
    if (byId("subGreeting")) byId("subGreeting").textContent = cfg.couple.subGreeting || "Together with their families";
    if (byId("heroVenueTag")) byId("heroVenueTag").textContent = cfg.event.city || "South Florida, Florida";

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

    validateWeddingConfig(cfg);
    buildRsvpForm(cfg);

    // DYNAMIC CONTENT PROTECTION:
    // Before authorization, clear ceremony and timeline hosts.
    var timelineHost = byId("eventTimeline");
    if (timelineHost) timelineHost.innerHTML = "";
    var ceremonyContainer = byId("ceremonyDetailsContainer");
    if (ceremonyContainer) ceremonyContainer.innerHTML = "";

    // Unconditionally purge any legacy authentication keys (authorization is strictly memory-only)
    try {
      localStorage.removeItem("wedding_guest_code");
      sessionStorage.removeItem("wedding_guest_code");
      sessionStorage.removeItem("wedding_guest_session_code");
    } catch (e) {}
  }

  // -------------------------------------------------------------
  // 2. TIMELINE RENDERER
  // -------------------------------------------------------------
  function renderTimeline(events) {
    var host = byId("eventTimeline");
    if (!host) return;
    host.innerHTML = "";

    if (!events || events.length === 0) {
      return;
    }

    events.forEach(function (ev, idx) {
      var item = document.createElement("div");
      item.className = "timeline-item motion-reveal";
      item.style.setProperty("--item-index", idx);

      item.innerHTML =
        '<div class="timeline-time-col">' +
          '<div class="timeline-time-box">' +
            '<div class="timeline-time">' + (ev.time || "") + '</div>' +
            (ev.date ? '<div class="timeline-date-small">' + ev.date + '</div>' : '') +
          '</div>' +
        '</div>' +
        '<div class="timeline-flower-col" aria-hidden="true">' +
          '<img src="assets/images/flower.svg" class="timeline-flower-marker" alt="" aria-hidden="true">' +
        '</div>' +
        '<div class="timeline-content">' +
          '<div class="timeline-card">' +
            '<div class="timeline-name">' + (ev.name || "") + '</div>' +
            (ev.venue ? '<div class="timeline-venue"><span class="venue-mark">✦</span><span>' + ev.venue + '</span></div>' : '') +
            (ev.attire ? '<div class="timeline-attire"><span class="attire-mark">✦</span><span>' + ev.attire + '</span></div>' : '') +
          '</div>' +
        '</div>';

      host.appendChild(item);
    });

    observeMotionElements(host);
  }

  // -------------------------------------------------------------
  // 2b. CEREMONY DETAILS SECTIONS RENDERER
  // -------------------------------------------------------------
  function renderCeremonySections(events) {
    var container = byId("ceremonyDetailsContainer");
    if (!container) return;
    container.innerHTML = "";

    if (!events || events.length === 0) {
      return;
    }

    events.forEach(function (ev, index) {
      // Subtle decorative transition divider between ceremonies
      if (index > 0) {
        var divider = document.createElement("div");
        divider.className = "ceremony-transition-divider motion-reveal";
        divider.setAttribute("aria-hidden", "true");
        divider.innerHTML =
          '<div class="transition-line left"></div>' +
          '<div class="transition-motif">❦ ✦ ❦</div>' +
          '<div class="transition-line right"></div>';
        container.appendChild(divider);
      }

      var section = document.createElement("section");
      section.id = "ceremony-" + ev.id;
      section.className = "ceremony-detail-section ceremony-" + ev.id + " motion-reveal";
      section.setAttribute("data-event-id", ev.id);
      section.setAttribute("aria-labelledby", "heading-" + ev.id);

      var ritualsHtml = "";
      if (Array.isArray(ev.rituals) && ev.rituals.length > 0) {
        var heading = ev.detailsTitle || "Celebration Highlights";
        var itemsHtml = ev.rituals.map(function (item) {
          return '<li class="ceremony-program-item"><span class="program-bullet">✦</span><span class="program-text">' + item + '</span></li>';
        }).join("");

        ritualsHtml =
          '<div class="ceremony-program-box">' +
            '<div class="ceremony-program-header">' +
              '<span class="program-flourish">❦</span>' +
              '<h4 class="ceremony-program-heading">' + heading + '</h4>' +
              '<span class="program-flourish">❦</span>' +
            '</div>' +
            '<ul class="ceremony-program-list">' +
              itemsHtml +
            '</ul>' +
          '</div>';
      }

      section.innerHTML =
        '<div class="ceremony-bg-layer" aria-hidden="true"></div>' +
        '<div class="ceremony-card">' +
          '<div class="ceremony-card-ornament">' +
            '<img src="assets/images/flower.svg" alt="" class="ceremony-flower-icon" aria-hidden="true">' +
          '</div>' +
          '<h2 id="heading-' + ev.id + '" class="script-heading dark ceremony-title">' + (ev.name || "") + '</h2>' +
          '<div class="ceremony-meta-badge">' +
            '<span class="ceremony-date-long">' + (ev.dateLong || ev.date || "") + '</span>' +
            '<span class="ceremony-divider">•</span>' +
            '<span class="ceremony-time-range">' + (ev.time || "") + '</span>' +
          '</div>' +
          '<div class="ceremony-venue-box">' +
            '<div class="ceremony-venue-label">Venue &amp; Location</div>' +
            '<h3 class="ceremony-venue-name">' + (ev.venue || "") + '</h3>' +
            '<p class="ceremony-venue-address">' + (ev.address || "") + '</p>' +
            (ev.googleMapsUrl ?
              '<a class="ceremony-map-button" href="' + ev.googleMapsUrl + '" target="_blank" rel="noopener noreferrer">' +
                '<span class="button-pin">📍</span> <span>GET DIRECTIONS</span>' +
              '</a>' : '') +
          '</div>' +
          ritualsHtml +
        '</div>';

      container.appendChild(section);
    });

    observeMotionElements(container);
  }

  // -------------------------------------------------------------
  // 3. INTERACTIVE WEDDING SCRATCH-CARD COUNTDOWN
  // -------------------------------------------------------------
  function startCountdown(targetDateStr) {
    var target = new Date(targetDateStr).getTime();
    var daysVal = byId("countdownDaysValue");
    var hoursVal = byId("countdownHoursValue");
    var minsVal = byId("countdownMinutesValue");
    var secsVal = byId("countdownSecondsValue");
    var container = byId("countdown");
    var instruction = byId("scratchInstruction");

    // 1. Continuous Live Timer (Updates values without destroying DOM)
    function tick() {
      var now = Date.now();
      var distance = Math.max(0, target - now);

      var days = Math.floor(distance / (1000 * 60 * 60 * 24));
      var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      var seconds = Math.floor((distance % (1000 * 60)) / 1000);

      if (daysVal) daysVal.textContent = String(days).padStart(2, "0");
      if (hoursVal) hoursVal.textContent = String(hours).padStart(2, "0");
      if (minsVal) minsVal.textContent = String(minutes).padStart(2, "0");
      if (secsVal) secsVal.textContent = String(seconds).padStart(2, "0");
    }

    tick();
    setInterval(tick, 1000);

    // 2. Interactive Scratch Cards Logic
    initScratchCards();

    function initScratchCards() {
      var units = document.querySelectorAll(".scratch-unit");
      if (!units || units.length === 0) return;

      var isRevealed = false;
      var hasReducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      // Master synchronized reveal function
      function revealAllCountdownCards() {
        if (isRevealed) return;
        isRevealed = true;

        if (instruction) {
          instruction.classList.add("is-hidden");
        }

        if (container) {
          container.classList.add("is-revealed");
        }

        units.forEach(function (unit) {
          unit.classList.add("is-revealed");
          var canvas = unit.querySelector(".scratch-overlay");
          if (canvas) {
            canvas.style.pointerEvents = "none";
            if (hasReducedMotion) {
              canvas.style.display = "none";
            } else {
              canvas.style.transition = "opacity 0.6s cubic-bezier(0.22, 1, 0.36, 1)";
              canvas.style.opacity = "0";
              setTimeout(function () {
                if (canvas) canvas.style.display = "none";
              }, 650);
            }
          }
        });
      }

      // Draw royal wedding antique-gold foil coating
      function drawFoilCover(canvas, unitLabel) {
        var parent = canvas.parentElement;
        if (!parent) return;
        var rect = parent.getBoundingClientRect();
        var width = Math.round(rect.width) || 76;
        var height = Math.round(rect.height) || 88;
        var dpr = window.devicePixelRatio || 1;

        canvas.width = Math.round(width * dpr);
        canvas.height = Math.round(height * dpr);
        canvas.style.width = width + "px";
        canvas.style.height = height + "px";

        var ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (!ctx) return;
        ctx.save();
        ctx.scale(dpr, dpr);

        // A. Rich metallic gold foil background
        var grad = ctx.createLinearGradient(0, 0, width, height);
        grad.addColorStop(0, "#d6b56d");
        grad.addColorStop(0.25, "#f5e6c4");
        grad.addColorStop(0.50, "#cf9f46");
        grad.addColorStop(0.75, "#f4e4be");
        grad.addColorStop(1, "#b88a32");

        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);

        // B. Subtle luxury gold speckles / fine grain
        ctx.fillStyle = "rgba(255, 255, 255, 0.22)";
        for (var i = 0; i < 75; i++) {
          var gx = Math.abs(Math.sin(i * 997)) * width;
          var gy = Math.abs(Math.cos(i * 613)) * height;
          ctx.fillRect(gx, gy, 1.2, 1.2);
        }
        ctx.fillStyle = "rgba(90, 10, 30, 0.08)";
        for (var j = 0; j < 50; j++) {
          var bx = Math.abs(Math.cos(j * 431)) * width;
          var by = Math.abs(Math.sin(j * 853)) * height;
          ctx.fillRect(bx, by, 1, 1);
        }

        // C. Elegant inner border
        ctx.strokeStyle = "rgba(102, 2, 31, 0.24)";
        ctx.lineWidth = 1;
        ctx.strokeRect(3.5, 3.5, width - 7, height - 7);

        // D. Corner star sparkles
        ctx.font = "8px serif";
        ctx.fillStyle = "rgba(102, 2, 31, 0.45)";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("✦", 9, 10);
        ctx.fillText("✦", width - 9, height - 10);

        // E. Foil Typography
        ctx.font = "600 8.5px 'Montserrat', sans-serif";
        ctx.fillStyle = "rgba(74, 1, 22, 0.65)";
        ctx.fillText("SCRATCH", width / 2, height / 2 - 8);

        ctx.font = "700 11.5px 'Cinzel', 'Playfair Display', serif";
        ctx.fillStyle = "#4a0116";
        ctx.fillText((unitLabel || "").toUpperCase(), width / 2, height / 2 + 10);

        ctx.restore();
      }

      // Micro gold dust sparkle emitter
      function spawnGoldDust(cx, cy) {
        var particle = document.createElement("span");
        particle.className = "scratch-particle";
        var dx = (Math.random() - 0.5) * 20;
        var dy = (Math.random() * -14) - 4;
        particle.style.setProperty("--dx", dx + "px");
        particle.style.setProperty("--dy", dy + "px");
        particle.style.left = cx + "px";
        particle.style.top = cy + "px";
        document.body.appendChild(particle);
        setTimeout(function () {
          if (particle.parentNode) particle.parentNode.removeChild(particle);
        }, 420);
      }

      // Configure individual scratch tile
      units.forEach(function (unit) {
        var canvas = unit.querySelector(".scratch-overlay");
        if (!canvas) return;
        var unitName = unit.getAttribute("data-unit") || "days";

        drawFoilCover(canvas, unitName);

        var ctx = canvas.getContext("2d", { willReadFrequently: true });
        var isScratching = false;
        var lastX = 0;
        var lastY = 0;
        var moveCount = 0;
        var lastCheckTime = 0;

        function getCanvasPos(e) {
          var rect = canvas.getBoundingClientRect();
          return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
          };
        }

        function eraseLine(x0, y0, x1, y1) {
          if (!ctx) return;
          var dpr = window.devicePixelRatio || 1;
          var isMobile = window.innerWidth <= 768;
          var radius = (isMobile ? 20 : 16) * dpr;

          ctx.save();
          ctx.globalCompositeOperation = "destination-out";
          ctx.lineCap = "round";
          ctx.lineJoin = "round";
          ctx.lineWidth = radius * 2;
          ctx.beginPath();
          ctx.moveTo(x0 * dpr, y0 * dpr);
          ctx.lineTo(x1 * dpr, y1 * dpr);
          ctx.stroke();
          ctx.restore();
        }

        function checkPercentage() {
          if (isRevealed || !ctx) return 0;
          try {
            var w = canvas.width;
            var h = canvas.height;
            var imgData = ctx.getImageData(0, 0, w, h);
            var pix = imgData.data;
            var total = 0;
            var transparent = 0;
            // Sample every 4th pixel for performance
            for (var i = 3; i < pix.length; i += 16) {
              total++;
              if (pix[i] < 128) {
                transparent++;
              }
            }
            return total > 0 ? (transparent / total) : 0;
          } catch (err) {
            return 0;
          }
        }

        canvas.addEventListener("pointerdown", function (e) {
          if (isRevealed) return;
          isScratching = true;
          try {
            canvas.setPointerCapture(e.pointerId);
          } catch (err) {}
          var pos = getCanvasPos(e);
          lastX = pos.x;
          lastY = pos.y;
          eraseLine(lastX, lastY, lastX, lastY);
          spawnGoldDust(e.clientX, e.clientY);
        });

        canvas.addEventListener("pointermove", function (e) {
          if (!isScratching || isRevealed) return;
          var pos = getCanvasPos(e);
          eraseLine(lastX, lastY, pos.x, pos.y);
          lastX = pos.x;
          lastY = pos.y;

          moveCount++;
          if (moveCount % 3 === 0) {
            spawnGoldDust(e.clientX, e.clientY);
          }

          var now = Date.now();
          if (moveCount % 8 === 0 || (now - lastCheckTime > 90)) {
            lastCheckTime = now;
            if (checkPercentage() >= 0.32) {
              revealAllCountdownCards();
            }
          }
        });

        function endScratch(e) {
          if (!isScratching) return;
          isScratching = false;
          try {
            canvas.releasePointerCapture(e.pointerId);
          } catch (err) {}
          if (!isRevealed && checkPercentage() >= 0.30) {
            revealAllCountdownCards();
          }
        }

        canvas.addEventListener("pointerup", endScratch);
        canvas.addEventListener("pointercancel", endScratch);

        // Accessibility: Keyboard trigger on focusable card
        unit.addEventListener("keydown", function (e) {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            revealAllCountdownCards();
          }
        });
      });

      // Redraw on window resize if not yet revealed
      var resizeTimeout = null;
      window.addEventListener("resize", function () {
        if (isRevealed) return;
        if (resizeTimeout) clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(function () {
          if (!isRevealed) {
            units.forEach(function (unit) {
              var canvas = unit.querySelector(".scratch-overlay");
              var unitName = unit.getAttribute("data-unit") || "days";
              if (canvas && canvas.style.display !== "none") {
                drawFoilCover(canvas, unitName);
              }
            });
          }
        }, 150);
      });
    }
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
  // 4b. SIGNATURE STAGED HERO ENTRANCE
  // -------------------------------------------------------------
  var heroEntranceTimer = null;
  function playHeroEntrance() {
    var hero = byId("celebrationHero");
    if (!hero) return;

    if (heroEntranceTimer) {
      clearTimeout(heroEntranceTimer);
      heroEntranceTimer = null;
    }

    // 1. Cleanly remove previous animation & resting classes
    hero.classList.remove("is-revealed", "is-animating-entrance");
    void hero.offsetWidth; // Force layout reflow so initial hidden transforms are applied

    // 2. On next animation frame, trigger the synchronized timeline
    requestAnimationFrame(function () {
      if (!hero) return;
      hero.classList.add("is-animating-entrance");

      // 3. At 3.85s, transition smoothly into ambient living resting state
      heroEntranceTimer = setTimeout(function () {
        if (hero) {
          hero.classList.remove("is-animating-entrance");
          hero.classList.add("is-revealed");
        }
      }, 3850);
    });
  }

  window.playHeroEntrance = playHeroEntrance;

  // -------------------------------------------------------------
  // 4c. CLIENT-SIDE TRANSPARENT FLORAL ASSET PROCESSOR
  // -------------------------------------------------------------
  function prepareFloralAssets() {
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
  }

  // -------------------------------------------------------------
  // 5. UNIFIED INVITATION STATE MACHINE
  // CLOSED -> OPENING -> CODE_ENTRY -> UNLOCKING -> HERO_REVEAL -> COMPLETE
  // -------------------------------------------------------------
  var ANIM_STATES = {
    CLOSED: "CLOSED",
    OPENING: "OPENING",
    CODE_ENTRY: "CODE_ENTRY",
    UNLOCKING: "UNLOCKING",
    HERO_REVEAL: "HERO_REVEAL",
    COMPLETE: "COMPLETE"
  };

  var currentState = ANIM_STATES.CLOSED;
  var stateTimers = [];

  function clearStateTimers() {
    stateTimers.forEach(function (t) { clearTimeout(t); });
    stateTimers = [];
  }

  function preloadCriticalAssets() {
    var criticalUrls = [
      "assets/images/ChatGPT Image Sep 26, 2026, 01_25_51 PM-1.png",
      "assets/images/envelope-seal.png",
      "assets/images/wedding-card.png",
      "assets/images/invite-card-bg.png",
      "assets/images/invite-input-pill.png",
      "assets/images/invite-btn-pill.png",
      "assets/images/08_center_glow.png",
      "assets/images/07_floating_dust_particles.png",
      "assets/images/hero-burgundy-bg.png",
      "assets/images/branch-gold.png",
      "assets/images/branch-ivory.png",
      "assets/images/peony-red.jpg",
      "assets/images/rose-ivory.jpg",
      "assets/images/ganesh-hero.png",
      "assets/images/mehendi.png",
      "assets/images/marriage.png",
      "assets/images/reception.png"
    ];

    criticalUrls.forEach(function (url) {
      var img = new Image();
      img.src = url;
      if (typeof img.decode === "function") {
        img.decode().catch(function () {});
      }
    });
  }

  function setupUnifiedInvitationExperience() {
    var scene = byId("envelopeScene");
    var wrapper = byId("envelopeWrapper");
    var unsealBtn = byId("unsealHitBtn");
    var form = byId("cardInviteForm");
    var input = byId("cardInviteCodeInput");
    var errorMsg = byId("cardInviteErrorMsg");
    var submitBtn = byId("cardInviteSubmitBtn");
    var inputPill = byId("cardInputPillGroup");
    var mainSite = byId("mainSite");
    var hero = byId("celebrationHero");

    if (!scene || !wrapper) return;

    preloadCriticalAssets();

    // Set Initial State
    currentState = ANIM_STATES.CLOSED;
    scene.className = "envelope-scene state-closed";
    wrapper.setAttribute("aria-expanded", "false");

    // ========================================================
    // TAP TO OPEN (CLOSED -> OPENING -> CODE_ENTRY)
    // ========================================================
    function handleTapToOpen() {
      if (currentState !== ANIM_STATES.CLOSED) return;
      currentState = ANIM_STATES.OPENING;
      clearStateTimers();

      scene.className = "envelope-scene state-opening";
      wrapper.setAttribute("aria-expanded", "true");

      // Play soft unseal wax sound
      playUnsealSound();

      // At 1.85s: Open card settled -> Morph seamlessly to CODE_ENTRY
      stateTimers.push(setTimeout(function () {
        if (currentState === ANIM_STATES.OPENING) {
          currentState = ANIM_STATES.CODE_ENTRY;
          scene.className = "envelope-scene state-code-entry";

          // Fade out petals during code entry
          var petalLayer = byId("petalShower");
          if (petalLayer) petalLayer.style.opacity = "0";

          if (errorMsg) {
            errorMsg.hidden = true;
            errorMsg.textContent = "";
          }
          if (submitBtn) {
            submitBtn.disabled = false;
          }

          // Auto-focus input after form elements arrive (~600ms)
          stateTimers.push(setTimeout(function () {
            if (currentState === ANIM_STATES.CODE_ENTRY && input) {
              input.focus();
            }
          }, 600));
        }
      }, 1850));
    }

    if (unsealBtn) {
      unsealBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        handleTapToOpen();
      });
    }

    wrapper.addEventListener("click", function (e) {
      if (currentState === ANIM_STATES.CLOSED) {
        handleTapToOpen();
      }
    });

    wrapper.addEventListener("keydown", function (e) {
      if ((e.key === "Enter" || e.key === " ") && currentState === ANIM_STATES.CLOSED) {
        e.preventDefault();
        handleTapToOpen();
      }
    });

    // ========================================================
    // CODE SUBMISSION (CODE_ENTRY -> UNLOCKING -> HERO_REVEAL -> COMPLETE)
    // ========================================================
    if (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        if (currentState !== ANIM_STATES.CODE_ENTRY) return;

        var rawCode = (input ? input.value : "").trim();
        var code = rawCode.toUpperCase();

        if (!code) {
          if (errorMsg) {
            errorMsg.textContent = "Please enter your invite code.";
            errorMsg.hidden = false;
          }
          if (inputPill) {
            inputPill.classList.remove("has-error");
            void inputPill.offsetWidth;
            inputPill.classList.add("has-error");
          }
          if (input) input.focus();
          return;
        }

        // Validate code using existing authorization engine
        var invitation = resolveInvitation(code);
        if (!invitation || !invitation.bundle || !Array.isArray(invitation.allowedEvents) || invitation.allowedEvents.length === 0) {
          if (errorMsg) {
            errorMsg.textContent = "That invite code doesn’t seem to match. Please try again.";
            errorMsg.hidden = false;
          }
          if (inputPill) {
            inputPill.classList.remove("has-error");
            void inputPill.offsetWidth;
            inputPill.classList.add("has-error");
          }
          if (input) input.focus();
          return;
        }

        // ========================================================
        // VALID CODE ACCEPTED -> START UNLOCKING SEQUENCE
        // ========================================================
        currentState = ANIM_STATES.UNLOCKING;
        clearStateTimers();

        if (submitBtn) submitBtn.disabled = true;
        if (input) {
          input.disabled = true;
          input.blur();
        }
        if (errorMsg) {
          errorMsg.hidden = true;
          errorMsg.textContent = "";
        }

        // 1. Authoritative memory-only unlock
        unlockInvitation(invitation);

        // 2. Immediately prepare mainSite directly underneath the fixed envelope overlay
        if (mainSite) {
          mainSite.removeAttribute("hidden");
          mainSite.removeAttribute("inert");
          mainSite.setAttribute("aria-hidden", "false");
          mainSite.classList.add("hero-reveal-prep");
          mainSite.classList.remove("hero-reveal-active");
        }

        // 3. Reset hero animation state before starting
        var hero = byId("celebrationHero");
        if (hero) {
          hero.classList.remove("is-revealed", "is-animating-entrance");
          void hero.offsetWidth; // force browser layout paint of initial hidden state
        }

        // 4. Double requestAnimationFrame to ensure browser paints hidden state before triggering animations
        requestAnimationFrame(function () {
          requestAnimationFrame(function () {
            // Activate crossfade on mainSite & envelope overlay simultaneously
            if (mainSite) {
              mainSite.classList.remove("hero-reveal-prep");
              mainSite.classList.add("hero-reveal-active");
            }
            scene.className = "envelope-scene state-unlocking";
            document.body.classList.remove("invitation-locked");

            // Trigger hero entrance (staggered floral bloom & names)
            playHeroEntrance();

            // Resume celebratory petals
            var petalLayer = byId("petalShower");
            if (petalLayer) petalLayer.style.opacity = "0.75";
          });
        });

        // 5. At 1.55s: Envelope overlay is fully transparent -> remove overlay & enable scroll
        stateTimers.push(setTimeout(function () {
          currentState = ANIM_STATES.COMPLETE;

          // Hide envelope scene and enable standard page scrolling
          scene.className = "envelope-scene state-complete";
          document.body.classList.remove("envelope-closed-state");
          document.body.style.overflow = "";

          if ("scrollRestoration" in window.history) {
            try {
              window.history.scrollRestoration = "auto";
            } catch (e) {}
          }

          // Start background music
          toggleMusic();
        }, 1550));
      });
    }
  }

  // -------------------------------------------------------------
  // 6. SCROLL REVEAL ANIMATIONS
  // -------------------------------------------------------------
  // -------------------------------------------------------------
  // 6. GLOBAL SCROLL TRANSITION & REVERSIBLE MOTION SYSTEM
  // -------------------------------------------------------------
  var lastScrollY = window.pageYOffset || document.documentElement.scrollTop || 0;
  var scrollDirection = "down";
  var isScrollTicking = false;
  var motionObserver = null;

  function observeMotionElements(root) {
    var scope = root || document;
    var elements = scope.querySelectorAll(".motion-reveal");
    if (!("IntersectionObserver" in window)) {
      elements.forEach(function (el) { el.classList.add("is-visible"); });
      return;
    }

    if (!motionObserver) {
      motionObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          var target = entry.target;
          var rect = entry.boundingClientRect;
          var isIntersecting = entry.isIntersecting;

          if (isIntersecting) {
            target.classList.add("is-visible", "has-entered");
            target.classList.remove("is-leaving-top", "is-leaving-bottom");
            if (scrollDirection === "down") {
              target.classList.add("scroll-in-down");
              target.classList.remove("scroll-in-up");
            } else {
              target.classList.add("scroll-in-up");
              target.classList.remove("scroll-in-down");
            }
          } else {
            if (target.classList.contains("has-entered")) {
              target.classList.remove("is-visible");
              if (rect.top < 0) {
                target.classList.add("is-leaving-top");
                target.classList.remove("is-leaving-bottom");
              } else {
                target.classList.add("is-leaving-bottom");
                target.classList.remove("is-leaving-top");
              }
            }
          }
        });
      }, {
        threshold: [0.08, 0.25],
        rootMargin: "0px 0px -40px 0px"
      });
    }

    elements.forEach(function (el) {
      motionObserver.observe(el);
    });
  }

  function onScrollTick() {
    var currentScrollY = window.pageYOffset || document.documentElement.scrollTop || 0;
    var delta = currentScrollY - lastScrollY;
    if (Math.abs(delta) > 1) {
      scrollDirection = delta > 0 ? "down" : "up";
      document.body.classList.toggle("scrolling-down", scrollDirection === "down");
      document.body.classList.toggle("scrolling-up", scrollDirection === "up");
      lastScrollY = currentScrollY;
    }

    var winH = window.innerHeight || 800;
    var isMobile = window.innerWidth <= 768;

    // 1. Hero Content cinematic depth and transition
    var hero = byId("celebrationHero");
    var heroContent = document.querySelector(".hero-content");
    var heroGlow = document.querySelector(".hero-ambient-glow");
    var heroTitle = document.querySelector(".script-line");
    var coupleNames = document.querySelector(".couple-names");

    if (hero && heroContent) {
      var hRect = hero.getBoundingClientRect();

      // Trigger staged entrance animation when hero becomes visible after auth
      if (accessGranted && hRect.top < winH * 0.75 && !hero.classList.contains("is-revealed") && !hero.classList.contains("is-animating-entrance")) {
        playHeroEntrance();
      }

      // Viewport-relative scroll transition:
      // When hero is active at the top of the viewport (hRect.top ~ 0), opacity is 1.0!
      // When user scrolls down out of the hero, hRect.top becomes negative.
      if (hRect.top <= 10 && hRect.bottom > 0) {
        var exitRatio = Math.min(1, Math.max(0, -hRect.top / (winH * 0.85)));

        // Background moves approximately -12px (mobile: -6px)
        var bgShift = (exitRatio * (isMobile ? -6 : -12)).toFixed(1);
        hero.style.backgroundPosition = "center " + bgShift + "px";

        // Decorative glow slowly reduces
        if (heroGlow) {
          var glowAlpha = 0.88 * (1 - exitRatio * 0.40);
          heroGlow.style.opacity = glowAlpha.toFixed(2);
        }

        // Title translateY approximately -8px
        if (heroTitle) {
          var titleShift = (exitRatio * (isMobile ? -4 : -8)).toFixed(1);
          heroTitle.style.transform = "translate3d(0, " + titleShift + "px, 0)";
        }

        // Couple names scale 1 -> approximately 0.985, very small movement (8-14px desktop, 4-8px mobile)
        if (coupleNames) {
          var nameScale = 1 - (exitRatio * 0.015);
          var nameShift = (exitRatio * (isMobile ? -4 : -10)).toFixed(1);
          coupleNames.style.transform = "translate3d(0, " + nameShift + "px, 0) scale(" + nameScale.toFixed(3) + ")";
        }

        // Overall content opacity: 1 -> approximately 0.78 maximum (NEVER drops below 0.76 while leaving!)
        var heroOpacity = 1 - (exitRatio * 0.22);
        heroContent.style.opacity = heroOpacity.toFixed(2);
      } else if (hRect.top > 10) {
        // Hero is approaching or at rest
        heroContent.style.opacity = "1";
        if (heroTitle) heroTitle.style.transform = "translate3d(0, 0, 0)";
        if (coupleNames) coupleNames.style.transform = "translate3d(0, 0, 0) scale(1)";
        if (heroGlow) heroGlow.style.opacity = "0.88";
      } else {
        // Hero is completely past viewport
        heroContent.style.opacity = "0.78";
      }
    }

    // 2. Wedding Section Ambient Gold Light Glow & Depth
    var weddingSec = byId("ceremony-wedding");
    if (weddingSec) {
      var wRect = weddingSec.getBoundingClientRect();
      if (wRect.top < winH && wRect.bottom > 0) {
        var centerOffset = (wRect.top + wRect.height / 2) - (winH / 2);
        var distRatio = Math.min(1, Math.abs(centerOffset) / (winH * 0.75));
        var glowOpacity = 0.15 + (0.20 * (1 - distRatio)); // 0.15 to 0.35
        weddingSec.style.setProperty("--wedding-glow-intensity", glowOpacity.toFixed(3));

        var depthShift = (centerOffset * (isMobile ? -0.04 : -0.08)).toFixed(1);
        weddingSec.style.setProperty("--wedding-depth-y", depthShift + "px");
      }
    }

    // 3. Mehendi Botanical & Floral subtle depth
    var mehendiSec = byId("ceremony-mehendi");
    if (mehendiSec) {
      var mRect = mehendiSec.getBoundingClientRect();
      if (mRect.top < winH && mRect.bottom > 0) {
        var mCenterOffset = (mRect.top + mRect.height / 2) - (winH / 2);
        var mShift = (mCenterOffset * (isMobile ? -0.03 : -0.06)).toFixed(1);
        mehendiSec.style.setProperty("--mehendi-depth-y", mShift + "px");
      }
    }

    // 4. Reception subtle depth
    var receptionSec = byId("ceremony-reception");
    if (receptionSec) {
      var rRect = receptionSec.getBoundingClientRect();
      if (rRect.top < winH && rRect.bottom > 0) {
        var rCenterOffset = (rRect.top + rRect.height / 2) - (winH / 2);
        var rShift = (rCenterOffset * (isMobile ? -0.03 : -0.06)).toFixed(1);
        receptionSec.style.setProperty("--reception-depth-y", rShift + "px");
      }
    }

    isScrollTicking = false;
  }

  function handleScroll() {
    if (!isScrollTicking) {
      isScrollTicking = true;
      window.requestAnimationFrame(onScrollTick);
    }
  }

  function setupScrollAnimations() {
    observeMotionElements(document);
    window.addEventListener("scroll", handleScroll, { passive: true });

    var frames = document.querySelectorAll(".frame");
    if (!("IntersectionObserver" in window)) return;

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
    // Requirement 20: 4-6 petals moving slowly during initial state
    var count = isMobile ? 5 : 6;

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
      if (!accessGranted || !activeInvitation) return;
      modal.hidden = false;
      modal.removeAttribute("inert");
      modal.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
    });

    function closeModal() {
      modal.hidden = true;
      modal.setAttribute("inert", "");
      modal.setAttribute("aria-hidden", "true");
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

    var attendanceSelect = byId("rsvpAttendanceSelect");
    var functionsWrap = byId("rsvpFunctionsWrap");
    if (attendanceSelect && functionsWrap) {
      attendanceSelect.addEventListener("change", function () {
        if (attendanceSelect.value.indexOf("Decline") !== -1) {
          functionsWrap.style.display = "none";
        } else {
          functionsWrap.style.display = "block";
        }
      });
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var formData = new FormData(form);
      var name = formData.get("guestName") || "Guest";
      var mobile = formData.get("mobileNumber") || "";
      var count = formData.get("familyGuestCount") || "1";
      var attendance = formData.get("attendance") || "Yes";
      var msg = formData.get("message") || "";

      var checkedEvents = [];
      form.querySelectorAll('input[name="attendingEvent"]:checked').forEach(function (cb) {
        checkedEvents.push(cb.value);
      });

      var responses = JSON.parse(localStorage.getItem("wedding_rsvps") || "[]");
      responses.push({
        name: name,
        mobile: mobile,
        guests: count,
        attendance: attendance,
        events: checkedEvents,
        inviteCode: activeInvitation ? activeInvitation.code : null,
        invitationLabel: activeInvitation ? activeInvitation.label : null,
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

        var checkedEvents = [];
        form.querySelectorAll('input[name="attendingEvent"]:checked').forEach(function (cb) {
          checkedEvents.push(cb.value);
        });
        var eventsText = checkedEvents.length > 0 ? checkedEvents.join(", ") : "None";

        var invitedList = (activeInvitation && activeInvitation.allowedEvents) ?
          activeInvitation.allowedEvents.map(function (e) { return e.name; }).join(", ") :
          "All Functions";

        var text = "✨ *Wedding RSVP for Isha & Sajan's Wedding* ✨\n\n" +
          "👤 *Name:* " + (name || "Family & Friends") + "\n" +
          (activeInvitation ? ("🏷️ *Invite Code:* " + activeInvitation.code + "\n") : "") +
          (activeInvitation ? ("📜 *Invitation:* " + activeInvitation.label + "\n") : "") +
          "🎊 *Invited Functions:* " + invitedList + "\n" +
          "✅ *Attendance:* " + attendance + "\n" +
          "👥 *Number of Guests:* " + count + "\n" +
          "💌 *Functions Attending:* " + eventsText + "\n" +
          (msg ? ("✍️ *Message:* " + msg + "\n") : "") +
          "\nLooking forward to celebrating with you!";

        var phone = cfg.copy.organizerWhatsapp || "919876543210";
        var url = "https://wa.me/" + phone + "?text=" + encodeURIComponent(text);
        window.open(url, "_blank");
      });
    }
  }

  // -------------------------------------------------------------
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
  // 9. INITIALIZE ON DOM READY
  // -------------------------------------------------------------
  document.addEventListener("DOMContentLoaded", function () {
    enforceLockedScroll();
    bindData(data);
    prepareFloralAssets();
    startCountdown(data.event.countdownDate || "2026-11-20T15:30:00-05:00");
    setupUnifiedInvitationExperience();
    setupScrollAnimations();
    setupPetals();

    var musicBtn = byId("musicToggle");
    if (musicBtn) {
      musicBtn.addEventListener("click", toggleMusic);
    }
  });

  // Immediate guard on initial script execution
  enforceLockedScroll();

})();
