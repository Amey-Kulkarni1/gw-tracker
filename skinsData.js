// skinsData.js - CS2 items data definitions: Knives, Skins, Gloves, Weapons, Wears

(function (root) {
  const CS2_DATA = {
    KNIFE_MODELS: [
      { regex: /\bm9\s*(?:bayonet(?:\s+knife)?)?\b/i, name: "M9 Bayonet Knife", generic: false },
      { regex: /\bshadow\s+daggers?(?:\s+knife)?\b/i, name: "Shadow Daggers Knife", generic: false },
      { regex: /\bbowie(?:\s+knife)?\b/i, name: "Bowie Knife", generic: false },
      { regex: /\b(?:butterfly(?:\s+knife)?|bfk)\b/i, name: "Butterfly Knife", generic: false },
      { regex: /\bfalchion(?:\s+knife)?\b/i, name: "Falchion Knife", generic: false },
      { regex: /\bhuntsman(?:\s+knife)?\b/i, name: "Huntsman Knife", generic: false },
      { regex: /\b(?:karambit(?:\s+knife)?|kara)\b/i, name: "Karambit Knife", generic: false },
      { regex: /\bkukri(?:\s+knife)?\b/i, name: "Kukri Knife", generic: false },
      { regex: /\bbayonet(?:\s+knife)?\b/i, name: "Bayonet Knife", generic: false },
      { regex: /\bnavaja(?:\s+knife)?\b/i, name: "Navaja Knife", generic: false },
      { regex: /\bparacord(?:\s+knife)?\b/i, name: "Paracord Knife", generic: false },
      { regex: /\bstiletto(?:\s+knife)?\b/i, name: "Stiletto Knife", generic: false },
      { regex: /\btalon(?:\s+knife)?\b/i, name: "Talon Knife", generic: false },
      { regex: /\bursus(?:\s+knife)?\b/i, name: "Ursus Knife", generic: false },
      // Generic English words used as knife names
      { regex: /\bclassic(?:\s+knife)?\b/i, explicitRegex: /\bclassic\s+knife\b/i, name: "Classic Knife", generic: true },
      { regex: /\bflip(?:\s+knife)?\b/i, explicitRegex: /\bflip\s+knife\b/i, name: "Flip Knife", generic: true },
      { regex: /\bgut(?:\s+knife)?\b/i, explicitRegex: /\bgut\s+knife\b/i, name: "Gut Knife", generic: true },
      { regex: /\bnomad(?:\s+knife)?\b/i, explicitRegex: /\bnomad\s+knife\b/i, name: "Nomad Knife", generic: true },
      { regex: /\bskeleton(?:\s+knife)?\b/i, explicitRegex: /\bskeleton\s+knife\b/i, name: "Skeleton Knife", generic: true },
      { regex: /\bsurvival(?:\s+knife)?\b/i, explicitRegex: /\bsurvival\s+knife\b/i, name: "Survival Knife", generic: true },
    ],

    KNIFE_SKINS: [
      // Multi-word skins first
      { regex: /\bgamma\s+doppler\b/i, name: "Gamma Doppler" },
      { regex: /\bmarble\s+fade\b/i, name: "Marble Fade" },
      { regex: /\bblack\s+laminate\b/i, name: "Black Laminate" },
      { regex: /\bblue\s+steel\b/i, name: "Blue Steel" },
      { regex: /\bboreal\s+forest\b/i, name: "Boreal Forest" },
      { regex: /\bbright\s+water\b/i, name: "Bright Water" },
      { regex: /\bcase\s+hardened\b/i, name: "Case Hardened" },
      { regex: /\bcrimson\s+web\b/i, name: "Crimson Web" },
      { regex: /\bdamascus\s+steel\b/i, name: "Damascus Steel" },
      { regex: /\bforest\s+ddpat\b/i, name: "Forest DDPAT" },
      { regex: /\bnight\s+stripe\b/i, name: "Night Stripe" },
      { regex: /\brust\s+coat\b/i, name: "Rust Coat" },
      { regex: /\bsafari\s+mesh\b/i, name: "Safari Mesh" },
      { regex: /\btiger\s+tooth\b/i, name: "Tiger Tooth" },
      { regex: /\burban\s+masked\b/i, name: "Urban Masked" },
      // Single-word skins
      { regex: /\bautotronic\b/i, name: "Autotronic" },
      { regex: /\bdoppler\b/i, name: "Doppler" },
      { regex: /\bfade\b/i, name: "Fade" },
      { regex: /\bfreehand\b/i, name: "Freehand" },
      { regex: /\blore\b/i, name: "Lore" },
      { regex: /\bnight\b/i, name: "Night" },
      { regex: /\bscorched\b/i, name: "Scorched" },
      { regex: /\bslaughter\b/i, name: "Slaughter" },
      { regex: /\bstained\b/i, name: "Stained" },
      { regex: /\bultraviolet\b/i, name: "Ultraviolet" },
      { regex: /\bvanilla\b/i, name: "Vanilla" },
    ],

    GLOVE_MODELS: [
      { regex: /\bbloodhound(?:(?:\s+leather)?\s+gloves?)?\b/i, name: "Bloodhound Gloves", generic: false },
      { regex: /\bbroken\s+fang(?:\s+gloves?)?\b/i, name: "Broken Fang Gloves", generic: false },
      { regex: /\bhand\s*wraps?(?:\s+gloves?)?\b/i, name: "Hand Wraps", generic: false },
      { regex: /\bhydra(?:\s+gloves?)?\b/i, name: "Hydra Gloves", generic: false },
      { regex: /\bmoto(?:\s+gloves?)?\b/i, name: "Moto Gloves", generic: false },
      // Generic English words used as glove names
      { regex: /\bdriver(?:\s+gloves?)?\b/i, explicitRegex: /\bdriver\s+gloves?\b/i, name: "Driver Gloves", generic: true },
      { regex: /\bspecialist(?:\s+gloves?)?\b/i, explicitRegex: /\bspecialist\s+gloves?\b/i, name: "Specialist Gloves", generic: true },
      { regex: /\bsport(?:s)?(?:\s+gloves?)?\b/i, explicitRegex: /\bsport(?:s)?\s+gloves?\b/i, name: "Sport Gloves", generic: true },
    ],

    GLOVE_SKINS: [
      // Multi-word skins first
      { regex: /\bchocolate\s+chesterfield\b/i, name: "Chocolate Chesterfield" },
      { regex: /\b3rd\s+commando\s+company\b/i, name: "3rd Commando Company" },
      { regex: /\bbrocade\s+flowers\b/i, name: "Brocade Flowers" },
      { regex: /\bpillow\s+punchers\b/i, name: "Pillow Punchers" },
      { regex: /\bcreme\s+pinstripe\b/i, name: "Creme Pinstripe" },
      { regex: /\bscarlet\s+shamagh\b/i, name: "Scarlet Shamagh" },
      { regex: /\bviolet\s+beadwork\b/i, name: "Violet Beadwork" },
      { regex: /\bimperial\s+plaid\b/i, name: "Imperial Plaid" },
      { regex: /\bdesert\s+shamagh\b/i, name: "Desert Shamagh" },
      { regex: /\bblood\s+pressure\b/i, name: "Blood Pressure" },
      { regex: /\bcrimson\s+kimono\b/i, name: "Crimson Kimono" },
      { regex: /\byellow[- ]banded\b/i, name: "Yellow-banded" },
      { regex: /\bbrocade\s+crane\b/i, name: "Brocade Crane" },
      { regex: /\bcrimson\s+weave\b/i, name: "Crimson Weave" },
      { regex: /\bhand\s+sweaters\b/i, name: "Hand Sweaters" },
      { regex: /\brezan\s+the\s+red\b/i, name: "Rezan the Red" },
      { regex: /\bcobalt\s+skulls\b/i, name: "Cobalt Skulls" },
      { regex: /\bcase\s+hardened\b/i, name: "Case Hardened" },
      { regex: /\blt\.?\s*commander\b/i, name: "Lt. Commander" },
      { regex: /\bpandora(?:'s)?\s+box\b/i, name: "Pandora's Box" },
      { regex: /\bultra[\s-]?violent\b/i, name: "Ultra Violent" },
      { regex: /\bneedle\s+point\b/i, name: "Needle Point" },
      { regex: /\bdragon\s+fists\b/i, name: "Dragon Fists" },
      { regex: /\bqueen\s+jaguar\b/i, name: "Queen Jaguar" },
      { regex: /\bracing\s+green\b/i, name: "Racing Green" },
      { regex: /\bsnow\s+leopard\b/i, name: "Snow Leopard" },
      { regex: /\bspruce\s+ddpat\b/i, name: "Spruce DDPAT" },
      { regex: /\bcloud\s+chaser\b/i, name: "Cloud Chaser" },
      { regex: /\bforest\s+ddpat\b/i, name: "Forest DDPAT" },
      { regex: /\blime\s+polycam\b/i, name: "Lime Polycam" },
      { regex: /\btiger\s+strike\b/i, name: "Tiger Strike" },
      { regex: /\bbronze\s+morph\b/i, name: "Bronze Morph" },
      { regex: /\blunar\s+weave\b/i, name: "Lunar Weave" },
      { regex: /\bwave\s+chaser\b/i, name: "Wave Chaser" },
      { regex: /\bfinish\s+line\b/i, name: "Finish Line" },
      { regex: /\bcrimson\s+web\b/i, name: "Crimson Web" },
      { regex: /\bemerald\s+web\b/i, name: "Emerald Web" },
      { regex: /\bfield\s+agent\b/i, name: "Field Agent" },
      { regex: /\bmarble\s+fade\b/i, name: "Marble Fade" },
      { regex: /\bking\s+snake\b/i, name: "King Snake" },
      { regex: /\bplum\s+quill\b/i, name: "Plum Quill" },
      { regex: /\bhedge\s+maze\b/i, name: "Hedge Maze" },
      { regex: /\bblack\s+tie\b/i, name: "Black Tie" },
      { regex: /\bduct\s+tape\b/i, name: "Duct Tape" },
      { regex: /\bcool\s+mint\b/i, name: "Cool Mint" },
      { regex: /\bsmoke\s+out\b/i, name: "Smoke Out" },
      { regex: /\bbig\s+swell\b/i, name: "Big Swell" },
      { regex: /\bred\s+racer\b/i, name: "Red Racer" },
      { regex: /\bcaution!?\b/i, name: "CAUTION!" },
      { regex: /\bbig\s+game\b/i, name: "Big Game" },
      { regex: /\bboom!?\b/i, name: "Boom!" },
      { regex: /\bpow!?\b/i, name: "POW!" },
      // Single-word skins
      { regex: /\bamphibious\b/i, name: "Amphibious" },
      { regex: /\barboreal\b/i, name: "Arboreal" },
      { regex: /\barid\b/i, name: "Arid" },
      { regex: /\bbadlands\b/i, name: "Badlands" },
      { regex: /\bblackbook\b/i, name: "Blackbook" },
      { regex: /\bblaze\b/i, name: "Blaze" },
      { regex: /\bbronzed\b/i, name: "Bronzed" },
      { regex: /\bbuckshot\b/i, name: "Buckshot" },
      { regex: /\bcharred\b/i, name: "Charred" },
      { regex: /\bconstrictor\b/i, name: "Constrictor" },
      { regex: /\bconvoy\b/i, name: "Convoy" },
      { regex: /\bdiamondback\b/i, name: "Diamondback" },
      { regex: /\beclipse\b/i, name: "Eclipse" },
      { regex: /\bemerald\b/i, name: "Emerald" },
      { regex: /\bfade\b/i, name: "Fade" },
      { regex: /\bfoundation\b/i, name: "Foundation" },
      { regex: /\bfrosty\b/i, name: "Frosty" },
      { regex: /\bgarden\b/i, name: "Garden" },
      { regex: /\bgiraffe\b/i, name: "Giraffe" },
      { regex: /\bguerrilla\b/i, name: "Guerrilla" },
      { regex: /\bjade\b/i, name: "Jade" },
      { regex: /\bleather\b/i, name: "Leather" },
      { regex: /\bmangrove\b/i, name: "Mangrove" },
      { regex: /\bmogul\b/i, name: "Mogul" },
      { regex: /\bnocts\b/i, name: "Nocts" },
      { regex: /\boccult\b/i, name: "Occult" },
      { regex: /\bomega\b/i, name: "Omega" },
      { regex: /\boverprint\b/i, name: "Overprint" },
      { regex: /\bovertake\b/i, name: "Overtake" },
      { regex: /\bpolygon\b/i, name: "Polygon" },
      { regex: /\brattler\b/i, name: "Rattler" },
      { regex: /\bseigaiha\b/i, name: "Seigaiha" },
      { regex: /\bslaughter\b/i, name: "Slaughter" },
      { regex: /\bslingshot\b/i, name: "Slingshot" },
      { regex: /\bsnakebite\b/i, name: "Snakebite" },
      { regex: /\bspearmint\b/i, name: "Spearmint" },
      { regex: /\bsunburst\b/i, name: "Sunburst" },
      { regex: /\bsuperconductor\b/i, name: "Superconductor" },
      { regex: /\btransport\b/i, name: "Transport" },
      { regex: /\bturtle\b/i, name: "Turtle" },
      { regex: /\bunhinged\b/i, name: "Unhinged" },
      { regex: /\bvice\b/i, name: "Vice" },
    ],

    GLOVES: [
      { regex: /\bbloodhound(?:(?:\s+leather)?\s+gloves?)?\b/i, name: "Bloodhound Gloves" },
      { regex: /\bbroken\s+fang(?:\s+gloves?)?\b/i, name: "Broken Fang Gloves" },
      { regex: /\bdriver(?:\s+gloves?)?\b/i, name: "Driver Gloves" },
      { regex: /\bhand\s*wraps?(?:\s+gloves?)?\b/i, name: "Hand Wraps" },
      { regex: /\bhydra(?:\s+gloves?)?\b/i, name: "Hydra Gloves" },
      { regex: /\bmoto(?:\s+gloves?)?\b/i, name: "Moto Gloves" },
      { regex: /\bspecialist(?:\s+gloves?)?\b/i, name: "Specialist Gloves" },
      { regex: /\bsport(?:s)?(?:\s+gloves?)?\b/i, name: "Sport Gloves" },
    ],

    WEAPONS: [
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
    ],

    WEARS: [
      { regex: /\b(?:factory[\s_-]?new|fn)\b/i, abbr: "FN", fullName: "Factory New" },
      { regex: /\b(?:minimal[\s_-]?wear|mw)\b/i, abbr: "MW", fullName: "Minimal Wear" },
      { regex: /\b(?:field[\s_-]?tested|ft(?!\s*[@.]))\b/i, abbr: "FT", fullName: "Field-Tested" },
      { regex: /\b(?:well[\s_-]?worn|ww)\b/i, abbr: "WW", fullName: "Well-Worn" },
      { regex: /\b(?:battle[\s_-]?scarred|bs)\b/i, abbr: "BS", fullName: "Battle-Scarred" },
    ],

    CS2_HINTS: [
      /\bcs2\b/i,
      /\bcsgo\b/i,
      /\bfactory[\s_-]?new\b/i,
      /\bminimal[\s_-]?wear\b/i,
      /\bfield[\s_-]?tested\b/i,
      /\bwell[\s_-]?worn\b/i,
      /\bbattle[\s_-]?scarred\b/i,
      /\bfn\b/i,
      /\bmw\b/i,
      /\bft(?!\s*[@.])\b/i,
      /\bww\b/i,
      /\bbs\b/i,
    ],

    STEAM_KNIFE_WEAPONS: {
      "Bayonet Knife": "Bayonet",
      "M9 Bayonet Knife": "M9 Bayonet",
      "Karambit Knife": "Karambit",
      "Shadow Daggers Knife": "Shadow Daggers",
      "Bowie Knife": "Bowie Knife",
      "Butterfly Knife": "Butterfly Knife",
      "Classic Knife": "Classic Knife",
      "Falchion Knife": "Falchion Knife",
      "Flip Knife": "Flip Knife",
      "Gut Knife": "Gut Knife",
      "Huntsman Knife": "Huntsman Knife",
      "Kukri Knife": "Kukri Knife",
      "Navaja Knife": "Navaja Knife",
      "Nomad Knife": "Nomad Knife",
      "Paracord Knife": "Paracord Knife",
      "Skeleton Knife": "Skeleton Knife",
      "Stiletto Knife": "Stiletto Knife",
      "Survival Knife": "Survival Knife",
      "Talon Knife": "Talon Knife",
      "Ursus Knife": "Ursus Knife",
    },

    buildKnifeMarketHashName: function ({ model, skin, wear, isStatTrak }) {
      if (!model || !skin || !wear) return null;
      const weaponName = CS2_DATA.STEAM_KNIFE_WEAPONS[model] || model;
      const wearObj = CS2_DATA.WEARS.find((w) => w.abbr === wear || w.fullName === wear);
      if (!wearObj) return null;
      const prefix = isStatTrak ? "★ StatTrak™ " : "★ ";
      return `${prefix}${weaponName} | ${skin} (${wearObj.fullName})`;
    },

    buildGloveMarketHashName: function ({ model, skin, wear }) {
      if (!model || !skin || !wear) return null;
      const wearObj = CS2_DATA.WEARS.find((w) => w.abbr === wear || w.fullName === wear);
      if (!wearObj) return null;
      return `★ ${model} | ${skin} (${wearObj.fullName})`;
    },

    fetchCSFloatPrice: async function (marketHashName) {
      if (!marketHashName) return null;

      // When running in content script, delegate to background service worker to bypass page CSP
      if (typeof chrome !== "undefined" && chrome.runtime && chrome.runtime.sendMessage && !chrome.runtime.getBackgroundPage) {
        try {
          const response = await new Promise((resolve) => {
            chrome.runtime.sendMessage(
              { action: "fetchCSFloatPrice", marketHashName },
              (res) => {
                if (chrome.runtime.lastError) {
                  console.warn("[CSFloat Message Warn]:", chrome.runtime.lastError);
                  return resolve(null);
                }
                resolve(res);
              }
            );
          });
          if (response && response.price != null) return response.price;
        } catch (e) {
          console.warn("[CSFloat Background Fetch Warn]:", e);
        }
      }

      // Direct fetch fallback (for background worker, options page, or Node.js)
      try {
        const url = `https://api.openskin.dev/v1/prices/csfloat?item=${encodeURIComponent(marketHashName)}`;
        const response = await fetch(url);
        if (!response.ok) return null;
        const data = await response.json();
        return data.ask != null ? data.ask : null;
      } catch (err) {
        console.error("[CSFloat API Error]:", err);
        return null;
      }
    },
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = CS2_DATA;
  } else {
    root.CS2_DATA = CS2_DATA;
  }
})(typeof globalThis !== "undefined" ? globalThis : this);
