// --- Helper: Extracts "gleam.io/CODE" from a full URL ---
function getGleamSignature(urlString) {
  try {
    const url = new URL(urlString);
    if (!url.hostname.includes('gleam.io')) return null;
    const pathParts = url.pathname.split('/').filter(p => p.length > 0);
    if (pathParts.length > 0) {
      return `gleam.io/${pathParts[0]}`;
    }
  } catch (e) { }
  return null;
}

// --- Gleam Helper Logic ---
function initGleamHelper() {
  const checkInterval = setInterval(() => {
    const timerSpan = document.querySelector('span[data-ends]');
    if (timerSpan) {
      clearInterval(checkInterval);
      createOverlay(timerSpan);
    }
  }, 1000);
}

async function createOverlay(element) {
  const epoch = parseInt(element.getAttribute("data-ends"));
  if (isNaN(epoch)) return;

  const endDate = new Date(epoch * 1000);
  const istString = endDate.toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short'
  });
  const saveDateString = endDate.getFullYear() + '-' +
    String(endDate.getMonth() + 1).padStart(2, '0') + '-' +
    String(endDate.getDate()).padStart(2, '0');

  const container = document.createElement('div');
  container.style.cssText = `
    position: fixed; bottom: 20px; right: 20px; z-index: 2147483647;
    background: #1e1e1e; border: 1px solid #4285f4; border-radius: 8px;
    padding: 15px; box-shadow: 0 4px 12px rgba(0,0,0,0.5);
    font-family: -apple-system, sans-serif; color: white; text-align: center;
  `;

  const text = document.createElement('div');
  text.innerText = `Ends (IST): ${istString}`;
  text.style.marginBottom = '10px'; text.style.fontSize = '14px';

  const btn = document.createElement('button');
  btn.style.cssText = `
    background: #4285f4; color: white; border: none; padding: 8px 16px;
    border-radius: 4px; cursor: pointer; font-weight: bold; font-size: 13px;
  `;

  const currentSignature = getGleamSignature(window.location.href);
  const data = await chrome.storage.local.get(["savedTabs"]);
  const savedTabs = data.savedTabs || [];

  const isAlreadySaved = savedTabs.some(tab => {
    const savedSignature = getGleamSignature(tab.url);
    return currentSignature && savedSignature && currentSignature === savedSignature;
  });

  if (isAlreadySaved) {
    updateButtonState(btn, true);
  } else {
    updateButtonState(btn, false);
    btn.onclick = () => saveGleamUrl(window.location.href, saveDateString, btn);
  }

  container.appendChild(text);
  container.appendChild(btn);
  document.body.appendChild(container);
}

function updateButtonState(btn, isSaved) {
  if (isSaved) {
    btn.innerText = "✓ Saved";
    btn.style.background = "#2e7d32";
    btn.style.cursor = "default";
    btn.disabled = true;
  } else {
    btn.innerText = "Save to this Date";
    btn.style.background = "#4285f4";
    btn.style.cursor = "pointer";
    btn.disabled = false;
  }
}

async function saveGleamUrl(url, dateStr, btn) {
  const data = await chrome.storage.local.get(["savedTabs"]);
  const savedTabs = data.savedTabs || [];
  const currentSignature = getGleamSignature(url);

  const isDuplicate = savedTabs.some(tab => {
    const savedSignature = getGleamSignature(tab.url);
    return currentSignature && savedSignature && currentSignature === savedSignature;
  });

  if (isDuplicate) {
    updateButtonState(btn, true);
    return;
  }

  savedTabs.push({
    id: Date.now().toString(), title: document.title || url,
    url: url, date: dateStr, dateAdded: new Date().toISOString(),
  });
  await chrome.storage.local.set({ savedTabs });
  updateButtonState(btn, true);
}

// =======================================================
// PART 2: TWITTER / X DATE PARSING
// =======================================================

