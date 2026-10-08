/**
 * Snipy — Universal Dashboard Controller (Figma Nodes 1:3, 4:138, 6:243)
 * Features:
 * - 90-Day Cookies & LocalStorage Persistence for all settings, auth, and preferences
 * - Dark Mode active by default with real-time toggle
 * - Tab navigation: Home (1:3), Custom (4:138), Settings (6:243)
 * - Session Log: Gauges start at 0% per user; Gauge 4 tracks Claude 3.5 Haiku Bedrock 100-review quota (stops when 100%)
 * - Fixes & Debug: Actual line-by-line diff data rendered from AWS Bedrock
 * - Custom Section: Clean textarea default, Python default, multi-language selector, dynamic Claude adaptation
 * - Settings Section: 4 AI Assistant modes, sliding context window strictly capped at 150 lines max
 * - Live Auto-Suggestions: Toggle with 2-hour capacity warning modal
 * - Daily Token System: 10 daily tokens (~2.5 hrs active time), auto-resets at midnight
 * - Real-time continuous synchronization with Neon PostgreSQL
 */

const BACKEND_URL = (typeof window !== "undefined" && window.location.origin.includes("onrender.com"))
  ? window.location.origin
  : "https://aws-2-u2md.onrender.com";

// User's Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyACt0tc8GnhYDFabqBToPoUZHBRAt16SyM",
  authDomain: "sniply-d4caf.firebaseapp.com",
  projectId: "sniply-d4caf",
  storageBucket: "sniply-d4caf.firebasestorage.app",
  messagingSenderId: "952891871914",
  appId: "1:952891871914:web:df108c3d334b1abb8236d3",
  measurementId: "G-NY6CFKFCKV"
};

let auth = null;
let googleProvider = null;
let currentUser = null;
let cachedOptimizationsList = [];
let sortDescending = true;
let activeSearchFilter = "";
let selectedLanguages = ["Python"];

// =========================================================================
// 90-DAY COOKIE & HYBRID STORAGE UTILITIES (Requirement 5)
// =========================================================================
function setCookie(name, value, days = 90) {
  try {
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    const val = typeof value === "object" ? encodeURIComponent(JSON.stringify(value)) : encodeURIComponent(String(value));
    document.cookie = `${name}=${val}; expires=${expires}; path=/; SameSite=Lax`;
  } catch (e) {
    console.warn("Cookie set error:", e);
  }
}

function getCookie(name) {
  try {
    const nameEQ = name + "=";
    const ca = document.cookie.split(";");
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i].trim();
      if (c.indexOf(nameEQ) === 0) {
        const raw = decodeURIComponent(c.substring(nameEQ.length));
        try {
          return JSON.parse(raw);
        } catch {
          return raw;
        }
      }
    }
  } catch (e) {
    console.warn("Cookie read error:", e);
  }
  return null;
}

