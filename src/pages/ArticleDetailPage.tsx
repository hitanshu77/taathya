import { useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Clock,
  Calendar,
  Bookmark,
  Share2,
  Tag,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import type { NewsArticle } from "@/hooks/useRealEstateNews";

const tagColors: Record<string, string> = {
  "Market Trends":     "bg-rose-100 text-rose-700 border-rose-200",
  "Home Loans":        "bg-blue-100 text-blue-700 border-blue-200",
  "Policy Update":     "bg-amber-100 text-amber-700 border-amber-200",
  Investment:          "bg-emerald-100 text-emerald-700 border-emerald-200",
  "Affordable Housing":"bg-violet-100 text-violet-700 border-violet-200",
  Technology:          "bg-cyan-100 text-cyan-700 border-cyan-200",
  Sustainability:      "bg-lime-100 text-lime-700 border-lime-200",
  Lifestyle:           "bg-pink-100 text-pink-700 border-pink-200",
};

/* Generate a few paragraphs of plausible body copy from the excerpt */
function expandContent(excerpt: string, title: string): string[] {
  return [
    excerpt,
    `The real estate sector continues to see significant movement as market participants closely monitor the developments surrounding ${title.split("—")[0].trim()}. Industry analysts point to a combination of macroeconomic factors, policy tailwinds, and evolving buyer preferences as the primary drivers.`,
    `Experts suggest that stakeholders — from first-time buyers to institutional investors — should stay informed and consult financial advisors before making major decisions. The market dynamics in metro and tier-2 cities show divergent trends, with different risk-return profiles across regions.`,
    `As the situation evolves, platforms like Taathya continue to track these developments to help buyers, sellers, and investors make smarter, data-backed property decisions. For real-time updates and personalised property recommendations, explore the listings on our platform.`,
  ];
}

const ArticleDetailPage = () => {
  const location = useLocation();
  const navigate  = useNavigate();
  const article   = location.state?.article as NewsArticle | undefined;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  /* No state means someone hit the URL directly — redirect gracefully */
  if (!article) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground text-lg">Article not found.</p>
        <Link
          to="/latest-updates"
          className="inline-flex items-center gap-2 text-primary font-semibold hover:underline"
        >
          <ArrowLeft size={16} /> Back to Latest Updates
        </Link>
      </div>
    );
  }

  const paragraphs = expandContent(article.excerpt, article.title);

  const handleShare = async () => {
    const shareData = { title: article.title, text: article.excerpt, url: window.location.href };
    if (navigator.share) {
      try { await navigator.share(shareData); } catch { /* dismissed */ }
    } else {
      await navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar forceScrolled />

      {/* ── Hero image ── */}
      <div className="relative w-full h-[40vh] sm:h-[52vh] mt-[72px] overflow-hidden">
        <img
          src={article.image}
          alt={article.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />

        {/* Back button floating on image */}
        <button
          onClick={() => navigate("/latest-updates", { replace: true })}
          className="absolute top-6 left-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/90 backdrop-blur-sm text-foreground text-sm font-semibold shadow hover:bg-white transition group"
        >
          <ArrowLeft size={15} className="group-hover:-translate-x-1 transition-transform" />
          Back
        </button>
      </div>

      {/* ── Article body ── */}
      <div className="max-w-3xl mx-auto px-6 pb-24 -mt-16 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Tag + actions row */}
          <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
            <span
              className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold tracking-wide border ${
                tagColors[article.tag] || "bg-muted text-muted-foreground border-border"
              }`}
            >
              <Tag size={11} />
              {article.tag}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleShare}
                className="w-9 h-9 rounded-full border border-border flex items-center justify-center hover:bg-secondary transition"
                title="Share"
              >
                <Share2 size={15} className="text-muted-foreground" />
              </button>
              <button
                className="w-9 h-9 rounded-full border border-border flex items-center justify-center hover:bg-secondary transition"
                title="Bookmark"
              >
                <Bookmark size={15} className="text-muted-foreground" />
              </button>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground leading-tight mb-6">
            {article.title}
          </h1>

          {/* Meta */}
          <div className="flex items-center gap-4 mb-8 pb-8 border-b border-border">
            <img
              src={article.authorAvatar}
              alt={article.author}
              className="w-11 h-11 rounded-full object-cover ring-2 ring-border"
            />
            <div className="flex-1">
              <p className="text-sm font-semibold text-foreground">{article.author}</p>
              <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                <span className="flex items-center gap-1"><Calendar size={11} /> {article.date}</span>
                <span className="flex items-center gap-1"><Clock size={11} /> {article.readTime}</span>
              </div>
            </div>
          </div>

          {/* Body paragraphs */}
          <div className="prose prose-lg max-w-none">
            {paragraphs.map((para, i) => (
              <motion.p
                key={i}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.1, duration: 0.5 }}
                className="text-foreground/80 leading-[1.85] mb-6 text-base sm:text-lg"
              >
                {para}
              </motion.p>
            ))}
          </div>

          {/* CTA banner */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55, duration: 0.5 }}
            className="mt-12 rounded-2xl hero-gradient p-8 text-center"
          >
            <p className="text-primary-foreground font-bold text-lg mb-2">
              Ready to act on these insights?
            </p>
            <p className="text-primary-foreground/70 text-sm mb-6">
              Browse properties, compare loans, and make smarter real estate decisions — all in one place.
            </p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary-foreground text-primary font-bold text-sm hover:opacity-90 transition"
            >
              Explore Taathya
            </Link>
          </motion.div>

          {/* Back link */}
          <div className="flex justify-center mt-12">
            <button
              onClick={() => navigate("/latest-updates", { replace: true })}
              className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-primary transition group"
            >
              <ArrowLeft size={15} className="group-hover:-translate-x-1 transition-transform" />
              Back to Latest Updates
            </button>
          </div>
        </motion.div>
      </div>

      <Footer />
    </div>
  );
};

export default ArticleDetailPage;
