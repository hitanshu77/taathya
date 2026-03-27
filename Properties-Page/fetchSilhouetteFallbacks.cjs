const fs = require("fs");
const path = require("path");

const ROOT = __dirname;
const MISSING_PATH = path.join(ROOT, "silhouetteMissing.json");
const OUT_DIR = path.join(ROOT, "imagesss", "web-fallback");

const MAX_PROPERTIES = Number(process.argv[2] || 49);
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";

function sanitize(name) {
  return String(name || "")
    .replace(/^[@#\s]+/, "")
    .replace(/[^a-z0-9]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
}

function decodeDdgWrappedUrl(href) {
  try {
    const u = new URL(href, "https://duckduckgo.com");
    const uddg = u.searchParams.get("uddg");
    if (uddg) return decodeURIComponent(uddg);
    if (href.startsWith("http://") || href.startsWith("https://")) return href;
  } catch (_) {}
  return null;
}

function absolutize(base, src) {
  try {
    return new URL(src, base).toString();
  } catch (_) {
    return null;
  }
}

function scoreImageUrl(url) {
  const u = String(url || "").toLowerCase();
  if (!u.startsWith("http://") && !u.startsWith("https://")) return -10;
  if (u.includes("logo") || u.includes("icon") || u.includes("avatar")) return -8;
  if (u.includes("sprite") || u.includes("placeholder")) return -8;
  let score = 0;
  if (/\.(jpg|jpeg|png|webp)(\?|$)/i.test(u)) score += 3;
  if (u.includes("project") || u.includes("property") || u.includes("tower") || u.includes("elevation")) score += 2;
  if (u.includes("cdn") || u.includes("images")) score += 1;
  return score;
}

async function fetchText(url, timeoutMs = 12000) {
  const ac = new AbortController();
  const t = setTimeout(() => ac.abort(), timeoutMs);
  try {
    const resp = await fetch(url, {
      headers: {
        "user-agent": UA,
        "accept-language": "en-US,en;q=0.9",
      },
      signal: ac.signal,
    });
    if (!resp.ok) return null;
    return await resp.text();
  } catch (_) {
    return null;
  } finally {
    clearTimeout(t);
  }
}

async function searchDuckDuckGo(query) {
  const url = `https://duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
  const html = await fetchText(url);
  if (!html) return [];

  const links = [];
  const rx = /<a[^>]+class="[^"]*result__a[^"]*"[^>]+href="([^"]+)"/gi;
  let m;
  while ((m = rx.exec(html))) {
    const real = decodeDdgWrappedUrl(m[1]);
    if (real && !links.includes(real)) links.push(real);
    if (links.length >= 6) break;
  }
  return links;
}

function extractImageCandidates(pageUrl, html) {
  const found = [];

  const og = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i);
  if (og && og[1]) {
    const u = absolutize(pageUrl, og[1]);
    if (u) found.push(u);
  }

  const tw = html.match(/<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i);
  if (tw && tw[1]) {
    const u = absolutize(pageUrl, tw[1]);
    if (u) found.push(u);
  }

  const rxImg = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
  let m;
  while ((m = rxImg.exec(html))) {
    const u = absolutize(pageUrl, m[1]);
    if (u) found.push(u);
    if (found.length > 80) break;
  }

  return Array.from(new Set(found)).sort((a, b) => scoreImageUrl(b) - scoreImageUrl(a));
}

async function downloadImage(url, outPath, timeoutMs = 15000) {
  const ac = new AbortController();
  const t = setTimeout(() => ac.abort(), timeoutMs);
  try {
    const resp = await fetch(url, {
      headers: { "user-agent": UA, "accept": "image/*,*/*;q=0.8" },
      signal: ac.signal,
    });
    if (!resp.ok) return false;
    const ctype = String(resp.headers.get("content-type") || "").toLowerCase();
    if (!ctype.startsWith("image/")) return false;
    const ab = await resp.arrayBuffer();
    const buf = Buffer.from(ab);
    if (buf.length < 20_000) return false;
    fs.writeFileSync(outPath, buf);
    return true;
  } catch (_) {
    return false;
  } finally {
    clearTimeout(t);
  }
}

async function fetchOneProperty(name) {
  const query = `${name} ahmedabad residential project elevation`;
  const pages = await searchDuckDuckGo(query);
  for (const pageUrl of pages.slice(0, 4)) {
    const html = await fetchText(pageUrl);
    if (!html) continue;
    const images = extractImageCandidates(pageUrl, html);
    let idx = 0;
    for (const imgUrl of images.slice(0, 8)) {
      const base = sanitize(name) || "property";
      const extMatch = imgUrl.match(/\.(jpe?g|png|webp)(\?|$)/i);
      const ext = extMatch ? extMatch[1].toLowerCase() : "jpg";
      const outName = `${base}-web-${idx}.${ext}`;
      const outPath = path.join(OUT_DIR, outName);
      const ok = await downloadImage(imgUrl, outPath);
      if (ok) return { ok: true, file: outName, page: pageUrl, image: imgUrl };
      idx += 1;
    }
  }
  return { ok: false };
}

async function main() {
  if (!fs.existsSync(MISSING_PATH)) {
    throw new Error(`Missing file: ${MISSING_PATH}. Run generateSilhouetteProfiles.cjs first.`);
  }
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const missing = JSON.parse(fs.readFileSync(MISSING_PATH, "utf8"));
  const targets = missing.slice(0, MAX_PROPERTIES);

  const results = [];
  let success = 0;
  for (const name of targets) {
    const r = await fetchOneProperty(name);
    results.push({ name, ...r });
    if (r.ok) {
      success += 1;
      console.log("OK", name, "=>", r.file);
    } else {
      console.log("MISS", name);
    }
  }

  const reportPath = path.join(ROOT, "silhouetteWebFetchReport.json");
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2), "utf8");
  console.log("Fetched:", success, "of", targets.length);
  console.log("Report:", reportPath);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
