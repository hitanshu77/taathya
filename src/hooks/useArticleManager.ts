import { useState, useCallback, useRef, useEffect } from "react";
import { useRealEstateNews, type NewsArticle } from "./useRealEstateNews";

/* ── Importance levels ── */
export type Importance = 0 | 1 | 2 | 3;

export interface NewspaperArticle extends NewsArticle {
  importance: Importance;
  timestamp: number; // epoch ms – for sorting
  category: string;  // display category tag
}

const MAX_ARTICLES = 12;

/* Map RSS tag → visual category label */
const TAG_TO_CATEGORY: Record<string, string> = {
  "Market Trends": "Market",
  "Home Loans": "Loans",
  "Policy Update": "Policy",
  Investment: "Market",
  "Affordable Housing": "Construction",
  Technology: "New Launch",
  Sustainability: "Policy",
  Lifestyle: "New Launch",
};

/* Parse "Feb 22, 2026" → epoch ms */
function parseDate(d: string): number {
  const ms = Date.parse(d);
  return Number.isNaN(ms) ? Date.now() : ms;
}

/* Assign importance based on position in the source list */
function assignImportance(index: number): Importance {
  if (index === 0) return 3;
  if (index <= 2) return 2;
  if (index <= 6) return 1;
  return 0;
}

/* Deterministic sort: importance desc → timestamp desc */
function sortArticles(arr: NewspaperArticle[]): NewspaperArticle[] {
  return [...arr].sort((a, b) => {
    if (b.importance !== a.importance) return b.importance - a.importance;
    return b.timestamp - a.timestamp;
  });
}

/**
 * Article manager hook.
 * Consumes the live RSS feed via useRealEstateNews, maps it to NewspaperArticle[],
 * and exposes an `addArticle` function for dynamic insertions.
 */
export function useArticleManager(feedCount = 12) {
  const { articles: rawArticles, loading, error } = useRealEstateNews(feedCount);
  const [managed, setManaged] = useState<NewspaperArticle[]>([]);
  const seededRef = useRef(false);

  /* Seed from RSS feed once loaded */
  useEffect(() => {
    if (loading || error || rawArticles.length === 0 || seededRef.current) return;
    seededRef.current = true;

    const mapped: NewspaperArticle[] = rawArticles.map((a, i) => ({
      ...a,
      importance: assignImportance(i),
      timestamp: parseDate(a.date),
      category: TAG_TO_CATEGORY[a.tag] ?? "Market",
    }));

    setManaged(sortArticles(mapped).slice(0, MAX_ARTICLES));
  }, [rawArticles, loading, error]);

  /* Fallback static data (used while RSS loads or if it fails) */
  useEffect(() => {
    if (managed.length > 0) return;
    // Build from static headlines
    const statics: NewspaperArticle[] = STATIC_ARTICLES.map((a, i) => ({
      ...a,
      importance: assignImportance(i),
      timestamp: parseDate(a.date),
    }));
    setManaged(sortArticles(statics));
  }, [managed.length]);

  /**
   * Insert a new important article.
   * 1. Prepend to list
   * 2. Re-sort by importance + timestamp
   * 3. Trim to MAX_ARTICLES (drops least important / oldest)
   */
  const addArticle = useCallback(
    (article: Omit<NewspaperArticle, "timestamp"> & { timestamp?: number }) => {
      setManaged((prev) => {
        const full: NewspaperArticle = {
          ...article,
          timestamp: article.timestamp ?? Date.now(),
        } as NewspaperArticle;
        const next = [full, ...prev];
        return sortArticles(next).slice(0, MAX_ARTICLES);
      });
    },
    [],
  );

  return { articles: managed, loading: loading && managed.length === 0, error, addArticle };
}

