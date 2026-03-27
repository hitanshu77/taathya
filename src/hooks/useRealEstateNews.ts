import { useState, useEffect, useCallback, useRef } from "react";

/* ═══════════════════════════════════════════════════════
   Types
   ═══════════════════════════════════════════════════════ */

/** Backward-compatible article shape used by all consumers */
export interface NewsArticle {
  id: string;
  image: string;
  tag: string;         // category — "Real Estate", "Finance", etc.
  title: string;
  excerpt: string;
  date: string;        // formatted "Feb 27, 2026"
  readTime: string;
  author: string;
  authorAvatar: string;
  link: string;
  /* ── new scoring fields ── */
  importance: number;
  locationTag: LocationTag;
  publishedAt: string; // ISO string for sorting
  source: string;      // "NewsAPI" | "RSS" | "static"
}

export type LocationTag = "Ahmedabad" | "Gandhinagar" | "Gujarat" | "India" | "Global";
export type CategoryFilter = "All" | "Real Estate" | "Finance" | "Economy" | "Banking" | "Stock Market";
export type LocationFilter = "All" | LocationTag;

/* ═══════════════════════════════════════════════════════
   Configuration
   ═══════════════════════════════════════════════════════ */

const NEWS_API_KEY_1 = import.meta.env.VITE_NEWS_API_KEY as string;
const NEWS_API_KEY_2 = import.meta.env.VITE_NEWS_API_KEY_2 as string;
const RSS2JSON_KEY   = import.meta.env.VITE_RSS2JSON_KEY as string;
const MAX_ARTICLES = 50;
const CACHE_KEY = "taathya_news_cache_v3";
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes
const BREAKING_THRESHOLD = 15;

/* ── NewsAPI query sets (India-focused) ── */
const RE_QUERIES = [
  "India real estate",
  "India property market",
  "India housing market",
  "India construction industry",
  "India apartment flats prices",
  "India builder developer projects",
];
const FIN_QUERIES = [
  "RBI policy repo rate",
  "India home loan interest rates",
  "India banking sector NBFCs",
  "stock market India BSE NSE Sensex",
  "India mortgage rates HDFC SBI",
  "India mutual funds investment",
  "India economy GDP inflation",
];
const LOC_QUERIES = [
  "Ahmedabad real estate property",
  "Gujarat property market housing",
  "Gandhinagar development GIFT City",
  "Surat Vadodara real estate",
];

function buildUrl(query: string, apiKey: string, pageSize = 15) {
  const q = encodeURIComponent(query);
  return `https://newsapi.org/v2/everything?q=${q}&language=en&sortBy=publishedAt&pageSize=${pageSize}&apiKey=${apiKey}`;
}

/* ── RSS feed helper — adds API key for higher item limits ── */
function rssUrl(feed: string, count = 50): string {
  const encoded = encodeURIComponent(feed);
  const keyParam = RSS2JSON_KEY ? `&api_key=${RSS2JSON_KEY}` : "";
  return `https://api.rss2json.com/v1/api.json?rss_url=${encoded}&count=${count}${keyParam}`;
}

/* ── RSS fallback URLs (more sources, higher counts) ── */
const RSS_FEEDS = [
  rssUrl("https://news.google.com/rss/search?q=real+estate+India&hl=en-IN&gl=IN&ceid=IN:en"),
  rssUrl("https://news.google.com/rss/search?q=Ahmedabad+property+Gujarat&hl=en-IN&gl=IN&ceid=IN:en"),
  rssUrl("https://news.google.com/rss/search?q=India+finance+RBI+banking&hl=en-IN&gl=IN&ceid=IN:en"),
  rssUrl("https://news.google.com/rss/search?q=Gujarat+real+estate+construction&hl=en-IN&gl=IN&ceid=IN:en"),
  rssUrl("https://news.google.com/rss/search?q=India+stock+market+sensex+nifty&hl=en-IN&gl=IN&ceid=IN:en"),
  rssUrl("https://news.google.com/rss/search?q=Gandhinagar+GIFT+City+development&hl=en-IN&gl=IN&ceid=IN:en"),
  rssUrl("https://economictimes.indiatimes.com/industry/services/property-/-cstruction/rssfeeds/13357270.cms"),
  rssUrl("https://www.livemint.com/rss/realestate"),
];

