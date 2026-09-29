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
    if (byId("partnerTwo")) byId("partnerTwo").textContent = cfg.couple.partnerTwo || "Sagar";
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
      section.className = "ceremony-detail-section ceremony-" + ev.id + " paper-section motion-reveal";
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

      var artworkHtml = "";
      if (ev.image) {
        artworkHtml =
          '<div class="ceremony-artwork-wrap">' +
            '<img class="ceremony-artwork" src="' + ev.image + '" alt="' + ev.name + '">' +
          '</div>';
      }

      // Ceremony-specific decorative accents
      var ceremonyDecorHtml = "";
      var dividerHtml = "";

      if (ev.id === "mehendi") {
        ceremonyDecorHtml =
          '<div class="mehendi-botanical-accents" aria-hidden="true">' +
            '<svg class="mehendi-vine mehendi-vine-left" viewBox="0 0 100 100" fill="none">' +
              '<path d="M10,90 Q30,60 50,50 Q70,40 90,10" stroke="rgba(184, 134, 40, 0.45)" stroke-width="1.5" stroke-linecap="round"/>' +
              '<circle cx="35" cy="58" r="3" fill="rgba(92, 128, 70, 0.6)"/>' +
              '<circle cx="65" cy="42" r="3" fill="rgba(92, 128, 70, 0.6)"/>' +
              '<circle cx="85" cy="18" r="2.5" fill="rgba(184, 134, 40, 0.7)"/>' +
            '</svg>' +
            '<svg class="mehendi-vine mehendi-vine-right" viewBox="0 0 100 100" fill="none">' +
              '<path d="M10,90 Q30,60 50,50 Q70,40 90,10" stroke="rgba(184, 134, 40, 0.45)" stroke-width="1.5" stroke-linecap="round"/>' +
              '<circle cx="35" cy="58" r="3" fill="rgba(92, 128, 70, 0.6)"/>' +
              '<circle cx="65" cy="42" r="3" fill="rgba(92, 128, 70, 0.6)"/>' +
              '<circle cx="85" cy="18" r="2.5" fill="rgba(184, 134, 40, 0.7)"/>' +
            '</svg>' +
          '</div>';
        dividerHtml = '<div class="floral-divider" aria-hidden="true"></div>';
      } else if (ev.id === "wedding") {
        ceremonyDecorHtml =
          '<div class="wedding-glow-layer" aria-hidden="true"></div>' +
          '<div class="mandap-arch-frame" aria-hidden="true">' +
            '<div class="mandap-arch-curve"></div>' +
          '</div>';
        dividerHtml = '<div class="wedding-ceremony-line" aria-hidden="true"></div>';
      } else if (ev.id === "reception") {
        ceremonyDecorHtml =
          '<div class="reception-light-canopy" aria-hidden="true">' +
            '<span class="light-dot d1">✦</span>' +
            '<span class="light-dot d2">✦</span>' +
            '<span class="light-dot d3">✦</span>' +
            '<span class="light-dot d4">✦</span>' +
            '<span class="light-dot d5">✦</span>' +
          '</div>';
        dividerHtml = '<div class="wedding-ceremony-line" aria-hidden="true"></div>';
      }

      section.innerHTML =
        '<img class="torn torn-top" data-asset="tornEdge" src="assets/images/torn-edge.svg" alt="" aria-hidden="true">' +
        ceremonyDecorHtml +
        '<div class="ceremony-card">' +
          '<div class="ceremony-card-ornament">' +
            '<img src="assets/images/flower.svg" alt="" class="ceremony-flower-icon" aria-hidden="true">' +
          '</div>' +
          '<h2 id="heading-' + ev.id + '" class="script-heading dark ceremony-title">' + (ev.name || "") + '</h2>' +
          dividerHtml +
          '<div class="ceremony-meta-badge">' +
            '<span class="ceremony-date-long">' + (ev.dateLong || ev.date || "") + '</span>' +
            '<span class="ceremony-divider">•</span>' +
            '<span class="ceremony-time-range">' + (ev.time || "") + '</span>' +
          '</div>' +
          artworkHtml +
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
        '</div>' +
        '<img class="torn torn-bottom" data-asset="tornEdge" src="assets/images/torn-edge.svg" alt="" aria-hidden="true">';

      container.appendChild(section);
    });

    observeMotionElements(container);
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
  // 4b. SIGNATURE STAGED HERO ENTRANCE
  // -------------------------------------------------------------
  function playHeroEntrance() {
    var hero = byId("celebrationHero");
    if (!hero) return;
    hero.classList.remove("is-animating-entrance");
    hero.classList.add("is-revealed");
  }

  window.playHeroEntrance = playHeroEntrance;

  // -------------------------------------------------------------
  // 5. UNIFIED INVITATION EXPERIENCE & STATE MACHINE
  // "THE WEDDING CARD BECOMES THE WEBSITE"
  // -------------------------------------------------------------
  var INVITATION_STATES = {
    LOCKED_ENVELOPE: "LOCKED_ENVELOPE",
    OPENING_ENVELOPE: "OPENING_ENVELOPE",
    CODE_CARD: "CODE_CARD",
    VALIDATING: "VALIDATING",
    EXPANDING_CARD: "EXPANDING_CARD",
    SITE_READY: "SITE_READY"
  };

  var currentState = INVITATION_STATES.LOCKED_ENVELOPE;
  var isOpeningOrClosing = false;

  function setupUnifiedInvitationExperience() {
    var scene = byId("envelopeScene");
    var wrapper = byId("envelopeWrapper");
    var card = byId("invitationCard");
    var unsealBtn = byId("unsealHitBtn");
    var backBtn = byId("cardBackBtn");
    var form = byId("cardInviteForm");
    var input = byId("cardInviteCodeInput");
    var errorMsg = byId("cardInviteErrorMsg");
    var submitBtn = byId("cardInviteSubmitBtn");
    var inputPill = byId("cardInputPillGroup");
    var mainSite = byId("mainSite");
    var heroVideo = byId("heroVideo");

    if (!scene || !wrapper || !card) return;

    // Subtle idle float when locked
    setTimeout(function () {
      if (currentState === INVITATION_STATES.LOCKED_ENVELOPE) {
        scene.classList.add("is-idle");
      }
    }, 1100);

    // ========================================================
    // STAGE 2: UNSEAL ENVELOPE & RISE CARD
    // ========================================================
    function openEnvelopeAndRiseCard() {
      if (currentState !== INVITATION_STATES.LOCKED_ENVELOPE || isOpeningOrClosing) return;
      isOpeningOrClosing = true;
      currentState = INVITATION_STATES.OPENING_ENVELOPE;

      scene.classList.remove("is-idle");
      wrapper.setAttribute("aria-expanded", "true");

      // Play soft unseal wax sound
      playUnsealSound();

      // 0ms - 180ms: Wax seal subtle press
      scene.classList.add("is-pressing");

      // 180ms - 700ms: Seal release, flap opens, card begins rising
      setTimeout(function () {
        scene.classList.remove("is-pressing");
        scene.classList.add("is-opening");
      }, 180);

      // 850ms: Card reaches full rise, unfold into code card
      setTimeout(function () {
        unfoldCardToCodeStage();
      }, 850);
    }

    // ========================================================
    // STAGE 3: CARD UNFOLDS TO REVEAL EMBEDDED CODE FORM
    // ========================================================
    function unfoldCardToCodeStage() {
      currentState = INVITATION_STATES.CODE_CARD;
      isOpeningOrClosing = false;
      card.classList.add("is-unfolded");
      scene.classList.add("is-unfolded");

      if (errorMsg) {
        errorMsg.hidden = true;
        errorMsg.textContent = "";
      }
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.classList.remove("is-pressed");
      }

      // Auto-focus input after unfold choreography finishes (~800ms)
      setTimeout(function () {
        if (currentState === INVITATION_STATES.CODE_CARD && input) {
          input.focus();
        }
      }, 800);
    }

    // ========================================================
    // BACK BUTTON: REVERSE CHOREOGRAPHY TO CLOSED ENVELOPE
    // ========================================================
    function foldCardBackToEnvelope() {
      if (currentState !== INVITATION_STATES.CODE_CARD || isOpeningOrClosing) return;
      isOpeningOrClosing = true;

      // 1. Fade form elements and fold inner panel
      card.classList.remove("is-unfolded");
      scene.classList.remove("is-unfolded");
      if (input) input.blur();

      // 2. Lower card back into pocket and close envelope flap
      setTimeout(function () {
        scene.classList.remove("is-opening");
        wrapper.setAttribute("aria-expanded", "false");
      }, 350);

      // 3. Reset back to LOCKED_ENVELOPE
      setTimeout(function () {
        currentState = INVITATION_STATES.LOCKED_ENVELOPE;
        isOpeningOrClosing = false;
        scene.classList.add("is-idle");
      }, 950);
    }

    // Click on unseal button or envelope wrapper
    if (unsealBtn) {
      unsealBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        openEnvelopeAndRiseCard();
      });
    }

    wrapper.addEventListener("click", function (e) {
      if (currentState === INVITATION_STATES.LOCKED_ENVELOPE) {
        openEnvelopeAndRiseCard();
      }
    });

    wrapper.addEventListener("keydown", function (e) {
      if ((e.key === "Enter" || e.key === " ") && currentState === INVITATION_STATES.LOCKED_ENVELOPE) {
        e.preventDefault();
        openEnvelopeAndRiseCard();
      }
    });

    if (backBtn) {
      backBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        foldCardBackToEnvelope();
      });
    }

    // ========================================================
    // STAGE 4 & 5: VALID CODE SUBMISSION & CARD EXPANSION
    // ========================================================
    if (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        if (currentState !== INVITATION_STATES.CODE_CARD) return;

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

        // Validate code against configuration
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
        // VALID CODE ACCEPTED
        // ========================================================
        currentState = INVITATION_STATES.VALIDATING;
        if (submitBtn) submitBtn.disabled = true;
        if (input) input.blur();
        if (errorMsg) {
          errorMsg.hidden = true;
          errorMsg.textContent = "";
        }

        // Authoritative unlock
        unlockInvitation(invitation);

        // Micro-animation 0-350ms: thin warm-gold light traces inner border
        card.classList.add("has-success-glow");

        setTimeout(function () {
          performCardExpansion(invitation);
        }, 350);
      });
    }

    function performCardExpansion(invitation) {
      currentState = INVITATION_STATES.EXPANDING_CARD;

      // 1. Measure initial card bounding rect
      var firstRect = card.getBoundingClientRect();

      // 2. Prepare main site shell (remove hidden/inert before animation)
      if (mainSite) {
        mainSite.removeAttribute("hidden");
        mainSite.removeAttribute("inert");
        mainSite.setAttribute("aria-hidden", "false");
      }
      document.body.classList.remove("invitation-locked");

      // 3. Compute target dimensions
      var isMobile = window.innerWidth <= 760;
      var targetWidth = isMobile ? window.innerWidth : Math.min(window.innerWidth, 760);
      var targetLeft = isMobile ? 0 : Math.round((window.innerWidth - targetWidth) / 2);
      var targetHeight = window.innerHeight;
      var targetRadius = isMobile ? 0 : 8;

      // 4. Set initial fixed position on expanding card
      card.style.position = "fixed";
      card.style.top = Math.round(firstRect.top) + "px";
      card.style.left = Math.round(firstRect.left) + "px";
      card.style.width = Math.round(firstRect.width) + "px";
      card.style.height = Math.round(firstRect.height) + "px";
      card.style.borderRadius = "20px";
      card.classList.add("is-expanding");

      scene.classList.add("is-expanding");
      scene.classList.add("is-expanding-bg");

      // 5. Trigger smooth FLIP transition in next frame
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          card.style.top = "0px";
          card.style.left = targetLeft + "px";
          card.style.width = targetWidth + "px";
          card.style.height = targetHeight + "px";
          card.style.borderRadius = targetRadius + "px";
        });
      });

      // 6. At 75% expansion (~850ms), reveal hero content inside mainSite
      setTimeout(function () {
        playHeroEntrance();
      }, 850);

      // 7. Transition completion at 1250ms -> SITE_READY
      setTimeout(function () {
        currentState = INVITATION_STATES.SITE_READY;

        // Cleanly hide envelope scene and unlock normal scrolling
        scene.classList.add("is-hidden-done");
        scene.hidden = true;
        document.body.classList.remove("envelope-closed-state");
        document.body.style.overflow = "";

        if ("scrollRestoration" in window.history) {
          try {
            window.history.scrollRestoration = "auto";
          } catch (e) {}
        }

        // Start background music & video
        toggleMusic();
        if (heroVideo && heroVideo.src) {
          heroVideo.play().catch(function () {});
        }
      }, 1250);
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

        var text = "✨ *Wedding RSVP for Isha & Sagar's Wedding* ✨\n\n" +
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