function deleteCookie(name) {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax`;
}

// Universal Storage Abstraction (Chrome Storage Local + Browser LocalStorage + 90-Day Cookies)
const storage = {
  get: (keys, callback) => {
    if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
      chrome.storage.local.get(keys, callback);
    } else {
      const result = {};
      keys.forEach((key) => {
        let val = null;
        const item = localStorage.getItem(key);
        if (item !== null) {
          try { val = JSON.parse(item); } catch { val = item; }
        } else {
          // Fallback to 90-day cookie
          val = getCookie(key);
        }
        result[key] = val;
      });
      callback(result);
    }
  },
  set: (obj, callback) => {
    // Write to chrome storage if available
    if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
      chrome.storage.local.set(obj, callback);
    }
    // Write to LocalStorage & 90-day cookies
    Object.keys(obj).forEach((key) => {
      const val = obj[key];
      localStorage.setItem(key, typeof val === "object" ? JSON.stringify(val) : String(val));
      setCookie(key, val, 90);
    });
    if (callback && !(typeof chrome !== "undefined" && chrome.storage && chrome.storage.local)) {
      callback();
    }
  }
};

const AVAILABLE_LANGUAGES = [
  { name: "Python", icon: "assets/python.png" },
  { name: "C", icon: "assets/python.png" },
  { name: "C++", icon: "assets/python.png" },
  { name: "JavaScript", icon: "assets/python.png" },
  { name: "TypeScript", icon: "assets/python.png" },
  { name: "Java", icon: "assets/python.png" },
  { name: "Rust", icon: "assets/python.png" },
  { name: "Go", icon: "assets/python.png" }
];

// =========================================================================
// THEME CONTROLLER (Dark Mode active by default, persisted in 90-day cookies)
// =========================================================================
function updateSidebarLogo(isDark) {
  const logoDark = document.getElementById("sidebar-logo-dark");
  const logoLight = document.getElementById("sidebar-logo-light");
  if (logoDark && logoLight) {
    if (isDark) {
      logoDark.classList.remove("hidden");
      logoLight.classList.add("hidden");
    } else {
      logoDark.classList.add("hidden");
      logoLight.classList.remove("hidden");
    }
  }
}

function initTheme() {
  const savedTheme = getCookie("pref_theme");
  const isDark = savedTheme !== null ? (savedTheme === true || savedTheme === "true") : false; // Default clean Figma light mode
  
  if (isDark) {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }

  updateSidebarLogo(isDark);
  const toggle = document.getElementById("pref-theme");
  if (toggle) toggle.checked = isDark;
}

function handleThemeToggle(checkbox) {
  const isDark = checkbox.checked;
  if (isDark) {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
  updateSidebarLogo(isDark);
  storage.set({ pref_theme: isDark });
  setCookie("pref_theme", isDark, 90);
  showToast(isDark ? "🌙 Night mode activated" : "☀️ Light mode activated");
}

// =========================================================================
// FIREBASE AUTHENTICATION
// =========================================================================
if (typeof firebase !== "undefined") {
  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }
  auth = firebase.auth();
  googleProvider = new firebase.auth.GoogleAuthProvider();

  auth.onAuthStateChanged((user) => {
    const authGate = document.getElementById("dashboard-auth-gate");
    if (user) {
      currentUser = user;
      if (authGate) authGate.classList.add("hidden");

      const userData = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL
      };

      storage.set({ sniply_user: userData });
      setCookie("sniply_auth_uid", user.uid, 90);
      window.dispatchEvent(new CustomEvent("sniply_auth_changed", { detail: userData }));

      // Sync user profile to Neon PostgreSQL
      fetch(`${BACKEND_URL}/api/v1/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firebase_uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL
        })
      }).catch((e) => console.warn("Neon user sync error:", e));

      updateUserUI(user);
      fetchDashboardMetrics();
      fetchDailyTokens();
      loadUserCustomPreferences();
      loadUserSettings();
      startRealTimeSync();
    } else {
      // Check stored user fallback (cookie or localStorage)
      storage.get(["sniply_user"], (data) => {
        if (data.sniply_user && data.sniply_user.uid) {
          currentUser = data.sniply_user;
          if (authGate) authGate.classList.add("hidden");
          updateUserUI(data.sniply_user);
          fetchDashboardMetrics();
          fetchDailyTokens();
          loadUserCustomPreferences();
          loadUserSettings();
          startRealTimeSync();
        } else {
          const cookieUid = getCookie("sniply_auth_uid");
          if (cookieUid) {
            // Restore session placeholder
            currentUser = { uid: cookieUid, displayName: "Developer", email: "user@snipy.ai" };
            if (authGate) authGate.classList.add("hidden");
            fetchDashboardMetrics();
            fetchDailyTokens();
            loadUserCustomPreferences();
            loadUserSettings();
            startRealTimeSync();
          } else {
            // Lock dashboard until authenticated
            if (authGate) authGate.classList.remove("hidden");
          }
        }
      });
    }
  });
}

function triggerDashboardGoogleSignIn() {
  if (!auth || !googleProvider) return;
  auth.signInWithPopup(googleProvider)
    .then((result) => {
      const authGate = document.getElementById("dashboard-auth-gate");
      if (authGate) authGate.classList.add("hidden");
      currentUser = result.user;
      updateUserUI(result.user);
      fetchDashboardMetrics();
      fetchDailyTokens();
      loadUserCustomPreferences();
      loadUserSettings();
      startRealTimeSync();
    })
    .catch((err) => {
      console.error("Dashboard auth error:", err);
    });
}

function handleDashboardSignOut() {
  if (auth) {
    auth.signOut().then(() => {
      localStorage.removeItem("sniply_user");
      deleteCookie("sniply_user");
      deleteCookie("sniply_auth_uid");
      if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
        chrome.storage.local.remove(["sniply_user"]);
      }
      const authGate = document.getElementById("dashboard-auth-gate");
      if (authGate) authGate.classList.remove("hidden");
      const userChip = document.getElementById("user-chip");
      if (userChip) userChip.classList.add("hidden");
    });
  }
}

function updateUserUI(user) {
  const userChip = document.getElementById("user-chip");
  const userAvatar = document.getElementById("user-avatar");
  const userName = document.getElementById("user-name");
  const welcomeUserName = document.getElementById("welcome-user-name");
  if (user) {
    if (userChip) {
      userChip.classList.remove("hidden");
      userChip.classList.add("flex");
    }
    const displayName = user.displayName ? user.displayName.split(" ")[0] : (user.email ? user.email.split("@")[0] : "John Doe");
    if (userName) userName.textContent = displayName;
    if (welcomeUserName) welcomeUserName.textContent = user.displayName || displayName;
    if (user.photoURL && userAvatar) userAvatar.src = user.photoURL;
  }
}

// =========================================================================
// TAB NAVIGATION (Progress & usage <-> Personalization <-> Settings)
// =========================================================================
function switchDashboardTab(tab) {
  let activeTab = "progress";
  if (tab === "personalization" || tab === "custom") {
    activeTab = "personalization";
  } else if (tab === "settings") {
    activeTab = "settings";
  } else {
    activeTab = "progress";
  }

  const tabDefs = [
    { key: "progress", viewId: "view-progress", altViewId: "view-home", btnId: "nav-btn-progress", altBtnId: "nav-btn-home" },
    { key: "personalization", viewId: "view-personalization", altViewId: "view-custom", btnId: "nav-btn-personalization", altBtnId: "nav-btn-custom" },
    { key: "settings", viewId: "view-settings", altViewId: null, btnId: "nav-btn-settings", altBtnId: null }
  ];

  tabDefs.forEach((def) => {
    const isCurrent = def.key === activeTab;
    const view = document.getElementById(def.viewId) || (def.altViewId ? document.getElementById(def.altViewId) : null);
    const btn = document.getElementById(def.btnId) || (def.altBtnId ? document.getElementById(def.altBtnId) : null);

    if (view) {
      if (isCurrent) {
        view.classList.remove("hidden");
      } else {
        view.classList.add("hidden");
      }
    }

    if (btn) {
      if (isCurrent) {
        btn.classList.add("active");
        btn.classList.remove("text-white/60");
      } else {
        btn.classList.remove("active");
        btn.classList.add("text-white/60");
      }
    }
  });

  if (activeTab === "progress") {
    fetchDashboardMetrics(false);
    fetchDailyTokens();
  } else if (activeTab === "personalization") {
    loadUserCustomPreferences();
  } else if (activeTab === "settings") {
    loadUserSettings();
  }
}