/* ═══════════════════════════════════════════════════════
   Category detection
   ═══════════════════════════════════════════════════════ */

function detectTag(text: string): string {
  const t = text.toLowerCase();
  if (/rbi|repo rate|home loan|emi|interest rate|mortgage|lending|hdfc|sbi loan/.test(t))
    return "Home Loans";
  if (/stamp duty|rera|policy|government|budget|rebate|regulation|act|ministry|tax/.test(t))
    return "Policy Update";
  if (/investment|return|appreciation|portfolio|roi|yield|investor|capital gain/.test(t))
    return "Investment";
  if (/stock|sensex|nifty|bse|nse|share market|equity|ipo|trading/.test(t))
    return "Stock Market";
  if (/mutual fund|sip|nav|amc|fund house/.test(t))
    return "Mutual Funds";
  if (/bank|upi|digital payment|fintech|credit|debit|deposit|saving/.test(t))
    return "Banking";
  if (/affordable|budget home|first.time|low.cost|under \d+l|pradhan mantri|pmay/.test(t))
    return "Affordable Housing";
  if (/smart home|technology|proptech|ai|digital|iot|automation/.test(t))
    return "Technology";
  if (/green|sustainability|eco|igbc|griha|net.zero|solar/.test(t))
    return "Sustainability";
  if (/co.living|lifestyle|community|coworking|co-living/.test(t))
    return "Lifestyle";
  if (/inflation|gdp|economy|fiscal|monetary|rupee|forex|growth rate/.test(t))
    return "Economy";
  return "Market Trends";
}

/* ═══════════════════════════════════════════════════════
   Relevance gate — reject articles that are NOT about
   real estate, finance, property, or India topics.
   ═══════════════════════════════════════════════════════ */

const RELEVANCE_PATTERNS: RegExp[] = [
  // Real estate & property
  /real\s*estate/i, /property/i, /housing/i, /apartment/i, /flat/i,
  /builder/i, /construction/i, /residential/i, /commercial\s*(space|property|real)/i,
  /plot/i, /land\s*(deal|price|acquisition|parcel)/i, /township/i,
  /rera/i, /stamp\s*duty/i, /registry/i, /carpet\s*area/i,
  /affordable\s*housing/i, /luxury\s*home/i, /villa/i, /bungalow/i,
  /redevelopment/i, /slum/i, /infrastructure/i, /metro\s*(rail|line|project)/i,
  /smart\s*city/i, /urban\s*(development|planning)/i,
  // Finance & banking
  /\brbi\b/i, /repo\s*rate/i, /interest\s*rate/i, /home\s*loan/i,
  /mortgage/i, /\bemi\b/i, /\bsbi\b/i, /\bhdfc\b/i, /\bicici\b/i,
  /bank/i, /\bnbfc\b/i, /mutual\s*fund/i, /\bsip\b/i,
  /stock\s*market/i, /\bsensex\b/i, /\bnifty\b/i, /\bbse\b/i, /\bnse\b/i,
  /\bipo\b/i, /equity/i, /investment/i, /investor/i,
  /budget/i, /fiscal/i, /inflation/i, /\bgdp\b/i, /economy/i,
  /fintech/i, /\bupi\b/i, /digital\s*payment/i, /credit/i,
  /tax/i, /gst/i, /income\s*tax/i, /capital\s*gain/i,
  // India / Gujarat / local
  /india/i, /gujarat/i, /ahmedabad/i, /gandhinagar/i,
  /mumbai/i, /delhi/i, /bengaluru|bangalore/i, /hyderabad/i,
  /chennai/i, /pune/i, /kolkata/i, /noida/i, /gurgaon|gurugram/i,
  /surat/i, /vadodara|baroda/i, /rajkot/i, /jaipur/i,
  /pradhan\s*mantri/i, /pmay/i, /sardar\s*patel/i, /gift\s*city/i,
  /dholera/i, /sanand/i,
];

