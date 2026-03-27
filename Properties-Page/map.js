// ============================================================
// CINEMATIC REAL-ESTATE EXPLORER — map.js
// Ahmedabad 3D Property Map Engine
// ============================================================
// Dependencies (must be loaded before this file):
//   - Mapbox GL JS (global `mapboxgl`)
//   - propertyCoordinates.js  → window.propertyCoordinates
//   - propertycards.js        → window.propertyCardsData
//   - silhouetteProfiles.js   → window.propertySilhouetteProfiles (optional)
// ============================================================

mapboxgl.accessToken = window.MAPBOX_ACCESS_TOKEN || "";

// ─────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────

const MAP_CENTER  = [72.5714, 23.0225];
const MAP_ZOOM    = 11;
const MAP_PITCH   = 55;
const MAP_BEARING = -10;

// Zoom thresholds
const ZOOM = {
  FAR_MAX:       7.4,
  LANDMARK_MIN:  6.8,
  ALL_BLDG_MIN:  8.8,
};

// Vivid colour palette — high contrast on dark-v11
const COLOR = {
  DEFAULT:    "#4f6cff",
  HOVER:      "#ffd166",
  ACTIVE:     "#ffe08a",
  LUXURY:     "#7b8fff",
  COMMERCIAL: "#56cfdd",
  PLOT:       "#a8ff78",
};

// Building footprint radii (metres) and extrusion heights by tier
const BUILDING = {
  luxury: {
    radius: 190,
    heights: { "5 bhk": 420, "4 bhk": 340, "3 bhk": 280, office: 320, default: 300 },
  },
  premium: {
    radius: 165,
    heights: { "5 bhk": 360, "4 bhk": 300, "3 bhk": 260, office: 300, default: 260 },
  },
  residential: {
    radius: 130,
    heights: { "3 bhk": 220, "2 bhk": 180, "1 bhk": 160, default: 170 },
  },
  commercial: {
    radius: 200,
    heights: { office: 300, retail: 280, showroom: 250, default: 280 },
  },
  plot: {
    radius: 80,
    heights: { default: 40 },
  },
};

const FEATURED_COUNT  = 12;
const MIN_SPREAD_DEG  = 0.012;

// ─────────────────────────────────────────
// GEOMETRY HELPERS
// ─────────────────────────────────────────

// Degrees-per-metre at a given latitude
function metersToDeg(lat) {
  return {
    lat: 1 / 111320,
    lng: 1 / (111320 * Math.cos((lat * Math.PI) / 180)),
  };
}

// Stable building orientation derived from property name (−36° … +36°)
function nameToAngle(name) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (Math.imul(h, 31) + name.charCodeAt(i)) | 0;
  return ((Math.abs(h) % 72) - 36) * (Math.PI / 180);
}

// Stable [0..1) pseudo-random from a project name + seed
function hash01(name, seed = 0) {
  let h = 2166136261 ^ seed;
  for (let i = 0; i < name.length; i++) {
    h ^= name.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 1000000) / 1000000;
}