function parseAbsoluteDate(text) {
  const currentYear = new Date().getFullYear();

  // 1. DD/MM/YY(YY)
  // Matches: 28/02/26, 28/02/2026
  const dateSlashMatch = text.match(/\b(\d{1,2})\/(\d{1,2})\/(\d{2,4})\b/);
  if (dateSlashMatch) {
    let [_, day, month, year] = dateSlashMatch;
    if (year.length === 2) year = "20" + year;
    return { type: 'absolute', value: `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}` };
  }

  const monthNames = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];

  // 2. Month Day(st/nd/rd/th) (Year)
  // Matches: Feb 14th, February 14, Feb 21st 2026
  const monthRegex = new RegExp(`\\b(${monthNames.join("|")})[a-z]*\\s+(\\d{1,2})(?:st|nd|rd|th)?(?:,?\\s+(\\d{4}))?\\b`, "i");
  const monthFirstMatch = text.match(monthRegex);
  if (monthFirstMatch) {
    let [_, monthStr, day, year] = monthFirstMatch;
    let monthIndex = monthNames.findIndex(m => monthStr.toLowerCase().startsWith(m));
    let month = String(monthIndex + 1).padStart(2, '0');
    if (!year) {
      year = currentYear;
      // Logic: If date < today - 1 day, assume next year?
      // Example: Today is Mar 1. Text says "Feb 28". Likely next year.
      // Example: Today is Feb 10. Text says "Feb 12". Likely this year.
      const testDate = new Date(`${year}-${month}-${day.padStart(2, '0')}`);
      if (testDate < new Date(new Date().getTime() - 86400000)) {
        year = currentYear + 1;
      }
    }
    return { type: 'absolute', value: `${year}-${month}-${day.padStart(2, '0')}` };
  }

  // 3. Day(st/nd/rd/th) Month (Year)
  // Matches: 14th February, 14 Feb 2026
  const dayRegex = new RegExp(`\\b(\\d{1,2})(?:st|nd|rd|th)?\\s+(${monthNames.join("|")})[a-z]*(?:,?\\s+(\\d{4}))?\\b`, "i");
  const dayFirstMatch = text.match(dayRegex);
  if (dayFirstMatch) {
    let [_, day, monthStr, year] = dayFirstMatch;
    let monthIndex = monthNames.findIndex(m => monthStr.toLowerCase().startsWith(m));
    let month = String(monthIndex + 1).padStart(2, '0');
    if (!year) {
      year = currentYear;
      const testDate = new Date(`${year}-${month}-${day.padStart(2, '0')}`);
      if (testDate < new Date(new Date().getTime() - 86400000)) {
        year = currentYear + 1;
      }
    }
    return { type: 'absolute', value: `${year}-${month}-${day.padStart(2, '0')}` };
  }

  return null;
}

function extractDaysFromText(text) {
  if (!text) return null;

  // 1. Absolute Date Parsing
  const absDate = parseAbsoluteDate(text);
  if (absDate) return absDate;

  text = text.toLowerCase();

  // 2. Relative Parsing
  // Hours (e.g. 72h)
  const hourMatch = text.match(/(\d+)\s*(?:h|hr|hrs|hours)/);
  if (hourMatch) return { type: 'relative', value: Math.ceil(parseInt(hourMatch[1]) / 24) };

  // Days (e.g. 7 days)
  const dayMatch = text.match(/(\d+)\s*days?/);
  if (dayMatch) return { type: 'relative', value: parseInt(dayMatch[1]) };

  // Weeks
  if (text.includes("a week") || text.includes("one week")) return { type: 'relative', value: 7 };
  const weekMatch = text.match(/(\d+)\s*weeks?/);
  if (weekMatch) return { type: 'relative', value: parseInt(weekMatch[1]) * 7 };

  // Months
  if (/\b(?:a|one)\s+months?\b/i.test(text)) return { type: 'relative', value: 30 };
  const monthMatch = text.match(/(\d+)\s*months?/);
  if (monthMatch) return { type: 'relative', value: parseInt(monthMatch[1]) * 30 };
  if (/\bmonths?\b/i.test(text)) return { type: 'relative', value: 30 };

  return null;
}