/** Returns true only if the article text matches at least one relevant topic */
function isRelevant(text: string): boolean {
  return RELEVANCE_PATTERNS.some((p) => p.test(text));
}

/* ═══════════════════════════════════════════════════════
   Scoring system
   ═══════════════════════════════════════════════════════ */

/* Location scoring */
const LOCATION_PATTERNS: { pattern: RegExp; tag: LocationTag; score: number }[] = [
  { pattern: /ahmedabad/i,   tag: "Ahmedabad",   score: 15 },
  { pattern: /gandhinagar/i,  tag: "Gandhinagar", score: 14 },
  { pattern: /gujarat/i,      tag: "Gujarat",     score: 10 },
  { pattern: /india|indian|mumbai|delhi|bengaluru|hyderabad|chennai|pune|kolkata/i, tag: "India", score: 6 },
];

function detectLocation(text: string): { tag: LocationTag; score: number } {
  for (const loc of LOCATION_PATTERNS) {
    if (loc.pattern.test(text)) return { tag: loc.tag, score: loc.score };
  }
  return { tag: "Global", score: 3 };
}

/* Keyword scoring */
const KEYWORDS: { pattern: RegExp; score: number }[] = [
  { pattern: /real estate/i,    score: 3 },
  { pattern: /housing/i,        score: 3 },
  { pattern: /property/i,       score: 3 },
  { pattern: /construction/i,   score: 2 },
  { pattern: /interest rate/i,  score: 3 },
  { pattern: /mortgage/i,       score: 3 },
  { pattern: /banking/i,        score: 2 },
  { pattern: /rbi/i,            score: 3 },
  { pattern: /inflation/i,      score: 2 },
  { pattern: /economy/i,        score: 2 },
];

function keywordScore(text: string): number {
  let score = 0;
  for (const kw of KEYWORDS) {
    if (kw.pattern.test(text)) score += kw.score;
  }
  return score;
}

/* Recency scoring */
function recencyScore(publishedAt: string): number {
  const now = Date.now();
  const pub = new Date(publishedAt).getTime();
  if (isNaN(pub)) return 0;
  const hoursAgo = (now - pub) / (1000 * 60 * 60);
  if (hoursAgo <= 6) return 5;
  if (hoursAgo <= 24) return 3;
  if (hoursAgo <= 72) return 1;
  return 0;
}

/* Compute total importance */
export function computeImportance(text: string, publishedAt: string): { importance: number; locationTag: LocationTag } {
  const loc = detectLocation(text);
  const kw  = keywordScore(text);
  const rec = recencyScore(publishedAt);
  return { importance: loc.score + kw + rec, locationTag: loc.tag };
}

/* ═══════════════════════════════════════════════════════
   Helpers
   ═══════════════════════════════════════════════════════ */

