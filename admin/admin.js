/* ==========================================================================
   ISHA & SAJAN WEDDING — RSVP ADMIN DASHBOARD JAVASCRIPT
   ========================================================================== */

(function () {
  "use strict";

  // State
  let allRsvps = [];
  let currentStatusFilter = "all";
  let currentEventFilter = "all";
  let currentSearchQuery = "";
  let isFetching = false;

  // DOM Elements
  const initLoader = document.getElementById("initLoader");
  const loginView = document.getElementById("loginView");
  const dashboardView = document.getElementById("dashboardView");

  // Login Elements
  const loginForm = document.getElementById("loginForm");
  const adminPasswordInput = document.getElementById("adminPassword");
  const togglePasswordBtn = document.getElementById("togglePasswordBtn");
  const pwdEyeIcon = document.getElementById("pwdEyeIcon");
  const loginError = document.getElementById("loginError");
  const loginSubmitBtn = document.getElementById("loginSubmitBtn");

  // Header Elements
  const refreshBtn = document.getElementById("refreshBtn");
  const exportCsvBtn = document.getElementById("exportCsvBtn");
  const logoutBtn = document.getElementById("logoutBtn");

  // Summary Metrics Elements
  const statResponses = document.getElementById("statResponses");
  const statTotalGuests = document.getElementById("statTotalGuests");
  const statAccepted = document.getElementById("statAccepted");
  const statDeclined = document.getElementById("statDeclined");
  const statMehendiGuests = document.getElementById("statMehendiGuests");
  const statWeddingGuests = document.getElementById("statWeddingGuests");
  const statReceptionGuests = document.getElementById("statReceptionGuests");

  // Headcount Elements
  const headcountMehendi = document.getElementById("headcountMehendi");
  const headcountWedding = document.getElementById("headcountWedding");
  const headcountReception = document.getElementById("headcountReception");

  // Filter & Search Elements
  const searchInput = document.getElementById("searchInput");
  const clearSearchBtn = document.getElementById("clearSearchBtn");
  const statusFilterControl = document.getElementById("statusFilterControl");
  const eventFilterSelect = document.getElementById("eventFilterSelect");
  const visibleCount = document.getElementById("visibleCount");
  const totalCount = document.getElementById("totalCount");

  // Table Elements
  const rsvpTableBody = document.getElementById("rsvpTableBody");
  const tableLoading = document.getElementById("tableLoading");
  const tableError = document.getElementById("tableError");
  const tableErrorMsg = document.getElementById("tableErrorMsg");
  const retryFetchBtn = document.getElementById("retryFetchBtn");
  const tableEmpty = document.getElementById("tableEmpty");
  const tableContainer = document.getElementById("tableContainer");

  // --------------------------------------------------------------------------
  // 1. INITIALIZATION & SESSION CHECK
  // --------------------------------------------------------------------------
  async function checkSession() {
    try {
      const response = await fetch("/api/admin-session", {
        method: "GET",
        headers: { "Cache-Control": "no-cache" }
      });

      if (!response.ok) {
        showLogin();
        return;
      }

      const data = await response.json();
      if (data && data.authenticated) {
        showDashboard();
        fetchRsvps();
      } else {
        showLogin();
      }
    } catch (err) {
      console.error("[ADMIN] Error validating session:", err);
      showLogin();
    } finally {
      if (initLoader) initLoader.style.display = "none";
    }
  }

  function showLogin() {
    if (initLoader) initLoader.style.display = "none";
    if (dashboardView) dashboardView.style.display = "none";
    if (loginView) {
      loginView.style.display = "flex";
      if (adminPasswordInput) {
        adminPasswordInput.value = "";
        adminPasswordInput.focus();
      }
    }
  }

  function showDashboard() {
    if (initLoader) initLoader.style.display = "none";
    if (loginView) loginView.style.display = "none";
    if (dashboardView) dashboardView.style.display = "flex";
  }

  // --------------------------------------------------------------------------
  // 2. LOGIN & LOGOUT HANDLERS
  // --------------------------------------------------------------------------
  if (togglePasswordBtn && adminPasswordInput) {
    togglePasswordBtn.addEventListener("click", function () {
      const isPassword = adminPasswordInput.type === "password";
      adminPasswordInput.type = isPassword ? "text" : "password";
      if (pwdEyeIcon) {
        pwdEyeIcon.textContent = isPassword ? "🔒" : "👁";
      }
    });
  }

  if (loginForm) {
    loginForm.addEventListener("submit", async function (e) {
      e.preventDefault();
      const password = (adminPasswordInput.value || "").trim();
      if (!password) return;

      if (loginError) {
        loginError.hidden = true;
        loginError.textContent = "";
      }

      const btnText = loginSubmitBtn.querySelector(".btn-text");
      const btnLoader = loginSubmitBtn.querySelector(".btn-loader");
      if (btnText) btnText.hidden = true;
      if (btnLoader) btnLoader.hidden = false;
      loginSubmitBtn.disabled = true;

      try {
        const res = await fetch("/api/admin-login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password: password })
        });

        const result = await res.json().catch(() => ({}));

        if (!res.ok || !result.success) {
          throw new Error(result.error || "Incorrect admin password.");
        }

        showDashboard();
        fetchRsvps();
      } catch (err) {
        if (loginError) {
          loginError.hidden = false;
          loginError.textContent = err.message || "Incorrect admin password.";
        }
        if (adminPasswordInput) {
          adminPasswordInput.focus();
          adminPasswordInput.select();
        }
      } finally {
        if (btnText) btnText.hidden = false;
        if (btnLoader) btnLoader.hidden = true;
        loginSubmitBtn.disabled = false;
      }
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener("click", async function () {
      try {
        await fetch("/api/admin-logout", { method: "POST" });
      } catch (err) {
        console.warn("[ADMIN] Logout error:", err);
      }
      allRsvps = [];
      showLogin();
    });
  }

  // --------------------------------------------------------------------------
  // 3. DATA RETRIEVAL (GET /api/admin-rsvps)
  // --------------------------------------------------------------------------
  async function fetchRsvps() {
    if (isFetching) return;
    isFetching = true;

    if (tableLoading) tableLoading.hidden = false;
    if (tableError) tableError.hidden = true;
    if (tableEmpty) tableEmpty.hidden = true;
    if (tableContainer) tableContainer.hidden = true;

    if (refreshBtn) refreshBtn.classList.add("is-refreshing");

    try {
      const response = await fetch("/api/admin-rsvps", {
        method: "GET",
        headers: { "Cache-Control": "no-cache" }
      });

      if (response.status === 401) {
        showLogin();
        return;
      }

      const data = await response.json().catch(() => ({}));

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Unable to load RSVP responses. Please try again.");
      }

      allRsvps = Array.isArray(data.rsvps) ? data.rsvps : [];
      updateSummaryMetrics();
      renderFilteredRsvps();
    } catch (err) {
      console.error("[ADMIN] Error loading RSVPs:", err);
      if (tableError) {
        tableError.hidden = false;
        if (tableErrorMsg) tableErrorMsg.textContent = err.message || "Unable to load RSVP responses. Please try again.";
      }
      if (tableContainer) tableContainer.hidden = true;
    } finally {
      isFetching = false;
      if (tableLoading) tableLoading.hidden = true;
      if (refreshBtn) refreshBtn.classList.remove("is-refreshing");
    }
  }

  if (refreshBtn) refreshBtn.addEventListener("click", fetchRsvps);
  if (retryFetchBtn) retryFetchBtn.addEventListener("click", fetchRsvps);

  // --------------------------------------------------------------------------
  // 4. STATISTICAL CALCULATIONS
  // --------------------------------------------------------------------------
  function isAttending(rsvp) {
    const att = String(rsvp.attendance || "").trim().toLowerCase();
    return att === "yes" || att.includes("accept") || att.includes("joyful");
  }

  function hasEvent(rsvp, eventKeyword) {
    if (!isAttending(rsvp)) return false;
    const events = Array.isArray(rsvp.attending_events) ? rsvp.attending_events : [];
    const lowerKeyword = eventKeyword.toLowerCase();
    return events.some(function (ev) {
      const evStr = String(ev).toLowerCase();
      if (lowerKeyword === "wedding") {
        return evStr.includes("wedding") || evStr.includes("phera");
      }
      return evStr.includes(lowerKeyword);
    });
  }

  function getGuestCount(rsvp) {
    const count = Number(rsvp.guest_count);
    return Number.isInteger(count) && count > 0 ? count : 1;
  }

  function updateSummaryMetrics() {
    let totalResponses = allRsvps.length;
    let totalGuestsAttending = 0;
    let totalAccepted = 0;
    let totalDeclined = 0;

    let mehendiGuests = 0;
    let weddingGuests = 0;
    let receptionGuests = 0;

    allRsvps.forEach(function (rsvp) {
      const attending = isAttending(rsvp);
      const count = getGuestCount(rsvp);

      if (attending) {
        totalAccepted++;
        totalGuestsAttending += count;

        if (hasEvent(rsvp, "mehendi")) {
          mehendiGuests += count;
        }
        if (hasEvent(rsvp, "wedding")) {
          weddingGuests += count;
        }
        if (hasEvent(rsvp, "reception")) {
          receptionGuests += count;
        }
      } else {
        totalDeclined++;
      }
    });

    // Update Summary Cards
    if (statResponses) statResponses.textContent = totalResponses;
    if (statTotalGuests) statTotalGuests.textContent = totalGuestsAttending;
    if (statAccepted) statAccepted.textContent = totalAccepted;
    if (statDeclined) statDeclined.textContent = totalDeclined;
    if (statMehendiGuests) statMehendiGuests.textContent = mehendiGuests;
    if (statWeddingGuests) statWeddingGuests.textContent = weddingGuests;
    if (statReceptionGuests) statReceptionGuests.textContent = receptionGuests;

    // Update Headcount Cards
    if (headcountMehendi) headcountMehendi.textContent = mehendiGuests;
    if (headcountWedding) headcountWedding.textContent = weddingGuests;
    if (headcountReception) headcountReception.textContent = receptionGuests;
  }

  // --------------------------------------------------------------------------
  // 5. SEARCH & FILTERING LOGIC
  // --------------------------------------------------------------------------
  function getFilteredRsvps() {
    const query = currentSearchQuery.trim().toLowerCase();

    return allRsvps.filter(function (rsvp) {
      // 1. Status Filter
      const attending = isAttending(rsvp);
      if (currentStatusFilter === "yes" && !attending) return false;
      if (currentStatusFilter === "no" && attending) return false;

      // 2. Event Filter
      if (currentEventFilter !== "all") {
        if (!hasEvent(rsvp, currentEventFilter)) return false;
      }

      // 3. Search Query
      if (query) {
        const name = String(rsvp.guest_name || "").toLowerCase();
        const phone = String(rsvp.mobile_number || "").toLowerCase();
        const code = String(rsvp.invite_code || "").toLowerCase();
        const label = String(rsvp.invitation_label || "").toLowerCase();
        const message = String(rsvp.message || "").toLowerCase();

        const match =
          name.includes(query) ||
          phone.includes(query) ||
          code.includes(query) ||
          label.includes(query) ||
          message.includes(query);

        if (!match) return false;
      }

      return true;
    });
  }

  async function deleteRsvp(id, name, rowEl) {
    if (!confirm(`Delete RSVP for "${name || "this guest"}"? This cannot be undone.`)) return;
    try {
      rowEl.style.opacity = "0.4";
      rowEl.style.pointerEvents = "none";
      const res = await fetch(`/api/admin-delete-rsvp?id=${encodeURIComponent(id)}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) throw new Error(data.error || "Delete failed.");
      allRsvps = allRsvps.filter(function (r) { return r.id !== id; });
      renderFilteredRsvps();
      updateSummaryMetrics();
    } catch (err) {
      rowEl.style.opacity = "";
      rowEl.style.pointerEvents = "";
      alert(err.message || "Could not delete. Please try again.");
    }
  }

  function renderFilteredRsvps() {
    const filtered = getFilteredRsvps();

    if (visibleCount) visibleCount.textContent = filtered.length;
    if (totalCount) totalCount.textContent = allRsvps.length;

    if (!rsvpTableBody) return;
    rsvpTableBody.innerHTML = "";

    if (filtered.length === 0) {
      if (tableEmpty) tableEmpty.hidden = false;
      if (tableContainer) tableContainer.hidden = true;
      return;
    }

    if (tableEmpty) tableEmpty.hidden = true;
    if (tableContainer) tableContainer.hidden = false;

    filtered.forEach(function (rsvp) {
      const tr = document.createElement("tr");

      // Guest Name
      const tdName = document.createElement("td");
      tdName.className = "guest-name-cell";
      tdName.textContent = rsvp.guest_name || "Guest";
      tr.appendChild(tdName);

      // Mobile Number
      const tdPhone = document.createElement("td");
      const phoneVal = rsvp.mobile_number || "";
      if (phoneVal) {
        const aPhone = document.createElement("a");
        aPhone.className = "phone-link";
        aPhone.href = `tel:${phoneVal.replace(/\s+/g, "")}`;
        aPhone.textContent = phoneVal;
        tdPhone.appendChild(aPhone);
      } else {
        tdPhone.textContent = "—";
      }
      tr.appendChild(tdPhone);

      // Status
      const tdStatus = document.createElement("td");
      const attending = isAttending(rsvp);
      const statusBadge = document.createElement("span");
      statusBadge.className = `status-badge ${attending ? "status-attending" : "status-declined"}`;
      statusBadge.innerHTML = attending ? "✓ Attending" : "✕ Declined";
      tdStatus.appendChild(statusBadge);
      tr.appendChild(tdStatus);

      // Guest Count
      const tdCount = document.createElement("td");
      tdCount.className = "text-center";
      const countPill = document.createElement("span");
      countPill.className = "guest-count-pill";
      countPill.textContent = getGuestCount(rsvp);
      tdCount.appendChild(countPill);
      tr.appendChild(tdCount);

      // Functions Chips
      const tdEvents = document.createElement("td");
      const chipsWrap = document.createElement("div");
      chipsWrap.className = "chips-wrap";

      if (!attending) {
        const chipNone = document.createElement("span");
        chipNone.className = "event-chip chip-none";
        chipNone.textContent = "Declined";
        chipsWrap.appendChild(chipNone);
      } else {
        const events = Array.isArray(rsvp.attending_events) ? rsvp.attending_events : [];
        if (events.length === 0) {
          const chipNone = document.createElement("span");
          chipNone.className = "event-chip chip-none";
          chipNone.textContent = "None selected";
          chipsWrap.appendChild(chipNone);
        } else {
          events.forEach(function (ev) {
            const evStr = String(ev);
            const lower = evStr.toLowerCase();
            const chip = document.createElement("span");
            chip.className = "event-chip";

            if (lower.includes("mehendi")) {
              chip.classList.add("chip-mehendi");
              chip.textContent = "🌿 Mehendi";
            } else if (lower.includes("wedding") || lower.includes("phera")) {
              chip.classList.add("chip-wedding");
              chip.textContent = "🪔 Wedding Ceremony";
            } else if (lower.includes("reception")) {
              chip.classList.add("chip-reception");
              chip.textContent = "🥂 Reception";
            } else {
              chip.textContent = evStr;
            }
            chipsWrap.appendChild(chip);
          });
        }
      }
      tdEvents.appendChild(chipsWrap);
      tr.appendChild(tdEvents);

      // Invite Code
      const tdCode = document.createElement("td");
      if (rsvp.invite_code) {
        const codeBadge = document.createElement("span");
        codeBadge.className = "code-badge";
        codeBadge.textContent = rsvp.invite_code;
        tdCode.appendChild(codeBadge);
      } else {
        tdCode.textContent = "—";
      }
      tr.appendChild(tdCode);

      // Invitation Label
      const tdLabel = document.createElement("td");
      tdLabel.className = "invitation-type-cell";
      tdLabel.textContent = rsvp.invitation_label || "—";
      tr.appendChild(tdLabel);

      // Message
      const tdMessage = document.createElement("td");
      tdMessage.className = "message-cell";
      tdMessage.textContent = rsvp.message || "—";
      if (rsvp.message) tdMessage.title = rsvp.message;
      tr.appendChild(tdMessage);

      // Submitted At
      const tdDate = document.createElement("td");
      tdDate.className = "time-cell";
      tdDate.textContent = formatDate(rsvp.created_at);
      tr.appendChild(tdDate);

      // Delete
      const tdDelete = document.createElement("td");
      tdDelete.className = "text-center";
      const deleteBtn = document.createElement("button");
      deleteBtn.className = "delete-btn";
      deleteBtn.title = "Delete this RSVP";
      deleteBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>';
      deleteBtn.addEventListener("click", function () {
        deleteRsvp(rsvp.id, rsvp.guest_name, tr);
      });
      tdDelete.appendChild(deleteBtn);
      tr.appendChild(tdDelete);

      rsvpTableBody.appendChild(tr);
    });
  }

  function formatDate(isoString) {
    if (!isoString) return "—";
    try {
      const d = new Date(isoString);
      if (isNaN(d.getTime())) return isoString;
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit"
      });
    } catch {
      return isoString;
    }
  }

  // --------------------------------------------------------------------------
  // 6. EVENT LISTENERS FOR SEARCH & FILTERS
  // --------------------------------------------------------------------------
  if (searchInput) {
    searchInput.addEventListener("input", function (e) {
      currentSearchQuery = e.target.value;
      if (clearSearchBtn) clearSearchBtn.hidden = !currentSearchQuery;
      renderFilteredRsvps();
    });
  }

  if (clearSearchBtn) {
    clearSearchBtn.addEventListener("click", function () {
      if (searchInput) {
        searchInput.value = "";
        currentSearchQuery = "";
        clearSearchBtn.hidden = true;
        renderFilteredRsvps();
        searchInput.focus();
      }
    });
  }

  if (statusFilterControl) {
    statusFilterControl.addEventListener("click", function (e) {
      const btn = e.target.closest(".filter-btn");
      if (!btn) return;

      statusFilterControl.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      currentStatusFilter = btn.dataset.status || "all";
      renderFilteredRsvps();
    });
  }

  if (eventFilterSelect) {
    eventFilterSelect.addEventListener("change", function (e) {
      currentEventFilter = e.target.value;
      renderFilteredRsvps();
    });
  }

  // --------------------------------------------------------------------------
  // 7. CSV EXPORT
  // --------------------------------------------------------------------------
  if (exportCsvBtn) {
    exportCsvBtn.addEventListener("click", function () {
      const dataToExport = getFilteredRsvps();
      if (dataToExport.length === 0) {
        alert("No RSVP records to export.");
        return;
      }

      const headers = [
        "Guest Name",
        "Mobile Number",
        "Attendance",
        "Guest Count",
        "Attending Events",
        "Invite Code",
        "Invitation Label",
        "Message",
        "Submitted At"
      ];

      function escapeCsv(val) {
        const str = val === null || val === undefined ? "" : String(val);
        if (str.includes(",") || str.includes('"') || str.includes("\n") || str.includes("\r")) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      }

      const rows = dataToExport.map(function (r) {
        const attending = isAttending(r) ? "yes" : "no";
        const events = Array.isArray(r.attending_events) ? r.attending_events.join("; ") : "";
        return [
          escapeCsv(r.guest_name),
          escapeCsv(r.mobile_number),
          escapeCsv(attending),
          escapeCsv(getGuestCount(r)),
          escapeCsv(events),
          escapeCsv(r.invite_code),
          escapeCsv(r.invitation_label),
          escapeCsv(r.message),
          escapeCsv(r.created_at)
        ].join(",");
      });

      const csvContent = [headers.join(","), ...rows].join("\r\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const nowStr = new Date().toISOString().slice(0, 10);
      link.setAttribute("href", url);
      link.setAttribute("download", `isha-sajan-wedding-rsvps-${nowStr}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    });
  }

  // --------------------------------------------------------------------------
  // 8. BOOTSTRAP
  // --------------------------------------------------------------------------
  checkSession();

})();
