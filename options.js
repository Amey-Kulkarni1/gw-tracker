document.addEventListener("DOMContentLoaded", () => {
  // Initialize save for later module
  saveForLaterApp.init();
  settingsApp.init();

  // Initialize main data management listeners (inside settings modal)
  document
    .getElementById("exportData")
    .addEventListener("click", handleExportAll);
  document
    .getElementById("importData")
    .addEventListener("click", () =>
      document.getElementById("importFile").click()
    );
  document
    .getElementById("importFile")
    .addEventListener("change", handleImport);
});

// =======================================================
// SETTINGS APP (Modal & Redirection Toggles)
// =======================================================
const settingsApp = {
  async init() {
    this.populateTimezones();
    this.setupEventListeners();
    await this.loadSettings();
  },

  populateTimezones() {
    const tzSelect = document.getElementById("settingTimezone");
    if (!tzSelect) return;

    if (typeof Intl !== "undefined" && typeof Intl.supportedValuesOf === "function") {
      try {
        const allZones = Intl.supportedValuesOf("timeZone");
        const existingValues = new Set(Array.from(tzSelect.options).map((o) => o.value));

        const optGroup = document.createElement("optgroup");
        optGroup.label = "All Time Zones";

        allZones.forEach((tz) => {
          if (!existingValues.has(tz)) {
            const opt = document.createElement("option");
            opt.value = tz;
            opt.textContent = tz;
            optGroup.appendChild(opt);
          }
        });

        if (optGroup.children.length > 0) {
          tzSelect.appendChild(optGroup);
        }
      } catch (e) {}
    }
  },

  setupEventListeners() {
    const modal = document.getElementById("settingsModal");
    const openBtn = document.getElementById("openSettingsBtn");
    const closeBtn = document.getElementById("closeSettingsBtn");

    openBtn.addEventListener("click", () => {
      this.loadSettings();
      modal.style.display = "flex";
    });

    closeBtn.addEventListener("click", () => {
      modal.style.display = "none";
    });

    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        modal.style.display = "none";
      }
    });

    document.getElementById("toggleInstagram").addEventListener("change", (e) => {
      this.updateRedirectSetting("instagram", e.target.checked);
    });
    document.getElementById("toggleTelegram").addEventListener("change", (e) => {
      this.updateRedirectSetting("telegram", e.target.checked);
    });
    document.getElementById("toggleStake").addEventListener("change", (e) => {
      this.updateRedirectSetting("stake", e.target.checked);
    });

    const tzSelect = document.getElementById("settingTimezone");
    if (tzSelect) {
      tzSelect.addEventListener("change", async (e) => {
        await chrome.storage.local.set({ timezone: e.target.value });
      });
    }
  },

  async loadSettings() {
    const data = await chrome.storage.local.get({
      redirectSettings: { instagram: true, telegram: true, stake: true },
      timezone: "UTC",
    });
    const s = data.redirectSettings || {};
    document.getElementById("toggleInstagram").checked = s.instagram !== false;
    document.getElementById("toggleTelegram").checked = s.telegram !== false;
    document.getElementById("toggleStake").checked = s.stake !== false;

    const tzSelect = document.getElementById("settingTimezone");
    if (tzSelect) {
      tzSelect.value = data.timezone || "UTC";
    }
  },

  async updateRedirectSetting(key, enabled) {
    const data = await chrome.storage.local.get({
      redirectSettings: { instagram: true, telegram: true, stake: true },
    });
    const s = data.redirectSettings || { instagram: true, telegram: true, stake: true };
    s[key] = enabled;
    await chrome.storage.local.set({ redirectSettings: s });
  },
};

// =======================================================
// UNIVERSAL MESSAGE & DATA HANDLERS
// =======================================================
function showMessage(text, type) {
  const messageDiv = document.getElementById("message");
  messageDiv.textContent = text;
  messageDiv.className = `message ${type}`;
  messageDiv.style.display = "block";
  setTimeout(() => {
    messageDiv.style.display = "none";
  }, 5000);
}