const tagImages: Record<string, string[]> = {
  "Home Loans":         ["1554224155-6726b3ff858f", "1560520653-9e0e4c89eb11", "1461088945293-0c17689e48ac"],
  "Policy Update":      ["1589829545856-d10d557cf95f", "1504307651254-35680f356dfd", "1551288049-bebda4e38f71"],
  "Investment":         ["1486406146926-c627a92ad1ab", "1611974789855-9c2a0a7236a3", "1497366754035-f200581b4b08"],
  "Affordable Housing": ["1545324418-cc1a3fa10c00", "1560518883-ce09059eeffa", "1558618047-3c8c76ca1f6c"],
  "Technology":         ["1558618666-fcd25c85cd64", "1535378917042-10a22c95931a", "1551434678-e076c223a692"],
  "Sustainability":     ["1518005020951-eccb494ad742", "1508450859948-4e04fabd4526", "1490750967868-88df5691cc44"],
  "Lifestyle":          ["1555041469-a586c61ea9bc", "1593642632559-0c6d3fc62b89", "1519167758481-83f550bb49b3"],
  "Stock Market":       ["1611974789855-9c2a0a7236a3", "1590283603385-17ffb3a7f29f", "1542222024-c39e2281f121"],
  "Mutual Funds":       ["1579532537598-459ecdaf39cc", "1486406146926-c627a92ad1ab", "1611974789855-9c2a0a7236a3"],
  "Banking":            ["1541354329998-f4d9a9f9297f", "1554224155-6726b3ff858f", "1526304640581-d334cdbbf45e"],
  "Economy":            ["1526304640581-d334cdbbf45e", "1590283603385-17ffb3a7f29f", "1486406146926-c627a92ad1ab"],
  "Market Trends":      ["1570168007204-dfb528c6958f", "1587474260584-136574528ed5", "1596176530529-78163a4f7af2"],
};

function getImage(tag: string, index: number): string {
  const ids = tagImages[tag] ?? tagImages["Market Trends"];
  return `https://images.unsplash.com/photo-${ids[index % ids.length]}?w=800&h=500&fit=crop`;
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, " ").replace(/&[a-z]+;/gi, " ").replace(/\s{2,}/g, " ").trim();
}

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  } catch {
    return dateStr;
  }
}

function estimateReadTime(text: string): string {
  const words = text.trim().split(/\s+/).length;
  return `${Math.max(2, Math.round(words / 200))} min read`;
}

const AUTHORS = [
  { name: "Priya Sharma",  avatar: "https://i.pravatar.cc/80?img=1"  },
  { name: "Vikram Desai",  avatar: "https://i.pravatar.cc/80?img=3"  },
  { name: "Ananya Patel",  avatar: "https://i.pravatar.cc/80?img=5"  },
  { name: "Rohan Mehta",   avatar: "https://i.pravatar.cc/80?img=8"  },
  { name: "Sneha Iyer",    avatar: "https://i.pravatar.cc/80?img=9"  },
  { name: "Arjun Nair",    avatar: "https://i.pravatar.cc/80?img=11" },
  { name: "Kavita Singh",  avatar: "https://i.pravatar.cc/80?img=16" },
];

/* ═══════════════════════════════════════════════════════
   Cache
   ═══════════════════════════════════════════════════════ */

interface CacheEntry { articles: NewsArticle[]; timestamp: number }

function readCache(): NewsArticle[] | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const entry: CacheEntry = JSON.parse(raw);
    if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
      localStorage.removeItem(CACHE_KEY);
      return null;
    }
    return entry.articles;
  } catch {
    return null;
  }
}

function writeCache(articles: NewsArticle[]) {
  try {
    const entry: CacheEntry = { articles, timestamp: Date.now() };
    localStorage.setItem(CACHE_KEY, JSON.stringify(entry));
  } catch { /* storage full — ignore */ }
}

/* ═══════════════════════════════════════════════════════
   Deduplication & merge
   ═══════════════════════════════════════════════════════ */

function deduplicateAndSort(items: NewsArticle[]): NewsArticle[] {
  const seen = new Map<string, NewsArticle>();
  for (const item of items) {
    const titleKey = item.title.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 60);
    const urlKey   = item.link.toLowerCase();
    const key = titleKey || urlKey;
    const existing = seen.get(key);
    if (!existing || item.importance > existing.importance) {
      seen.set(key, item);
    }
  }
  return [...seen.values()]
    .sort((a, b) => b.importance - a.importance || new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    .slice(0, MAX_ARTICLES);
}