// =========================================================================
// REAL-TIME METRICS & GAUGES (Starting at 0%, 100-Review Quota Limit)
// =========================================================================
let syncIntervalTimer = null;
function startRealTimeSync() {
  if (syncIntervalTimer) clearInterval(syncIntervalTimer);
  syncIntervalTimer = setInterval(() => {
    fetchDashboardMetrics(false);
    fetchDailyTokens();
  }, 4000);
}

window.addEventListener("focus", () => {
  fetchDashboardMetrics(false);
  fetchDailyTokens();
});

window.addEventListener("storage", (e) => {
  if (e.key === "sniply_user" || e.key === "activeSnippet" || e.key === "daily_tokens") {
    fetchDashboardMetrics(false);
    fetchDailyTokens();
  }
});

async function fetchDashboardMetrics(showLoading = true) {
  try {
    storage.get(["sniply_user", "backendUrl"], async (data) => {
      const backend = data.backendUrl || BACKEND_URL;
      const user = currentUser || data.sniply_user || {};
      const url = `${backend}/api/v1/user/stats${user.uid ? `?userId=${user.uid}` : ''}`;

      const res = await fetch(url);
      if (res.ok) {
        const body = await res.json();
        if (body.success && body.data) {
          updateGauges(body.data);
          cachedOptimizationsList = body.data.recent_optimizations || [];
          renderFixesCards(cachedOptimizationsList);
        }
      }
    });
  } catch (e) {
    console.warn("Could not fetch Neon DB stats:", e);
  }
}

/**
 * Updates Session Log Gauges (Figma Nodes 24:180, 24:197, 24:186)
 * - Gauges start at 0% for every new user
 * - Circular arc gauge circumference arc length = 212 (r=45, 270 deg)
 */
function updateGauges(stats) {
  const ARC_MAX = 212;

  const setArc = (gaugeId, textId, pct) => {
    const gauge = document.getElementById(gaugeId);
    const text = document.getElementById(textId);
    const clampedPct = Math.max(0, Math.min(100, Math.round(pct)));
    if (text) text.textContent = `${clampedPct} %`;
    if (gauge) {
      const offset = ARC_MAX - (ARC_MAX * (clampedPct / 100));
      gauge.style.strokeDashoffset = offset;
    }
  };

  const totalRuns = stats.total_fixes || 0;

  if (totalRuns === 0) {
    // Strictly start with 0% per user
    setArc("gauge-mistakes", "text-mistakes", 0);
    setArc("gauge-syntax", "text-syntax", 0);
    setArc("gauge-usage", "text-usage", 0);
    setArc("gauge-fixes", "text-fixes", 0);
  } else {
    setArc("gauge-mistakes", "text-mistakes", stats.mistakes_pct !== undefined ? stats.mistakes_pct : 0);
    setArc("gauge-syntax", "text-syntax", stats.syntax_pct !== undefined ? stats.syntax_pct : 0);
    setArc("gauge-usage", "text-usage", stats.usage_pct !== undefined ? stats.usage_pct : 0);
    setArc("gauge-fixes", "text-fixes", stats.fixes_pct !== undefined ? stats.fixes_pct : 0);
  }

  // Quota Count (0 to 100 Reviews)
  const quotaCountEl = document.getElementById("quota-count");
  if (quotaCountEl) {
    quotaCountEl.textContent = Math.min(100, totalRuns);
  }

  // Rate Limit 100% Reached Badge
  const rateLimitBadge = document.getElementById("rate-limit-badge");
  const isLimited = stats.is_rate_limited || (stats.usage_pct >= 100) || (totalRuns >= 100);
  if (rateLimitBadge) {
    if (isLimited) {
      rateLimitBadge.classList.remove("hidden");
    } else {
      rateLimitBadge.classList.add("hidden");
    }
  }
}

// =========================================================================
// DAILY AUTO-SUGGESTION TOKEN SYSTEM (10 Tokens / Day, ~2.5 hrs Capacity)
// =========================================================================
async function fetchDailyTokens() {
  try {
    const user = currentUser || {};
    const url = `${BACKEND_URL}/api/v1/user/tokens${user.uid ? `?userId=${user.uid}` : ''}`;
    const res = await fetch(url);
    if (res.ok) {
      const body = await res.json();
      if (body.success && body.data) {
        updateTokenUI(body.data);
      }
    }
  } catch (e) {
    console.warn("Could not fetch daily tokens:", e);
  }
}

