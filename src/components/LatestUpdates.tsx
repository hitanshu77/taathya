import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Clock, ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useRealEstateNews } from "@/hooks/useRealEstateNews";

/* Static fallback — shown while loading or if API fails */
const fallbackUpdates = [
  {
    image: "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=800&h=500&fit=crop",
    tag: "Market Trends",
    title: "Mumbai's Skyline Is Changing — 30% Surge in Luxury Launches",
    excerpt:
      "Premium housing in Mumbai sees unprecedented demand as NRIs and HNIs drive the luxury segment above Rs 5 Cr. South Mumbai and BKC lead the charge.",
    date: "Feb 22, 2026",
    readTime: "4 min read",
    link: "#",
  },
  {
    image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&h=500&fit=crop",
    tag: "Home Loans",
    title: "RBI Holds Repo Rate — What It Means for Your EMI",
    excerpt:
      "With the repo rate steady at 6.5%, home loan EMIs remain unchanged. Experts suggest this is the best window to lock in fixed-rate loans before potential hikes.",
    date: "Feb 20, 2026",
    readTime: "3 min read",
    link: "#",
  },
  {
    image: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&h=500&fit=crop",
    tag: "Policy Update",
    title: "New Stamp Duty Rebate for Women Homebuyers in Maharashtra",
    excerpt:
      "The state government announces a 1% stamp duty reduction for women buyers, potentially saving Rs 1-3 lakhs on properties under Rs 1 Cr.",
    date: "Feb 18, 2026",
    readTime: "5 min read",
    link: "#",
  },
  {
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=500&fit=crop",
    tag: "Investment",
    title: "Bengaluru's ORR Corridor — The Next Real Estate Goldmine?",
    excerpt:
      "Infrastructure upgrades and IT expansion make Outer Ring Road properties appreciate 22% in just 18 months. Here's where smart money is flowing.",
    date: "Feb 15, 2026",
    readTime: "6 min read",
    link: "#",
  },
  {
    image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&h=500&fit=crop",
    tag: "Affordable Housing",
    title: "Under 50L — Top 5 Cities for First-Time Homebuyers in 2026",
    excerpt:
      "From Pune's Hinjewadi to Hyderabad's Kompally, affordable housing hotspots offer quality living at accessible price points with strong appreciation potential.",
    date: "Feb 12, 2026",
    readTime: "4 min read",
    link: "#",
  },
];

const tagColors: Record<string, string> = {
  "Market Trends": "bg-accent text-accent-foreground",
  "Home Loans": "bg-primary text-primary-foreground",
  "Policy Update": "bg-secondary text-secondary-foreground",
  Investment: "bg-accent text-accent-foreground",
  "Affordable Housing": "bg-primary text-primary-foreground",
};

const LatestUpdates = () => {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);
  const { articles, loading, error } = useRealEstateNews(5);

  /* Use live articles; fall back to static if errored or still loading */
  const updates = !loading && !error && articles.length ? articles : fallbackUpdates;

  const goTo = (idx: number) => {
    setDirection(idx > current ? 1 : -1);
    setCurrent(idx);
  };

  const next = () => {
    setDirection(1);
    setCurrent((p) => (p + 1) % updates.length);
  };

  const prev = () => {
    setDirection(-1);
    setCurrent((p) => (p - 1 + updates.length) % updates.length);
  };

  useEffect(() => {
    const id = setInterval(() => {
      setDirection(1);
      setCurrent((p) => (p + 1) % updates.length);
    }, 5000);
    return () => clearInterval(id);
  }, []);

  const item = updates[current];

  const variants = {
    enter: (d: number) => ({ x: d > 0 ? 80 : -80, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d > 0 ? -80 : 80, opacity: 0 }),
  };

  return (
    <section className="py-24 px-6 section-alt overflow-hidden">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-end justify-between mb-14">
          <div>
            <span className="inline-flex items-center gap-2 text-sm font-semibold text-primary uppercase tracking-wider">
              Latest Updates
              {!loading && !error && articles.length > 0 && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-[10px] font-bold normal-case tracking-normal">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  Live
                </span>
              )}
            </span>
            <h2 className="text-3xl md:text-5xl font-extrabold mt-3 text-foreground leading-tight">
              Stories from the
              <br />
              <span className="text-primary">Real Estate World</span>
            </h2>
          </div>
          <div className="hidden md:flex items-center gap-3">
            <Link
              to="/latest-updates"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-border bg-card text-sm font-semibold text-foreground hover:bg-secondary transition mr-2"
            >
              View All <ArrowRight size={14} />
            </Link>
            <button
              onClick={prev}
              className="w-12 h-12 rounded-full border border-border bg-card flex items-center justify-center hover:bg-secondary transition"
            >
              <ChevronLeft size={20} className="text-foreground" />
            </button>
            <button
              onClick={next}
              className="w-12 h-12 rounded-full bg-primary flex items-center justify-center hover:opacity-90 transition"
            >
              <ChevronRight size={20} className="text-primary-foreground" />
            </button>
          </div>
        </div>

        {/* Slideshow */}
        <div className="relative overflow-hidden rounded-3xl">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={current}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-0 bg-card border border-border shadow-xl rounded-3xl overflow-hidden"
            >
              {/* Image side */}
              <div className="relative h-64 sm:h-80 lg:h-[440px]">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent lg:bg-gradient-to-r lg:from-transparent lg:via-transparent lg:to-card/30" />
              </div>

              {/* Content side */}
              <div className="p-8 sm:p-10 lg:p-14 flex flex-col justify-center">
                <span
                  className={`inline-block w-fit px-4 py-1.5 rounded-full text-xs font-bold tracking-wide mb-5 ${
                    tagColors[item.tag] || "bg-muted text-muted-foreground"
                  }`}
                >
                  {item.tag}
                </span>

                <h3 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-foreground leading-snug mb-4">
                  {item.title}
                </h3>

                <p className="text-muted-foreground font-body leading-relaxed mb-8 text-sm sm:text-base">
                  {item.excerpt}
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-xs text-muted-foreground font-body">
                    <span>{item.date}</span>
                    <span className="flex items-center gap-1">
                      <Clock size={13} /> {item.readTime}
                    </span>
                  </div>
                  <a
                    href={item.link && item.link !== "#" ? item.link : undefined}
                    target={item.link && item.link !== "#" ? "_blank" : undefined}
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-primary font-semibold text-sm hover:gap-3 transition-all"
                  >
                    Read More <ArrowRight size={16} />
                  </a>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Progress dots */}
        <div className="flex justify-center gap-2 mt-8">
          {updates.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className="relative h-2 rounded-full overflow-hidden transition-all duration-300"
              style={{ width: i === current ? 40 : 10 }}
            >
              <div className="absolute inset-0 bg-border rounded-full" />
              {i === current && (
                <motion.div
                  key={current}
                  className="absolute inset-0 bg-primary rounded-full"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 5, ease: "linear" }}
                  style={{ transformOrigin: "left" }}
                />
              )}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LatestUpdates;