function normalizeProjectName(s) {
  return String(s || "")
    .trim()
    .replace(/^[@#\s\._,;:-]+/, "")
    .replace(/[\-_]+/g, " ")
    .replace(/\s+/g, " ")
    .toLowerCase();
}

function shiftHexColor(hex, amount = 0) {
  const m = String(hex || "").match(/^#?([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i);
  if (!m) return COLOR.DEFAULT;
  const r = Math.max(0, Math.min(255, parseInt(m[1], 16) + amount));
  const g = Math.max(0, Math.min(255, parseInt(m[2], 16) + amount));
  const b = Math.max(0, Math.min(255, parseInt(m[3], 16) + amount));
  const toHex = (v) => v.toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

// Parse floor count from features list  e.g. "G+22 Floors"  →  22
function parseFloorCount(card) {
  if (!card || typeof card !== "object") return null;
  const feats = Array.isArray(card.features) ? card.features : [];
  for (const f of feats) {
    let m = f.match(/g\s*\+\s*(\d+)/i);
    if (m) return parseInt(m[1], 10);
    m = f.match(/(\d+)\s*(?:floor|storey|stor(?:y|ies))/i);
    if (m) return parseInt(m[1], 10);
  }
  return null;
}

// Infer building footprint dimensions (metres) from property name + type
// Rectangles with realistic aspect ratios: towers are narrow, slabs are wide
function inferDimensions(card) {
  const nm  = (card.schemeName || "").toLowerCase();
  const tp  = (card.type       || "").toLowerCase();
  const bhk = String(card.categories?.[0]?.bhk || card.title || "").toLowerCase();

  if (tp.includes("plot") || bhk.includes("plot"))                  return { w: 34, d: 34 };
  if (/villa|bungalow|row.?house|duplex|twin/i.test(nm))            return { w: 28, d: 20 };

  // Commercial: wide, squat podium
  if (tp.includes("commercial") ||
      /hub|mall|plaza|arcade|centre|center|complex|business|office/i.test(nm))
    return { w: 62, d: 42 };

  // Luxury / named towers: very narrow, slender
  if (/tower|pinnacle|sky.?(line|rise)|altitude|icon|summit|apex/i.test(nm) ||
      bhk.includes("5 bhk") || bhk.includes("4 bhk") ||
      /luxuria|imperial|elite|grand|royal|prestige/i.test(nm))
    return { w: 21, d: 34 };

  // 3 BHK mid-rise slab
  if (bhk.includes("3 bhk")) return { w: 32, d: 40 };

  // Default: standard residential slab
  return { w: 28, d: 34 };
}

// Distinct silhouette footprints per property (base / mid / crown)
function createSilhouetteFootprint([lng, lat], card, part = "base") {
  const name  = card?.schemeName || "project";
  const angle = nameToAngle(name);
  const baseDims = inferDimensions(card || {});
  const w = baseDims.w * (0.68 + hash01(name, 501) * 1.10);
  const d = baseDims.d * (0.68 + hash01(name, 777) * 1.10);
  const { lat: dLat, lng: dLng } = metersToDeg(lat);
  const cosA = Math.cos(angle), sinA = Math.sin(angle);

  const family = Math.floor(hash01(name, 33) * 5); // 5 silhouette families
  const jitter = 0.87 + hash01(name, 97) * 0.26;
  const profLib = (window && window.propertySilhouetteProfiles) || {};
  const normName = String(name || "").replace(/^@/, "");
  const meta = profLib[name] || profLib[`@${normName}`] || profLib[normName] || null;

  const familyProfiles = [
    [1.00, 0.86, 1.06, 0.84, 0.98, 0.88, 1.02, 0.90], // faceted tower
    [1.00, 0.78, 0.98, 0.76, 1.00, 0.80, 1.02, 0.82], // blade
    [1.04, 0.92, 0.94, 0.92, 1.04, 0.92, 0.96, 0.92], // twin massing
    [1.06, 0.76, 1.06, 0.76, 1.06, 0.76, 1.06, 0.76], // star-ish crown
    [1.00, 0.94, 0.96, 0.90, 1.00, 0.94, 0.96, 0.90], // podium + shaft
  ];

  const defaultPartScale = part === "base" ? 1.00 : part === "mid" ? 0.72 : 0.44;
  const bands = Array.isArray(meta?.bands) && meta.bands.length === 3 ? meta.bands : null;
  const partScale = part === "base"
    ? (bands ? bands[0] : defaultPartScale)
    : part === "mid"
      ? (bands ? bands[1] : defaultPartScale)
      : (bands ? bands[2] : defaultPartScale);
  const taperBias = part === "base" ? 1.00 : part === "mid" ? 0.96 : 0.90;
  const generated = meta?.profile8;
  const profile = (Array.isArray(generated) && generated.length === 8)
    ? generated
    : familyProfiles[family];

  const ring = [];
  for (let i = 0; i < 8; i++) {
    const t = (i / 8) * Math.PI * 2;
    const mx = profile[i] * jitter * taperBias;
    const my = profile[(i + 2) % 8] * jitter * taperBias;
    const x = (w * 0.5 * partScale) * Math.cos(t) * mx;
    const y = (d * 0.5 * partScale) * Math.sin(t) * my;
    const rx = x * cosA - y * sinA;
    const ry = x * sinA + y * cosA;
    ring.push([lng + rx * dLng, lat + ry * dLat]);
  }
  ring.push(ring[0]);
  return ring;
}

// ─────────────────────────────────────────
// PROPERTY CLASSIFICATION
// ─────────────────────────────────────────

function classifyProperty(card) {
  if (!card) return { tier: "residential", bhkKey: "default", color: COLOR.DEFAULT };

  const type   = (card.type || "").toLowerCase();
  const bhkRaw = Array.isArray(card.categories) && card.categories.length
    ? String(card.categories[0].bhk || "")
    : String(card.title || "");
  const bhkKey = bhkRaw.toLowerCase().replace(/\s+/g, " ").trim();
  const name   = (card.schemeName || "").toLowerCase();

  if (type.includes("commercial") || bhkKey.includes("office") ||
      bhkKey.includes("showroom") || bhkKey.includes("retail")) {
    return { tier: "commercial", bhkKey, color: COLOR.COMMERCIAL };
  }
  if (bhkKey.includes("plot") || type.includes("plot")) {
    return { tier: "plot", bhkKey, color: COLOR.PLOT };
  }
  if (bhkKey.includes("5 bhk") || bhkKey.includes("4 bhk") ||
      /luxuria|imperial|elite|grand|sky|heights|tower/i.test(name)) {
    return { tier: "luxury", bhkKey, color: COLOR.LUXURY };
  }
  if (bhkKey.includes("3 bhk")) {
    return { tier: "premium", bhkKey, color: COLOR.DEFAULT };
  }
  return { tier: "residential", bhkKey, color: COLOR.DEFAULT };
}

function getBuildingMetrics(card) {
  const { tier, bhkKey } = classifyProperty(card);
  const cfg     = BUILDING[tier] || BUILDING.residential;
  const heights = cfg.heights;

  let tierH = heights.default;
  for (const [key, val] of Object.entries(heights)) {
    if (key !== "default" && bhkKey.includes(key)) { tierH = val; break; }
  }

  // Floor count from features string overrides tier default (14m visual per floor)
  const floors = parseFloorCount(card);
  const height = (floors != null && floors >= 2)
    ? Math.max(floors * 14, 30)
    : tierH;

  return { radius: cfg.radius, height, tier };
}

// ─────────────────────────────────────────
// PROJECT INDEX
// ─────────────────────────────────────────

function buildProjectIndex() {
  const coords = window.propertyCoordinates || {};
  const cards  = window.propertyCardsData  || [];
  const profLib = window.propertySilhouetteProfiles || {};

  // Ahmedabad bounding box — filter out bogus overseas coordinates
  const AHD = { minLng: 72.3, maxLng: 72.9, minLat: 22.8, maxLat: 23.4 };
  const inAhd = (coord) => {
    if (!Array.isArray(coord) || coord.length < 2) return false;
    const [lng, lat] = coord;
    if (!Number.isFinite(lng) || !Number.isFinite(lat)) return false;
    return lng >= AHD.minLng && lng <= AHD.maxLng && lat >= AHD.minLat && lat <= AHD.maxLat;
  };

  const cardByName = {};
  const cardByNorm = {};
  const profileByNorm = {};
  for (const card of cards) {
    if (!card.schemeName) continue;
    const n = card.schemeName.trim();
    if (!cardByName[n]) cardByName[n] = card;
    const norm = normalizeProjectName(n);
    if (norm && !cardByNorm[norm]) cardByNorm[norm] = card;
  }

  for (const [k, v] of Object.entries(profLib)) {
    const norm = normalizeProjectName(k);
    if (norm && !profileByNorm[norm]) profileByNorm[norm] = v;
  }

  const index = {};
  for (const [name, coord] of Object.entries(coords)) {
    if (!inAhd(coord)) continue;
    const card =
      cardByName[name] ||
      cardByName[`@${name}`] ||
      cardByNorm[normalizeProjectName(name)] ||
      { schemeName: name, title: name, categories: [] };
    const profile =
      profLib[name] ||
      profLib[`@${name}`] ||
      profileByNorm[normalizeProjectName(name)] ||
      null;
    const cardImg = Array.isArray(card?.images) && card.images.length
      ? String(card.images[0] || "")
      : "";
    const profileImg = String(profile?.image || "");
    const imageRaw = profileImg || cardImg;
    const image = imageRaw
      ? imageRaw.replace(/^\.\//, "")
      : "";
    const metrics = getBuildingMetrics(card);
    const { color: tierColor } = classifyProperty(card);
    const color = /^#[0-9a-f]{6}$/i.test(profile?.dominantColor || "")
      ? profile.dominantColor
      : tierColor;
    index[name] = { name, coord, card, ...metrics, color, image };
  }
  return index;
}

const projectIndex    = buildProjectIndex();
const allProjectNames = Object.keys(projectIndex);

// ─────────────────────────────────────────
// LANDMARK SELECTION
// ─────────────────────────────────────────

function scoreProject(p) {
  let score = 0;
  const card = p.card || {};
  const bhk  = Array.isArray(card.categories) && card.categories.length
    ? String(card.categories[0].bhk || "").toLowerCase() : "";

  if (bhk.includes("5 bhk")) score += 6;
  else if (bhk.includes("4 bhk")) score += 5;
  else if (bhk.includes("3 bhk")) score += 3;
  if (/adani|shaligram|shridhar|ratna|sobha|times|satyamev|emberlynn/i.test(p.name)) score += 4;
  if (/luxuria|sky|heights|imperial|elite|tower|grand|obsidian/i.test(p.name)) score += 3;
  if (Array.isArray(card.images) && card.images.length >= 3) score += 2;
  if ((card.type || "").toLowerCase().includes("commercial")) score += 2;
  if (p.height >= 300) score += 3;
  return score;
}

function geoDistance(a, b) {
  const dx = a[0] - b[0], dy = a[1] - b[1];
  return Math.sqrt(dx * dx + dy * dy);
}

const sortedByScore = allProjectNames
  .map((n) => projectIndex[n])
  .sort((a, b) => scoreProject(b) - scoreProject(a));

const featuredProjectNames = [];
for (const p of sortedByScore) {
  if (featuredProjectNames.length >= FEATURED_COUNT) break;
  const tooClose = featuredProjectNames.some(
    (n) => geoDistance(p.coord, projectIndex[n].coord) < MIN_SPREAD_DEG
  );
  if (!tooClose) featuredProjectNames.push(p.name);
}

// ─────────────────────────────────────────
// GEOJSON BUILDERS
// ─────────────────────────────────────────

function buildExtrusionGeoJSON(names, part = "base") {
  let id = 1;
  return {
    type: "FeatureCollection",
    features: names
      .filter((n) => projectIndex[n])
      .map((name) => {
        const p = projectIndex[name];
        const full = Math.max(p.height, 48);
        const hBase = Math.round(full * 0.58);
        const hMid = Math.round(full * 0.28);
        const hCrown = Math.round(full * 0.14);
        const base = 0;
        const partBase = part === "base" ? base : part === "mid" ? hBase : hBase + hMid;
        const partHeight = part === "base" ? hBase : part === "mid" ? hMid : hCrown;
        const partColor = part === "base"
          ? shiftHexColor(p.color, -22)
          : part === "mid"
            ? shiftHexColor(p.color, -4)
            : shiftHexColor(p.color, 18);
        return {
          type: "Feature",
          id:   id++,
          properties: {
            name,
            lng:    p.coord[0],
            lat:    p.coord[1],
            height: partHeight,
            base:   partBase,
            fullHeight: full,
            tier:   p.tier,
            color:  partColor,
          },
          geometry: {
            type:        "Polygon",
            coordinates: [createSilhouetteFootprint(p.coord, p.card || {}, part)],
          },
        };
      }),
  };
}

const featuredBaseGeoJSON = buildExtrusionGeoJSON(featuredProjectNames, "base");
const featuredMidGeoJSON = buildExtrusionGeoJSON(featuredProjectNames, "mid");
const featuredCrownGeoJSON = buildExtrusionGeoJSON(featuredProjectNames, "crown");

const otherNames = allProjectNames.filter((n) => !featuredProjectNames.includes(n));
const othersBaseGeoJSON = buildExtrusionGeoJSON(otherNames, "base");
const othersMidGeoJSON = buildExtrusionGeoJSON(otherNames, "mid");
const othersCrownGeoJSON = buildExtrusionGeoJSON(otherNames, "crown");

// Far-zoom visual: keep featured silhouettes visible as a tight Gujarat cluster.
function buildFarClusterGeoJSON(part = "base") {
  const names = featuredProjectNames.slice(0, FEATURED_COUNT);
  let id = 1;
  return {
    type: "FeatureCollection",
    features: names.map((name, i) => {
      const p = projectIndex[name];
      const a = i * 0.64 + hash01(name, 7) * 0.5;
      const r = 0.035 + ((i % 4) * 0.007);
      const farCoord = [
        MAP_CENTER[0] + Math.cos(a) * r,
        MAP_CENTER[1] + Math.sin(a) * r * 0.72,
      ];

      const full = Math.max(70, Math.round(p.height * 0.35));
      const hBase = Math.round(full * 0.56);
      const hMid = Math.round(full * 0.30);
      const hCrown = Math.round(full * 0.14);
      const partBase = part === "base" ? 0 : part === "mid" ? hBase : hBase + hMid;
      const partHeight = part === "base" ? hBase : part === "mid" ? hMid : hCrown;
      const partColor = part === "base"
        ? shiftHexColor(p.color, -22)
        : part === "mid"
          ? shiftHexColor(p.color, -4)
          : shiftHexColor(p.color, 18);

      return {
        type: "Feature",
        id: id++,
        properties: {
          name,
          lng: p.coord[0],
          lat: p.coord[1],
          height: partHeight,
          base: partBase,
          fullHeight: full,
          tier: p.tier,
          color: partColor,
        },
        geometry: {
          type: "Polygon",
          coordinates: [createSilhouetteFootprint(farCoord, p.card || {}, part)],
        },
      };
    }),
  };
}

const featuredFarBaseGeoJSON = buildFarClusterGeoJSON("base");
const featuredFarMidGeoJSON = buildFarClusterGeoJSON("mid");
const featuredFarCrownGeoJSON = buildFarClusterGeoJSON("crown");

// Build featureLookup: name → { sourceId, id }
const featureLookup = {};
[
  { geojson: featuredBaseGeoJSON, sourceId: "featured-projects-base" },
  { geojson: othersBaseGeoJSON,   sourceId: "other-projects-base"    },
].forEach(({ geojson, sourceId }) => {
  geojson.features.forEach((f) => {
    featureLookup[f.properties.name] = { sourceId, id: f.id };
  });
});

// ─────────────────────────────────────────
// MAP INIT — lazy, called when map zone scrolls into view
// ─────────────────────────────────────────

let map    = null;
let popup  = null;

// State (declared here so helper functions can reference them safely)
let hoveredId     = null;
let hoveredSource = null;
let activeId      = null;
let activeSource  = null;
let glowRafId     = null;
let photoMarkers  = [];
let filterVisibleSet = null;
let markerRafId = null;

window.initMapExplorer = function () {
  if (map) { map.resize(); return; }

  // ── Hide overlay immediately — never block on map events ──────────────
  // The overlay disappears in 600ms regardless of token/network/WebGL state.
  const overlayEl = document.getElementById("map-loading");
  function hideOverlay() {
    if (!overlayEl || overlayEl.style.opacity === "0") return;
    overlayEl.style.opacity = "0";
    setTimeout(() => { if (overlayEl?.parentNode) overlayEl.remove(); }, 700);
  }
  setTimeout(hideOverlay, 600);

  // ── Create map (try-catch: guards against WebGL unavailable / bad env) ──
  try {
    map = new mapboxgl.Map({
      container: "map",
      style:     "mapbox://styles/mapbox/dark-v11",
      center:    MAP_CENTER,
      zoom:      9,
      pitch:     30,
      bearing:   -20,
      antialias: true,
    });
  } catch (e) {
    console.error("[MapExplorer] mapboxgl.Map constructor failed:", e);
    hideOverlay();
    return;
  }

  window.mapInstance = map; // expose for zoom HUD

  // Force WebGL canvas to correct size after layout is settled
  requestAnimationFrame(() => { map.resize(); });

  popup = new mapboxgl.Popup({
    closeButton: false,
    closeOnClick: false,
    offset: 14,
    maxWidth: "260px",
  });

  map.addControl(new mapboxgl.NavigationControl({ showCompass: true }), "top-right");

  map.on("error", (e) => {
    console.warn("[MapExplorer] Mapbox error:", e?.error?.message || e);
  });

  map.on("load", () => {

  // Atmosphere
  map.setFog({
    range:           [1, 12],
    color:           "#0b0f1a",
    "horizon-blend": 0.25,
    "space-color":   "#050711",
    "star-intensity": 0.2,
  });

  // Style overrides
  const layers = map.getStyle().layers;

  layers
    .filter((l) => l.type === "fill-extrusion" || l.id.includes("building"))
    .forEach((l) => map.setLayoutProperty(l.id, "visibility", "none"));

  for (const layer of layers) {
    const id = layer.id;
    if (id.includes("water") || id.includes("river") || id.includes("lake")) {
      if (layer.type === "fill") map.setPaintProperty(id, "fill-color", "#0a1f35");
      if (layer.type === "line") map.setPaintProperty(id, "line-color", "#0a1f35");
    }
    if (id.includes("road-primary") || id.includes("road-motorway") || id.includes("road-trunk")) {
      if (layer.type === "line") {
        map.setPaintProperty(id, "line-color", "#2a3c58");
        map.setPaintProperty(id, "line-width", ["interpolate", ["linear"], ["zoom"], 5, 0.5, 10, 2, 15, 5]);
      }
    }
    if (id.includes("road-secondary") || id.includes("road-street") || id.includes("road-minor")) {
      if (layer.type === "line") {
        map.setPaintProperty(id, "line-color", "#151d2b");
        map.setPaintProperty(id, "line-width", ["interpolate", ["linear"], ["zoom"], 12, 0.4, 16, 1.5]);
      }
    }
    if (id.includes("park") || id.includes("green") || id.includes("grass")) {
      if (layer.type === "fill") map.setPaintProperty(id, "fill-color", "#0b1a0f");
    }
    if (id.includes("poi") || id.includes("transit") || id.includes("natural") ||
        id.includes("waterway-label") || id.includes("road-label")) {
      map.setLayoutProperty(id, "visibility", "none");
    }
  }

  // Sources: three silhouette bands (base/mid/crown) for featured + all properties
  map.addSource("featured-projects-base",  { type: "geojson", data: featuredBaseGeoJSON });
  map.addSource("featured-projects-mid",   { type: "geojson", data: featuredMidGeoJSON });
  map.addSource("featured-projects-crown", { type: "geojson", data: featuredCrownGeoJSON });

  map.addSource("other-projects-base",  { type: "geojson", data: othersBaseGeoJSON });
  map.addSource("other-projects-mid",   { type: "geojson", data: othersMidGeoJSON });
  map.addSource("other-projects-crown", { type: "geojson", data: othersCrownGeoJSON });

  // Far-zoom cluster near Gujarat center: always visible, no dots
  map.addSource("featured-projects-far-base",  { type: "geojson", data: featuredFarBaseGeoJSON });
  map.addSource("featured-projects-far-mid",   { type: "geojson", data: featuredFarMidGeoJSON });
  map.addSource("featured-projects-far-crown", { type: "geojson", data: featuredFarCrownGeoJSON });

  // ── Real city buildings from OSM (dark backdrop — actual Ahmedabad footprints) ──
  // These sit BELOW our property layers so featured buildings pop out on top.
  map.addLayer({
    id:             "city-buildings-3d",
    type:           "fill-extrusion",
    source:         "composite",
    "source-layer": "building",
    minzoom:        14,
    filter:         ["==", ["get", "extrude"], "true"],
    paint: {
      "fill-extrusion-color":   "#080d1a",
      "fill-extrusion-height":  [
        "interpolate", ["linear"], ["zoom"],
        14, 0,
        16, ["coalesce", ["to-number", ["get", "height"], null], 10],
      ],
      "fill-extrusion-base":    ["coalesce", ["to-number", ["get", "min_height"], null], 0],
      "fill-extrusion-opacity": ["interpolate", ["linear"], ["zoom"], 14, 0, 15, 0.75],
      "fill-extrusion-vertical-gradient": true,
    },
  });

  // Shared colour expression: active → ACTIVE, hover → HOVER, else tier colour
  const colorExpr = [
    "case",
    ["boolean", ["feature-state", "active"], false], COLOR.ACTIVE,
    ["boolean", ["feature-state", "hover"],  false], COLOR.HOVER,
    ["get", "color"],
  ];

  function addSilhouetteLayer(id, source, minzoom, maxzoom, opacityStops) {
    const layer = {
      id,
      type: "fill-extrusion",
      source,
      minzoom,
      paint: {
        "fill-extrusion-color": colorExpr,
        "fill-extrusion-height": [
          "interpolate", ["linear"], ["zoom"],
          minzoom, 0,
          Math.min(minzoom + 2.5, 16), ["get", "height"],
        ],
        "fill-extrusion-base": ["get", "base"],
        "fill-extrusion-opacity": ["interpolate", ["linear"], ["zoom"], ...opacityStops],
        "fill-extrusion-vertical-gradient": true,
        "fill-extrusion-color-transition": { duration: 320 },
      },
    };
    if (typeof maxzoom === "number") layer.maxzoom = maxzoom;
    map.addLayer(layer);
  }

  // Far silhouettes: visible even at global zoom-out, clustered in Gujarat.
  addSilhouetteLayer("featured-far-base-3d",  "featured-projects-far-base",  0, ZOOM.FAR_MAX, [0, 0.9, ZOOM.FAR_MAX - 0.5, 0.7, ZOOM.FAR_MAX, 0]);
  addSilhouetteLayer("featured-far-mid-3d",   "featured-projects-far-mid",   0, ZOOM.FAR_MAX, [0, 0.8, ZOOM.FAR_MAX - 0.5, 0.6, ZOOM.FAR_MAX, 0]);
  addSilhouetteLayer("featured-far-crown-3d", "featured-projects-far-crown", 0, ZOOM.FAR_MAX, [0, 0.7, ZOOM.FAR_MAX - 0.5, 0.55, ZOOM.FAR_MAX, 0]);

  // Featured silhouettes: always present once approaching city zoom.
  addSilhouetteLayer("featured-projects-base-3d",  "featured-projects-base",  ZOOM.LANDMARK_MIN, 24, [ZOOM.LANDMARK_MIN, 0.25, ZOOM.LANDMARK_MIN + 1.4, 0.92]);
  addSilhouetteLayer("featured-projects-mid-3d",   "featured-projects-mid",   ZOOM.LANDMARK_MIN + 0.2, 24, [ZOOM.LANDMARK_MIN + 0.2, 0.1, ZOOM.LANDMARK_MIN + 1.6, 0.85]);
  addSilhouetteLayer("featured-projects-crown-3d", "featured-projects-crown", ZOOM.LANDMARK_MIN + 0.35, 24, [ZOOM.LANDMARK_MIN + 0.35, 0.05, ZOOM.LANDMARK_MIN + 1.8, 0.8]);

  // All remaining properties: progressively reveal as user zooms in.
  addSilhouetteLayer("other-projects-base-3d",  "other-projects-base",  ZOOM.ALL_BLDG_MIN, 24, [ZOOM.ALL_BLDG_MIN, 0, ZOOM.ALL_BLDG_MIN + 1.6, 0.85]);
  addSilhouetteLayer("other-projects-mid-3d",   "other-projects-mid",   ZOOM.ALL_BLDG_MIN + 0.45, 24, [ZOOM.ALL_BLDG_MIN + 0.45, 0, ZOOM.ALL_BLDG_MIN + 1.9, 0.75]);
  addSilhouetteLayer("other-projects-crown-3d", "other-projects-crown", ZOOM.ALL_BLDG_MIN + 0.8, 24, [ZOOM.ALL_BLDG_MIN + 0.8, 0, ZOOM.ALL_BLDG_MIN + 2.2, 0.72]);

  buildPhotoMarkers();
  map.on("zoom", schedulePhotoMarkerUpdate);
  map.on("move", schedulePhotoMarkerUpdate);

  try {
    wireInteractions();
  } catch (e) {
    console.error("[MapExplorer] wireInteractions error:", e);
  } finally {
    cinematicIntro(); // always fires — hides overlay + starts fly-in
  }
  }); // end map.on("load")
}; // end window.initMapExplorer

// ─────────────────────────────────────────
// EASING
// ─────────────────────────────────────────

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

// ─────────────────────────────────────────
// CINEMATIC INTRO
// ─────────────────────────────────────────

function cinematicIntro() {
  const overlay = document.getElementById("map-loading");
  if (overlay) {
    setTimeout(() => {
      overlay.style.opacity = "0";
      setTimeout(() => { if (overlay.parentNode) overlay.remove(); }, 700);
    }, 900);
  }

  map.flyTo({
    center:  MAP_CENTER,
    zoom:    MAP_ZOOM,
    pitch:   MAP_PITCH,
    bearing: MAP_BEARING,
    speed:   0.28,
    curve:   1.6,
    easing:  easeInOutCubic,
  });
}

// ─────────────────────────────────────────
// FLYTO PROPERTY
// ─────────────────────────────────────────

function flyToProperty(coord) {
  const drift = (Math.random() - 0.5) * 14;
  map.flyTo({
    center:  coord,
    zoom:    15.2,
    pitch:   58,
    bearing: MAP_BEARING + drift,
    speed:   0.32,
    curve:   1.5,
    easing:  easeInOutCubic,
  });
}

function createPhotoMarkerElement(project) {
  if (!project?.image) return null;

  const wrap = document.createElement("button");
  wrap.type = "button";
  wrap.className = "property-photo-marker";
  wrap.setAttribute("aria-label", project.name);

  const stem = document.createElement("span");
  stem.className = "property-photo-stem";

  const card = document.createElement("span");
  card.className = "property-photo-card";

  const img = document.createElement("img");
  img.className = "property-photo-img";
  img.loading = "lazy";
  img.decoding = "async";
  img.src = project.image;
  img.alt = project.name;

  const label = document.createElement("span");
  label.className = "property-photo-label";
  label.textContent = project.name;

  card.appendChild(img);
  card.appendChild(label);
  wrap.appendChild(stem);
  wrap.appendChild(card);

  return wrap;
}

function buildPhotoMarkers() {
  photoMarkers.forEach((m) => m.marker.remove());
  photoMarkers = [];

  for (const p of Object.values(projectIndex)) {
    const el = createPhotoMarkerElement(p);
    if (!el) continue;

    el.addEventListener("mouseenter", () => {
      popup.setLngLat(p.coord).setHTML(`<div class="map-popup"><div class="map-popup-title">${p.name}</div></div>`).addTo(map);
    });
    el.addEventListener("mouseleave", () => popup.remove());
    el.addEventListener("click", () => {
      flyToProperty(p.coord);
      window.dispatchEvent(new CustomEvent("propertySelected", { detail: { name: p.name } }));
      document.getElementById("map")?.classList.add("map-focus-mode");
    });

    const marker = new mapboxgl.Marker({ element: el, anchor: "bottom", offset: [0, -8] })
      .setLngLat(p.coord)
      .addTo(map);

    photoMarkers.push({ marker, el, project: p });
  }

  updatePhotoMarkers();
}

function schedulePhotoMarkerUpdate() {
  if (markerRafId) return;
  markerRafId = requestAnimationFrame(() => {
    markerRafId = null;
    updatePhotoMarkers();
  });
}

function updatePhotoMarkers() {
  if (!map || !photoMarkers.length) return;

  const z = map.getZoom();
  const center = map.getCenter();
  const show = z >= 10.2;
  const maxCount = z < 11.2 ? 36 : z < 12.2 ? 80 : 180;

  const ranked = photoMarkers
    .map((m) => {
      const [lng, lat] = m.project.coord;
      const dx = lng - center.lng;
      const dy = lat - center.lat;
      return { m, d2: dx * dx + dy * dy };
    })
    .sort((a, b) => a.d2 - b.d2);

  const allowed = new Set(ranked.slice(0, maxCount).map((x) => x.m.project.name));

  photoMarkers.forEach(({ el, project }) => {
    const byFilter = !filterVisibleSet || filterVisibleSet.has(project.name);
    const byDensity = allowed.has(project.name);
    const visible = show && byFilter && byDensity;
    el.style.display = visible ? "block" : "none";
    if (visible) {
      const scale = z < 11 ? 0.62 : z < 12 ? 0.78 : z < 13 ? 0.92 : 1.05;
      el.style.setProperty("--photo-scale", String(scale));
    }
  });
}

// ─────────────────────────────────────────
// STATE HELPERS
// ─────────────────────────────────────────

function clearHover() {
  if (hoveredId !== null && hoveredSource) {
    map.setFeatureState({ source: hoveredSource, id: hoveredId }, { hover: false });
  }
  hoveredId = null; hoveredSource = null;
}

function clearActive() {
  if (activeId !== null && activeSource) {
    map.setFeatureState({ source: activeSource, id: activeId }, { active: false });
  }
  activeId = null; activeSource = null;
  stopGlowPulse();
}

function setActive(sourceId, id) {
  clearActive();
  activeId     = id;
  activeSource = sourceId;
  map.setFeatureState({ source: sourceId, id }, { active: true });
  startGlowPulse();
}

// ─────────────────────────────────────────
// GLOW PULSE (RAF loop)
// ─────────────────────────────────────────

function startGlowPulse() {
  stopGlowPulse();
  const ls = ["featured-projects-base-3d", "other-projects-base-3d"];

  function tick() {
    const t       = (Math.sin(Date.now() / 380) + 1) / 2;
    const opacity = 0.82 + t * 0.18;
    const expr = ["case", ["boolean", ["feature-state", "active"], false], opacity, 0.6];
    ls.forEach((l) => { if (map.getLayer(l)) map.setPaintProperty(l, "fill-extrusion-opacity", expr); });
    glowRafId = requestAnimationFrame(tick);
  }

  glowRafId = requestAnimationFrame(tick);
}

function stopGlowPulse() {
  if (glowRafId !== null) { cancelAnimationFrame(glowRafId); glowRafId = null; }
  if (map.getLayer("featured-projects-base-3d"))
    map.setPaintProperty("featured-projects-base-3d", "fill-extrusion-opacity",
      ["interpolate", ["linear"], ["zoom"], ZOOM.LANDMARK_MIN, 0.14, ZOOM.LANDMARK_MIN + 1.4, 0.62]);
  if (map.getLayer("other-projects-base-3d"))
    map.setPaintProperty("other-projects-base-3d", "fill-extrusion-opacity",
      ["interpolate", ["linear"], ["zoom"], ZOOM.ALL_BLDG_MIN, 0, ZOOM.ALL_BLDG_MIN + 1.6, 0.52]);
}

// ─────────────────────────────────────────
// POPUP
// ─────────────────────────────────────────

function showPopup(lngLat, project) {
  const card  = project.card;
  const bhk   = card && Array.isArray(card.categories) && card.categories.length
    ? card.categories[0].bhk   || "" : "";
  const price = card && Array.isArray(card.categories) && card.categories.length
    ? card.categories[0].price || "" : "";
  const loc   = (card && (card.propertyLocation || card.latest)) || "";

  popup.setLngLat(lngLat).setHTML(`
    <div class="map-popup">
      <div class="map-popup-title">${project.name}</div>
      ${loc   ? `<div class="map-popup-loc">📍 ${loc}</div>` : ""}
      ${bhk   ? `<div class="map-popup-line">${bhk}</div>`    : ""}
      ${price ? `<div class="map-popup-price">${price}</div>` : ""}
    </div>
  `).addTo(map);
}

// ─────────────────────────────────────────
// INTERACTIONS
// ─────────────────────────────────────────

function wireInteractions() {
  const extrusionLayers = ["featured-projects-base-3d", "other-projects-base-3d"];

  extrusionLayers.forEach((layerId) => {
    map.on("mousemove", layerId, (e) => {
      if (!e.features?.length) return;
      const f = e.features[0];
      if (hoveredId !== null && (hoveredId !== f.id || hoveredSource !== f.source)) {
        map.setFeatureState({ source: hoveredSource, id: hoveredId }, { hover: false });
      }
      hoveredId     = f.id;
      hoveredSource = f.source;
      map.setFeatureState({ source: f.source, id: f.id }, { hover: true });
      map.getCanvas().style.cursor = "pointer";
      const project = projectIndex[f.properties.name];
      if (project) showPopup(e.lngLat, project);
    });

    map.on("mouseleave", layerId, () => {
      clearHover();
      map.getCanvas().style.cursor = "";
      popup.remove();
    });

    map.on("click", layerId, (e) => {
      if (!e.features?.length) return;
      const f    = e.features[0];
      const name = f.properties.name;
      setActive(f.source, f.id);
      flyToProperty([f.properties.lng, f.properties.lat]);
      window.dispatchEvent(new CustomEvent("propertySelected", { detail: { name } }));
      document.getElementById("map")?.classList.add("map-focus-mode");
    });
  });

  // Carousel → Map
  window.addEventListener("propertyCarouselChanged", (e) => {
    const name = e.detail?.name;
    if (!name) return;
    const lookup  = featureLookup[name];
    const project = projectIndex[name];
    if (!lookup || !project) return;
    setActive(lookup.sourceId, lookup.id);
    flyToProperty(project.coord);
    document.getElementById("map")?.classList.add("map-focus-mode");
  });

  // Filters → Map silhouettes
  window.addEventListener("propertyFiltersChanged", (e) => {
    if (!e.detail?.names) return;
    const visible   = e.detail.names;
    filterVisibleSet = new Set(visible);
    const filterExp = ["in", ["get", "name"], ["literal", visible]];
    [
      "featured-projects-base-3d", "featured-projects-mid-3d", "featured-projects-crown-3d",
      "other-projects-base-3d", "other-projects-mid-3d", "other-projects-crown-3d",
      "featured-far-base-3d", "featured-far-mid-3d", "featured-far-crown-3d",
    ].forEach((layerId) => { if (map.getLayer(layerId)) map.setFilter(layerId, filterExp); });
    schedulePhotoMarkerUpdate();
  });
}