function updateTokenUI(data) {
  // Tokens used out of 10 (each token = 3 problems, max 30 problems)
  const tokensUsed = data.tokens_used !== undefined ? data.tokens_used : (data.daily_tokens !== undefined ? data.daily_tokens : 0);
  const maxTokens = data.max_tokens || data.max_daily_tokens || 10;
  const problemsUsed = data.problems_used !== undefined ? data.problems_used : (tokensUsed * 3);
  const maxProblems = data.max_problems || 30;
  const isLocked = data.is_locked || (problemsUsed >= maxProblems) || (tokensUsed >= maxTokens);
  const remainingHours = data.remaining_hours !== undefined ? data.remaining_hours : Math.max(0, ((maxTokens - tokensUsed) * 0.25)).toFixed(1);

  const ratioDisplayEl = document.getElementById("token-ratio-display");
  const displayEl = document.getElementById("token-count-display");
  const mainProgressBar = document.getElementById("main-token-progress");
  const progressBar = document.getElementById("token-progress-bar");
  const badgeEl = document.getElementById("token-status-badge");

  if (ratioDisplayEl) {
    ratioDisplayEl.textContent = `${tokensUsed}/${maxTokens}`;
  }
  if (displayEl) {
    displayEl.textContent = `${tokensUsed} / ${maxTokens}`;
  }

  const pct = Math.max(0, Math.min(100, (tokensUsed / maxTokens) * 100));

  if (mainProgressBar) {
    mainProgressBar.style.width = `${pct}%`;
    if (isLocked) {
      mainProgressBar.className = "bg-rose-500 h-full rounded-[20px] transition-all duration-500 shadow-[0_0_12px_rgba(244,63,94,0.6)]";
    } else {
      mainProgressBar.className = "bg-white h-full rounded-[20px] transition-all duration-500";
    }
  }
  if (progressBar) {
    progressBar.style.width = `${pct}%`;
    progressBar.className = "h-full rounded-full transition-all duration-500 " + 
      (isLocked ? "bg-rose-500" : (pct < 80 ? "bg-white" : "bg-amber-400"));
  }

  if (badgeEl) {
    if (isLocked) {
      badgeEl.textContent = `Limit Reached (${problemsUsed}/${maxProblems} problems fixed) — Free tier exhausted`;
      badgeEl.className = "text-xs font-mono text-rose-400 font-semibold";
    } else {
      const probsLeft = Math.max(0, maxProblems - problemsUsed);
      badgeEl.textContent = `Active (${probsLeft} problems left / ~${remainingHours} hrs available)`;
      badgeEl.className = "text-xs font-mono text-white/50";
    }
  }

  // Also sync to storage for content script and popup
  storage.set({
    daily_tokens: Math.max(0, maxTokens - tokensUsed),
    tokens_used: tokensUsed,
    problems_used: problemsUsed,
    max_problems: maxProblems,
    is_locked: isLocked,
    quota_exceeded: isLocked
  });
}

// =========================================================================
// AUTO-SUGGESTION TOGGLE & WARNING MODAL (Requirement 6)
// =========================================================================
function handleAutoSuggestionsToggle(checkbox) {
  if (checkbox.checked) {
    // Show confirmation modal with 2-hour capacity warning
    const modal = document.getElementById("autosuggest-modal");
    if (modal) {
      modal.classList.remove("hidden");
      modal.classList.add("flex");
    }
  } else {
    // Disabling is immediate
    storage.set({ pref_auto_suggestions: false });
    setCookie("pref_auto_suggestions", false, 90);
    showToast("Live Auto-Suggestions disabled.");
  }
}

function confirmAutoSuggestionToggle() {
  const modal = document.getElementById("autosuggest-modal");
  const checkbox = document.getElementById("pref-auto-suggestions");
  if (modal) {
    modal.classList.add("hidden");
    modal.classList.remove("flex");
  }
  if (checkbox) checkbox.checked = true;

  storage.set({ pref_auto_suggestions: true });
  setCookie("pref_auto_suggestions", true, 90);

  if (currentUser && currentUser.uid) {
    fetch(`${BACKEND_URL}/api/v1/user/preferences`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        firebase_uid: currentUser.uid,
        pref_auto_suggestions: true
      })
    }).catch((e) => console.warn("Auto suggestion preference sync error:", e));
  }

  showToast("⚡ Auto-Suggestions enabled! (10 daily tokens active for ~2.5 hrs).");
}

function cancelAutoSuggestionToggle() {
  const modal = document.getElementById("autosuggest-modal");
  const checkbox = document.getElementById("pref-auto-suggestions");
  if (modal) {
    modal.classList.add("hidden");
    modal.classList.remove("flex");
  }
  if (checkbox) checkbox.checked = false;
  storage.set({ pref_auto_suggestions: false });
  setCookie("pref_auto_suggestions", false, 90);
}

