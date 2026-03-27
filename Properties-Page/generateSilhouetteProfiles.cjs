const fs = require("fs");
const path = require("path");
const vm = require("vm");
const { Jimp, intToRGBA } = require("jimp");

const ROOT = __dirname;
const IMAGES_DIR = path.join(ROOT, "imagesss");
const CARDS_PATH = path.join(ROOT, "propertycards.js");
const COORDS_PATH = path.join(ROOT, "propertyCoordinates.js");
const OUTPUT_PATH = path.join(ROOT, "silhouetteProfiles.js");
const MISSING_PATH = path.join(ROOT, "silhouetteMissing.json");
const REPORT_PATH = path.join(ROOT, "silhouetteCoverageReport.json");

function normalize(s) {
  return String(s || "")
    .toLowerCase()
    .replace(/\.[a-z0-9]+$/i, "")
    .replace(/[@#]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function tokenize(s) {
  return normalize(s).split(" ").filter((t) => t.length > 2);
}

function hash01(s, seed = 0) {
  const str = String(s || "");
  let h = 2166136261 ^ seed;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 1000000) / 1000000;
}

function parseFloorCount(card) {
  const feats = Array.isArray(card?.features) ? card.features : [];
  for (const f of feats) {
    let m = String(f || "").match(/g\s*\+\s*(\d+)/i);
    if (m) return parseInt(m[1], 10);
    m = String(f || "").match(/(\d+)\s*(?:floor|storey|stor(?:y|ies))/i);
    if (m) return parseInt(m[1], 10);
  }
  return null;
}

function buildFallbackProfile(name, card) {
  const nm = String(name || card?.schemeName || "project");
  const bhk = String(card?.categories?.[0]?.bhk || card?.title || "").toLowerCase();
  const type = String(card?.type || "").toLowerCase();
  const floors = parseFloorCount(card);

  const familyProfiles = [
    [1.00, 0.86, 1.06, 0.84, 0.98, 0.88, 1.02, 0.90],
    [1.00, 0.78, 0.98, 0.76, 1.00, 0.80, 1.02, 0.82],
    [1.04, 0.92, 0.94, 0.92, 1.04, 0.92, 0.96, 0.92],
    [1.06, 0.76, 1.06, 0.76, 1.06, 0.76, 1.06, 0.76],
    [1.00, 0.94, 0.96, 0.90, 1.00, 0.94, 0.96, 0.90],
  ];

  let family = Math.floor(hash01(nm, 33) * 5);
  if (type.includes("commercial") || /mall|plaza|hub|arcade|business|office/i.test(nm)) family = 2;
  if (/tower|sky|heights|elite|lux|royal|imperial/i.test(nm) || bhk.includes("4 bhk") || bhk.includes("5 bhk")) family = 1;

  const base = familyProfiles[family].map((v, i) => {
    const nudge = (hash01(`${nm}-${i}`, 91) - 0.5) * 0.08;
    return +Math.max(0.72, Math.min(1.28, v + nudge)).toFixed(3);
  });

  let mid = 0.72;
  let crown = 0.44;
  if (type.includes("commercial")) {
    mid = 0.86;
    crown = 0.74;
  }
  if (bhk.includes("4 bhk") || bhk.includes("5 bhk") || /tower|sky|heights|elite|lux|royal|imperial/i.test(nm)) {
    mid = 0.68;
    crown = 0.38;
  }
  if (floors != null) {
    if (floors >= 24) {
      mid = Math.min(mid, 0.66);
      crown = Math.min(crown, 0.35);
    } else if (floors <= 8) {
      mid = Math.max(mid, 0.82);
      crown = Math.max(crown, 0.62);
    }
  }

  const fallbackPalette = ["#4f6cff", "#56cfdd", "#7b8fff", "#88d498", "#f2b880", "#b58cff", "#6ec8ff", "#9aa7ff"];
  const dominantColor = fallbackPalette[Math.floor(hash01(nm, 211) * fallbackPalette.length) % fallbackPalette.length];

  return {
    profile8: base,
    bands: [1, +mid.toFixed(3), +crown.toFixed(3)],
    confidence: 0.22,
    dominantColor,
    image: null,
    source: "synthetic-fallback",
  };
}

function movingAvg(arr, w = 3) {
  const out = arr.slice();
  const half = Math.floor(w / 2);
  for (let i = 0; i < arr.length; i++) {
    let sum = 0;
    let n = 0;
    for (let k = -half; k <= half; k++) {
      const j = i + k;
      if (j < 0 || j >= arr.length) continue;
      sum += arr[j];
      n += 1;
    }
    out[i] = sum / Math.max(1, n);
  }
  return out;
}

function clamp(v, lo, hi) {
  return Math.max(lo, Math.min(hi, v));
}

function toHex(v) {
  return clamp(Math.round(v), 0, 255).toString(16).padStart(2, "0");
}

function rgbToHex(r, g, b) {
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function getLum(img, x, y) {
  const c = intToRGBA(img.getPixelColor(x, y));
  return 0.2126 * c.r + 0.7152 * c.g + 0.0722 * c.b;
}

async function profileFromImage(filePath) {
  const img = await Jimp.read(filePath);
  const proc = img.clone().cover({ w: 96, h: 96 }).greyscale().contrast(0.25);

  const w = proc.bitmap.width;
  const h = proc.bitmap.height;

  let topSum = 0;
  let topN = 0;
  for (let y = 0; y < Math.floor(h * 0.25); y++) {
    for (let x = 0; x < w; x++) {
      topSum += getLum(proc, x, y);
      topN += 1;
    }
  }
  const topMean = topSum / Math.max(1, topN);
  const thr = Math.max(42, Math.min(190, topMean * 0.82));

  const heights = [];
  for (let x = 0; x < w; x++) {
    let yFound = Math.floor(h * 0.68);
    for (let y = 6; y < Math.floor(h * 0.92); y++) {
      const lum = getLum(proc, x, y);
      const up = getLum(proc, x, Math.max(0, y - 1));
      const edge = Math.abs(lum - up);
      if (lum < thr && edge > 7) {
        yFound = y;
        break;
      }
    }
    let hh = (h - yFound) / h;
    hh = Math.max(0.14, Math.min(0.96, hh));
    heights.push(hh);
  }

  let smooth = movingAvg(heights, 5);
  smooth = movingAvg(smooth, 5);

  const samplePos = [0.05, 0.18, 0.31, 0.44, 0.56, 0.69, 0.82, 0.95];
  const profile8 = samplePos.map((t) => {
    const idx = Math.min(w - 1, Math.max(0, Math.round(t * (w - 1))));
    const hNorm = smooth[idx];
    return +(0.78 + hNorm * 0.56).toFixed(3);
  });

  const mean = smooth.reduce((a, b) => a + b, 0) / smooth.length;
  const variance = smooth.reduce((a, b) => a + (b - mean) * (b - mean), 0) / smooth.length;

  const rowDarkRatio = (yy) => {
    const y = Math.max(0, Math.min(h - 1, Math.round(yy)));
    let dark = 0;
    for (let x = 0; x < w; x++) {
      if (getLum(proc, x, y) < thr) dark += 1;
    }
    return dark / w;
  };

  const baseW = Math.max(0.08, rowDarkRatio(h * 0.80));
  const midW = rowDarkRatio(h * 0.58);
  const topW = rowDarkRatio(h * 0.36);

  const midBand = Math.max(0.52, Math.min(0.95, midW / baseW));
  const crownBand = Math.max(0.28, Math.min(0.82, topW / baseW));

  let dark = 0;
  for (let y = Math.floor(h * 0.22); y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (getLum(proc, x, y) < thr) dark += 1;
    }
  }
  const darkRatio = dark / ((h - Math.floor(h * 0.22)) * w);
  const confidence = Math.max(0, Math.min(1, variance * 16 + darkRatio * 0.75));

  // Approximate dominant facade tone from center/mid region of the original image.
  let sr = 0;
  let sg = 0;
  let sb = 0;
  let n = 0;
  for (let y = Math.floor(h * 0.28); y < Math.floor(h * 0.78); y++) {
    for (let x = 0; x < w; x++) {
      const sx = Math.floor((x / w) * Math.max(1, img.bitmap.width - 1));
      const sy = Math.floor((y / h) * Math.max(1, img.bitmap.height - 1));
      const c = intToRGBA(img.getPixelColor(sx, sy));
      const lum = 0.2126 * c.r + 0.7152 * c.g + 0.0722 * c.b;
      if (lum < 26 || lum > 232) continue;
      sr += c.r;
      sg += c.g;
      sb += c.b;
      n += 1;
    }
  }
  const ar = n ? sr / n : 96;
  const ag = n ? sg / n : 120;
  const ab = n ? sb / n : 178;

  // Boost saturation/contrast so facade colors remain distinguishable on dark basemap.
  const rgbMean = (ar + ag + ab) / 3;
  const satBoost = 1.65;
  const rSat = rgbMean + (ar - rgbMean) * satBoost;
  const gSat = rgbMean + (ag - rgbMean) * satBoost;
  const bSat = rgbMean + (ab - rgbMean) * satBoost;
  const dominantColor = rgbToHex(rSat * 1.08, gSat * 1.08, bSat * 1.08);

  return {
    profile8,
    bands: [1, +midBand.toFixed(3), +crownBand.toFixed(3)],
    confidence: +confidence.toFixed(3),
    dominantColor,
  };
}

function loadCards() {
  const code = fs.readFileSync(CARDS_PATH, "utf8");
  const ctx = { window: {} };
  vm.createContext(ctx);
  vm.runInContext(code, ctx);
  return ctx.propertyCardsData || ctx.window.propertyCardsData || [];
}

function loadCoords() {
  const code = fs.readFileSync(COORDS_PATH, "utf8");
  const ctx = { window: {} };
  vm.createContext(ctx);
  vm.runInContext(code, ctx);
  return ctx.propertyCoordinates || ctx.window.propertyCoordinates || {};
}

function walkFiles(dir, out = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) walkFiles(full, out);
    else out.push(full);
  }
  return out;
}

