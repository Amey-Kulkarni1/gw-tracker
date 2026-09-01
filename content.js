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

// --- Helper: Extracts "sweepwidget.com/PATH" from a full URL ---
function getSweepwidgetSignature(urlString) {
  try {
    const url = new URL(urlString);
    if (!url.hostname.includes('sweepwidget.com')) return null;
    const pathParts = url.pathname.split('/').filter(p => p.length > 0);
    if (pathParts.length > 0) {
      return `sweepwidget.com/${pathParts.join('/')}`;
    }
  } catch (e) { }
  return null;
}

// --- Helper: Date & Time formatting with timezone support ---
function formatDateInTimeZone(date, timeZone) {
  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timeZone || 'UTC',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    const parts = formatter.formatToParts(date);
    const year = parts.find((p) => p.type === 'year').value;
    const month = parts.find((p) => p.type === 'month').value;
    const day = parts.find((p) => p.type === 'day').value;
    return `${year}-${month}-${day}`;
  } catch (e) {
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}

function formatDateTimeInTimeZone(date, timeZone) {
  try {
    return date.toLocaleString('en-US', {
      timeZone: timeZone || 'UTC',
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  } catch (e) {
    return date.toUTCString();
  }
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

  const data = await chrome.storage.local.get({ timezone: "UTC", savedTabs: [] });
  const timeZone = data.timezone || "UTC";
  const savedTabs = data.savedTabs || [];

  const endDate = new Date(epoch * 1000);
  const timeZoneString = formatDateTimeInTimeZone(endDate, timeZone);
  const saveDateString = formatDateInTimeZone(endDate, timeZone);

  const container = document.createElement('div');
  container.style.cssText = `
    position: fixed; bottom: 20px; right: 20px; z-index: 2147483647;
    background: #1e1e1e; border: 1px solid #4285f4; border-radius: 8px;
    padding: 15px; box-shadow: 0 4px 12px rgba(0,0,0,0.5);
    font-family: -apple-system, sans-serif; color: white; text-align: center;
  `;

  const text = document.createElement('div');
  text.innerText = `Ends (${timeZone}): ${timeZoneString}`;
  text.style.marginBottom = '10px'; text.style.fontSize = '14px';

  const btn = document.createElement('button');
  btn.style.cssText = `
    background: #4285f4; color: white; border: none; padding: 8px 16px;
    border-radius: 4px; cursor: pointer; font-weight: bold; font-size: 13px;
  `;

  const currentSignature = getGleamSignature(window.location.href);

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

  const rawTitle = document.title || url;
  const title = rawTitle.toLowerCase().includes('gleam') ? rawTitle : `${rawTitle} Gleam`;

  savedTabs.push({
    id: Date.now().toString(),
    title: title,
    url: url,
    date: dateStr,
    dateAdded: new Date().toISOString(),
  });
  await chrome.storage.local.set({ savedTabs });
  updateButtonState(btn, true);
}

// --- SweepWidget Helper Logic ---
function parseSweepwidgetCountdown() {
  const clockdiv = document.getElementById('clockdiv') || document.querySelector('#clockdiv, .clockdiv');
  if (!clockdiv) return null;

  const daysEl = clockdiv.querySelector('.days');
  const hoursEl = clockdiv.querySelector('.hours');
  const minutesEl = clockdiv.querySelector('.minutes');
  const secondsEl = clockdiv.querySelector('.seconds');

  if (!daysEl && !hoursEl && !minutesEl && !secondsEl) return null;

  const days = daysEl ? parseInt(daysEl.innerText.trim(), 10) || 0 : 0;
  const hours = hoursEl ? parseInt(hoursEl.innerText.trim(), 10) || 0 : 0;
  const minutes = minutesEl ? parseInt(minutesEl.innerText.trim(), 10) || 0 : 0;
  const seconds = secondsEl ? parseInt(secondsEl.innerText.trim(), 10) || 0 : 0;

  const totalSeconds = (days * 86400) + (hours * 3600) + (minutes * 60) + seconds;
  if (totalSeconds <= 0) return null;

  return new Date(Date.now() + totalSeconds * 1000);
}

function initSweepwidgetHelper() {
  const checkInterval = setInterval(() => {
    const clockdiv = document.getElementById('clockdiv') || document.querySelector('#clockdiv, .clockdiv');
    if (clockdiv) {
      clearInterval(checkInterval);
      createSweepwidgetOverlay();
    }
  }, 1000);
}

async function createSweepwidgetOverlay() {
  const endDate = parseSweepwidgetCountdown();
  if (!endDate) return;

  const data = await chrome.storage.local.get({ timezone: "UTC", savedTabs: [] });
  const timeZone = data.timezone || "UTC";
  const savedTabs = data.savedTabs || [];

  const timeZoneString = formatDateTimeInTimeZone(endDate, timeZone);
  const saveDateString = formatDateInTimeZone(endDate, timeZone);

  const container = document.createElement('div');
  container.style.cssText = `
    position: fixed; bottom: 20px; right: 20px; z-index: 2147483647;
    background: #1e1e1e; border: 1px solid #4a3aff; border-radius: 8px;
    padding: 15px; box-shadow: 0 4px 12px rgba(0,0,0,0.5);
    font-family: -apple-system, sans-serif; color: white; text-align: center;
  `;

  const text = document.createElement('div');
  text.innerText = `Ends (${timeZone}): ${timeZoneString}`;
  text.style.marginBottom = '10px'; text.style.fontSize = '14px';

  const btn = document.createElement('button');
  btn.style.cssText = `
    background: #4a3aff; color: white; border: none; padding: 8px 16px;
    border-radius: 4px; cursor: pointer; font-weight: bold; font-size: 13px;
  `;

  const currentSignature = getSweepwidgetSignature(window.location.href);

  const isAlreadySaved = savedTabs.some(tab => {
    const savedSignature = getSweepwidgetSignature(tab.url);
    return currentSignature && savedSignature && currentSignature === savedSignature;
  });

  if (isAlreadySaved) {
    updateButtonState(btn, true);
  } else {
    updateButtonState(btn, false);
    btn.onclick = () => saveSweepwidgetUrl(window.location.href, saveDateString, btn);
  }

  container.appendChild(text);
  container.appendChild(btn);
  document.body.appendChild(container);
}

async function saveSweepwidgetUrl(url, dateStr, btn) {
  const data = await chrome.storage.local.get(["savedTabs"]);
  const savedTabs = data.savedTabs || [];
  const currentSignature = getSweepwidgetSignature(url);

  const isDuplicate = savedTabs.some(tab => {
    const savedSignature = getSweepwidgetSignature(tab.url);
    return currentSignature && savedSignature && currentSignature === savedSignature;
  });

  if (isDuplicate) {
    updateButtonState(btn, true);
    return;
  }

  const rawTitle = document.title || url;
  const title = rawTitle.toLowerCase().includes('sweepwidget') ? rawTitle : `${rawTitle} SweepWidget`;

  savedTabs.push({
    id: Date.now().toString(),
    title: title,
    url: url,
    date: dateStr,
    dateAdded: new Date().toISOString(),
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

async function extractPrizeFromText(text) {
  if (!text) return null;

  const data = typeof CS2_DATA !== "undefined" ? CS2_DATA : null;
  if (!data) return null;

  // 1. Knife detection (Model -> Skin -> Wear)
  const hasKnifeContext = /\bknives\b|\bknife\b|★|\bcs2\b|\bcsgo\b/i.test(text);

  let matchedSkin = null;
  for (const s of data.KNIFE_SKINS) {
    if (s.regex.test(text)) {
      matchedSkin = s.name;
      break;
    }
  }

  let matchedModel = null;
  for (const k of data.KNIFE_MODELS) {
    if (k.generic) {
      if (k.explicitRegex.test(text) || (k.regex.test(text) && (hasKnifeContext || matchedSkin))) {
        matchedModel = k.name;
        break;
      }
    } else if (k.regex.test(text)) {
      matchedModel = k.name;
      break;
    }
  }

  if (matchedModel || (hasKnifeContext && /\bknives\b|\bknife\b/i.test(text))) {
    const modelName = matchedModel || "Knife";
    const isStatTrak = /\b(?:stat[\s-]?trak(?:™)?|stattrak(?:™)?)\b/i.test(text) || /\bST\b/.test(text);

    let matchedWear = null;
    for (const w of data.WEARS) {
      if (w.regex.test(text)) {
        matchedWear = w.abbr;
        break;
      }
    }

    // Fully detected knife: Model + Skin + Wear -> Get Market Hash Name & Live Price
    if (matchedModel && matchedSkin && matchedWear && data.buildKnifeMarketHashName) {
      const hashName = data.buildKnifeMarketHashName({
        model: matchedModel,
        skin: matchedSkin,
        wear: matchedWear,
        isStatTrak,
      });

      if (hashName) {
        if (data.fetchCSFloatPrice) {
          const livePrice = await data.fetchCSFloatPrice(hashName);
          if (livePrice != null) {
            return `${hashName} [$${livePrice}]`;
          }
        }
        return hashName;
      }
    }

    // Partial detection fallback (no live price query)
    const parts = [];
    if (isStatTrak) parts.push("ST");
    parts.push(modelName);
    if (matchedSkin) parts.push(matchedSkin);
    if (matchedWear) parts.push(matchedWear);

    return parts.join(" ");
  }

  // 2. Glove detection (Model -> Skin -> Wear)
  const hasGloveContext = /\bgloves?\b|\bwraps?\b|★|\bcs2\b|\bcsgo\b/i.test(text);

  let matchedGloveSkin = null;
  if (data.GLOVE_SKINS) {
    for (const s of data.GLOVE_SKINS) {
      if (s.regex.test(text)) {
        matchedGloveSkin = s.name;
        break;
      }
    }
  }

  let matchedGloveModel = null;
  const gloveModels = data.GLOVE_MODELS || data.GLOVES || [];
  for (const g of gloveModels) {
    if (g.generic) {
      if (g.explicitRegex ? (g.explicitRegex.test(text) || (g.regex.test(text) && (hasGloveContext || matchedGloveSkin))) : g.regex.test(text)) {
        matchedGloveModel = g.name;
        break;
      }
    } else if (g.regex.test(text)) {
      matchedGloveModel = g.name;
      break;
    }
  }

  if (matchedGloveModel || (hasGloveContext && /\bgloves?\b/i.test(text))) {
    const modelName = matchedGloveModel || "Gloves";

    let matchedWear = null;
    for (const w of data.WEARS) {
      if (w.regex.test(text)) {
        matchedWear = w.abbr;
        break;
      }
    }

    // Fully detected glove: Model + Skin + Wear -> Get Market Hash Name & Live Price
    if (matchedGloveModel && matchedGloveSkin && matchedWear && data.buildGloveMarketHashName) {
      const hashName = data.buildGloveMarketHashName({
        model: matchedGloveModel,
        skin: matchedGloveSkin,
        wear: matchedWear,
      });

      if (hashName) {
        if (data.fetchCSFloatPrice) {
          const livePrice = await data.fetchCSFloatPrice(hashName);
          if (livePrice != null) {
            return `${hashName} [$${livePrice}]`;
          }
        }
        return hashName;
      }
    }

    // Partial detection fallback (no live price query)
    const parts = [];
    parts.push(modelName);
    if (matchedGloveSkin) parts.push(matchedGloveSkin);
    if (matchedWear) parts.push(matchedWear);

    return parts.join(" ");
  }

  // 3. Patterns to match USD amounts (first match wins)
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

  // 4. Weapon models detection
  for (const weapon of data.WEAPONS) {
    if (weapon.regex.test(text)) {
      return weapon.name;
    }
  }

  // 5. Fallback CS2 skin hint
  if (data.CS2_HINTS && data.CS2_HINTS.some((re) => re.test(text))) return "cs2 skin";

  return null;
}

function extractGleamDate(timeZone = 'UTC') {
  const endsElement = document.querySelector('[data-ends]');
  if (endsElement) {
    const endsTimestamp = endsElement.getAttribute('data-ends');
    if (endsTimestamp) {
      const epoch = parseInt(endsTimestamp);
      if (!isNaN(epoch)) {
        const date = new Date(epoch * 1000);
        return { type: 'absolute', value: formatDateInTimeZone(date, timeZone) };
      }
    }
  }
  return null;
}

function extractSweepwidgetDate(timeZone = 'UTC') {
  const endDate = parseSweepwidgetCountdown();
  if (endDate) {
    return { type: 'absolute', value: formatDateInTimeZone(endDate, timeZone) };
  }
  return null;
}

// Listen for the background script asking for the date
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getDetectedDays") {
    (async () => {
      let result = null;
      let prize = null;

      // Check for Gleam.io or SweepWidget first
      if (window.location.hostname.includes("gleam.io")) {
        const data = await chrome.storage.local.get({ timezone: "UTC" });
        result = extractGleamDate(data.timezone || "UTC");
      } else if (window.location.hostname.includes("sweepwidget.com")) {
        const data = await chrome.storage.local.get({ timezone: "UTC" });
        result = extractSweepwidgetDate(data.timezone || "UTC");
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
        // Only extract date if we don't have one from Gleam or SweepWidget
        if (!result) {
          result = extractDaysFromText(text);
        }
        // Always try to extract prize from tweet text
        prize = await extractPrizeFromText(text);
        console.log("[Content] Extracted prize:", prize);
      }

      console.log("[Content] Sending response:", { result, prize });
      sendResponse({ result: result, prize: prize });
    })();
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
} else if (window.location.hostname.includes('sweepwidget.com')) {
  initSweepwidgetHelper();
}
