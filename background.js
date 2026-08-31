// --- Main setup on install/update ---
chrome.runtime.onInstalled.addListener(() => {
  rebuildContextMenus();
});

// --- Listen for a click on the extension's icon ---
chrome.action.onClicked.addListener((tab) => {
  chrome.runtime.openOptionsPage();
});

// --- Rebuild menus and update icons if storage changes ---
chrome.storage.onChanged.addListener((changes, namespace) => {
  // If the list of saved tabs changes, update the icons on all open tabs
  if (changes.savedTabs) {
    updateAllTabs();
  }
});

// =======================================================
// NEW FEATURE: ICON AND BADGE UPDATE LOGIC
// =======================================================

// --- Listen for when the user switches to a different tab ---
chrome.tabs.onActivated.addListener((activeInfo) => {
  chrome.tabs.get(activeInfo.tabId, (tab) => {
    if (chrome.runtime.lastError) return;
    updateIconAndBadgeForTab(tab);
  });
});

// --- Listen for when a tab's URL changes ---
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  // Check only when the tab has finished loading to avoid multiple checks
  if (changeInfo.status === "complete") {
    updateIconAndBadgeForTab(tab);
  }


});



/**
 * Checks all open tabs and updates their icons.
 * Called when the saved items list changes.
 */
function updateAllTabs() {
  chrome.tabs.query({}, (tabs) => {
    for (const tab of tabs) {
      updateIconAndBadgeForTab(tab);
    }
  });
}

/**
 * Checks a single tab's URL against the saved list and updates the icon and badge.
 * @param {chrome.tabs.Tab} tab The tab to check.
 */
async function updateIconAndBadgeForTab(tab) {
  // Ensure we have a valid tab with an http URL
  if (!tab || !tab.id || !tab.url || !tab.url.startsWith("http")) {
    return;
  }

  const data = await chrome.storage.local.get(["savedTabs"]);
  const savedTabs = data.savedTabs || [];
  const savedItem = savedTabs.find((item) => item.url === tab.url);

  if (savedItem) {
    // URL is saved: change icon to "saved" version and show date in a badge
    chrome.action.setIcon({
      path: {
        16: "icons/icon16-saved.png",
        32: "icons/icon32-saved.png",
        48: "icons/icon48-saved.png",
        128: "icons/icon128-saved.png",
      },
      tabId: tab.id,
    });
    if (savedItem.date) {
      const date = new Date(savedItem.date + "T00:00:00");
      const badgeText = `${date.getDate()}/${date.getMonth() + 1}`; // e.g., "15/8"
      chrome.action.setBadgeText({
        text: badgeText,
        tabId: tab.id,
      });
      chrome.action.setBadgeBackgroundColor({ color: "#4285f4", tabId: tab.id });
    } else {
      // Saved but NO DATE
      chrome.action.setBadgeText({
        text: "?",
        tabId: tab.id,
      });
      chrome.action.setBadgeBackgroundColor({ color: "#FBBC04", tabId: tab.id });
    }
  } else {
    // URL is not saved: revert icon to default and clear badge
    chrome.action.setIcon({
      path: {
        16: "icons/icon16.png",
        32: "icons/icon32.png",
        48: "icons/icon48.png",
        128: "icons/icon128.png",
      },
      tabId: tab.id,
    });
    chrome.action.setBadgeText({ text: "", tabId: tab.id });
  }
}

// =======================================================
// CONTEXT MENU LOGIC (Unchanged)
// =======================================================

function rebuildContextMenus() {
  chrome.contextMenus.removeAll(() => {
    // Single Context Menu Item
    chrome.contextMenus.create({
      id: "saveAuto",
      title: "Save for Later (Auto-detect)",
      contexts: ["page", "link"],
    });

    // Separator and Custom Date
    chrome.contextMenus.create({
      id: "separator1",
      type: "separator",
      contexts: ["page", "link"],
    });
    chrome.contextMenus.create({
      id: "customDate",
      title: "Custom Date...",
      contexts: ["page", "link"],
    });
  });
}

chrome.commands.onCommand.addListener((command) => {
  if (command !== "save-for-later-auto-detect") return;
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];
    if (!tab || !tab.id || !tab.url || !tab.url.startsWith("http")) return;
    processAutoSave(tab, tab.url);
  });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  const url = info.linkUrl || info.pageUrl || tab.url;

  // 1. One Click Auto Save
  if (info.menuItemId === "saveAuto") {
    processAutoSave(tab, url);
  }
  // 2. Check Custom Date
  else if (info.menuItemId === "customDate") {
    const optionsUrl =
      chrome.runtime.getURL("options.html") +
      `?action=add&url=${encodeURIComponent(url)}`;
    chrome.tabs.create({ url: optionsUrl });
  }
});