function extractPrizeFromText(text) {
  if (!text) return null;

  // Patterns to match USD amounts (first match wins)
  const patterns = [
    /\$(\d+(?:,\d{3})*(?:\.\d{2})?)/,           // $50, $100, $50.00, $1,000
    /(\d+(?:,\d{3})*(?:\.\d{2})?)\s*\$/,         // 50$, 100$, 50.00$
    /(\d+(?:,\d{3})*(?:\.\d{2})?)\s*USD/i,       // 50 USD, 100 USD
    /USD\s*(\d+(?:,\d{3})*(?:\.\d{2})?)/i,       // USD 50, USD 100
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const amount = parseFloat(match[1].replace(/,/g, ''));
      if (!isNaN(amount) && amount > 0) {
        return amount;
      }
    }
  }

  const specificKnives = [
    { regex: /\bm9\s+bayonet\b/i, name: "m9 bayonet knife" },
    { regex: /\bshadow\s+daggers?\b/i, name: "shadow daggers knife" },
    { regex: /\bbowie\b/i, name: "bowie knife" },
    { regex: /\bbutterfly\b/i, name: "butterfly knife" },
    { regex: /\bclassic\b/i, name: "classic knife" },
    { regex: /\bfalchion\b/i, name: "falchion knife" },
    { regex: /\bflip\b/i, name: "flip knife" },
    { regex: /\bgut\b/i, name: "gut knife" },
    { regex: /\bhuntsman\b/i, name: "huntsman knife" },
    { regex: /\bkarambit\b/i, name: "karambit knife" },
    { regex: /\bkukri\b/i, name: "kukri knife" },
    { regex: /\bbayonet\b/i, name: "bayonet knife" },
    { regex: /\bnavaja\b/i, name: "navaja knife" },
    { regex: /\bnomad\b/i, name: "nomad knife" },
    { regex: /\bparacord\b/i, name: "paracord knife" },
    { regex: /\bskeleton\b/i, name: "skeleton knife" },
    { regex: /\bstiletto\b/i, name: "stiletto knife" },
    { regex: /\bsurvival\b/i, name: "survival knife" },
    { regex: /\btalon\b/i, name: "talon knife" },
    { regex: /\bursus\b/i, name: "ursus knife" },
  ];

  for (const k of specificKnives) {
    if (k.regex.test(text)) {
      return k.name;
    }
  }

  if (/\bknife\b/i.test(text)) return "knife";

  if (/\bgloves?\b/i.test(text)) return "gloves";

  const weaponModels = [
    { regex: /\bak[- ]?47\b/i, name: "AK-47" },
    { regex: /\bm4a1[- ]?s\b/i, name: "M4A1-S" },
    { regex: /\bm4a4\b/i, name: "M4A4" },
    { regex: /\bm4a1\b/i, name: "M4A1" },
    { regex: /\bawp\b/i, name: "AWP" },
    { regex: /\bdesert\s+eagle\b/i, name: "Desert Eagle" },
    { regex: /\bdeagle\b/i, name: "Deagle" },
    { regex: /\busp[- ]?s\b/i, name: "USP-S" },
    { regex: /\busp\b/i, name: "USP" },
    { regex: /\bglock(?:[- ]?18)?\b/i, name: "Glock" },
    { regex: /\bgalil(?:[- ]?ar)?\b/i, name: "Galil" },
    { regex: /\bfamas\b/i, name: "FAMAS" },
    { regex: /\bmp9\b/i, name: "MP9" },
    { regex: /\bmac[- ]?10\b/i, name: "MAC-10" },
    { regex: /\bp250\b/i, name: "P250" },
    { regex: /\bfive[- ]?seven\b/i, name: "Five-SeveN" },
    { regex: /\bcz75(?:[- ]?auto)?\b/i, name: "CZ75-Auto" },
    { regex: /\btec[- ]?9\b/i, name: "Tec-9" },
    { regex: /\bssg(?:[- ]?08)?\b/i, name: "SSG 08" },
    { regex: /\bscout\b/i, name: "Scout" },
    { regex: /\bsg[- ]?553\b/i, name: "SG 553" },
    { regex: /\baug\b/i, name: "AUG" },
    { regex: /\bmp7\b/i, name: "MP7" },
    { regex: /\bp90\b/i, name: "P90" },
    { regex: /\bump(?:[- ]?45)?\b/i, name: "UMP-45" },
    { regex: /\b(?:pp[- ]?)?bizon\b/i, name: "PP-Bizon" },
    { regex: /\bnova\b/i, name: "Nova" },
    { regex: /\bxm1014\b/i, name: "XM1014" },
    { regex: /\bmag[- ]?7\b/i, name: "MAG-7" },
    { regex: /\bsawed[- ]?off\b/i, name: "Sawed-Off" },
    { regex: /\bm249\b/i, name: "M249" },
    { regex: /\bnegev\b/i, name: "Negev" },
    { regex: /\bg3sg1\b/i, name: "G3SG1" },
    { regex: /\bscar[- ]?20\b/i, name: "SCAR-20" },
  ];

  for (const weapon of weaponModels) {
    if (weapon.regex.test(text)) {
      return weapon.name;
    }
  }

  const cs2SkinHints = [
    /\bcs2\b/i,
    /\bcsgo\b/i,
    /\bfactory\s+new\b/i,
    /\bminimal\s+wear\b/i,
    /\bfield[\s-]?tested\b/i,
    /\bwell\s+worn\b/i,
    /\bbattle\s+scarred\b/i,
    /\bfn\b/i,
    /\bmw\b/i,
    /\bft\b/i,
    /\bww\b/i,
    /\bbs\b/i,
  ];
  if (cs2SkinHints.some((re) => re.test(text))) return "cs2 skin";

  return null;
}