/* ═══════════════════════════════════════════════════════
   Normalize raw data → NewsArticle
   ═══════════════════════════════════════════════════════ */

function normalizeNewsApi(item: Record<string, unknown>, i: number): NewsArticle {
  const title   = String(item.title ?? "").replace(/\s*-\s*[^-]+$/, "");
  const desc    = stripHtml(String(item.description ?? ""));
  const content = stripHtml(String(item.content ?? ""));
  const body    = desc || content;
  const pubAt   = String(item.publishedAt ?? new Date().toISOString());
  const fullText = title + " " + body;
  const tag     = detectTag(fullText);
  const { importance, locationTag } = computeImportance(fullText, pubAt);
  const authorObj  = AUTHORS[i % AUTHORS.length];
  const src     = item.source as Record<string, string> | undefined;

  return {
    id:           String(item.url ?? i),
    image:        (item.urlToImage as string) || getImage(tag, i),
    tag,
    title,
    excerpt:      body.slice(0, 220) + (body.length > 220 ? "…" : ""),
    date:         formatDate(pubAt),
    readTime:     estimateReadTime(body),
    author:       String(item.author ?? src?.name ?? authorObj.name),
    authorAvatar: authorObj.avatar,
    link:         String(item.url ?? "#"),
    importance,
    locationTag,
    publishedAt:  pubAt,
    source:       "NewsAPI",
  };
}

function normalizeRss(item: Record<string, string>, i: number): NewsArticle {
  const rawText = stripHtml(item.description ?? "");
  const title   = item.title ?? "";
  const pubAt   = item.pubDate ?? new Date().toISOString();
  const fullText = title + " " + rawText;
  const tag     = detectTag(fullText);
  const { importance, locationTag } = computeImportance(fullText, pubAt);
  const author  = AUTHORS[i % AUTHORS.length];

  return {
    id:           item.link ?? String(i),
    image:        item.thumbnail || getImage(tag, i),
    tag,
    title,
    excerpt:      rawText.slice(0, 220) + (rawText.length > 220 ? "…" : ""),
    date:         formatDate(pubAt),
    readTime:     estimateReadTime(rawText),
    author:       author.name,
    authorAvatar: author.avatar,
    link:         item.link ?? "#",
    importance,
    locationTag,
    publishedAt:  pubAt,
    source:       "RSS",
  };
}

/* ═══════════════════════════════════════════════════════
   Fetch functions
   ═══════════════════════════════════════════════════════ */

async function fetchAllNewsApi(): Promise<NewsArticle[]> {
  const hasKey1 = !!NEWS_API_KEY_1;
  const hasKey2 = !!NEWS_API_KEY_2;
  if (!hasKey1 && !hasKey2) return [];

  const allQueries = [...RE_QUERIES, ...FIN_QUERIES, ...LOC_QUERIES];

  /* Split queries between the two keys so we use both daily quotas */
  const fetchPromises = allQueries.map((q, i) => {
    const key = (hasKey2 && i % 2 === 1) ? NEWS_API_KEY_2 : NEWS_API_KEY_1;
    return fetch(buildUrl(q, key, 15)).then((r) => r.json());
  });

  const results = await Promise.allSettled(fetchPromises);

  const articles: NewsArticle[] = [];
  let globalIdx = 0;

  for (const result of results) {
    if (result.status !== "fulfilled") continue;
    const data = result.value;
    if (data.status !== "ok" || !data.articles?.length) continue;
    for (const raw of data.articles) {
      const t = String(raw.title ?? "").toLowerCase();
      if (t === "[removed]" || !t) continue;
      // Strict relevance gate — reject articles not about real estate/finance/India
      const fullText = `${raw.title ?? ""} ${raw.description ?? ""} ${raw.content ?? ""}`;
      if (!isRelevant(fullText)) continue;
      articles.push(normalizeNewsApi(raw, globalIdx++));
    }
  }

  return articles;
}