/* ── Static fallback articles ── */
const STATIC_ARTICLES: NewspaperArticle[] = [
  {
    id: "s1",
    image: "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=800&h=500&fit=crop",
    tag: "Market Trends",
    title: "New Luxury Towers Launch on SG Highway",
    excerpt:
      "Premium housing on SG Highway sees unprecedented demand as NRIs and HNIs drive the luxury segment above ₹5 Cr. Ahmedabad's western corridor leads with record-breaking pre-launch sales.",
    date: "Mar 8, 2026",
    readTime: "4 min read",
    author: "Priya Sharma",
    authorAvatar: "https://i.pravatar.cc/80?img=1",
    link: "#",
    importance: 3,
    timestamp: Date.now(),
    category: "Market",
  },
  {
    id: "s2",
    image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&h=500&fit=crop",
    tag: "Home Loans",
    title: "Interest Rates Drop for Home Loans",
    excerpt:
      "RBI's surprise rate cut brings home loan EMIs down by ₹1,200–₹2,800 per lakh. Experts say this is the best window to lock in fixed-rate home loans before the next review cycle.",
    date: "Mar 7, 2026",
    readTime: "3 min read",
    author: "Vikram Desai",
    authorAvatar: "https://i.pravatar.cc/80?img=3",
    link: "#",
    importance: 2,
    timestamp: Date.now() - 86400000,
    category: "Loans",
  },
  {
    id: "s3",
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=500&fit=crop",
    tag: "Market Trends",
    title: "Ahmedabad Property Prices Rise 6%",
    excerpt:
      "Residential property prices across Ahmedabad's key micro-markets have risen 6% quarter-on-quarter driven by infrastructure upgrades and growing IT sector presence.",
    date: "Mar 5, 2026",
    readTime: "5 min read",
    author: "Ananya Patel",
    authorAvatar: "https://i.pravatar.cc/80?img=5",
    link: "#",
    importance: 2,
    timestamp: Date.now() - 172800000,
    category: "Market",
  },
  {
    id: "s4",
    image: "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=800&h=500&fit=crop",
    tag: "Policy Update",
    title: "New Metro Line Boosts Real Estate Demand",
    excerpt:
      "Phase-2 metro expansion along the Science City–Motera corridor is driving 15–20% appreciation in adjacent residential pockets. Here's where buyers should look.",
    date: "Mar 3, 2026",
    readTime: "4 min read",
    author: "Rohan Mehta",
    authorAvatar: "https://i.pravatar.cc/80?img=8",
    link: "#",
    importance: 1,
    timestamp: Date.now() - 259200000,
    category: "Policy",
  },
  {
    id: "s5",
    image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&h=500&fit=crop",
    tag: "Affordable Housing",
    title: "Under ₹50L — Top 5 Cities for First-Time Buyers",
    excerpt:
      "From Pune's Hinjewadi to Hyderabad's Kompally, affordable housing hotspots offer quality living at accessible price points with strong appreciation potential.",
    date: "Mar 1, 2026",
    readTime: "4 min read",
    author: "Sneha Iyer",
    authorAvatar: "https://i.pravatar.cc/80?img=9",
    link: "#",
    importance: 1,
    timestamp: Date.now() - 345600000,
    category: "Construction",
  },
  {
    id: "s6",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=500&fit=crop",
    tag: "Technology",
    title: "Smart Homes Are Now the Standard — Not a Luxury",
    excerpt:
      "IoT integration, energy-efficient systems, and AI-powered security are now expected in mid-range apartments. Builders who don't adapt risk losing millennial buyers.",
    date: "Feb 28, 2026",
    readTime: "5 min read",
    author: "Arjun Nair",
    authorAvatar: "https://i.pravatar.cc/80?img=11",
    link: "#",
    importance: 1,
    timestamp: Date.now() - 432000000,
    category: "New Launch",
  },
  {
    id: "s7",
    image: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&h=500&fit=crop",
    tag: "Policy Update",
    title: "Stamp Duty Rebate for Women Homebuyers in Maharashtra",
    excerpt:
      "The state government announces a 1% stamp duty reduction for women buyers, potentially saving ₹1–3 lakhs on properties under ₹1 Cr.",
    date: "Feb 26, 2026",
    readTime: "3 min read",
    author: "Kavita Singh",
    authorAvatar: "https://i.pravatar.cc/80?img=16",
    link: "#",
    importance: 0,
    timestamp: Date.now() - 518400000,
    category: "Policy",
  },
  {
    id: "s8",
    image: "https://images.unsplash.com/photo-1518005020951-eccb494ad742?w=800&h=500&fit=crop",
    tag: "Sustainability",
    title: "Green Certifications Add 12–18% Premium to Values",
    excerpt:
      "IGBC and GRIHA rated buildings command significantly higher valuations. Buyers increasingly prioritize sustainability, driving developers to go green.",
    date: "Feb 24, 2026",
    readTime: "4 min read",
    author: "Priya Sharma",
    authorAvatar: "https://i.pravatar.cc/80?img=1",
    link: "#",
    importance: 0,
    timestamp: Date.now() - 604800000,
    category: "Policy",
  },
  {
    id: "s9",
    image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&h=500&fit=crop",
    tag: "Lifestyle",
    title: "Co-Living 2.0: Shared Spaces Redefine Urban Living",
    excerpt:
      "The co-living market is projected to reach $13 billion by 2028. New-age operators are offering premium amenities, flexible leases, and community experiences.",
    date: "Feb 22, 2026",
    readTime: "5 min read",
    author: "Vikram Desai",
    authorAvatar: "https://i.pravatar.cc/80?img=3",
    link: "#",
    importance: 0,
    timestamp: Date.now() - 691200000,
    category: "New Launch",
  },
  {
    id: "s10",
    image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&h=500&fit=crop",
    tag: "Investment",
    title: "REITs Deliver 14% Returns — Time to Diversify?",
    excerpt:
      "Real Estate Investment Trusts have outperformed FDs and gold over the last two years. We break down the top-performing REITs and what to look for before investing.",
    date: "Feb 20, 2026",
    readTime: "6 min read",
    author: "Kavita Singh",
    authorAvatar: "https://i.pravatar.cc/80?img=16",
    link: "#",
    importance: 0,
    timestamp: Date.now() - 777600000,
    category: "Market",
  },
  {
    id: "s11",
    image: "https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=800&h=500&fit=crop",
    tag: "Market Trends",
    title: "Hyderabad — India's Fastest-Growing Realty Market",
    excerpt:
      "Driven by IT expansion and infrastructure development, Hyderabad's residential market has seen a 35% jump in new launches. Financial District and Kokapet lead.",
    date: "Feb 18, 2026",
    readTime: "5 min read",
    author: "Rohan Mehta",
    authorAvatar: "https://i.pravatar.cc/80?img=8",
    link: "#",
    importance: 0,
    timestamp: Date.now() - 864000000,
    category: "Market",
  },
  {
    id: "s12",
    image: "https://images.unsplash.com/photo-1558618047-3c8c76ca1f6c?w=800&h=500&fit=crop",
    tag: "Affordable Housing",
    title: "PMAY 2.0 Extended: 2 Lakh More Homes for Urban Poor",
    excerpt:
      "The government's flagship housing scheme gets a fresh allocation of ₹60,000 Cr, targeting EWS and LIG categories in 150 cities.",
    date: "Feb 16, 2026",
    readTime: "3 min read",
    author: "Ananya Patel",
    authorAvatar: "https://i.pravatar.cc/80?img=5",
    link: "#",
    importance: 0,
    timestamp: Date.now() - 950400000,
    category: "Construction",
  },
];
