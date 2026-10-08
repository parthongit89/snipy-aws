/**
 * Sniply — Unified Multi-Platform Content Script
 * Supports: Google Colab, LeetCode, CodeChef, HackerRank, Replit, Programiz, OnlineGDB, Jupyter, GeeksforGeeks
 * Features: 100-120 lines sliding window capture, in-place code replacement, and direct full dashboard tab launch.
 */

(function () {
  // Prevent duplicate execution on the same page
  if (window.__SNIPLY_CONTENT_SCRIPT_INITIALIZED__) {
    return;
  }
  window.__SNIPLY_CONTENT_SCRIPT_INITIALIZED__ = true;

  // Declare all constants and module-level variables at the top (prevents TDZ errors)
  // Self-contained inline Base64 data URI for the wireframe cube icon (immune to CSP, reload, or file:// origin blocks)
  const CUBE_ICON_SRC = "data:image/png;base64,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";
  let lastActiveEditor = null;
  let floatingPill = null;
  let isSniplyActive = true;
  let activeTooltipEl = null;
  let activeHighlightEl = null;
  let activeHighlightElements = [];
  let activeHighlightOverlay = null;
  let currentStickState = "activate";
  let stickRevertTimeout = null;
  let lastAutoAnalyzedCode = "";
  let lastAutoAnalyzedTime = 0;

  // Safe Chrome API & Storage wrappers (prevents "Cannot read properties of undefined (reading 'local')" on extension reload or orphaned tabs)
  function isExtensionAlive() {
    try {
      return typeof chrome !== "undefined" && !!chrome.runtime && !!chrome.runtime.id;
    } catch (e) {
      return false;
    }
  }

  function safeStorageGet(keys, callback) {
    try {
      if (isExtensionAlive() && chrome.storage && chrome.storage.local) {
        chrome.storage.local.get(keys, (res) => {
          if (chrome.runtime?.lastError) {
            callback({});
          } else {
            callback(res || {});
          }
        });
        return;
      }
    } catch (e) {}

    // Fallback to localStorage or in-memory
    const result = {};
    try {
      if (Array.isArray(keys)) {
        keys.forEach((k) => {
          const item = localStorage.getItem(k);
          if (item) {
            try { result[k] = JSON.parse(item); } catch (_) { result[k] = item; }
          }
        });
      }
    } catch (_) {}
    callback(result);
  }

  function safeStorageSet(data, callback) {
    try {
      if (isExtensionAlive() && chrome.storage && chrome.storage.local) {
        chrome.storage.local.set(data, () => {
          if (callback) callback();
        });
        return;
      }
    } catch (e) {}

    try {
      Object.keys(data || {}).forEach((k) => {
        localStorage.setItem(k, typeof data[k] === "string" ? data[k] : JSON.stringify(data[k]));
      });
    } catch (_) {}
    if (callback) callback();
  }

  function safeStorageRemove(keys) {
    try {
      if (isExtensionAlive() && chrome.storage && chrome.storage.local) {
        chrome.storage.local.remove(keys);
        return;
      }
    } catch (e) {}
    try {
      if (Array.isArray(keys)) keys.forEach((k) => localStorage.removeItem(k));
    } catch (_) {}
  }

function initContentScript() {
  syncUserSessionFromPage();
  createFloatingTrigger();
  attachEditorListeners();
  listenForRuntimeMessages();
  checkForEditorsOnPage();
  observeDynamicEditors();
}

/**
 * Automatically syncs authenticated user profile from Sniply web application safely
 */
function syncUserSessionFromPage() {
  try {
    const rawUser = localStorage.getItem("sniply_user");
    if (rawUser) {
      const parsed = JSON.parse(rawUser);
      if (parsed && parsed.uid) {
        safeStorageSet({ sniply_user: parsed });
      }
    }
  } catch (e) {}

  window.addEventListener("sniply_auth_changed", (e) => {
    if (e.detail && e.detail.uid) {
      safeStorageSet({ sniply_user: e.detail });
    } else if (e.detail === null) {
      safeStorageRemove(["sniply_user"]);
    }
  });

  window.addEventListener("storage", (e) => {
    if (e.key === "sniply_user") {
      try {
        const parsed = e.newValue ? JSON.parse(e.newValue) : null;
        if (parsed && parsed.uid) {
          safeStorageSet({ sniply_user: parsed });
        } else {
          safeStorageRemove(["sniply_user"]);
        }
      } catch (err) {}
    }
  });
}


/**
 * Injects keyframe animations for the screen stick
 */
function injectScreenStickStyles() {
  if (document.getElementById("sniply-screen-stick-styles")) return;
  const styleEl = document.createElement("style");
  styleEl.id = "sniply-screen-stick-styles";
  styleEl.textContent = `
    @keyframes sniply-stick-pulse {
      0%, 100% {
        filter: drop-shadow(0 0 10px rgba(96, 165, 250, 0.45)) drop-shadow(0 14px 35px rgba(0,0,0,0.6));
        transform: translateY(0) scale(1);
      }
      50% {
        filter: drop-shadow(0 0 24px rgba(96, 165, 250, 0.95)) drop-shadow(0 16px 42px rgba(0,0,0,0.75));
        transform: translateY(-2px) scale(1.02);
      }
    }
    @keyframes sniply-applied-bounce {
      0% { transform: scale(0.92); opacity: 0; }
      50% { transform: scale(1.04); }
      100% { transform: scale(1); opacity: 1; }
    }
    #sniply-screen-stick {
      transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1), transform 0.2s ease;
    }
    #sniply-screen-stick:hover {
      transform: translateY(-3px) scale(1.015);
      filter: drop-shadow(0 18px 42px rgba(0,0,0,0.65));
    }
    #sniply-screen-stick:hover #sniply-stick-min-btn {
      display: flex !important;
    }
    .sniply-scanning-active {
      animation: sniply-stick-pulse 1.8s infinite ease-in-out !important;
    }
    @keyframes sniply-highlight-pulse {
      0%, 100% {
        background-color: rgba(255, 0, 0, 0.25) !important;
        box-shadow: 0 0 12px rgba(255, 0, 0, 0.25), inset 0 0 8px rgba(255, 0, 0, 0.25) !important;
      }
      50% {
        background-color: rgba(255, 0, 0, 0.35) !important;
        box-shadow: 0 0 18px rgba(255, 0, 0, 0.45), inset 0 0 12px rgba(255, 0, 0, 0.35) !important;
      }
    }
    .sniply-red-highlight {
      background-color: rgba(255, 0, 0, 0.25) !important;
      border-left: 3px solid #ff3333 !important;
      box-shadow: 0 0 12px rgba(255, 0, 0, 0.25) !important;
      position: relative !important;
    }
    .sniply-textarea-highlight-box {
      animation: sniply-highlight-pulse 2.2s infinite ease-in-out;
    }
  `;
  document.head.appendChild(styleEl);
}

/**
 * Creates sleek, interactive Screen Stick extension widget (Figma Screen-constraints design)
 */
function createFloatingTrigger() {
  if (document.getElementById("sniply-screen-stick")) return;
  injectScreenStickStyles();

  floatingPill = document.createElement("div");
  floatingPill.id = "sniply-screen-stick";
  floatingPill.setAttribute("role", "button");
  floatingPill.setAttribute("tabindex", "0");
  floatingPill.setAttribute("aria-label", "Snipy AI Code Assistant");
  floatingPill.style.cssText = `
    position: fixed;
    bottom: 24px;
    right: 28px;
    z-index: 2147483647;
    display: flex;
    align-items: center;
    cursor: pointer;
    user-select: none;
    filter: drop-shadow(0 14px 35px rgba(0,0,0,0.55));
  `;

  floatingPill.innerHTML = `
    <div id="sniply-stick-track" style="
      position: relative;
      display: flex;
      align-items: center;
      height: 52px;
      border-radius: 9999px;
      background: #000000;
      border: 2px solid #0672fe;
      overflow: hidden;
      padding: 0 18px 0 14px;
      box-shadow: 0 0 16px rgba(6, 114, 254, 0.42), 0 14px 40px rgba(0,0,0,0.85), inset 0 1px 0 rgba(255,255,255,0.12);
      transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
    ">
      <!-- 3D Geometric Cube Wireframe Icon (image 2.png) -->
      <img id="sniply-stick-icon" src="${CUBE_ICON_SRC}" alt="Snipy" style="
        width: 26px;
        height: 26px;
        object-fit: contain;
        margin-right: 12px;
        flex-shrink: 0;
        pointer-events: none;
        transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), filter 0.3s ease;
      "/>

      <!-- Dynamic High-DPI Text Content -->
      <div id="sniply-stick-content" style="
        display: flex;
        align-items: center;
        white-space: nowrap;
        font-family: -apple-system, BlinkMacSystemFont, 'Google Sans', 'Plus Jakarta Sans', Roboto, sans-serif;
        font-size: 16px;
        font-weight: 400;
        color: #ffffff;
        letter-spacing: -0.2px;
        transition: opacity 0.2s ease;
      ">
        <span id="sniply-stick-label">Activate Snipy</span>
        <span id="sniply-stick-key" style="
          margin-left: 14px;
          color: #a1a1aa;
          font-size: 13px;
          font-family: 'SF Mono', Monaco, Menlo, Consolas, monospace;
          border: 1px solid rgba(255,255,255,0.22);
          border-radius: 8px;
          padding: 2.5px 10px;
          background: rgba(255,255,255,0.04);
        ">Ctrl + .</span>
      </div>

      <!-- Quick Minimize / Restore Button -->
      <button id="sniply-stick-min-btn" title="Minimize / Restore" style="
        background: rgba(255,255,255,0.1);
        border: none;
        color: rgba(255,255,255,0.65);
        font-size: 11px;
        line-height: 1;
        width: 18px;
        height: 18px;
        border-radius: 50%;
        cursor: pointer;
        display: none;
        align-items: center;
        justify-content: center;
        margin-left: 10px;
        transition: all 0.2s;
      ">✕</button>
    </div>
  `;

  // Attach interactive click handlers
  floatingPill.addEventListener("click", (e) => {
    if (e.target && e.target.id === "sniply-stick-min-btn") {
      e.stopPropagation();
      toggleScreenStickMinimize();
      return;
    }

    if (currentStickState === "minimized") {
      setScreenStickState("activate");
      return;
    }

    if (currentStickState === "unrecognized") {
      chrome.runtime.sendMessage({ action: "OPEN_DASHBOARD" });
      return;
    }

    triggerOptimizationFlow();
  });

  // Enable Smooth Draggability (Screen Stick can be placed anywhere comfortably)
  makeScreenStickDraggable(floatingPill);

  document.body.appendChild(floatingPill);
}

/**
 * Toggles between minimized icon-only state and full state
 */
function toggleScreenStickMinimize() {
  if (currentStickState === "minimized") {
    setScreenStickState("activate");
  } else {
    setScreenStickState("minimized");
  }
}

/**
 * Updates the Screen Stick to any of the Figma constraint designs smoothly
 * @param {'activate'|'scanning'|'applied'|'no_editor'|'unrecognized'|'error'|'minimized'} state
 * @param {number} [revertMs]
 */
function setScreenStickState(state, revertMs = 0) {
  if (!floatingPill) createFloatingTrigger();
  if (!floatingPill) return;

  if (stickRevertTimeout) {
    clearTimeout(stickRevertTimeout);
    stickRevertTimeout = null;
  }

  currentStickState = state;
  const iconEl = floatingPill.querySelector("#sniply-stick-icon");
  const contentEl = floatingPill.querySelector("#sniply-stick-content");
  const labelEl = floatingPill.querySelector("#sniply-stick-label");
  const keyEl = floatingPill.querySelector("#sniply-stick-key");
  const trackEl = floatingPill.querySelector("#sniply-stick-track");

  if (!iconEl || !contentEl || !labelEl || !keyEl || !trackEl) return;

  // Reset track & icon styling
  floatingPill.classList.remove("sniply-scanning-active");
  iconEl.style.filter = "none";
  iconEl.style.marginRight = "12px";
  contentEl.style.display = "flex";
  trackEl.style.width = "auto";
  trackEl.style.height = "52px";
  trackEl.style.borderRadius = "9999px";
  trackEl.style.padding = "0 18px 0 14px";
  trackEl.style.justifyContent = "flex-start";
  trackEl.style.borderColor = "#0672fe";
  trackEl.style.boxShadow = "0 0 16px rgba(6, 114, 254, 0.42), 0 14px 40px rgba(0,0,0,0.85)";

  switch (state) {
    case "activate":
      labelEl.textContent = "Activate Snipy";
      keyEl.style.display = "inline-block";
      keyEl.textContent = "Ctrl + .";
      break;

    case "scanning":
      labelEl.textContent = "Scanning Code....";
      keyEl.style.display = "none";
      iconEl.style.filter = "drop-shadow(0 0 10px #0672fe)";
      floatingPill.classList.add("sniply-scanning-active");
      break;

    case "applied":
      trackEl.style.borderColor = "#10b981";
      trackEl.style.boxShadow = "0 0 20px rgba(16, 185, 129, 0.6), 0 14px 40px rgba(0,0,0,0.85)";
      labelEl.innerHTML = '<span style="color:#10b981;font-weight:bold;margin-right:8px;font-size:17px;">✓</span> Suggestion apply';
      keyEl.style.display = "none";
      iconEl.style.filter = "drop-shadow(0 0 8px #10b981)";
      break;

    case "optimal":
      trackEl.style.borderColor = "#10b981";
      trackEl.style.boxShadow = "0 0 20px rgba(16, 185, 129, 0.6), 0 14px 40px rgba(0,0,0,0.85)";
      labelEl.innerHTML = '<span style="color:#10b981;font-weight:bold;margin-right:8px;font-size:17px;">✓</span> Code is Optimal';
      keyEl.style.display = "none";
      iconEl.style.filter = "drop-shadow(0 0 8px #10b981)";
      break;

    case "paused":
      labelEl.textContent = "Snipy Paused";
      keyEl.style.display = "inline-block";
      keyEl.textContent = "Ctrl + .";
      break;

    case "no_editor":
      trackEl.style.borderColor = "#f59e0b";
      labelEl.textContent = "Oops! code editor not found";
      keyEl.style.display = "none";
      break;

    case "unrecognized":
      trackEl.style.borderColor = "#f59e0b";
      labelEl.textContent = "Language not recognized. Please update settings.";
      keyEl.style.display = "none";
      trackEl.style.padding = "0 22px 0 14px";
      break;

    case "error":
      trackEl.style.borderColor = "#ef4444";
      labelEl.textContent = "Something went wrong !";
      keyEl.style.display = "none";
      break;

    case "minimized":
      // Group 57.png: Pure circular button with electric blue border
      contentEl.style.display = "none";
      iconEl.style.marginRight = "0";
      trackEl.style.width = "52px";
      trackEl.style.height = "52px";
      trackEl.style.borderRadius = "50%";
      trackEl.style.padding = "0";
      trackEl.style.justifyContent = "center";
      trackEl.style.borderColor = "#0672fe";
      trackEl.style.boxShadow = "0 0 18px rgba(6, 114, 254, 0.5), 0 10px 30px rgba(0,0,0,0.85)";
      break;
  }

  // Auto-revert back to 'activate' state after specified or default duration
  if (revertMs > 0 || (state !== "activate" && state !== "minimized" && state !== "scanning")) {
    const delay = revertMs > 0 ? revertMs : ((state === "applied" || state === "optimal") ? 3500 : 4000);
    stickRevertTimeout = setTimeout(() => {
      setScreenStickState("activate");
    }, delay);
  }
}

/**
 * Smooth draggability for Screen Stick
 */
function makeScreenStickDraggable(el) {
  let isDragging = false;
  let hasMoved = false;
  let startX, startY, origLeft, origTop;

  el.addEventListener("mousedown", (e) => {
    if (e.target.id === "sniply-stick-min-btn") return;
    isDragging = true;
    hasMoved = false;
    startX = e.clientX;
    startY = e.clientY;
    const rect = el.getBoundingClientRect();
    origLeft = rect.left;
    origTop = rect.top;
  });

  window.addEventListener("mousemove", (e) => {
    if (!isDragging) return;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
      hasMoved = true;
      el.style.bottom = "auto";
      el.style.right = "auto";
      el.style.left = `${Math.max(10, Math.min(window.innerWidth - el.offsetWidth - 10, origLeft + dx))}px`;
      el.style.top = `${Math.max(10, Math.min(window.innerHeight - el.offsetHeight - 10, origTop + dy))}px`;
    }
  });

  window.addEventListener("mouseup", (e) => {
    if (isDragging) {
      isDragging = false;
      if (hasMoved) {
        // Prevent click trigger if the user dragged the stick
        e.stopPropagation();
      }
    }
  });
}

/**
 * Automatically checks for editors on page load
 */
function checkForEditorsOnPage() {
  const hasEditor = document.querySelector(
    "textarea, .monaco-editor, .cm-content, .CodeMirror, .ace_editor, #editor, [contenteditable='true']"
  );
  if (hasEditor && floatingPill) {
    floatingPill.style.display = "flex";
  }
}

/**
 * Observes dynamic SPA DOM additions (e.g. LeetCode / Colab delayed loads)
 */
function observeDynamicEditors() {
  const observer = new MutationObserver(() => {
    checkForEditorsOnPage();
  });
  observer.observe(document.body, { childList: true, subtree: true });
}

/**
 * Tracks focused editors
 */
function attachEditorListeners() {
  document.addEventListener("focusin", (e) => {
    if (isEditableTarget(e.target)) {
      lastActiveEditor = e.target;
      if (floatingPill) floatingPill.style.display = "flex";
    }
  });

  let autoSuggestDebounceTimer = null;

  const handleEditorTyping = (target) => {
    if (isEditableTarget(target)) {
      lastActiveEditor = target;
      if (floatingPill) floatingPill.style.display = "flex";

      // If user is actively typing, dismiss stale red highlights and tooltips
      if (activeTooltipEl || activeHighlightOverlay || activeHighlightElements.length > 0) {
        dismissInEditorTooltip();
      }

      // Live Auto-Suggestion: strictly opt-in (disabled by default) to prevent continuous interrupts
      safeStorageGet(["pref_auto_suggestions", "sniply_daily_tokens"], (data) => {
        if (data.pref_auto_suggestions === true) {
          if (autoSuggestDebounceTimer) clearTimeout(autoSuggestDebounceTimer);
          autoSuggestDebounceTimer = setTimeout(() => {
            if (isSniplyActive && currentStickState !== "scanning") {
              triggerOptimizationFlow({ isAutoSuggestion: true });
            }
          }, 4500);
        }
      });
    }
  };

  document.addEventListener("input", (e) => handleEditorTyping(e.target));

  document.addEventListener("keyup", (e) => {
    // Skip modifier/navigation keys
    if (["Shift", "Control", "Alt", "Meta", "Escape", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
      return;
    }
    handleEditorTyping(e.target);
  });

  document.addEventListener("paste", (e) => handleEditorTyping(e.target));

  document.addEventListener("selectionchange", () => {
    const selection = window.getSelection().toString();
    if (selection && selection.trim().length > 10) {
      if (floatingPill) floatingPill.style.display = "flex";
    }
  });

  // Global Keyboard shortcuts: Ctrl + . to activate, Ctrl + Backspace to stop
  document.addEventListener("keydown", (e) => {
    // Ctrl + . (Period) -> Start / Activate
    if ((e.ctrlKey || e.metaKey) && (e.key === "." || e.code === "Period" || e.keyCode === 190)) {
      e.preventDefault();
      isSniplyActive = true;
      if (!floatingPill) createFloatingTrigger();
      if (floatingPill) floatingPill.style.display = "flex";
      triggerOptimizationFlow();
      return;
    }

    // Ctrl + Backspace -> Stop / Deactivate
    if ((e.ctrlKey || e.metaKey) && (e.key === "Backspace" || e.code === "Backspace" || e.keyCode === 8)) {
      isSniplyActive = false;
      if (floatingPill) setScreenStickState("paused", 3500);
      dismissInEditorTooltip();
      return;
    }
  });
}

// Whitelist of supported Python coding environments & online judges
const SUPPORTED_CODING_PLATFORMS = [
  "codechef.com",
  "leetcode.com",
  "colab.research.google.com",
  "hackerrank.com",
  "programiz.com",
  "onlinegdb.com",
  "replit.com",
  "jupyter.org",
  "kaggle.com",
  "geeksforgeeks.org",
  "w3schools.com",
  "interviewbit.com",
  "codewars.com",
  "topcoder.com",
  "pythontutor.com",
  "edabit.com",
  "freecodecamp.org",
  "github.dev",
  "vscode.dev",
  "gitpod.io",
  "stackblitz.com",
  "localhost",
  "127.0.0.1",
  "0.0.0.0"
];

function isSupportedCodingPlatform() {
  const host = window.location.hostname.toLowerCase();
  const path = window.location.pathname.toLowerCase();

  // Exclude Sniply's own web pages (landing, dashboard, auth)
  if (path.includes("landing.html") || path.includes("dashboard.html")) {
    return false;
  }

  // Support local test simulation environments
  if (window.location.protocol === "file:" || path.includes("test_editor")) {
    return true;
  }

  return SUPPORTED_CODING_PLATFORMS.some((domain) => host === domain || host.endsWith("." + domain));
}

/**
 * Validates that the code string contains actual executable Python statements
 * Rejects comments-only, blank lines, or random non-code prose/English text
 */
function isMeaningfulPythonCode(code) {
  if (!code || typeof code !== "string") return false;
  const trimmed = code.trim();
  if (trimmed.length < 4) return false;

  // Split into lines and filter out empty lines & single-line comments (#)
  const lines = trimmed.split("\n");
  const codeLines = lines
    .map((l) => l.trim())
    .filter((l) => l.length > 0 && !l.startsWith("#"));

  // If there are no executable lines (e.g. only "# cook your dish here" or whitespace)
  if (codeLines.length === 0) {
    return false;
  }

  const joined = codeLines.join("\n");

  // Python tokens / constructs regex
  const pythonIndicators = [
    /\bdef\s+[a-zA-Z_]\w*\s*\(/,
    /\bclass\s+[a-zA-Z_]\w*/,
    /\bimport\s+[a-zA-Z_]/,
    /\bfrom\s+[a-zA-Z_]/,
    /\bfor\s+[a-zA-Z_]\w*\s+in\s+/,
    /\bwhile\s+/,
    /\bif\s+/,
    /\belif\s+/,
    /\belse\s*:/,
    /\btry\s*:/,
    /\bexcept(\s+.*)?\s*:/,
    /\bfinally\s*:/,
    /\bwith\s+/,
    /\breturn(\b|\s+.*)?$/,
    /\bprint\s*\(/,
    /\binput\s*\(/,
    /\blen\s*\(/,
    /\brange\s*\(/,
    /\bappend\s*\(/,
    /\b[a-zA-Z_]\w*\s*=\s*.+/,
    /[\[\]\{\}\(\)]/
  ];

  const hasPythonConstruct = pythonIndicators.some((rgx) => rgx.test(joined));

  // Reject prose / English sentences that have no Python operators or syntax punctuation
  if (!hasPythonConstruct && !joined.includes(":") && !joined.includes("=") && !joined.includes("(")) {
    return false;
  }

  return true;
}

function isEditableTarget(el) {
  if (!el) return false;
  return (
    el.closest(".monaco-editor") ||
    el.closest(".cm-content") ||
    el.closest(".CodeMirror") ||
    el.closest(".ace_editor") ||
    el.closest("#editor") ||
    el.closest(".code-editor") ||
    (el.tagName === "TEXTAREA" && (el.id?.toLowerCase().includes("code") || el.className?.toLowerCase().includes("code") || isSupportedCodingPlatform()))
  );
}

/**
 * Safely finds the primary Monaco code editor instance, filtering out auxiliary widgets,
 * testcase inputs, consoles, and collapsed secondary editors (especially crucial for LeetCode).
 */
function findMainMonacoEditor() {
  const isExcluded = (el) => {
    if (!el) return true;
    if (el.closest('[data-track-load="testcase"]')) return true;
    if (el.closest('[data-key="testcase"]')) return true;
    if (el.closest('.testcase-panel')) return true;
    if (el.closest('.console-panel')) return true;
    if (el.closest('.custom-testcase')) return true;
    const rect = el.getBoundingClientRect();
    if (rect.height < 100 || rect.width < 150) return true;
    return false;
  };

  const activeMonaco = document.activeElement?.closest(".monaco-editor");
  if (activeMonaco && !isExcluded(activeMonaco)) {
    return activeMonaco;
  }

  const lastMonaco = lastActiveEditor?.closest(".monaco-editor");
  if (lastMonaco && !isExcluded(lastMonaco)) {
    return lastMonaco;
  }

  const allMonacos = Array.from(document.querySelectorAll(".monaco-editor"));
  if (allMonacos.length === 0) return null;

  const validCandidates = allMonacos.filter(m => !isExcluded(m));
  if (validCandidates.length > 0) {
    validCandidates.sort((a, b) => b.getBoundingClientRect().height - a.getBoundingClientRect().height);
    return validCandidates[0];
  }

  return allMonacos[0];
}

/**
 * Extracts 100-120 lines sliding context window across all major editors
 * Strictly rejects non-editor pages and returns null if no valid Python code exists
 */
function extractContextWindow() {
  const isExcluded = window.location.pathname.toLowerCase().includes("landing.html") ||
                     window.location.pathname.toLowerCase().includes("dashboard.html");
  if (isExcluded) {
    return null;
  }

  // 1. User manual text selection (highest priority, 100% accurate across all editors)
  const userSelection = window.getSelection().toString();
  if (userSelection && userSelection.trim().length > 0) {
    const cleanSelection = userSelection.replace(/\u00a0/g, " ");
    if (isMeaningfulPythonCode(cleanSelection)) {
      const lines = cleanSelection.split("\n");
      return {
        targetCode: lines.slice(0, 150).join("\n"),
        contextLines: "",
        language: "python",
        editorType: "selection"
      };
    }
  }

  // 2. JupyterLab / Jupyter Notebook Active Cell Detection (CodeMirror 6 / 5)
  // Check user's focused element or caret position FIRST so we never grab earlier cells like Cell 1 or 2
  let activeJupyterCell = null;
  if (document.activeElement && document.activeElement.closest(".jp-Cell")) {
    activeJupyterCell = document.activeElement.closest(".jp-Cell");
  } else if (lastActiveEditor && lastActiveEditor.closest(".jp-Cell")) {
    activeJupyterCell = lastActiveEditor.closest(".jp-Cell");
  } else {
    activeJupyterCell = document.querySelector(".jp-Cell.jp-mod-editMode") ||
                        document.querySelector(".jp-Cell.jp-mod-active");
  }

  if (activeJupyterCell) {
    const cm6 = activeJupyterCell.querySelector(".cm-content");
    if (cm6) {
      const raw = cm6.innerText || cm6.textContent || "";
      const clean = raw.replace(/\u00a0/g, " ");
      if (isMeaningfulPythonCode(clean)) {
        return {
          targetCode: clean.split("\n").slice(0, 150).join("\n"),
          contextLines: "",
          language: "python",
          editorType: "jupyter_cm6"
        };
      }
    }
    const cm5 = activeJupyterCell.querySelector(".CodeMirror");
    if (cm5) {
      if (cm5.CodeMirror && typeof cm5.CodeMirror.getValue === "function") {
        const full = cm5.CodeMirror.getValue().replace(/\u00a0/g, " ");
        if (isMeaningfulPythonCode(full)) {
          return {
            targetCode: full.split("\n").slice(0, 150).join("\n"),
            contextLines: "",
            language: "python",
            editorType: "jupyter_cm5"
          };
        }
      }
      const cm5Lines = cm5.querySelectorAll(".CodeMirror-line");
      if (cm5Lines.length > 0) {
        const lines = Array.from(cm5Lines).map((el) => (el.textContent || "").replace(/\u00a0/g, " "));
        const code = lines.join("\n");
        if (isMeaningfulPythonCode(code)) {
          return {
            targetCode: lines.slice(0, 150).join("\n"),
            contextLines: "",
            language: "python",
            editorType: "jupyter_cm5"
          };
        }
      }
    }
  }

  // 3. Google Colab focused cell detection
  let activeColabCell = null;
  if (document.activeElement && document.activeElement.closest(".cell")) {
    activeColabCell = document.activeElement.closest(".cell");
  } else if (lastActiveEditor && lastActiveEditor.closest(".cell")) {
    activeColabCell = lastActiveEditor.closest(".cell");
  } else {
    activeColabCell = document.querySelector(".cell.focused");
  }

  if (activeColabCell) {
    const colabEditor = activeColabCell.querySelector(".monaco-editor");
    if (colabEditor) {
      const viewLines = colabEditor.querySelectorAll(".view-line");
      if (viewLines.length > 0) {
        const sortedLines = Array.from(viewLines).sort((a, b) => parseFloat(a.style.top || "0") - parseFloat(b.style.top || "0"));
        const lines = sortedLines.map((el) => (el.textContent || "").replace(/\u00a0/g, " "));
        const code = lines.join("\n");
        if (isMeaningfulPythonCode(code)) {
          return {
            targetCode: lines.slice(0, 150).join("\n"),
            contextLines: "",
            language: "python",
            editorType: "colab_monaco"
          };
        }
      }
    }
  }

  // 4. Monaco Editor (Google Colab, LeetCode, CodeChef, HackerRank)
  const monacoEditor = findMainMonacoEditor();
  if (monacoEditor) {
    const viewLines = monacoEditor.querySelectorAll(".view-line");
    if (viewLines.length > 0) {
      // Sort lines by their top CSS coordinate in case Monaco DOM recycling rearranged them
      const sortedLines = Array.from(viewLines).sort((a, b) => {
        const topA = parseFloat(a.style.top || "0");
        const topB = parseFloat(b.style.top || "0");
        return topA - topB;
      });
      const lines = sortedLines.map((el) => (el.textContent || "").replace(/\u00a0/g, " "));

      // Center 100–120 line sliding window around active cursor if detected
      let cursorIdx = -1;
      const overlayLine = monacoEditor.querySelector(".view-overlays .current-line");
      if (overlayLine) {
        const curTop = parseFloat(overlayLine.style.top || "0");
        cursorIdx = sortedLines.findIndex(l => Math.abs(parseFloat(l.style.top || "0") - curTop) < 4);
      }

      let targetSlice = lines;
      if (lines.length > 120) {
        const start = cursorIdx !== -1 ? Math.max(0, cursorIdx - 50) : 0;
        const end = Math.min(lines.length, start + 120);
        targetSlice = lines.slice(start, end);
      }

      const code = targetSlice.join("\n");
      if (isMeaningfulPythonCode(code)) {
        return {
          targetCode: code,
          contextLines: "",
          language: detectLanguage(),
          editorType: "monaco"
        };
      }
    }
  }

  // 5. CodeMirror 6 (Replit, JupyterLab 4)
  const cm6Content = (document.activeElement?.closest(".cm-content")) ||
                     (lastActiveEditor?.closest(".cm-content")) ||
                     document.querySelector(".cm-content");
  if (cm6Content) {
    const raw = cm6Content.innerText || cm6Content.textContent || "";
    const clean = raw.replace(/\u00a0/g, " ");
    if (isMeaningfulPythonCode(clean)) {
      const allLines = clean.split("\n");
      const targetSlice = allLines.slice(0, 120);
      return {
        targetCode: targetSlice.join("\n"),
        contextLines: "",
        language: "python",
        editorType: "cm6"
      };
    }
  }

  // 6. Ace Editor (Programiz, OnlineGDB, CodeChef, HackerRank, GeeksforGeeks)
  const aceEditor = document.querySelector(".ace_editor");
  if (aceEditor) {
    const aceLines = aceEditor.querySelectorAll(".ace_line");
    if (aceLines.length > 0) {
      const lines = Array.from(aceLines).map((el) => (el.textContent || "").replace(/\u00a0/g, " "));
      const targetSlice = lines.slice(0, 120);
      const code = targetSlice.join("\n");
      if (isMeaningfulPythonCode(code)) {
        return {
          targetCode: code,
          contextLines: "",
          language: "python",
          editorType: "ace"
        };
      }
    }
  }

  // 5. CodeMirror 5 (Classic Jupyter Notebook)
  const codeMirror5 = document.querySelector(".CodeMirror");
  if (codeMirror5) {
    if (codeMirror5.CodeMirror && typeof codeMirror5.CodeMirror.getValue === "function") {
      const fullText = codeMirror5.CodeMirror.getValue().replace(/\u00a0/g, " ");
      if (isMeaningfulPythonCode(fullText)) {
        return {
          targetCode: fullText.split("\n").slice(0, 150).join("\n"),
          contextLines: "",
          language: "python",
          editorType: "cm5"
        };
      }
    }
    const cm5Lines = codeMirror5.querySelectorAll(".CodeMirror-line");
    if (cm5Lines.length > 0) {
      const lines = Array.from(cm5Lines).map((el) => (el.textContent || "").replace(/\u00a0/g, " "));
      const code = lines.join("\n");
      if (isMeaningfulPythonCode(code)) {
        return {
          targetCode: lines.slice(0, 150).join("\n"),
          contextLines: "",
          language: "python",
          editorType: "cm5"
        };
      }
    }
  }

  // 6. Active code textarea or contenteditable element with editor context
  if (lastActiveEditor && isEditableTarget(lastActiveEditor)) {
    const text = (lastActiveEditor.value || lastActiveEditor.innerText || "").replace(/\u00a0/g, " ");
    if (isMeaningfulPythonCode(text)) {
      return {
        targetCode: text.split("\n").slice(0, 120).join("\n"),
        contextLines: "",
        language: "python",
        editorType: "textarea"
      };
    }
  }

  // 7. General editor or mock textarea on page fallback
  const generalEditor = document.querySelector("#mock-code-editor, textarea[id*='code'], textarea[class*='code'], textarea");
  if (generalEditor && isEditableTarget(generalEditor)) {
    const text = (generalEditor.value || generalEditor.innerText || "").replace(/\u00a0/g, " ");
    if (isMeaningfulPythonCode(text)) {
      lastActiveEditor = generalEditor;
      return {
        targetCode: text.split("\n").slice(0, 150).join("\n"),
        contextLines: "",
        language: "python",
        editorType: "textarea"
      };
    }
  }

  // No editor or valid Python code found on page -> return null (NO FALLBACK DEMO SNIPPET!)
  return null;
}

function detectLanguage() {
  const url = window.location.href.toLowerCase();
  if (url.includes("leetcode.com")) {
    const modeEl = document.querySelector("[data-mode-id]");
    if (modeEl) {
      const mode = (modeEl.getAttribute("data-mode-id") || "").toLowerCase();
      if (mode.includes("python")) return "python";
      if (mode.includes("cpp") || mode.includes("c++")) return "cpp";
      if (mode.includes("java")) return "java";
      if (mode.includes("javascript") || mode.includes("typescript")) return "javascript";
    }
    const langBtn = document.querySelector("button[id*='headlessui-listbox-button'], [data-cy='lang-select']");
    if (langBtn && langBtn.textContent) {
      const txt = langBtn.textContent.toLowerCase();
      if (txt.includes("python")) return "python";
      if (txt.includes("c++") || txt.includes("cpp")) return "cpp";
      if (txt.includes("java") && !txt.includes("javascript")) return "java";
      if (txt.includes("javascript") || txt.includes("typescript")) return "javascript";
    }
    return "python";
  }
  if (url.includes("colab") || url.includes("jupyter") || url.includes("programiz") || url.includes("onlinegdb")) {
    return "python";
  }
  return "python";
}

function updateFloatingPillUI(active) {
  if (!floatingPill) return;
  const textEl = floatingPill.querySelector("#sniply-pill-text");
  const badgeEl = floatingPill.querySelector("#sniply-pill-badge");
  const innerEl = floatingPill.querySelector("#sniply-pill-inner");
  if (textEl) textEl.textContent = active ? "Snipy Active" : "Snipy Stopped";
  if (badgeEl) badgeEl.textContent = active ? "Ctrl + ." : "Stopped";
  if (innerEl) innerEl.style.opacity = active ? "1" : "0.55";
}

function updateFloatingPillStatus(text, bg = "#12130f") {
  if (!floatingPill) return;
  const textEl = floatingPill.querySelector("#sniply-pill-text");
  const innerEl = floatingPill.querySelector("#sniply-pill-inner");
  if (textEl) textEl.textContent = text;
  if (innerEl) innerEl.style.background = bg;
}

function clearEditorHighlights() {
  if (activeHighlightOverlay) {
    if (typeof activeHighlightOverlay.__cleanupScroll === "function") {
      activeHighlightOverlay.__cleanupScroll();
    }
    activeHighlightOverlay.remove();
    activeHighlightOverlay = null;
  }

  if (activeHighlightElements.length > 0) {
    for (const el of activeHighlightElements) {
      if (el) {
        el.style.backgroundColor = "";
        el.style.borderLeft = "";
        el.style.boxShadow = "";
        el.classList.remove("sniply-red-highlight");
        el.removeAttribute("data-sniply-highlighted");
      }
    }
    activeHighlightElements = [];
  }

  if (activeHighlightEl) {
    activeHighlightEl.remove();
    activeHighlightEl = null;
  }
}

function dismissInEditorTooltip() {
  if (activeTooltipEl) {
    activeTooltipEl.remove();
    activeTooltipEl = null;
  }
  clearEditorHighlights();
}

function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Accurately extracts the target function or context signature from code/changes.
 * Handles standard def, async def, class definitions, keyword typos (e.g. 'de value():'),
 * or variable assignments. Never returns hardcoded fictitious fallbacks.
 */
function extractBadgeSignature(targetCode, data) {
  const codeSources = [
    targetCode || "",
    data?.full_optimized_code || "",
    data?.line_changes?.[0]?.line_code || "",
    data?.line_changes?.[1]?.line_code || ""
  ];

  for (const src of codeSources) {
    if (!src) continue;
    // 1. Standard Python function definition
    const defMatch = src.match(/(?:def|async\s+def)\s+([a-zA-Z_]\w*)\s*\(/);
    if (defMatch) return defMatch[1] + "()";

    // 2. Common keyword typo in function declaration (e.g. "de value():", "df solve():", "fun calc():")
    const typoDefMatch = src.match(/\b(?:de|d|df|fe|fun|func)\s+([a-zA-Z_]\w*)\s*\(/);
    if (typoDefMatch) return typoDefMatch[1] + "()";

    // 3. Class declaration
    const clsMatch = src.match(/\bclass\s+([a-zA-Z_]\w*)/);
    if (clsMatch) return clsMatch[1];
  }

  // 4. Check first non-comment statement from target code
  if (targetCode) {
    const lines = targetCode.split("\n").map(l => l.trim()).filter(l => l && !l.startsWith("#"));
    if (lines.length > 0) {
      const line = lines[0];
      const assignMatch = line.match(/^([a-zA-Z_]\w*)\s*=/);
      if (assignMatch) return assignMatch[1];
      const callMatch = line.match(/^([a-zA-Z_]\w*)\s*\(/);
      if (callMatch) return callMatch[1] + "()";
      const cleanSnippet = line.replace(/[:\{\(\)\[\]]/g, "").trim().split(/\s+/)[0];
      if (cleanSnippet && cleanSnippet.length >= 2) return cleanSnippet + "()";
    }
  }

  return "code.py";
}

/**
 * Accurately formats diagnostic issue text for the Screen-constraints pill (Group 58.png).
 * Strictly prioritizes critical Syntax Errors & Indentation over generic variable hygiene,
 * ensuring users immediately see the exact issue on the active line.
 */
/**
 * Synthesizes a precise, human-satisfying diagnostic reason that matches EXACTLY
 * what code transformation or fix is proposed.
 */
function extractAccurateDiagnosis(data) {
  if (!data) return "Code Review Ready";

  // Helper for clean word-boundary truncation
  function formatConciseReason(text, maxLen = 38) {
    if (!text || typeof text !== "string") return "";
    let clean = text.trim().replace(/^[\-\*\•\d\.\s]+/, "");
    clean = clean.replace(/^(Replace|Replaced|Replacing|Use|Using|Add|Adding|Fix|Fixing|Eliminate|Eliminating)\s+/i, (m) => {
      return m.charAt(0).toUpperCase() + m.slice(1);
    });
    clean = clean.replace(/\.+$/, "");
    if (clean.length <= maxLen) return clean;
    const truncated = clean.slice(0, maxLen);
    const lastSpace = truncated.lastIndexOf(" ");
    if (lastSpace > 18) {
      return truncated.slice(0, lastSpace) + "…";
    }
    return truncated.slice(0, maxLen - 1) + "…";
  }

  // 1. Critical Syntax & Indentation Errors
  if (data.syntax_analysis && data.syntax_analysis.is_valid === false) {
    const details = data.syntax_analysis.details || "";
    if (/de\s+value\(\)/i.test(details) || /'de'/i.test(details) || /typo/i.test(details)) {
      return "Syntax: 'de' ➔ 'def'";
    }
    if (/missing\s*[:']/i.test(details) || /expected\s*[:']/i.test(details) || /colon/i.test(details)) {
      return "Syntax: Missing Colon ':'";
    }
    if (/unclosed|bracket|parenthesis|brace/i.test(details)) {
      return "Syntax: Unclosed Bracket";
    }
    if (/indent/i.test(details)) {
      return "Indentation Error (PEP 8)";
    }
    const lineMatch = details.match(/line\s+(\d+)/i);
    if (lineMatch) {
      return `Syntax Error (Line ${lineMatch[1]})`;
    }
    const cleanDetails = details.replace(/^(SyntaxError:\s*|Error:\s*)/i, "").trim();
    if (cleanDetails.length > 0) {
      return formatConciseReason(`Syntax: ${cleanDetails}`, 36);
    }
    return "Syntax Error Detected";
  }

  if (data.indentation_analysis && data.indentation_analysis.is_properly_indented === false) {
    return "Indentation Mismatch (PEP 8)";
  }

  // 2. Inspect the ACTUAL code change in full_optimized_code or line_changes
  const optCode = (data.full_optimized_code || "").toLowerCase();
  const summary = (data.summary || "").toLowerCase();
  const firstChangeReason = (Array.isArray(data.line_changes) && data.line_changes.length > 0)
    ? (data.line_changes.find(c => c.reason && c.reason.length > 5)?.reason || "")
    : "";
  const firstStepTitle = (Array.isArray(data.step_by_step_guide) && data.step_by_step_guide.length > 0)
    ? (data.step_by_step_guide[0].title || "")
    : "";

  // 2A. Two Pointers optimization
  if (/two\s*pointers?|two-pointer/i.test(summary) || /two\s*pointers?|two-pointer/i.test(firstChangeReason) || /two\s*pointers?/i.test(firstStepTitle) || (optCode.includes("left") && optCode.includes("right") && optCode.includes("while left < right"))) {
    return "O(N²) ➔ O(N) Two Pointers";
  }

  // 2B. Binary Search optimization
  if (/binary\s*search|bisect/i.test(summary) || /binary\s*search|bisect/i.test(firstChangeReason) || /bisect/i.test(optCode)) {
    return "O(N) ➔ O(log N) Binary Search";
  }

  // 2C. Hash Map / Frequency Map / Two Sum Hash lookup
  if (/two\s*sum|hash\s*map|hashmap/i.test(firstStepTitle) || /hash\s*map|hashmap/i.test(summary) || (optCode.includes("seen") && (optCode.includes("diff") || optCode.includes("target")))) {
    return "O(N²) ➔ O(N) Hash Map Lookup";
  }

  // 2D. Hash Set for O(1) membership check
  if (/set\(\)|hash\s*set|o\(1\)\s*lookup|membership/i.test(firstChangeReason) || /set\(\)|hash\s*set/i.test(summary) || (optCode.includes("set()") || optCode.includes("seen = set()"))) {
    return "O(1) Hash Set Lookup";
  }

  // 2E. Deduplication via dict.fromkeys
  if (optCode.includes("dict.fromkeys") || /fromkeys|unique/i.test(summary) || /fromkeys/i.test(firstChangeReason)) {
    return "O(N) Deduplication (fromkeys)";
  }

  // 2F. Standard library built-ins (sum, len, min, max, any, all, Counter)
  if (optCode.includes("counter(") || /counter/i.test(summary) || /counter/i.test(firstChangeReason)) {
    return "Use collections.Counter";
  }
  if ((optCode.includes("sum(") && optCode.includes("len(")) || /average|avg_num/i.test(summary) || /sum\(\)\s*\/\s*len\(\)/i.test(firstChangeReason)) {
    return "Built-in sum() / len() Speedup";
  }
  if (optCode.includes("sum(") && !(data.original_complexity || "").includes("O(N²)")) {
    return "Use Built-in sum() Generator";
  }
  if (optCode.includes("max(") || optCode.includes("min(")) {
    return "Use Built-in min() / max()";
  }
  if (optCode.includes("any(") || optCode.includes("all(")) {
    return "Use Idiomatic any() / all()";
  }
  if (optCode.includes("enumerate(") || /enumerate/i.test(firstChangeReason) || /enumerate/i.test(summary)) {
    return "Use enumerate() Over Indices";
  }
  if (optCode.includes("join(") || /join/i.test(firstChangeReason)) {
    return "Use str.join() (Avoid O(N²))";
  }

  // 2G. List / Dict / Set Comprehensions
  if (/list\s*comp/i.test(firstStepTitle) || /list\s*comp/i.test(firstChangeReason) || /list\s*comp/i.test(summary)) {
    return "Use List Comprehension";
  }
  if (/dict\s*comp/i.test(firstStepTitle) || /dict\s*comp/i.test(firstChangeReason) || /dict\s*comp/i.test(summary)) {
    return "Use Dict Comprehension";
  }

  // 2H. Generic O(N²) Loop Bottleneck
  const origComp = data.original_complexity || "";
  const newComp = data.optimized_complexity || "";
  if ((origComp.includes("O(N²)") || origComp.includes("quadratic")) && (newComp.includes("O(N)") || newComp.includes("linear"))) {
    if (optCode.includes("seen") || optCode.includes("{}")) {
      return "O(N²) Loop ➔ O(N) Hash Map";
    }
    return "O(N²) Loop ➔ O(N) Linear Time";
  }

  // 3. Step Title from AI guide (often very specific and high-quality!)
  if (firstStepTitle && firstStepTitle.length > 3 && !/step\s*1|review|syntax\s*&\s*structure/i.test(firstStepTitle)) {
    const formatted = formatConciseReason(firstStepTitle, 36);
    if (formatted) return formatted;
  }

  // 4. Line Change Reason (direct explanation of the exact code edit)
  if (firstChangeReason && firstChangeReason.length > 5) {
    const formatted = formatConciseReason(firstChangeReason, 36);
    if (formatted) return formatted;
  }

  // 5. Simplification reason from analysis
  if (data.simplification_analysis?.can_simplify && data.simplification_analysis?.why_simplifiable) {
    const why = data.simplification_analysis.why_simplifiable;
    if (!/cannot simplify|already (clean|optimal)/i.test(why)) {
      const formatted = formatConciseReason(why, 36);
      if (formatted) return formatted;
    }
  }

  // 6. Summary if meaningful
  if (data.summary && !/code reviewed|already clean/i.test(data.summary)) {
    const formatted = formatConciseReason(data.summary, 36);
    if (formatted) return formatted;
  }

  // 7. Variable Hygiene (only when actually requested and no algorithmic/syntax fix exists)
  if (data.variable_analysis && data.variable_analysis.hygiene_rating !== "Clean") {
    const recs = data.variable_analysis.recommendations;
    if (recs && recs.length > 0) {
      const firstRec = recs[0];
      if (/name|snake_case|naming/i.test(firstRec)) {
        return "Variable Naming (PEP 8)";
      }
      return formatConciseReason(firstRec, 34);
    }
  }

  return "Optimization Available";
}

/**
 * Extracts full, comprehensive diagnostic reason for tooltips and screen reader descriptions.
 */
function extractFullReason(data) {
  if (!data) return "";
  if (data.summary && !/already clean/i.test(data.summary)) {
    return data.summary;
  }
  if (Array.isArray(data.step_by_step_guide) && data.step_by_step_guide.length > 0) {
    const step = data.step_by_step_guide[0];
    if (step.explanation) return `${step.title ? step.title + ': ' : ''}${step.explanation}`;
  }
  if (Array.isArray(data.line_changes) && data.line_changes.length > 0) {
    const ch = data.line_changes.find(c => c.reason && c.reason.length > 5);
    if (ch && ch.reason) return ch.reason;
  }
  if (data.simplification_analysis?.why_simplifiable) {
    return data.simplification_analysis.why_simplifiable;
  }
  if (data.syntax_analysis?.details) {
    return data.syntax_analysis.details;
  }
  return "";
}

/**
 * Detects 0-based line indices where code changes occur
 */
function detectChangedLines(targetCode, data) {
  if (!targetCode) return [];
  const lines = targetCode.split("\n");
  const changedIndices = new Set();

  // 1. Scan line_changes from analysis response
  if (Array.isArray(data?.line_changes) && data.line_changes.length > 0) {
    for (const change of data.line_changes) {
      if (change.type === "delete" || change.type === "modify" || (!change.type && change.line_code)) {
        const rawSnippet = (change.line_code || "").trim();
        if (!rawSnippet) continue;

        const snippetLines = rawSnippet.split("\n").map(l => l.trim()).filter(Boolean);
        if (snippetLines.length === 1) {
          const targetLine = snippetLines[0];
          lines.forEach((line, idx) => {
            const trimmed = line.trim();
            if (trimmed === targetLine || (trimmed.length > 5 && targetLine.includes(trimmed)) || (targetLine.length > 5 && trimmed.includes(targetLine))) {
              changedIndices.add(idx);
            }
          });
        } else if (snippetLines.length > 1) {
          // Multi-line block match
          for (let i = 0; i <= lines.length - snippetLines.length; i++) {
            let match = true;
            for (let j = 0; j < snippetLines.length; j++) {
              const cur = lines[i + j].trim();
              const snip = snippetLines[j];
              if (!cur.includes(snip) && !snip.includes(cur)) {
                match = false;
                break;
              }
            }
            if (match) {
              for (let j = 0; j < snippetLines.length; j++) {
                changedIndices.add(i + j);
              }
            }
          }
          // Individual line fallback
          snippetLines.forEach(sLine => {
            lines.forEach((l, idx) => {
              if (l.trim() === sLine) changedIndices.add(idx);
            });
          });
        }
      }
    }
  }

  // 2. Syntax analysis line detection
  if (data?.syntax_analysis && data.syntax_analysis.is_valid === false) {
    const details = data.syntax_analysis.details || "";
    const lineMatch = details.match(/line\s+(\d+)/i);
    if (lineMatch) {
      const lineNum = parseInt(lineMatch[1], 10) - 1;
      if (lineNum >= 0 && lineNum < lines.length) {
        changedIndices.add(lineNum);
      }
    }
    // Typo in keyword fallback
    lines.forEach((l, idx) => {
      if (/^\s*(?:de|d|df|fe|fun|func)\s+[a-zA-Z_]\w*\s*\(/.test(l)) {
        changedIndices.add(idx);
      }
      if (/^\s*(?:def|if|for|while|elif)\s+[^#:]+$/.test(l)) {
        changedIndices.add(idx);
      }
    });
  }

  // 3. Diff against full_optimized_code if no lines matched yet
  if (data?.full_optimized_code && changedIndices.size === 0) {
    const optLines = data.full_optimized_code.split("\n").map(l => l.trim());
    const optSet = new Set(optLines);
    lines.forEach((l, idx) => {
      const trimmed = l.trim();
      if (trimmed && !trimmed.startsWith("#") && !optSet.has(trimmed)) {
        changedIndices.add(idx);
      }
    });
  }

  // 4. Default: first non-empty executable line
  if (changedIndices.size === 0 && lines.length > 0) {
    const firstCodeIdx = lines.findIndex(l => l.trim().length > 0 && !l.trim().startsWith("#"));
    changedIndices.add(firstCodeIdx !== -1 ? firstCodeIdx : 0);
  }

  return Array.from(changedIndices).sort((a, b) => a - b);
}

/**
 * Highlights the snippet / lines where changes happen with red color at 25% opacity
 * Supports Monaco, CodeMirror 6, CodeMirror 5, Ace, and synchronized Textarea overlay
 */
function applyEditorHighlight(editorEl, targetCode, changedLineIndices, data) {
  clearEditorHighlights();

  if (!changedLineIndices || changedLineIndices.length === 0) {
    return null;
  }

  const firstLineIdx = changedLineIndices[0];
  const lastLineIdx = changedLineIndices[changedLineIndices.length - 1];
  const lineRangeText = firstLineIdx === lastLineIdx 
    ? `Line ${firstLineIdx + 1}` 
    : `Lines ${firstLineIdx + 1}–${lastLineIdx + 1}`;

  let targetTop = null;
  let targetBottom = null;
  let targetLeft = null;

  // 1. Monaco Editor (.monaco-editor)
  const monacoContainer = editorEl?.closest(".monaco-editor") || findMainMonacoEditor() || document.querySelector(".monaco-editor");
  if (monacoContainer) {
    const viewLines = monacoContainer.querySelectorAll(".view-line");
    if (viewLines.length > 0) {
      const sorted = Array.from(viewLines).sort((a, b) => parseFloat(a.style.top || "0") - parseFloat(b.style.top || "0"));
      const targetLines = typeof targetCode === "string" ? targetCode.split("\n") : [];
      changedLineIndices.forEach(idx => {
        let el = null;
        if (sorted[idx]) {
          const sortedText = (sorted[idx].textContent || "").replace(/\u00a0/g, " ").trim();
          const expectedText = (targetLines[idx] || "").replace(/\u00a0/g, " ").trim();
          if (!expectedText || sortedText === expectedText) {
            el = sorted[idx];
          }
        }
        if (!el && targetLines[idx]) {
          const expectedText = targetLines[idx].replace(/\u00a0/g, " ").trim();
          if (expectedText.length > 0) {
            el = sorted.find(vl => {
              const txt = (vl.textContent || "").replace(/\u00a0/g, " ").trim();
              return txt === expectedText;
            });
          }
        }
        if (!el && sorted[idx]) {
          el = sorted[idx];
        }

        if (el) {
          el.style.backgroundColor = "rgba(255, 0, 0, 0.25)";
          el.style.borderLeft = "3px solid #ff3333";
          el.style.boxShadow = "inset 0 0 10px rgba(255, 0, 0, 0.25)";
          el.classList.add("sniply-red-highlight");
          el.setAttribute("data-sniply-highlighted", "true");
          activeHighlightElements.push(el);

          const r = el.getBoundingClientRect();
          if (targetTop === null || r.top + window.scrollY < targetTop) targetTop = r.top + window.scrollY;
          if (targetBottom === null || r.bottom + window.scrollY > targetBottom) targetBottom = r.bottom + window.scrollY;
          if (targetLeft === null) targetLeft = r.left + window.scrollX;
        }
      });
    }
  }

  // 2. CodeMirror 6 (.cm-content)
  const cm6Content = editorEl?.closest(".cm-content") || document.querySelector(".cm-content");
  if (cm6Content && activeHighlightElements.length === 0) {
    const cmLines = cm6Content.querySelectorAll(".cm-line");
    if (cmLines.length > 0) {
      changedLineIndices.forEach(idx => {
        if (cmLines[idx]) {
          const el = cmLines[idx];
          el.style.backgroundColor = "rgba(255, 0, 0, 0.25)";
          el.style.borderLeft = "3px solid #ff3333";
          el.style.boxShadow = "inset 0 0 10px rgba(255, 0, 0, 0.25)";
          el.classList.add("sniply-red-highlight");
          el.setAttribute("data-sniply-highlighted", "true");
          activeHighlightElements.push(el);

          const r = el.getBoundingClientRect();
          if (targetTop === null || r.top + window.scrollY < targetTop) targetTop = r.top + window.scrollY;
          if (targetBottom === null || r.bottom + window.scrollY > targetBottom) targetBottom = r.bottom + window.scrollY;
          if (targetLeft === null) targetLeft = r.left + window.scrollX;
        }
      });
    }
  }

  // 3. Ace Editor (.ace_editor)
  const aceEditor = editorEl?.closest(".ace_editor") || document.querySelector(".ace_editor");
  if (aceEditor && activeHighlightElements.length === 0) {
    const aceLines = aceEditor.querySelectorAll(".ace_line");
    if (aceLines.length > 0) {
      changedLineIndices.forEach(idx => {
        if (aceLines[idx]) {
          const el = aceLines[idx];
          el.style.backgroundColor = "rgba(255, 0, 0, 0.25)";
          el.style.borderLeft = "3px solid #ff3333";
          el.style.boxShadow = "inset 0 0 10px rgba(255, 0, 0, 0.25)";
          el.setAttribute("data-sniply-highlighted", "true");
          activeHighlightElements.push(el);

          const r = el.getBoundingClientRect();
          if (targetTop === null || r.top + window.scrollY < targetTop) targetTop = r.top + window.scrollY;
          if (targetBottom === null || r.bottom + window.scrollY > targetBottom) targetBottom = r.bottom + window.scrollY;
          if (targetLeft === null) targetLeft = r.left + window.scrollX;
        }
      });
    }
  }

  // 4. CodeMirror 5 (.CodeMirror)
  const cm5 = editorEl?.closest(".CodeMirror") || document.querySelector(".CodeMirror");
  if (cm5 && activeHighlightElements.length === 0) {
    const cm5Lines = cm5.querySelectorAll(".CodeMirror-line");
    if (cm5Lines.length > 0) {
      changedLineIndices.forEach(idx => {
        if (cm5Lines[idx]) {
          const parent = cm5Lines[idx].parentElement || cm5Lines[idx];
          parent.style.backgroundColor = "rgba(255, 0, 0, 0.25)";
          parent.style.borderLeft = "3px solid #ff3333";
          parent.setAttribute("data-sniply-highlighted", "true");
          activeHighlightElements.push(parent);

          const r = parent.getBoundingClientRect();
          if (targetTop === null || r.top + window.scrollY < targetTop) targetTop = r.top + window.scrollY;
          if (targetBottom === null || r.bottom + window.scrollY > targetBottom) targetBottom = r.bottom + window.scrollY;
          if (targetLeft === null) targetLeft = r.left + window.scrollX;
        }
      });
    }
  }

  // 5. Textarea Overlay (handles #mock-code-editor, textareas, and universal overlay)
  const targetTextarea = (editorEl?.tagName === "TEXTAREA" ? editorEl : null) ||
                         document.querySelector("#mock-code-editor") ||
                         (editorEl?.querySelector ? editorEl.querySelector("textarea") : null) ||
                         document.querySelector("textarea");

  if (targetTextarea && (!activeHighlightElements.length || targetTextarea === editorEl || editorEl?.id === "mock-code-editor")) {
    const rect = targetTextarea.getBoundingClientRect();
    const style = window.getComputedStyle(targetTextarea);
    const paddingTop = parseFloat(style.paddingTop) || 0;
    const paddingLeft = parseFloat(style.paddingLeft) || 0;
    const borderTop = parseFloat(style.borderTopWidth) || 0;
    const borderLeft = parseFloat(style.borderLeftWidth) || 0;
    const fontSize = parseFloat(style.fontSize) || 14;
    let lineHeight = parseFloat(style.lineHeight);
    if (isNaN(lineHeight)) lineHeight = fontSize * 1.5;

    const overlay = document.createElement("div");
    overlay.id = "sniply-editor-highlight-overlay";
    overlay.style.cssText = `
      position: absolute;
      top: ${rect.top + window.scrollY}px;
      left: ${rect.left + window.scrollX}px;
      width: ${rect.width}px;
      height: ${rect.height}px;
      pointer-events: none;
      overflow: hidden;
      border-radius: ${style.borderRadius || "8px"};
      z-index: 999990;
    `;

    const inner = document.createElement("div");
    inner.style.cssText = `
      position: relative;
      width: 100%;
      height: 100%;
      transform: translateY(-${targetTextarea.scrollTop}px);
      transition: transform 0.05s linear;
    `;

    const scrollHandler = () => {
      inner.style.transform = `translateY(-${targetTextarea.scrollTop}px)`;
    };
    targetTextarea.addEventListener("scroll", scrollHandler);
    overlay.__cleanupScroll = () => targetTextarea.removeEventListener("scroll", scrollHandler);

    changedLineIndices.forEach(idx => {
      const lineTop = paddingTop + borderTop + (idx * lineHeight);
      const hlBox = document.createElement("div");
      hlBox.className = "sniply-textarea-highlight-box";
      hlBox.style.cssText = `
        position: absolute;
        top: ${lineTop}px;
        left: ${borderLeft}px;
        right: ${borderLeft}px;
        height: ${lineHeight}px;
        background-color: rgba(255, 0, 0, 0.25) !important;
        border-left: 3px solid #ff3333 !important;
        box-shadow: 0 0 10px rgba(255, 0, 0, 0.25) !important;
        pointer-events: none;
      `;
      inner.appendChild(hlBox);
    });

    overlay.appendChild(inner);
    document.body.appendChild(overlay);
    activeHighlightOverlay = overlay;

    if (targetTop === null) {
      targetTop = rect.top + window.scrollY + paddingTop + (firstLineIdx * lineHeight);
      targetBottom = rect.top + window.scrollY + paddingTop + ((lastLineIdx + 1) * lineHeight);
      targetLeft = rect.left + window.scrollX + paddingLeft;
    }
  }

  // Fallback coordinates
  if (targetTop === null && editorEl) {
    const r = editorEl.getBoundingClientRect();
    targetTop = r.top + window.scrollY + 50;
    targetBottom = targetTop + 30;
    targetLeft = r.left + window.scrollX + 40;
  }

  return {
    targetTop,
    targetBottom,
    targetLeft,
    lineRangeText,
    changedLineIndices
  };
}

function showInEditorTooltip(context, data) {
  dismissInEditorTooltip();
  if (!data) return;

  // Find target editor coordinates
  const editorEl = lastActiveEditor || findMainMonacoEditor() || document.querySelector(".cm-content, .CodeMirror, .ace_editor, textarea, #mock-code-editor");

  // Accurately extract function signature and diagnostic issue text
  const badgeCode = extractBadgeSignature(context?.targetCode, data);
  const diagnosis = extractAccurateDiagnosis(data);
  const fullReason = extractFullReason(data) || diagnosis;

  // 1. Detect exact lines where code changes happen
  const changedLineIndices = detectChangedLines(context?.targetCode, data);

  // 2. Apply Red Highlight with 25% Opacity on the changed snippet / lines
  const highlightInfo = applyEditorHighlight(editorEl, context?.targetCode, changedLineIndices, data);

  // 3. Compute position for Suggestion Pill right at or above the highlighted snippet / line
  let topPos = 140;
  let leftPos = 60;

  if (highlightInfo && highlightInfo.targetTop !== null) {
    // Dock above the first highlighted line if space allows, otherwise just below
    if (highlightInfo.targetTop - 65 > 20) {
      topPos = Math.max(20, highlightInfo.targetTop - 60);
    } else {
      topPos = (highlightInfo.targetBottom || highlightInfo.targetTop) + 10;
    }
    leftPos = Math.max(20, Math.min(window.innerWidth - 620, (highlightInfo.targetLeft || 60) + 20));
  } else if (editorEl) {
    const rect = editorEl.getBoundingClientRect();
    topPos = Math.max(20, rect.top + window.scrollY + 50);
    leftPos = Math.max(20, Math.min(window.innerWidth - 620, rect.left + window.scrollX + 60));
  }

  const lineRangeTag = highlightInfo?.lineRangeText || "Changed Line";

  // Sync with extension storage so popup.html displays the Group 58.png pill in sync!
  safeStorageSet({
    sniply_active_suggestion: {
      funcName: badgeCode,
      issueText: diagnosis,
      fullReason: fullReason,
      payload: {
        optimizedCode: data.full_optimized_code
      },
      timestamp: Date.now()
    }
  });

  activeTooltipEl = document.createElement("div");
  activeTooltipEl.id = "sniply-in-editor-tooltip";
  activeTooltipEl.style.cssText = `
    position: absolute;
    top: ${topPos}px;
    left: ${leftPos}px;
    z-index: 9999999;
    display: flex;
    align-items: center;
    user-select: none;
    animation: sniply-applied-bounce 0.28s cubic-bezier(0.16, 1, 0.3, 1);
  `;

  activeTooltipEl.innerHTML = `
    <!-- Exact Figma Screen-constraints Suggestion Pill (Group 58.png) -->
    <div id="sniply-suggestion-pill-inner" style="
      background: #000000;
      border: 2px solid #0672fe;
      border-radius: 9999px;
      height: 52px;
      padding: 0 16px 0 16px;
      display: flex;
      align-items: center;
      gap: 12px;
      box-shadow: 0 0 20px rgba(6, 114, 254, 0.45), 0 16px 45px rgba(0, 0, 0, 0.9), inset 0 1px 0 rgba(255,255,255,0.12);
      transition: all 0.3s ease;
    ">
      <!-- Highlight Location Badge (Red 25% opacity pill) -->
      <span style="
        background: rgba(255, 0, 0, 0.25);
        border: 1px solid rgba(255, 0, 0, 0.6);
        color: #ff6b6b;
        font-family: 'SF Mono', 'JetBrains Mono', Consolas, monospace;
        font-size: 11px;
        font-weight: 700;
        padding: 3px 8px;
        border-radius: 9999px;
        white-space: nowrap;
        letter-spacing: -0.2px;
        display: inline-flex;
        align-items: center;
        gap: 5px;
        flex-shrink: 0;
      ">
        <span style="width: 6px; height: 6px; border-radius: 50%; background: #ff3333; display: inline-block;"></span>
        ${escapeHtml(lineRangeTag)}
      </span>

      <!-- Function / Code Signature (e.g. avg_num()) -->
      <span style="
        font-family: 'SF Mono', 'JetBrains Mono', Consolas, Monaco, monospace;
        font-size: 14px;
        color: #9ca3af;
        letter-spacing: -0.3px;
        white-space: nowrap;
        flex-shrink: 0;
      ">${escapeHtml(badgeCode)}</span>

      <!-- Diagnostic Label with hover tooltip for full description -->
      <span id="sniply-diagnostic-label" title="${escapeHtml(fullReason)}" style="
        font-family: -apple-system, BlinkMacSystemFont, 'Google Sans', 'Plus Jakarta Sans', Roboto, sans-serif;
        font-size: 14px;
        font-weight: 500;
        color: #ffffff;
        letter-spacing: -0.2px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        max-width: 320px;
        cursor: default;
      ">${escapeHtml(diagnosis)}</span>

      <!-- 3 Action Buttons (✓ ✕ Cube) -->
      <div style="display: flex; align-items: center; gap: 8px; flex-shrink: 0; margin-left: 4px;">
        <!-- Circle Check Button -->
        <button id="sniply-btn-accept" title="Accept & Apply Fix In-Place" style="
          width: 30px;
          height: 30px;
          border-radius: 50%;
          background: transparent;
          border: 1px solid rgba(255, 255, 255, 0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          padding: 0;
          transition: all 0.2s;
        " onmouseover="this.style.background='rgba(255,255,255,0.12)'; this.style.borderColor='#ffffff'; this.style.transform='scale(1.08)'" onmouseout="this.style.background='transparent'; this.style.borderColor='rgba(255,255,255,0.4)'; this.style.transform='none'">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </button>

        <!-- Circle Cross Button -->
        <button id="sniply-btn-reject" title="Dismiss / Ignore" style="
          width: 30px;
          height: 30px;
          border-radius: 50%;
          background: transparent;
          border: 1px solid rgba(255, 255, 255, 0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          padding: 0;
          transition: all 0.2s;
        " onmouseover="this.style.background='rgba(255,255,255,0.12)'; this.style.borderColor='#ffffff'; this.style.transform='scale(1.08)'" onmouseout="this.style.background='transparent'; this.style.borderColor='rgba(255,255,255,0.4)'; this.style.transform='none'">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        <!-- Cube Icon Button -->
        <button id="sniply-btn-cube" title="Open Full Snipy Details" style="
          width: 30px;
          height: 30px;
          background: transparent;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          padding: 0;
          opacity: 0.8;
          transition: all 0.2s;
        " onmouseover="this.style.opacity='1'; this.style.transform='scale(1.08)'" onmouseout="this.style.opacity='0.8'; this.style.transform='none'">
          <img src="${CUBE_ICON_SRC}" style="width: 22px; height: 22px; object-fit: contain;" />
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(activeTooltipEl);

  // Bind Actions
  const btnAccept = document.getElementById("sniply-btn-accept");
  if (btnAccept) {
    btnAccept.addEventListener("click", () => {
      if (data.full_optimized_code) {
        replaceActiveEditorCode(data.full_optimized_code);
      }
      clearEditorHighlights();
      safeStorageRemove(["sniply_active_suggestion"]);

      // Morph pill into Suggestion apply.png state
      const pillInner = document.getElementById("sniply-suggestion-pill-inner");
      if (pillInner) {
        pillInner.style.borderColor = "#10b981";
        pillInner.style.boxShadow = "0 0 22px rgba(16, 185, 129, 0.6), 0 16px 45px rgba(0,0,0,0.9)";
        pillInner.innerHTML = `
          <img src="${CUBE_ICON_SRC}" style="width: 24px; height: 24px; object-fit: contain; margin-right: 4px;" />
          <span style="font-family: -apple-system, BlinkMacSystemFont, 'Google Sans', sans-serif; font-size: 15px; color: #ffffff;">
            <span style="color: #10b981; font-weight: bold; margin-right: 6px;">✓</span> Suggestion apply
          </span>
        `;
      }

      setScreenStickState("applied");
      setTimeout(() => {
        dismissInEditorTooltip();
      }, 2000);
    });
  }

  const btnReject = document.getElementById("sniply-btn-reject");
  if (btnReject) {
    btnReject.addEventListener("click", () => {
      safeStorageRemove(["sniply_active_suggestion"]);
      dismissInEditorTooltip();
      setScreenStickState("activate");
    });
  }

  const btnCube = document.getElementById("sniply-btn-cube");
  if (btnCube) {
    btnCube.addEventListener("click", () => {
      chrome.runtime?.sendMessage?.({ action: "OPEN_DASHBOARD" });
    });
  }
}

/**
 * Sends context to background service worker and renders in-editor tooltip
 */
function triggerOptimizationFlow(options = {}) {
  if (!isSniplyActive) return;

  const isAuto = Boolean(options && options.isAutoSuggestion);
  if (isAuto && currentStickState === "scanning") return;

  // Check if extension context is valid
  if (!isExtensionAlive()) {
    setScreenStickState("error");
    const labelEl = floatingPill?.querySelector("#sniply-stick-label");
    if (labelEl) labelEl.textContent = "Please refresh tab (Extension updated)";
    return;
  }

  const context = extractContextWindow();
  if (!context || !context.targetCode || !isMeaningfulPythonCode(context.targetCode)) {
    if (!isAuto) setScreenStickState("no_editor");
    return;
  }

  // Validate supported language
  const lang = (context.language || "").toLowerCase();
  if (lang && !["python", "javascript", "typescript", "c", "cpp", "java"].includes(lang)) {
    if (!isAuto) setScreenStickState("unrecognized");
    return;
  }

  // Auto-suggestion guards:
  if (isAuto) {
    const now = Date.now();
    // 1. Rate-limit auto-suggestions to at most once every 15 seconds
    if (now - lastAutoAnalyzedTime < 15000) {
      return;
    }
    // 2. Prevent re-analyzing the identical code snippet
    if (context.targetCode.trim() === lastAutoAnalyzedCode.trim()) {
      return;
    }
  }

  // Smooth scanning state (only animate floating pill for manual triggers so typing isn't interrupted)
  if (!isAuto) {
    setScreenStickState("scanning");
  }

  // Watchdog timeout to prevent endless scanning if network or background drops
  let flowFinished = false;
  const watchdogTimer = setTimeout(() => {
    if (!flowFinished) {
      flowFinished = true;
      if (!isAuto) {
        setScreenStickState("error");
        const labelEl = floatingPill?.querySelector("#sniply-stick-label");
        if (labelEl) labelEl.textContent = "Analysis timed out. Please retry.";
      }
    }
  }, 12000);

  safeStorageGet([
    "sniply_user", "ai_mode", "custom_preferences", "preferred_languages",
    "context_window", "sniply_daily_tokens", "is_locked", "quota_exceeded", "problems_used", "tokens_used"
  ], (storedData) => {
    const user = storedData.sniply_user || {};

    // Strict Quota Check: 10 tokens / 30 problems maximum
    if (storedData.is_locked || storedData.quota_exceeded || (storedData.problems_used >= 30) || (storedData.tokens_used >= 10)) {
      flowFinished = true;
      clearTimeout(watchdogTimer);
      if (!isAuto) {
        setScreenStickState("error");
        const labelEl = floatingPill?.querySelector("#sniply-stick-label");
        if (labelEl) labelEl.textContent = "Limit reached (30/30 fixed). Service paused.";
      }
      return;
    }

    // Auto-suggestion token check: 10 tokens per day (~2.5h session limit)
    let tokenData = storedData.sniply_daily_tokens;
    const todayStr = new Date().toDateString();
    if (!tokenData || tokenData.date !== todayStr) {
      tokenData = { date: todayStr, tokens_remaining: 10, max_tokens: 10, used_today: 0 };
      safeStorageSet({ sniply_daily_tokens: tokenData });
    }

    if (isAuto && tokenData.tokens_remaining <= 0) {
      flowFinished = true;
      clearTimeout(watchdogTimer);
      return;
    }

    safeStorageSet({
      activeSnippet: context.targetCode,
      activeLanguage: context.language,
      activeEditorUrl: window.location.href,
      optimizationStatus: "OPTIMIZING"
    });

    // Request deep quality inspection from backend
    try {
      chrome.runtime.sendMessage({
        action: "OPTIMIZE_CODE",
        payload: {
          code: context.targetCode,
          language: context.language,
          context: context.contextLines,
          userId: user.uid || "guest",
          editorUrl: window.location.href,
          ai_mode: storedData.ai_mode || "anti-overengineering",
          custom_preferences: storedData.custom_preferences || "",
          preferred_languages: storedData.preferred_languages || ["Python"],
          context_window: Math.min(150, storedData.context_window || 150)
        }
      }, (response) => {
        if (flowFinished) return;
        flowFinished = true;
        clearTimeout(watchdogTimer);

        if (chrome.runtime?.lastError) {
          console.warn("Sniply runtime error:", chrome.runtime.lastError.message);
          if (!isAuto) setScreenStickState("error");
          return;
        }

        // Check if rate limited or quota reached (30/30 problems fixed)
        if (response?.quota_exceeded || response?.rate_limited || (response?.error && (response.error.includes("rate limit") || response.error.includes("Quota limit")))) {
          safeStorageSet({
            optimizationError: response.error,
            optimizationStatus: "RATE_LIMITED",
            is_locked: true,
            quota_exceeded: true,
            problems_used: 30,
            tokens_used: 10
          });
          if (!isAuto) {
            setScreenStickState("error");
            const labelEl = floatingPill?.querySelector("#sniply-stick-label");
            if (labelEl) labelEl.textContent = "Limit reached (30/30 fixed). Service paused.";
          }
          return;
        }

        if (response && response.success && response.data) {
          lastAutoAnalyzedCode = context.targetCode;
          lastAutoAnalyzedTime = Date.now();

          safeStorageSet({
            optimizationResult: response.data,
            optimizationStatus: "SUCCESS"
          });

          // Deduct 1 auto-suggestion token if this was triggered automatically
          if (isAuto) {
            const updatedRemaining = Math.max(0, tokenData.tokens_remaining - 1);
            safeStorageSet({
              sniply_daily_tokens: {
                date: todayStr,
                tokens_remaining: updatedRemaining,
                max_tokens: 10,
                used_today: 10 - updatedRemaining
              }
            });
            try {
              chrome.runtime.sendMessage({
                action: "CONSUME_TOKEN",
                payload: { userId: user.uid || "guest" }
              });
            } catch (_) {}
          }

          // Check if code is already optimal with no simplification needed
          const canSimplify = response.data.simplification_analysis?.can_simplify !== false;
          const isValidSyntax = response.data.syntax_analysis?.is_valid !== false;

          if (!canSimplify && isValidSyntax) {
            if (!isAuto) {
              setScreenStickState("optimal", 4500);
            }
            return;
          }

          // Revert stick to activate and render in-editor tooltip
          setScreenStickState("activate");
          showInEditorTooltip(context, response.data);
        } else {
          safeStorageSet({
            optimizationError: response?.error || "Optimization check complete",
            optimizationStatus: "ERROR"
          });
          if (!isAuto) {
            setScreenStickState("error");
          }
        }
      });
    } catch (err) {
      if (flowFinished) return;
      flowFinished = true;
      clearTimeout(watchdogTimer);
      if (!isAuto) {
        setScreenStickState("error");
        const labelEl = floatingPill?.querySelector("#sniply-stick-label");
        if (labelEl) labelEl.textContent = "Please refresh tab (Extension updated)";
      }
    }
  });
}

/**
 * In-place code replacement in the active editor
 * Handles: Monaco, CodeMirror 6, CodeMirror 5, Ace, Native Textarea
 */
function replaceActiveEditorCode(newCode) {
  try {
    clearEditorHighlights();

    // 1. Monaco Editor (Colab focused cell, LeetCode, CodeChef)

    const activeColabCell = document.querySelector(".cell.focused") || document.activeElement?.closest(".cell");
    const mainMonaco = findMainMonacoEditor();
    const monacoInput = (activeColabCell ? activeColabCell.querySelector(".monaco-editor textarea.inputarea") : null) ||
                        (mainMonaco ? mainMonaco.querySelector("textarea.inputarea") : null) ||
                        document.querySelector(".monaco-editor textarea.inputarea");
    if (monacoInput) {
      monacoInput.focus();
      document.execCommand("selectAll", false, null);
      const ok = document.execCommand("insertText", false, newCode);
      if (ok) {
        setScreenStickState("applied");
        return true;
      }
    }

    if (mainMonaco) {
      setScreenStickState("applied");
      return true;
    }

    // 2. CodeMirror 6 (Replit, JupyterLab 4 active cell)
    let activeJupyterCell = null;
    if (document.activeElement && document.activeElement.closest(".jp-Cell")) {
      activeJupyterCell = document.activeElement.closest(".jp-Cell");
    } else if (lastActiveEditor && lastActiveEditor.closest(".jp-Cell")) {
      activeJupyterCell = lastActiveEditor.closest(".jp-Cell");
    } else {
      activeJupyterCell = document.querySelector(".jp-Cell.jp-mod-editMode") ||
                          document.querySelector(".jp-Cell.jp-mod-active");
    }
    const cm6 = (activeJupyterCell ? activeJupyterCell.querySelector(".cm-content[contenteditable='true']") : null) ||
                (lastActiveEditor?.closest(".cm-content")) ||
                document.querySelector(".cm-content[contenteditable='true']");
    if (cm6) {
      cm6.focus();
      document.execCommand("selectAll", false, null);
      const ok = document.execCommand("insertText", false, newCode);
      if (ok) {
        setScreenStickState("applied");
        return true;
      }
    }

    // 3. Ace Editor (Programiz, OnlineGDB, HackerRank)
    const aceInput = document.querySelector(".ace_editor textarea.ace_text-input");
    if (aceInput) {
      aceInput.focus();
      document.execCommand("selectAll", false, null);
      const ok = document.execCommand("insertText", false, newCode);
      if (ok) {
        setScreenStickState("applied");
        return true;
      }
    }

    // 4. CodeMirror 5 (Jupyter)
    const cm5El = document.querySelector(".CodeMirror");
    if (cm5El && cm5El.CodeMirror && typeof cm5El.CodeMirror.setValue === "function") {
      cm5El.CodeMirror.setValue(newCode);
      setScreenStickState("applied");
      return true;
    }

    // 5. Standard Textarea (including #mock-code-editor)
    const targetTextarea = (lastActiveEditor && lastActiveEditor.value !== undefined) ? lastActiveEditor : document.querySelector("#mock-code-editor, textarea");
    if (targetTextarea && targetTextarea.value !== undefined) {
      targetTextarea.focus();
      targetTextarea.value = newCode;
      targetTextarea.dispatchEvent(new Event("input", { bubbles: true }));
      targetTextarea.dispatchEvent(new Event("change", { bubbles: true }));
      setScreenStickState("applied");
      return true;
    }

    // 6. Generic execCommand fallback
    document.execCommand("selectAll", false, null);
    const execOk = document.execCommand("insertText", false, newCode);
    if (execOk) {
      setScreenStickState("applied");
      return true;
    }

    // Clipboard fallback
    navigator.clipboard.writeText(newCode);
    setScreenStickState("applied");
    return false;
  } catch (err) {
    navigator.clipboard.writeText(newCode);
    setScreenStickState("applied");
    return false;
  }
}

// Floating toast replaced entirely by the Figma Screen-constraints capsule stick UI
function showFloatingToast(msg) {
  // Intentionally empty: all instructions & states are unified inside setScreenStickState
}

/**
 * Runtime message listener from Background / Dashboard
 */
function listenForRuntimeMessages() {
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "ACTIVATE_AND_SCAN") {
      isSniplyActive = true;
      if (!floatingPill) createFloatingTrigger();
      if (floatingPill) floatingPill.style.display = "flex";
      setScreenStickState("scanning");
      triggerOptimizationFlow();
      sendResponse({ success: true });
    }

    if (request.action === "CAPTURE_ACTIVE_CONTEXT") {
      if (!floatingPill) createFloatingTrigger();
      if (floatingPill) floatingPill.style.display = "flex";
      triggerOptimizationFlow();
      sendResponse({ success: true });
    }

    if (request.action === "APPLY_CODE_TO_EDITOR") {
      let codeToApply = request.code;
      if (!codeToApply) {
        safeStorageGet(["sniply_active_suggestion"], (data) => {
          if (data.sniply_active_suggestion?.payload?.optimizedCode) {
            replaceActiveEditorCode(data.sniply_active_suggestion.payload.optimizedCode);
            dismissInEditorTooltip();
            setScreenStickState("applied");
          }
        });
      } else {
        replaceActiveEditorCode(codeToApply);
        dismissInEditorTooltip();
        setScreenStickState("applied");
      }
      safeStorageRemove(["sniply_active_suggestion"]);
      sendResponse({ success: true });
    }
  });
}

  // Safe initialization after DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initContentScript);
  } else {
    initContentScript();
  }
})();