async function fetchAllRss(): Promise<NewsArticle[]> {
  const results = await Promise.allSettled(
    RSS_FEEDS.map((url) => fetch(url).then((r) => r.json()))
  );

  const articles: NewsArticle[] = [];
  let globalIdx = 0;

  for (const result of results) {
    if (result.status !== "fulfilled") continue;
    const data = result.value;
    if (data.status !== "ok" || !data.items?.length) continue;
    for (const raw of data.items) {
      // Strict relevance gate — reject articles not about real estate/finance/India
      const fullText = `${raw.title ?? ""} ${raw.description ?? ""}`;
      if (!isRelevant(fullText)) continue;
      articles.push(normalizeRss(raw, globalIdx++));
    }
  }

  return articles;
}

/* ═══════════════════════════════════════════════════════
   Filter helpers (exported for use in UI)
   ═══════════════════════════════════════════════════════ */

const CATEGORY_MAP: Record<CategoryFilter, RegExp | null> = {
  All:            null,
  "Real Estate":  /Market Trends|Investment|Affordable Housing|Lifestyle|Technology|Sustainability/,
  Finance:        /Home Loans|Mutual Funds|Banking|Economy/,
  Economy:        /Economy|Policy Update/,
  Banking:        /Banking|Home Loans/,
  "Stock Market": /Stock Market|Mutual Funds|Investment/,
};

export function filterArticles(
  articles: NewsArticle[],
  location: LocationFilter = "All",
  category: CategoryFilter = "All",
  search = "",
): NewsArticle[] {
  return articles.filter((a) => {
    if (location !== "All" && a.locationTag !== location) return false;
    const catRegex = CATEGORY_MAP[category];
    if (catRegex && !catRegex.test(a.tag)) return false;
    if (search) {
      const q = search.toLowerCase();
      return a.title.toLowerCase().includes(q) || a.excerpt.toLowerCase().includes(q);
    }
    return true;
  });
}

export function getBreakingNews(articles: NewsArticle[]): NewsArticle[] {
  return articles.filter((a) => a.importance >= BREAKING_THRESHOLD);
}

/* ═══════════════════════════════════════════════════════
   Main hook
   ═══════════════════════════════════════════════════════ */

export function useRealEstateNews(count = 50) {
  const [articles, setArticles]       = useState<NewsArticle[]>([]);
  const [breakingNews, setBreaking]   = useState<NewsArticle[]>([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval>>();

  const fetchAndMerge = useCallback(async () => {
    /* Check cache first */
    const cached = readCache();
    if (cached?.length) {
      const sliced = cached.slice(0, count);
      setArticles(sliced);
      setBreaking(getBreakingNews(sliced));
      setLoading(false);
      return;
    }

    try {
      /* Fetch NewsAPI + RSS in parallel */
      const [newsApiArticles, rssArticles] = await Promise.allSettled([
        fetchAllNewsApi(),
        fetchAllRss(),
      ]);

      const all: NewsArticle[] = [
        ...(newsApiArticles.status === "fulfilled" ? newsApiArticles.value : []),
        ...(rssArticles.status === "fulfilled" ? rssArticles.value : []),
      ];

      if (all.length === 0) {
        setError(true);
        setLoading(false);
        return;
      }

      const ranked = deduplicateAndSort(all).slice(0, count);
      writeCache(ranked);
      setArticles(ranked);
      setBreaking(getBreakingNews(ranked));
      setLoading(false);
    } catch {
      setError(true);
      setLoading(false);
    }
  }, [count]);

  useEffect(() => {
    fetchAndMerge();

    /* Auto-refresh after cache expires */
    timerRef.current = setInterval(() => {
      localStorage.removeItem(CACHE_KEY);
      fetchAndMerge();
    }, CACHE_TTL_MS);

    return () => clearInterval(timerRef.current);
  }, [fetchAndMerge]);

  return { articles, breakingNews, loading, error, refetch: fetchAndMerge };
}