// =========================================================================
// FIXES & DEBUG: ACTUAL DATA & LINE-BY-LINE RENDERING (Requirement 2)
// =========================================================================
function renderFixesCards(items) {
  const container = document.getElementById("fixes-cards-container");
  if (!container) return;

  let displayItems = [...items];
  if (activeSearchFilter) {
    const q = activeSearchFilter.toLowerCase();
    displayItems = displayItems.filter((it) => 
      (it.summary && it.summary.toLowerCase().includes(q)) ||
      (it.language && it.language.toLowerCase().includes(q)) ||
      (it.original_complexity && it.original_complexity.toLowerCase().includes(q)) ||
      (it.keyword && it.keyword.toLowerCase().includes(q))
    );
  }

  if (!sortDescending) {
    displayItems.reverse();
  }

  if (displayItems.length === 0) {
    container.innerHTML = `
      <div class="border border-white/20 rounded-[30px] p-8 text-center bg-black/20">
        <p class="text-lg font-light text-white">No history recorded yet</p>
        <p class="text-sm text-white/50 mt-1">Run an optimization in LeetCode, CodeChef, or Jupyter to see your live fixes and history here.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = "";

  displayItems.forEach((item) => {
    const card = document.createElement("div");
    card.className = "border border-[#f5f5f5]/55 hover:border-white rounded-[30px] min-h-[67px] px-7 sm:px-9 py-3 flex items-center justify-between transition-all bg-black/20 hover:bg-white/[0.04] text-white cursor-pointer group";

    const compBefore = item.original_complexity || "O(N²)";
    const compAfter = item.optimized_complexity || "O(N)";
    
    let displayTag = item.keyword || "def";
    if (!displayTag || displayTag.toLowerCase().includes("overengine")) {
      displayTag = item.language ? item.language.toLowerCase() : "def";
    }

    const summaryText = item.summary || "Fix the keyword";

    card.innerHTML = `
      <div class="flex items-center gap-4 overflow-hidden flex-1 mr-4">
        <span class="font-mono text-[20px] font-light text-white opacity-80 shrink-0">&lt;&gt;</span>
        <span class="text-[18px] sm:text-[20px] font-light text-white opacity-80 truncate" title="${escapeHtml(summaryText)}">
          ${escapeHtml(summaryText)}
        </span>
        <span class="bg-[#d9d9d9]/10 rounded-[10px] px-3.5 py-1 text-[16px] text-white opacity-80 font-mono font-light shrink-0">
          ${escapeHtml(displayTag)}
        </span>
        <span class="hidden md:inline-flex text-xs font-mono font-light text-white/60 bg-white/5 px-2.5 py-0.5 rounded-full border border-white/10 shrink-0">
          ${escapeHtml(compBefore)} &rarr; ${escapeHtml(compAfter)}
        </span>
      </div>

      <div class="shrink-0 flex items-center gap-4">
        <div class="w-[25px] h-[25px] flex items-center justify-center shrink-0">
          <img src="assets/python.png" alt="Python" class="w-full h-full object-contain opacity-85 group-hover:opacity-100 transition-opacity" />
        </div>
        <button type="button" class="btn-del-fix opacity-0 group-hover:opacity-100 text-white/40 hover:text-rose-400 text-2xl font-light transition-all cursor-pointer leading-none" title="Delete this fix">&times;</button>
      </div>
    `;

    const delBtn = card.querySelector(".btn-del-fix");
    if (delBtn) {
      delBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        handleDeleteFix(item.id);
      });
    }

    card.addEventListener("click", () => {
      openFixDetailModal(item);
    });

    container.appendChild(card);
  });
}

async function handleClearAllFixes() {
  if (!confirm("Are you sure you want to clear your Fixes & Debug history?")) return;
  const user = currentUser || {};
  try {
    const url = `${BACKEND_URL}/api/v1/optimizations${user.uid ? `?userId=${user.uid}` : ''}`;
    const res = await fetch(url, { method: "DELETE" });
    if (res.ok) {
      cachedOptimizationsList = [];
      renderFixesCards([]);
      fetchDashboardMetrics(false);
      showToast("✓ Fixes & Debug history cleared.");
    }
  } catch (e) {
    console.warn("Could not clear optimizations:", e);
  }
}

async function handleDeleteFix(id) {
  const user = currentUser || {};
  try {
    const url = `${BACKEND_URL}/api/v1/optimizations/${id}${user.uid ? `?userId=${user.uid}` : ''}`;
    const res = await fetch(url, { method: "DELETE" });
    if (res.ok) {
      cachedOptimizationsList = cachedOptimizationsList.filter((item) => String(item.id) !== String(id));
      renderFixesCards(cachedOptimizationsList);
      fetchDashboardMetrics(false);
      showToast("Fix removed from history.");
    }
  } catch (e) {
    console.warn("Could not delete fix:", e);
  }
}

function openFixDetailModal(item) {
  const modal = document.getElementById("fix-detail-modal");
  const modalBadge = document.getElementById("modal-complexity-badge");
  const modalTime = document.getElementById("modal-time");
  const modalTitle = document.getElementById("modal-title");
  const modalSummary = document.getElementById("modal-summary");
  const modalCode = document.getElementById("modal-code");
  const lineChangesWrapper = document.getElementById("modal-line-changes-wrapper");
  const lineChangesContainer = document.getElementById("modal-line-changes");

  if (!modal) return;

  const compBefore = item.original_complexity || "O(N²)";
  const compAfter = item.optimized_complexity || "O(N)";
  modalBadge.textContent = `${compBefore} → ${compAfter}`;
  modalTime.textContent = item.created_at ? new Date(item.created_at).toLocaleTimeString() : "Recent Session";
  modalTitle.textContent = `Fix: ${item.keyword || "def"} optimization`;
  modalSummary.textContent = item.summary || "Context window replaced with an idiomatic, single-pass algorithm.";
  modalCode.textContent = item.full_optimized_code || (item.code_snippet || "# Clean code applied\nreturn [item for item in items]");

  // Render Line-by-Line Changes (Requirement 2)
  if (lineChangesContainer) {
    lineChangesContainer.innerHTML = "";
    const changes = item.line_changes || [];

    if (Array.isArray(changes) && changes.length > 0) {
      if (lineChangesWrapper) lineChangesWrapper.classList.remove("hidden");
      changes.forEach((ch) => {
        const row = document.createElement("div");
        row.className = "p-2.5 rounded-lg border text-xs space-y-1";

        if (ch.type === "remove") {
          row.className += " bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900/50 text-rose-800 dark:text-rose-300";
          row.innerHTML = `<span class="font-bold text-rose-600">- Line ${ch.line_num || '?'}:</span> <code>${escapeHtml(ch.original || '')}</code>`;
        } else if (ch.type === "add") {
          row.className += " bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/50 text-emerald-800 dark:text-emerald-300";
          row.innerHTML = `<span class="font-bold text-emerald-600">+ Line ${ch.line_num || '?'}:</span> <code>${escapeHtml(ch.suggestion || '')}</code> ${ch.reason ? `<span class="text-[11px] opacity-75 font-sans block mt-0.5">// ${escapeHtml(ch.reason)}</span>` : ''}`;
        } else {
          // Replace or general edit
          row.className += " bg-gray-50 dark:bg-gray-800/40 border-gray-200 dark:border-gray-700";
          row.innerHTML = `
            <div class="text-rose-700 dark:text-rose-400"><span class="font-bold">- Line ${ch.line_num || '?'}:</span> <code>${escapeHtml(ch.original || '')}</code></div>
            <div class="text-emerald-700 dark:text-emerald-400 mt-1"><span class="font-bold">+ Replace:</span> <code>${escapeHtml(ch.suggestion || '')}</code></div>
            ${ch.reason ? `<div class="text-[11px] text-gray-500 dark:text-gray-400 font-sans mt-0.5">// ${escapeHtml(ch.reason)}</div>` : ''}
          `;
        }
        lineChangesContainer.appendChild(row);
      });
    } else {
      // Clean fallback if no granular diff is available
      lineChangesContainer.innerHTML = `
        <div class="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-700 text-xs text-gray-600 dark:text-gray-400">
          Entire context replaced with full optimized snippet shown below.
        </div>
      `;
    }
  }

  modal.classList.remove("hidden");
  modal.classList.add("flex");
}

function closeFixDetailModal() {
  const modal = document.getElementById("fix-detail-modal");
  if (modal) {
    modal.classList.add("hidden");
    modal.classList.remove("flex");
  }
}

// =========================================================================
// CUSTOM PREFERENCES: MULTI-LANGUAGE & ADAPTIVE CLAUDE (Requirement 3)
// =========================================================================
function loadUserCustomPreferences() {
  storage.get(["custom_preferences", "preferred_languages"], (data) => {
    const textarea = document.getElementById("custom-rules-textarea");
    
    // Textarea must be CLEAN by default as requested
    if (textarea) {
      textarea.value = data.custom_preferences ? data.custom_preferences : "";
    }

    // Default is Python selected
    if (data.preferred_languages && Array.isArray(data.preferred_languages) && data.preferred_languages.length > 0) {
      selectedLanguages = data.preferred_languages;
    } else {
      selectedLanguages = ["Python"];
    }
    renderLanguagePills();
  });
}

function handleSavePreferences() {
  const textarea = document.getElementById("custom-rules-textarea");
  const rules = textarea ? textarea.value.trim() : "";

  storage.set({
    custom_preferences: rules,
    preferred_languages: selectedLanguages
  }, () => {
    showToast("✓ Custom preferences saved! Snipy.ai will adapt to your selected languages and personalization.");
  });

  setCookie("custom_preferences", rules, 90);
  setCookie("preferred_languages", selectedLanguages, 90);

  if (currentUser && currentUser.uid) {
    fetch(`${BACKEND_URL}/api/v1/user/preferences`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        firebase_uid: currentUser.uid,
        custom_preferences: rules,
        preferred_languages: selectedLanguages
      })
    }).catch((e) => console.warn("Preferences cloud sync notice:", e));
  }
}

function handleEditPreferences() {
  const textarea = document.getElementById("custom-rules-textarea");
  if (textarea) {
    textarea.focus();
    textarea.select();
  }
}

function renderLanguagePills() {
  const container = document.getElementById("selected-languages-container");
  if (!container) return;

  container.innerHTML = "";
  selectedLanguages.forEach((lang) => {
    const pill = document.createElement("div");
    pill.className = "h-[62px] min-w-[178px] px-6 rounded-[25px] border border-white flex items-center justify-between gap-4 bg-black/20 backdrop-blur-xs shadow-sm transition-all";
    
    let iconHtml = "";
    if (lang.toLowerCase() === "python") {
      iconHtml = `
        <div class="w-[28px] h-[28px] rounded-full bg-white/10 flex items-center justify-center p-1 shrink-0">
          <img src="assets/python.png" alt="Python" class="w-[20px] h-[20px] object-contain" />
        </div>
      `;
    } else {
      iconHtml = `
        <div class="w-[28px] h-[28px] rounded-full bg-white/10 flex items-center justify-center shrink-0">
          <span class="text-xs font-bold text-white">${escapeHtml(lang.substring(0, 2).toUpperCase())}</span>
        </div>
      `;
    }

    pill.innerHTML = `
      <div class="flex items-center gap-3.5">
        ${iconHtml}
        <span class="text-[20px] font-medium text-white tracking-tight">${escapeHtml(lang)}</span>
      </div>
      <button 
        type="button" 
        class="btn-remove-lang text-white/40 hover:text-rose-400 text-2xl font-light cursor-pointer leading-none transition-colors"
        title="Remove ${escapeHtml(lang)}"
      >
        &times;
      </button>
    `;
    const btnRemove = pill.querySelector(".btn-remove-lang");
    if (btnRemove) {
      btnRemove.addEventListener("click", () => removeLanguage(lang));
    }
    container.appendChild(pill);
  });
}

function addLanguage(name) {
  if (!selectedLanguages.includes(name)) {
    selectedLanguages.push(name);
    renderLanguagePills();
    storage.set({ preferred_languages: selectedLanguages });
    setCookie("preferred_languages", selectedLanguages, 90);
  }
}

function removeLanguage(name) {
  if (selectedLanguages.length <= 1) {
    showToast("At least one language must remain selected (Default: Python).");
    return;
  }
  selectedLanguages = selectedLanguages.filter((l) => l !== name);
  renderLanguagePills();
  storage.set({ preferred_languages: selectedLanguages });
  setCookie("preferred_languages", selectedLanguages, 90);
}

// =========================================================================
// SETTINGS: 4 AI MODES & CONTEXT WINDOW STRICT MAX 150 (Requirement 4)
// =========================================================================
function loadUserSettings() {
  storage.get(["ai_mode", "context_window", "pref_theme", "pref_auto_suggestions", "pref_data_privacy"], (data) => {
    const modeSelect = document.getElementById("setting-ai-mode");
    const windowInput = document.getElementById("setting-context-window");
    const prefTheme = document.getElementById("pref-theme");
    const prefAuto = document.getElementById("pref-auto-suggestions");
    const prefPrivacy = document.getElementById("pref-data-privacy");

    if (modeSelect) {
      modeSelect.value = data.ai_mode || "anti-overengineering";
    }

    // Default context window is 150 lines, capped at 150 max
    if (windowInput) {
      const cw = data.context_window !== undefined ? Math.min(150, Math.max(20, parseInt(data.context_window, 10) || 150)) : 150;
      windowInput.value = cw;
    }

    // Theme default dark
    if (prefTheme) {
      const isDark = data.pref_theme !== undefined ? data.pref_theme : true;
      prefTheme.checked = isDark;
    }

    if (prefAuto) {
      prefAuto.checked = data.pref_auto_suggestions !== undefined ? data.pref_auto_suggestions : false;
    }

    if (prefPrivacy) {
      prefPrivacy.checked = data.pref_data_privacy !== undefined ? data.pref_data_privacy : true;
    }
  });
}

function handleSaveSettings() {
  const modeSelect = document.getElementById("setting-ai-mode");
  const windowInput = document.getElementById("setting-context-window");
  const prefTheme = document.getElementById("pref-theme");
  const prefAuto = document.getElementById("pref-auto-suggestions");
  const prefPrivacy = document.getElementById("pref-data-privacy");

  // Enforce context window strictly capped at 150 lines
  let rawWindow = windowInput ? parseInt(windowInput.value, 10) : 150;
  if (isNaN(rawWindow) || rawWindow <= 0) rawWindow = 150;
  const clampedWindow = Math.min(150, Math.max(20, rawWindow));
  if (windowInput) windowInput.value = clampedWindow;

  const settingsData = {
    ai_mode: modeSelect ? modeSelect.value : "anti-overengineering",
    context_window: clampedWindow,
    pref_theme: prefTheme ? prefTheme.checked : true,
    pref_auto_suggestions: prefAuto ? prefAuto.checked : false,
    pref_data_privacy: prefPrivacy ? prefPrivacy.checked : true
  };

  storage.set(settingsData, () => {
    showToast("✓ Settings saved! AI assistant mode updated (150-line window enforced).");
  });

  setCookie("ai_mode", settingsData.ai_mode, 90);
  setCookie("context_window", settingsData.context_window, 90);
  setCookie("pref_theme", settingsData.pref_theme, 90);
  setCookie("pref_auto_suggestions", settingsData.pref_auto_suggestions, 90);
  setCookie("pref_data_privacy", settingsData.pref_data_privacy, 90);

  if (currentUser && currentUser.uid) {
    fetch(`${BACKEND_URL}/api/v1/user/preferences`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        firebase_uid: currentUser.uid,
        ai_mode: settingsData.ai_mode,
        context_window: settingsData.context_window,
        pref_theme: settingsData.pref_theme,
        pref_auto_suggestions: settingsData.pref_auto_suggestions,
        pref_data_privacy: settingsData.pref_data_privacy
      })
    }).catch((e) => console.warn("Settings cloud sync error:", e));
  }
}

function showToast(message) {
  const container = document.getElementById("toast-container");
  if (!container) return;
  const toast = document.createElement("div");
  toast.className = "pointer-events-auto bg-[#002629] dark:bg-[#161b22] text-white px-6 py-3.5 rounded-2xl shadow-xl text-sm font-medium flex items-center gap-3 transform transition-all duration-300 translate-y-4 opacity-0 border border-white/10";
  toast.innerHTML = `<span class="text-emerald-400 font-bold">✓</span><span>${message}</span>`;
  container.appendChild(toast);

  requestAnimationFrame(() => {
    toast.classList.remove("translate-y-4", "opacity-0");
  });

  setTimeout(() => {
    toast.classList.add("translate-y-4", "opacity-0");
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// =========================================================================
// DOM CONTENT LOADED INITIALIZATIONS
// =========================================================================
document.addEventListener("DOMContentLoaded", () => {
  // Initialize dark theme immediately
  initTheme();

  // Search toggle in Fixes & Debug
  const btnToggleSearch = document.getElementById("btn-toggle-search");
  const searchWrapper = document.getElementById("search-box-wrapper");
  const searchInput = document.getElementById("fixes-search-input");

  if (btnToggleSearch && searchWrapper) {
    btnToggleSearch.addEventListener("click", () => {
      searchWrapper.classList.toggle("hidden");
      searchWrapper.classList.toggle("flex");
      if (!searchWrapper.classList.contains("hidden") && searchInput) {
        searchInput.focus();
      }
    });
  }

  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      activeSearchFilter = e.target.value.trim();
      renderFixesCards(cachedOptimizationsList);
    });
  }

  // Sort toggle
  const btnToggleSort = document.getElementById("btn-toggle-sort");
  if (btnToggleSort) {
    btnToggleSort.addEventListener("click", () => {
      sortDescending = !sortDescending;
      renderFixesCards(cachedOptimizationsList);
    });
  }

  // Language Search Input & Autocomplete
  const langSearchInput = document.getElementById("custom-lang-search-input");
  const langDropdown = document.getElementById("lang-autocomplete-dropdown");
  const btnAddLang = document.getElementById("btn-add-language");

  if (langSearchInput && langDropdown) {
    langSearchInput.addEventListener("input", (e) => {
      const q = e.target.value.trim().toLowerCase();
      if (!q) {
        langDropdown.classList.add("hidden");
        return;
      }
      const matches = AVAILABLE_LANGUAGES.filter((l) => l.name.toLowerCase().includes(q));
      if (matches.length > 0) {
        langDropdown.innerHTML = matches.map((m) => `
          <div class="px-6 py-3 hover:bg-gray-50 dark:hover:bg-white/5 flex items-center justify-between cursor-pointer border-b border-gray-100 dark:border-white/5 last:border-none" onclick="addLanguage('${m.name}'); document.getElementById('lang-autocomplete-dropdown').classList.add('hidden'); document.getElementById('custom-lang-search-input').value = '';">
            <span class="font-medium text-sm text-[#002629] dark:text-white">${m.name}</span>
            <span class="text-xs text-gray-400 dark:text-white/50">+ Add</span>
          </div>
        `).join("");
        langDropdown.classList.remove("hidden");
      } else {
        langDropdown.classList.add("hidden");
      }
    });

    document.addEventListener("click", (e) => {
      if (!langSearchInput.contains(e.target) && !langDropdown.contains(e.target)) {
        langDropdown.classList.add("hidden");
      }
    });
  }

  if (btnAddLang && langSearchInput) {
    btnAddLang.addEventListener("click", () => {
      const val = langSearchInput.value.trim();
      if (val) {
        addLanguage(val);
        langSearchInput.value = "";
        if (langDropdown) langDropdown.classList.add("hidden");
      }
    });
  }

  // Modal actions
  const modalBtnCopy = document.getElementById("modal-btn-copy");
  if (modalBtnCopy) {
    modalBtnCopy.addEventListener("click", () => {
      const code = document.getElementById("modal-code")?.textContent || "";
      navigator.clipboard.writeText(code).then(() => {
        const orig = modalBtnCopy.textContent;
        modalBtnCopy.textContent = "✓ Copied!";
        setTimeout(() => { modalBtnCopy.textContent = orig; }, 1500);
      });
    });
  }

  const modalBtnApply = document.getElementById("modal-btn-apply");
  if (modalBtnApply) {
    modalBtnApply.addEventListener("click", () => {
      const code = document.getElementById("modal-code")?.textContent || "";
      if (typeof chrome !== "undefined" && chrome.runtime && chrome.runtime.sendMessage) {
        chrome.runtime.sendMessage({
          action: "APPLY_TO_ACTIVE_EDITOR",
          code: code
        }, () => {
          modalBtnApply.textContent = "✓ Applied to Editor Tab!";
          setTimeout(() => {
            modalBtnApply.textContent = "✓ Apply to Active Editor";
            closeFixDetailModal();
          }, 1200);
        });
      } else {
        navigator.clipboard.writeText(code).then(() => {
          modalBtnApply.textContent = "✓ Copied for Editor!";
          setTimeout(() => {
            modalBtnApply.textContent = "✓ Apply to Active Editor";
            closeFixDetailModal();
          }, 1200);
        });
      }
    });
  }
});

function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
