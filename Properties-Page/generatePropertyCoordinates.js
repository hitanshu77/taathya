const fs = require("fs");
const https = require("https");

const propertyCardsData = require("./propertycards");

const MAPBOX_TOKEN = process.env.MAPBOX_ACCESS_TOKEN || "";

function getValidProjectName(name) {
  if (!name) return null;

  // Remove leading symbols like "@", "#", punctuation and whitespace
  let cleaned = name.trim().replace(/^[@#\s\.\-_,;:]+/, "").trim();

  if (!cleaned) return null;

  const lower = cleaned.toLowerCase();

  // Descriptive / marketing phrases that should be skipped
  const descriptivePatterns = [
    "ready to move",
    "fully furnished",
    "luxurious",
    "luxury",
    "pre launch",
    "pre-launch",
    "prelaunch",
    "limited plots",
    "limited units",
    "corporate house",
    "showroom",
    "office",
    "pre-leased",
    "pre leased",
    "preleased",
    "pre-leased property",
    "preleased property",
    "pre leased property",
    "best investment property",
    "investment property",
    "bungalow",
    "plot",
  ];

  if (descriptivePatterns.some((pattern) => lower.startsWith(pattern))) {
    return null;
  }

  // Also skip if the whole thing looks like a generic descriptor
  if (
    [
      "corporate house",
      "showroom",
      "office",
      "pre-leased property",
      "investment property",
    ].includes(lower)
  ) {
    return null;
  }

  return cleaned;
}

function geocode(query) {
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
    query
  )}.json?access_token=${MAPBOX_TOKEN}&limit=1`;

  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        let data = "";

        res.on("data", (chunk) => {
          data += chunk;
        });

        res.on("end", () => {
          try {
            const json = JSON.parse(data);
            resolve(json);
          } catch (err) {
            reject(err);
          }
        });
      })
      .on("error", (err) => reject(err));
  });
}

async function main() {
  const coordinatesMap = {};

  for (const card of propertyCardsData) {
    const schemeName = card.schemeName || "";
    const propertyLocation = card.propertyLocation || "";

    const projectName = getValidProjectName(schemeName);

    // Skip entries without a valid project/development name
    if (!projectName) {
      continue;
    }

    // Avoid duplicate geocoding for the same project
    if (coordinatesMap[projectName]) {
      continue;
    }

    console.log("Geocoding project:", projectName);

    const baseLocation = propertyLocation ? `${propertyLocation} Ahmedabad` : "Ahmedabad";
    const primaryQuery = `${projectName} ${baseLocation}`.trim();

    let feature = null;

    try {
      const primaryResult = await geocode(primaryQuery);
      feature = Array.isArray(primaryResult.features) ? primaryResult.features[0] : null;
    } catch {
      feature = null;
    }

    if (!feature && propertyLocation) {
      const fallbackQuery = `${propertyLocation} Ahmedabad`;
      try {
        const fallbackResult = await geocode(fallbackQuery);
        feature = Array.isArray(fallbackResult.features) ? fallbackResult.features[0] : null;
      } catch {
        feature = null;
      }
    }

    if (feature && Array.isArray(feature.center) && feature.center.length === 2) {
      const [lng, lat] = feature.center;
      coordinatesMap[projectName] = [lng, lat];
    }
  }

  const lines = [
    "export const propertyCoordinates = {",
    ...Object.entries(coordinatesMap).map(
      ([name, [lng, lat]]) => `  "${name}": [${lng}, ${lat}],`
    ),
    "};",
    "",
  ];

  fs.writeFileSync(
    "propertyCoordinates.js",
    lines.join("\n"),
    { encoding: "utf8" }
  );
}

main().catch((err) => {
  console.error("Failed to generate propertyCoordinates.js", err);
  process.exit(1);
});