function buildImageCatalog() {
  const files = walkFiles(IMAGES_DIR)
    .filter((f) => /\.(png|jpe?g|webp|avif)$/i.test(f));
  return files.map((full) => {
    const rel = path.relative(IMAGES_DIR, full).replace(/\\/g, "/");
    const file = path.basename(full);
    return {
      file,
      rel,
      full,
      norm: normalize(rel),
      toks: tokenize(rel),
    };
  });
}

function chooseImageCandidates(card, catalog) {
  const chosen = new Map();

  const push = (c, score) => {
    if (!c) return;
    const prev = chosen.get(c.rel);
    if (!prev || score > prev.score) chosen.set(c.rel, { ...c, score });
  };

  const declared = Array.isArray(card.images) ? card.images : [];
  for (const img of declared) {
    const fn = path.basename(String(img || "").replace(/^\.\//, ""));
    const hit = catalog.find((c) => c.file.toLowerCase() === fn.toLowerCase());
    if (hit) push(hit, 100);
  }

  const name = String(card.schemeName || "").replace(/^@/, "");
  const tokens = tokenize(name);
  if (!tokens.length) {
    return Array.from(chosen.values()).sort((a, b) => b.score - a.score).slice(0, 6);
  }

  for (const c of catalog) {
    let score = 0;
    for (const t of tokens) {
      if (c.norm.includes(t)) score += 2;
      else if (c.toks.includes(t)) score += 1;
    }
    if (score > 0) push(c, score);
  }

  return Array.from(chosen.values())
    .sort((a, b) => b.score - a.score)
    .slice(0, 6);
}

async function main() {
  const cards = loadCards();
  const coords = loadCoords();
  const catalog = buildImageCatalog();

  const byName = new Map();
  const cardByNorm = new Map();
  for (const c of cards) {
    const name = String(c.schemeName || "").trim();
    if (!name || byName.has(name)) continue;
    byName.set(name, c);
    cardByNorm.set(normalize(name), c);
  }

  const out = {};
  const missing = [];
  let synthetic = 0;
  let mapped = 0;
  let generated = 0;
  let failed = 0;

  for (const [name, card] of byName.entries()) {
    const candidates = chooseImageCandidates(card, catalog);
    if (!candidates.length) continue;
    mapped += 1;

    let best = null;
    let bestImg = null;
    for (const img of candidates) {
      try {
        const profile = await profileFromImage(img.full);
        if (!best || profile.confidence > best.confidence) {
          best = profile;
          bestImg = img;
        }
      } catch (e) {
        // Try the next candidate file.
      }
    }

    if (!best || !bestImg) {
      failed += 1;
      continue;
    }

    out[name] = {
      profile8: best.profile8,
      bands: best.bands,
      confidence: best.confidence,
      dominantColor: best.dominantColor,
      image: `imagesss/${bestImg.rel}`,
      source: bestImg.rel.startsWith("web-fallback/") ? "image-web-fallback" : "image-local",
    };
    generated += 1;
  }

  for (const n of Object.keys(coords)) {
    if (out[n] || out[`@${n}`]) continue;
    const card = cardByNorm.get(normalize(n)) || cardByNorm.get(normalize(`@${n}`)) || null;
    out[n] = buildFallbackProfile(n, card);
    synthetic += 1;
  }

  for (const n of Object.keys(coords)) {
    if (!out[n] && !out[`@${n}`]) missing.push(n);
  }

  const js = [
    "// Auto-generated by generateSilhouetteProfiles.cjs",
    "// Do not edit manually unless intentional.",
    "window.propertySilhouetteProfiles = ",
    JSON.stringify(out, null, 2),
    ";",
    "",
  ].join("\n");

  fs.writeFileSync(OUTPUT_PATH, js, "utf8");
  fs.writeFileSync(MISSING_PATH, JSON.stringify(missing, null, 2), "utf8");
  fs.writeFileSync(REPORT_PATH, JSON.stringify({
    totalCards: byName.size,
    imageMapped: mapped,
    imageGenerated: generated,
    imageFailed: failed,
    syntheticGenerated: synthetic,
    mappableTotal: Object.keys(coords).length,
    mappableWithoutProfile: missing.length,
  }, null, 2), "utf8");
  console.log("Silhouette profiles generated:", generated, "mapped:", mapped, "failed:", failed, "total cards:", byName.size);
  console.log("Synthetic fallback generated:", synthetic);
  console.log("Mappable without profile:", missing.length);
  console.log("Missing list:", MISSING_PATH);
  console.log("Coverage report:", REPORT_PATH);
  console.log("Output:", OUTPUT_PATH);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