function extractGleamDate() {
  const endsElement = document.querySelector('[data-ends]');
  if (endsElement) {
    const endsTimestamp = endsElement.getAttribute('data-ends');
    if (endsTimestamp) {
      const date = new Date(parseInt(endsTimestamp) * 1000);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return { type: 'absolute', value: `${year}-${month}-${day}` };
    }
  }
  return null;
}

// Listen for the background script asking for the date
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getDetectedDays") {
    let result = null;
    let prize = null;

    // Check for Gleam.io first
    if (window.location.hostname.includes("gleam.io")) {
      result = extractGleamDate();
    }

    // For Twitter/X pages, extract date and prize from tweet text
    let tweetTextEl = null;
    const statusMatch = window.location.pathname.match(/\/status\/(\d+)/);
    if (statusMatch && statusMatch[1]) {
      const link = document.querySelector(`a[href*="/status/${statusMatch[1]}"]`);
      if (link) {
        const article = link.closest('article');
        if (article) {
          tweetTextEl = article.querySelector('[data-testid="tweetText"]');
        }
      }
    }
    if (!tweetTextEl) {
      tweetTextEl = document.querySelector('[data-testid="tweetText"]');
    }

    if (tweetTextEl) {
      const text = tweetTextEl.innerText || tweetTextEl.textContent || "";
      console.log("[Content] Tweet text:", text);
      // Only extract date if we don't have one from Gleam
      if (!result) {
        result = extractDaysFromText(text);
      }
      // Always try to extract prize from tweet text
      prize = extractPrizeFromText(text);
      console.log("[Content] Extracted prize:", prize);
    }

    console.log("[Content] Sending response:", { result, prize });
    sendResponse({ result: result, prize: prize });
    return true;
  }
  else if (request.action === "getPageDate") {
    let dateStr = null;
    const currentUrl = window.location.href;
    const statusMatch = currentUrl.match(/\/status\/(\d+)/);

    if (statusMatch && statusMatch[1]) {
      const tweetId = statusMatch[1];
      const allTimes = document.querySelectorAll('time');
      for (const timeEl of allTimes) {
        const parentLink = timeEl.closest('a');
        if (parentLink && parentLink.href.includes(tweetId)) {
          dateStr = timeEl.getAttribute('datetime');
          break;
        }
      }
    }
    if (!dateStr) {
      const mainTime = document.querySelector('article [data-testid="User-Name"] time');
      if (mainTime) dateStr = mainTime.getAttribute('datetime');
    }
    if (!dateStr) {
      const anyTime = document.querySelector('article time');
      if (anyTime) dateStr = anyTime.getAttribute('datetime');
    }
    sendResponse({ dateStr: dateStr });
    return true;
  }
  return true;
});

// =======================================================
// INITIALIZATION
// =======================================================

if (window.location.hostname.includes('gleam.io')) {
  initGleamHelper();
}
