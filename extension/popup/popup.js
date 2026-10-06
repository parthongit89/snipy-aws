/**
 * Snipy — Screen-constraints Popup Controller
 * Implements the Figma Screen-constraints interactive states:
 * - Group 59.png: "Activate Snipy" with electric blue rim
 * - Group 58.png: "avg_num() Variable Not consistant [✓] [✕] [cube]"
 * - Group 40.png: "Scanning Code...."
 * - Group 36, 37, 38: Warning / error states
 * - Suggestion apply.png: "Suggestion apply"
 */

document.addEventListener("DOMContentLoaded", async () => {
  const capsule = document.getElementById("sniply-popup-capsule");
  const viewActivate = document.getElementById("view-activate");
  const viewSuggestion = document.getElementById("view-suggestion");
  const viewStatus = document.getElementById("view-status");

  const capsuleFunc = document.getElementById("capsule-func");
  const capsuleIssue = document.getElementById("capsule-issue");
  const statusText = document.getElementById("status-text");

  const btnCheck = document.getElementById("btn-capsule-check");
  const btnCross = document.getElementById("btn-capsule-cross");
  const btnCube = document.getElementById("btn-capsule-cube");

  const linkDashboard = document.getElementById("link-dashboard");
  const btnToggleSettings = document.getElementById("btn-toggle-settings");
  const settingsDrawer = document.getElementById("settings-drawer");

  const apiKeyInput = document.getElementById("apiKey");
  const awsRegionSelect = document.getElementById("awsRegion");
  const modelIdSelect = document.getElementById("modelId");
  const btnSaveSettings = document.getElementById("btn-save-settings");

  let currentState = "activate";
  let activePayload = null;
  let revertTimeout = null;

  function setPopupState(state, info = {}) {
    if (revertTimeout) {
      clearTimeout(revertTimeout);
      revertTimeout = null;
    }

    currentState = state;
    capsule.className = "screen-constraint-capsule";

    // Hide all views first
    viewActivate.style.display = "none";
    viewSuggestion.style.display = "none";
    viewStatus.style.display = "none";

    switch (state) {
      case "activate":
        viewActivate.style.display = "flex";
        break;

      case "suggestion":
        viewSuggestion.style.display = "flex";
        capsuleFunc.textContent = info.funcName || "code.py";
        capsuleIssue.textContent = info.issueText || "Optimization Available";
        capsuleIssue.title = info.fullReason || info.issueText || "";
        activePayload = info.payload || null;
        break;

      case "scanning":
        viewStatus.style.display = "flex";
        statusText.textContent = "Scanning Code....";
        capsule.classList.add("capsule-scanning");
        break;

      case "applied":
        viewStatus.style.display = "flex";
        statusText.innerHTML = '<span style="color:#10b981;font-weight:bold;margin-right:8px;font-size:16px;">✓</span> Suggestion apply';
        capsule.classList.add("capsule-applied");
        revertTimeout = setTimeout(() => {
          setPopupState("activate");
          window.close();
        }, 1200);
        break;

      case "optimal":
        viewStatus.style.display = "flex";
        statusText.innerHTML = '<span style="color:#10b981;font-weight:bold;margin-right:8px;font-size:16px;">✓</span> Code is Optimal';
        capsule.classList.add("capsule-applied");
        revertTimeout = setTimeout(() => setPopupState("activate"), 2200);
        break;

      case "no_editor":
        viewStatus.style.display = "flex";
        statusText.textContent = "Oops! code editor not found";
        capsule.classList.add("capsule-warning");
        revertTimeout = setTimeout(() => setPopupState("activate"), 2800);
        break;

      case "unrecognized":
        viewStatus.style.display = "flex";
        statusText.textContent = "Language not recognized. Please update settings.";
        capsule.classList.add("capsule-warning");
        revertTimeout = setTimeout(() => setPopupState("activate"), 3000);
        break;

      case "error":
        viewStatus.style.display = "flex";
        statusText.textContent = info.msg || "Something went wrong !";
        capsule.classList.add("capsule-error");
        revertTimeout = setTimeout(() => setPopupState("activate"), 2800);
        break;
    }
  }

  // 1. On Popup Open: Check if there is an active pending suggestion from the current tab
  try {
    const data = await chrome.storage.local.get(["sniply_active_suggestion"]);
    if (data.sniply_active_suggestion && data.sniply_active_suggestion.funcName) {
      const now = Date.now();
      // Keep active suggestion visible if within 3 minutes
      if (!data.sniply_active_suggestion.timestamp || (now - data.sniply_active_suggestion.timestamp < 180000)) {
        setPopupState("suggestion", data.sniply_active_suggestion);
      }
    }
  } catch (_) {}

  // 2. Click on "Activate Snipy" View -> Triggers Scanning on Active Tab
  viewActivate.addEventListener("click", async (e) => {
    e.stopPropagation();
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab || !tab.id) {
        setPopupState("no_editor");
        return;
      }

      if (tab.url && (tab.url.startsWith("chrome://") || tab.url.startsWith("chrome-extension://") || tab.url.startsWith("edge://"))) {
        setPopupState("no_editor");
        return;
      }

      setPopupState("scanning");
      await chrome.storage.local.set({ targetTabId: tab.id });

      // Ensure content script is running
      try {
        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: ["content/content.js"]
        });
      } catch (e) {}

      // Send ACTIVATE_AND_SCAN
      chrome.tabs.sendMessage(tab.id, { action: "ACTIVATE_AND_SCAN" }, (response) => {
        if (chrome.runtime.lastError) {
          // If page was recently reloaded or no editor found
          setTimeout(() => {
            setPopupState("no_editor");
          }, 300);
          return;
        }

        if (response && response.optimal) {
          setPopupState("optimal");
        } else if (response && response.suggestion) {
          setPopupState("suggestion", response.suggestion);
        } else {
          // Content script handles UI on page, keep suggestion in sync
          setTimeout(() => {
            chrome.storage.local.get(["sniply_active_suggestion"], (res) => {
              if (res.sniply_active_suggestion) {
                setPopupState("suggestion", res.sniply_active_suggestion);
              } else {
                setPopupState("applied");
              }
            });
          }, 800);
        }
      });

    } catch (err) {
      setPopupState("error");
    }
  });

  // 3. Action Buttons on Suggestion View (Group 58.png)
  // Check Button (✓) -> Apply In-Place Fix
  if (btnCheck) {
    btnCheck.addEventListener("click", async (e) => {
      e.stopPropagation();
      try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tab && tab.id) {
          const codeToApply = activePayload?.optimizedCode || null;
          chrome.tabs.sendMessage(tab.id, {
            action: "APPLY_CODE_TO_EDITOR",
            code: codeToApply
          }, () => {});
        }
      } catch (_) {}

      // Clear pending suggestion
      chrome.storage.local.remove(["sniply_active_suggestion"]);
      setPopupState("applied");
    });
  }

  // Cross Button (✕) -> Dismiss Suggestion
  if (btnCross) {
    btnCross.addEventListener("click", (e) => {
      e.stopPropagation();
      chrome.storage.local.remove(["sniply_active_suggestion"]);
      setPopupState("activate");
    });
  }

  // Cube Button -> Open Full Dashboard / Sidepanel
  if (btnCube) {
    btnCube.addEventListener("click", (e) => {
      e.stopPropagation();
      chrome.runtime.sendMessage({ action: "OPEN_DASHBOARD" }, () => {
        window.close();
      });
    });
  }

  // 4. Open Simplicity Dashboard
  if (linkDashboard) {
    linkDashboard.addEventListener("click", () => {
      chrome.runtime.sendMessage({ action: "OPEN_DASHBOARD" }, () => {
        window.close();
      });
    });
  }

  // 5. Toggle Settings Drawer
  if (btnToggleSettings && settingsDrawer) {
    btnToggleSettings.addEventListener("click", () => {
      const isVisible = settingsDrawer.style.display === "block";
      settingsDrawer.style.display = isVisible ? "none" : "block";
    });
  }

  // 6. Load Saved Settings
  chrome.storage.local.get(["apiKey", "awsRegion", "modelId"], (data) => {
    if (data.apiKey) apiKeyInput.value = data.apiKey;
    if (data.awsRegion) awsRegionSelect.value = data.awsRegion;
    if (data.modelId) modelIdSelect.value = data.modelId;
  });

  // 7. Save Settings
  if (btnSaveSettings) {
    btnSaveSettings.addEventListener("click", () => {
      const apiKey = apiKeyInput.value.trim();
      const awsRegion = awsRegionSelect.value;
      const modelId = modelIdSelect.value;

      chrome.storage.local.set({ apiKey, awsRegion, modelId }, () => {
        btnSaveSettings.textContent = "Saved ✓";
        btnSaveSettings.style.background = "#10b981";
        setTimeout(() => {
          btnSaveSettings.textContent = "Save Settings";
          btnSaveSettings.style.background = "#0672fe";
          settingsDrawer.style.display = "none";
        }, 1000);
      });
    });
  }
});