async function handleExportAll() {
  try {
    const sflData = await chrome.storage.local.get(["savedTabs"]);

    const combinedData = {
      saveForLaterData: sflData.savedTabs || [],
    };

    if (combinedData.saveForLaterData.length === 0) {
      showMessage("No data to export.", "error");
      return;
    }

    const dataStr = JSON.stringify(combinedData, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const date = new Date().toISOString().slice(0, 10);
    a.download = `gw-tracker-backup-${date}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showMessage("Data exported successfully!", "success");
  } catch (error) {
    showMessage(`Export failed: ${error.message}`, "error");
  }
}

function handleImport(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = async (e) => {
    try {
      const data = JSON.parse(e.target.result);
      let sflImported = 0;

      // Case 1: Backup file with saveForLaterData property
      if (data.saveForLaterData) {
        await saveForLaterApp.importData(data.saveForLaterData);
        sflImported = data.saveForLaterData.length;
      }
      // Case 2: Old "Save for Later" backup (is an array of tabs)
      else if (Array.isArray(data) && data[0] && data[0].dateAdded) {
        await saveForLaterApp.importData(data);
        sflImported = data.length;
      } else {
        throw new Error("File format not recognized.");
      }

      showMessage(
        `Import successful! Added ${sflImported} saved items.`,
        "success"
      );
    } catch (error) {
      showMessage(`Import failed: ${error.message}`, "error");
    } finally {
      event.target.value = null; // Reset file input
    }
  };
  reader.readAsText(file);
}

// =======================================================
// FEATURE 1: SAVE FOR LATER APP
// =======================================================
const saveForLaterApp = {
  savedTabs: [],
  editingId: null,
  lastCheckboxIndex: null,

  init() {
    this.loadSavedTabs();
    this.setupEventListeners();

    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("action") === "add") {
      document.getElementById("sflUrl").value = decodeURIComponent(
        urlParams.get("url") || ""
      );
      this.showAddForm();
    }

    // LISTENER FOR AUTO-UPDATES
    chrome.storage.onChanged.addListener((changes, namespace) => {
      if (namespace === 'local' && changes.savedTabs) {
        this.savedTabs = changes.savedTabs.newValue || [];
        this.render();
      }
    });
  },

  setupEventListeners() {
    document
      .getElementById("sflSaveForm")
      .addEventListener("submit", this.handleSave.bind(this));
    document
      .getElementById("sflAddNew")
      .addEventListener("click", this.showAddForm.bind(this));
    document
      .getElementById("sflCancelAdd")
      .addEventListener("click", this.hideAddForm.bind(this));
    document
      .getElementById("sflSortBy")
      .addEventListener("change", this.render.bind(this));
    document
      .getElementById("sflSortOrder")
      .addEventListener("change", this.render.bind(this));
    document
      .getElementById("sflOpenTodays")
      .addEventListener("click", this.openTodaysUrls.bind(this));
    document
      .getElementById("sflOpenTomorrows")
      .addEventListener("click", this.openTomorrowsUrls.bind(this));
    document
      .getElementById("sflDeleteSelected")
      .addEventListener("click", this.handleDeleteSelected.bind(this));
    document
      .getElementById("sflSelectAllCheckbox")
      .addEventListener("change", this.handleSelectAll.bind(this));
    document
      .getElementById("sflTabsList")
      .addEventListener("click", this.handleTabsListClick.bind(this));
    document
      .getElementById("sflTabsList")
      .addEventListener("change", (e) => {
        if (e.target.classList.contains("tab-date-picker")) {
          this.handleDateChange(e);
        } else if (e.target.classList.contains("item-checkbox")) {
          this.updateSelectAllState();
        }
      });
    document
      .getElementById("sflTabsList")
      .addEventListener(
        "click",
        this.handleSavedItemsCheckboxClick.bind(this),
        true
      );
    document.addEventListener("keydown", this.handleOptionsPageKeydown.bind(this));
  },

  handleSavedItemsCheckboxClick(e) {
    if (!e.target.classList.contains("item-checkbox")) return;
    const boxes = Array.from(
      document.querySelectorAll("#sflTabsList .item-checkbox")
    );
    const currentIdx = boxes.indexOf(e.target);
    if (currentIdx === -1) return;
    if (e.shiftKey && this.lastCheckboxIndex !== null) {
      const start = Math.min(this.lastCheckboxIndex, currentIdx);
      const end = Math.max(this.lastCheckboxIndex, currentIdx);
      const isChecked = e.target.checked;
      for (let i = start; i <= end; i++) boxes[i].checked = isChecked;
      this.updateSelectAllState();
    }
    this.lastCheckboxIndex = currentIdx;
  },

  handleOptionsPageKeydown(e) {
    if (e.key !== "Delete") return;
    const el = document.activeElement;
    if (el && el.tagName === "INPUT") {
      const t = el.type;
      if (
        t === "text" ||
        t === "url" ||
        t === "date" ||
        t === "search" ||
        t === "number" ||
        t === "email" ||
        t === "password"
      ) {
        return;
      }
    }
    if (el && el.tagName === "TEXTAREA") return;
    if (el && el.tagName === "SELECT") return;
    const selected = document.querySelectorAll(
      "#sflTabsList .item-checkbox:checked"
    );
    if (selected.length === 0) return;
    e.preventDefault();
    this.handleDeleteSelected();
  },

  async loadSavedTabs() {
    const result = await chrome.storage.local.get(["savedTabs"]);
    this.savedTabs = result.savedTabs || [];
    this.render();
  },

  async saveTabsToStorage() {
    try {
      await chrome.storage.local.set({ savedTabs: this.savedTabs });
      return true;
    } catch (error) {
      showMessage("Error saving items: " + error.message, "error");
      return false;
    }
  },

  async importData(data) {
    const result = await chrome.storage.local.get(["savedTabs"]);
    this.savedTabs = result.savedTabs || [];
    const existingUrls = new Set(this.savedTabs.map((tab) => tab.url));
    const newItems = data.filter(
      (item) => item.url && !existingUrls.has(item.url)
    );
    this.savedTabs.push(...newItems);
    await this.saveTabsToStorage();
    this.render();
  },

  render() {
    const tabsList = document.getElementById("sflTabsList");
    const noTabs = document.getElementById("sflNoTabs");
    this.lastCheckboxIndex = null;
    if (this.savedTabs.length === 0) {
      tabsList.innerHTML = "";
      noTabs.style.display = "block";
      return;
    }
    noTabs.style.display = "none";

    const comparePrizes = (a, b) => {
      const hasA = a.prize != null && a.prize !== "";
      const hasB = b.prize != null && b.prize !== "";
      if (!hasA && !hasB) return 0;
      if (hasA && !hasB) return -1;
      if (!hasA && hasB) return 1;

      const aIsText = typeof a.prize === "string";
      const bIsText = typeof b.prize === "string";

      if (aIsText && bIsText) {
        return a.prize.localeCompare(b.prize);
      }
      if (aIsText && !bIsText) return -1;
      if (!aIsText && bIsText) return 1;

      const aPrize = typeof a.prize === "number" ? a.prize : 0;
      const bPrize = typeof b.prize === "number" ? b.prize : 0;
      return bPrize - aPrize;
    };

    const sortedTabs = [...this.savedTabs].sort((a, b) => {
      // 1. Prioritize Empty Dates
      if (!a.date && b.date) return -1;
      if (a.date && !b.date) return 1;
      if (!a.date && !b.date) {
        // Both empty dates: sort by prize (text prizes like gloves/knives/skins first, then dollar prizes)
        return comparePrizes(a, b);
      }

      // 2. Normal Sorting
      const sortBy = document.getElementById("sflSortBy").value;
      const sortOrder = document.getElementById("sflSortOrder").value;

      let aVal, bVal;

      if (sortBy === "title") {
        aVal = a.title.toLowerCase();
        bVal = b.title.toLowerCase();
      } else {
        // Date or DateAdded
        aVal = new Date(sortBy === "date" ? a.date : a.dateAdded);
        bVal = new Date(sortBy === "date" ? b.date : b.dateAdded);
      }

      let primaryCompare;
      if (aVal < bVal) primaryCompare = sortOrder === "asc" ? -1 : 1;
      else if (aVal > bVal) primaryCompare = sortOrder === "asc" ? 1 : -1;
      else primaryCompare = 0;

      // If dates are equal, sort by prize (text prizes first, then highest USD)
      if (primaryCompare === 0 && sortBy === "date") {
        return comparePrizes(a, b);
      }

      return primaryCompare;
    });

    tabsList.innerHTML = sortedTabs
      .map((tab) => {
        const isToday = (dateStr) => {
          if (!dateStr) return false;
          const date = new Date(dateStr + "T00:00:00");
          const today = new Date();
          return (
            date.getFullYear() === today.getFullYear() &&
            date.getMonth() === today.getMonth() &&
            date.getDate() === today.getDate()
          );
        };

        const escapeHtml = (text) => {
          const d = document.createElement("div");
          d.textContent = text;
          return d.innerHTML;
        };

        const dateValue = tab.date ? tab.date : "";
        const emptyClass = !tab.date ? "empty-date" : "";
        const todayClass = isToday(tab.date) ? 'style="border-color: #4285f4; background: #1e3a5f;"' : "";

        const prizeHtml =
          tab.prize != null && tab.prize !== ""
            ? `<span class="tab-prize">${
                typeof tab.prize === "number"
                  ? "$" + tab.prize.toLocaleString()
                  : String(tab.prize)
              }</span>`
            : "";

        return `
          <div class="tab-item" data-id="${tab.id}">
            <div class="item-selection"><input type="checkbox" class="item-checkbox" data-id="${tab.id}"></div>
            <div class="tab-info">
              <a href="${escapeHtml(tab.url)}" class="tab-title-link" target="_blank">${escapeHtml(tab.title)}</a>
              ${prizeHtml}
            </div>
            <div class="tab-actions">
              <input type="date" class="tab-date-picker ${emptyClass}" value="${dateValue}" data-id="${tab.id}" ${todayClass}>
              <button class="btn-danger btn-small" data-action="delete">Delete</button>
            </div>
          </div>`;
      })
      .join("");
    this.updateSelectAllState();
  },

  async handleSave(e) {
    e.preventDefault();
    const url = document.getElementById("sflUrl").value.trim();
    const date = document.getElementById("sflDate").value;
    if (!url || !date) return;

    // =======================================================
    // ADDED DUPLICATE CHECK
    // =======================================================
    // This new block checks if the URL is already saved for the exact same date
    // before adding or updating it.
    const isDuplicate = this.savedTabs.some(
      (tab) => tab.url === url && tab.date === date && tab.id !== this.editingId
    );

    if (isDuplicate) {
      showMessage("This URL is already saved for this exact date.", "error");
      return; // Stop the function if a duplicate is found
    }
    // =======================================================
    // END OF ADDED CODE
    // =======================================================

    const createTitleFromUrl = (url) => {
      if (url.length > 150) {
        return url.substring(0, 150) + "...";
      }
      return url;
    };

    const tabData = {
      id: this.editingId || Date.now().toString(),
      title: createTitleFromUrl(url), // Use the new helper function here
      url,
      date,
      dateAdded: this.editingId
        ? this.savedTabs.find((t) => t.id === this.editingId)?.dateAdded
        : new Date().toISOString(),
    };

    if (this.editingId) {
      const index = this.savedTabs.findIndex((t) => t.id === this.editingId);
      if (index >= 0) this.savedTabs[index] = tabData;
    } else {
      this.savedTabs.push(tabData);
    }

    if (await this.saveTabsToStorage()) {
      showMessage("Item saved successfully!", "success");
      this.hideAddForm();
      this.render();
    }
  },

  async handleDateChange(e) {
    const id = e.target.dataset.id;
    const newDate = e.target.value;
    const tabIndex = this.savedTabs.findIndex(t => t.id === id);

    if (tabIndex === -1) return;

    // Optional: Duplicate Check for new date (skipping for now to be less annoying on direct edits)

    this.savedTabs[tabIndex].date = newDate;

    if (await this.saveTabsToStorage()) {
      // Visual feedback
      const originalBorder = e.target.style.borderColor;
      e.target.style.borderColor = "#4285f4";
      setTimeout(() => {
        e.target.style.borderColor = originalBorder;
        // Re-render to sort if sort-by-date is active, but maybe delay it or wait for refresh?
        // For now, let's NOT re-render immediately to avoid jumpiness, 
        // unless the user refreshes or changes sort.
        // But we SHOULD update valid/invalid styling
        if (newDate) {
          e.target.classList.remove("empty-date");
        } else {
          e.target.classList.add("empty-date");
        }
      }, 500);
    }
  },

  handleTabsListClick(e) {
    if (!e.target.matches(".btn-small")) return;
    const id = e.target.closest(".tab-item").dataset.id;
    const action = e.target.dataset.action;

    if (action === "delete") {
      if (!confirm("Are you sure?")) return;
      this.savedTabs = this.savedTabs.filter((t) => t.id !== id);
      this.saveTabsToStorage().then(() => this.render());
    }
  },

  async handleDeleteSelected() {
    const selectedIds = Array.from(
      document.querySelectorAll("#sflTabsList .item-checkbox:checked")
    ).map((cb) => cb.dataset.id);
    if (selectedIds.length === 0) return;
    if (!confirm(`Delete ${selectedIds.length} items?`)) return;
    this.savedTabs = this.savedTabs.filter(
      (tab) => !selectedIds.includes(tab.id)
    );
    if (await this.saveTabsToStorage()) this.render();
  },

  handleSelectAll(e) {
    document
      .querySelectorAll("#sflTabsList .item-checkbox")
      .forEach((cb) => (cb.checked = e.target.checked));
  },

  updateSelectAllState() {
    const all = document.querySelectorAll("#sflTabsList .item-checkbox");
    const checked = document.querySelectorAll(
      "#sflTabsList .item-checkbox:checked"
    );
    const selectAll = document.getElementById("sflSelectAllCheckbox");
    if (all.length > 0 && all.length === checked.length) {
      selectAll.checked = true;
      selectAll.indeterminate = false;
    } else if (checked.length > 0) {
      selectAll.checked = false;
      selectAll.indeterminate = true;
    } else {
      selectAll.checked = false;
      selectAll.indeterminate = false;
    }
  },

  openTodaysUrls() {
    const isToday = (d) =>
      new Date(d).toDateString() === new Date().toDateString();
    this.savedTabs
      .filter((t) => isToday(t.date))
      .forEach((t) => chrome.tabs.create({ url: t.url }));
  },

  openTomorrowsUrls() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const isTomorrow = (d) =>
      new Date(d).toDateString() === tomorrow.toDateString();
    this.savedTabs
      .filter((t) => isTomorrow(t.date))
      .forEach((t) => chrome.tabs.create({ url: t.url }));
  },

  showAddForm() {
    document.getElementById("sflAddForm").style.display = "block";
    document.getElementById("sflUrl").focus();
    if (!document.getElementById("sflDate").value) {
      document.getElementById("sflDate").value = new Date()
        .toISOString()
        .split("T")[0];
    }
  },

  hideAddForm() {
    document.getElementById("sflAddForm").style.display = "none";
    document.getElementById("sflSaveForm").reset();
    this.editingId = null;
  },
};