// Helper function for Auto Save
async function processAutoSave(tab, url) {
  let detectedResult = null;
  let prize = null;

  // Try to get detected days and prize from content script
  if (tab.url.includes("x.com") || tab.url.includes("twitter.com") || tab.url.includes("gleam.io") || tab.url.includes("sweepwidget.com")) {
    try {
      const response = await chrome.tabs.sendMessage(tab.id, { action: "getDetectedDays" });
      console.log("[Background] Response from content script:", response);
      if (response) {
        if (response.result) {
          detectedResult = response.result;
        }
        if (response.prize != null && response.prize !== "") {
          prize = response.prize;
          console.log("[Background] Prize detected:", prize);
        }
      }
    } catch (e) {
      console.log("[Background] Could not fetch detected days (content script error?).", e);
    }
  }

  // Determine Date String
  let dateString = "";

  if (detectedResult) {
    if (detectedResult.type === 'absolute') {
      dateString = detectedResult.value;
    }
    else if (detectedResult.type === 'relative') {
      const days = detectedResult.value;
      let baseDate = new Date();

      // Try to get Tweet Date as base
      try {
        const response = await chrome.tabs.sendMessage(tab.id, { action: "getPageDate" });
        if (response && response.dateStr) {
          baseDate = new Date(response.dateStr);
        }
      } catch (e) {
        // Keep system date as base
      }

      baseDate.setHours(12, 0, 0, 0);

      const targetDate = new Date(baseDate);
      targetDate.setDate(targetDate.getDate() + days);

      const year = targetDate.getFullYear();
      const month = String(targetDate.getMonth() + 1).padStart(2, "0");
      const day = String(targetDate.getDate()).padStart(2, "0");
      dateString = `${year}-${month}-${day}`;
    }
  }

  let title = url;
  if (url.includes("gleam.io")) {
    const rawTitle = tab.title || url;
    title = rawTitle.toLowerCase().includes("gleam") ? rawTitle : `${rawTitle} Gleam`;
  } else if (url.includes("sweepwidget.com")) {
    const rawTitle = tab.title || url;
    title = rawTitle.toLowerCase().includes("sweepwidget") ? rawTitle : `${rawTitle} SweepWidget`;
  }

  saveItemDirectly(url, dateString, prize, title);
}



async function saveItemDirectly(url, dateString, prize = null, title = null) {
  try {
    const data = await chrome.storage.local.get(["savedTabs"]);
    const savedTabs = data.savedTabs || [];
    const existingIndex = savedTabs.findIndex(
      (tab) => tab.url === url && tab.date === dateString
    );
    if (existingIndex !== -1) {
      if (prize != null && prize !== "") {
        savedTabs[existingIndex].prize = prize;
        await chrome.storage.local.set({ savedTabs });
      }
      return;
    }
    const newItem = {
      id: Date.now().toString(),
      title: title || url,
      url,
      date: dateString,
      dateAdded: new Date().toISOString(),
    };
    if (prize != null && prize !== "") {
      newItem.prize = prize;
    }
    savedTabs.push(newItem);
    await chrome.storage.local.set({ savedTabs });
  } catch (e) {
    console.error("Save for Later: Failed to save item directly.", e);
  }
}




// =======================================================
// FEATURE: INSTAGRAM REEL TO POST CONVERTER
// =======================================================
chrome.webNavigation.onBeforeNavigate.addListener(
  async (details) => {
    // Only redirect if it's the main frame (not an iframe)
    if (details.frameId === 0) {
      const data = await chrome.storage.local.get({
        redirectSettings: { instagram: true, telegram: true, stake: true },
      });
      if (data.redirectSettings.instagram === false) return;
      const newUrl = details.url.replace("/reel/", "/p/");
      chrome.tabs.update(details.tabId, { url: newUrl });
    }
  },
  {
    url: [
      { hostSuffix: "instagram.com", pathContains: "/reel/" }
    ]
  }
);

// =======================================================
// OTHER FEATURES (Unchanged)
// =======================================================
chrome.webNavigation.onBeforeNavigate.addListener(
  async (details) => {
    if (details.frameId === 0) {
      const data = await chrome.storage.local.get({
        redirectSettings: { instagram: true, telegram: true, stake: true },
      });
      if (data.redirectSettings.telegram === false) return;
      const url = new URL(details.url);
      if (url.hostname === "t.me") {
        const newUrl = `https://telegram.me${url.pathname}`;
        chrome.tabs.update(details.tabId, { url: newUrl });
      }
    }
  },
  { url: [{ hostEquals: "t.me" }] }
);

// =======================================================
// FEATURE: STAKE.COM TO STAKE.AC REDIRECT
// =======================================================
chrome.webNavigation.onBeforeNavigate.addListener(
  async (details) => {
    if (details.frameId === 0) {
      const data = await chrome.storage.local.get({
        redirectSettings: { instagram: true, telegram: true, stake: true },
      });
      if (data.redirectSettings.stake === false) return;
      const url = new URL(details.url);
      if (url.hostname === "stake.com" || url.hostname.endsWith(".stake.com")) {
        url.hostname = url.hostname.replace(/stake\.com$/, "stake.ac");
        chrome.tabs.update(details.tabId, { url: url.toString() });
      }
    }
  },
  {
    url: [
      { hostSuffix: "stake.com" },
      { hostEquals: "stake.com" }
    ]
  }
);