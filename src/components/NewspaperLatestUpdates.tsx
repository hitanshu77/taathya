import { useRef, forwardRef, type ComponentPropsWithoutRef } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { motion, useInView } from "framer-motion";
import { ArrowRight, Clock, Tag } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useArticleManager, type NewspaperArticle } from "@/hooks/useArticleManager";

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Design tokens & variants (shadcn-ui pattern: CVA + cn)
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

const categoryColors: Record<string, string> = {
  Market:       "bg-rose-50 text-rose-700 border-rose-200",
  Construction: "bg-violet-50 text-violet-700 border-violet-200",
  Loans:        "bg-blue-50 text-blue-700 border-blue-200",
  Policy:       "bg-amber-50 text-amber-700 border-amber-200",
  "New Launch": "bg-emerald-50 text-emerald-700 border-emerald-200",
};

/** Card variant styles via CVA */
const cardVariants = cva(
  "group cursor-pointer rounded-2xl overflow-hidden bg-card border border-border transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
  {
    variants: {
      variant: {
        hero: "shadow-lg hover:shadow-xl hover:shadow-primary/5 col-span-full lg:col-span-1",
        column: "shadow-md hover:shadow-xl hover:shadow-primary/5 hover:border-primary/20",
        grid: "shadow-sm hover:shadow-lg hover:shadow-primary/5 hover:border-primary/20",
      },
      size: {
        default: "",
        large: "",
        small: "",
      },
    },
    defaultVariants: { variant: "grid", size: "default" },
  },
);

/** Shared entrance animation */
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] },
  }),
};

/* ━━━━━━━━━━━━━  Primitive: Category badge  ━━━━━━━━━━━━━━━━━━━━━━━━━ */

interface CategoryBadgeProps extends ComponentPropsWithoutRef<"span"> {
  category: string;
}

const CategoryBadge = forwardRef<HTMLSpanElement, CategoryBadgeProps>(
  ({ category, className, ...props }, ref) => (
    <span
      ref={ref}
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide border",
        categoryColors[category] ?? "bg-muted text-muted-foreground border-border",
        className,
      )}
      {...props}
    >
      <Tag size={9} aria-hidden />
      {category}
    </span>
  ),
);
CategoryBadge.displayName = "CategoryBadge";

/* ━━━━━━━━━━━━━  Primitive: Article meta line  ━━━━━━━━━━━━━━━━━━━━━━ */

interface ArticleMetaProps {
  article: NewspaperArticle;
  compact?: boolean;
  className?: string;
}

function ArticleMeta({ article, compact, className }: ArticleMetaProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 text-muted-foreground",
        compact ? "text-[11px]" : "text-xs",
        className,
      )}
    >
      <img
        src={article.authorAvatar}
        alt=""
        aria-hidden
        className={cn("rounded-full object-cover", compact ? "size-6" : "size-7")}
      />
      <span className="font-medium text-foreground/70 truncate max-w-[100px]">
        {article.author}
      </span>
      <span className="hidden sm:inline" aria-hidden>·</span>
      <time className="hidden sm:inline" dateTime={article.date}>
        {article.date}
      </time>
      <span className="flex items-center gap-0.5">
        <Clock size={compact ? 10 : 11} aria-hidden /> {article.readTime}
      </span>
    </div>
  );
}

/* ━━━━━━━━━━━━━  Primitive: Live indicator badge  ━━━━━━━━━━━━━━━━━━━ */

function LiveBadge() {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-[10px] font-bold normal-case tracking-normal">
      <span className="size-1.5 rounded-full bg-green-500 animate-pulse" aria-hidden />
      Live
    </span>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━  Article Card  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Unified card component. Renders as hero / column / grid based on variant.
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

interface ArticleCardProps extends VariantProps<typeof cardVariants> {
  article: NewspaperArticle;
  index?: number;
  className?: string;
}

function ArticleCard({ article, variant = "grid", size, index = 0, className }: ArticleCardProps) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-48px" });
  const navigate = useNavigate();

  const handleOpen = () => navigate("/article", { state: { article } });
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleOpen();
    }
  };

  const isHero = variant === "hero";
  const isColumn = variant === "column";
  const isLargeGrid = variant === "grid" && article.importance >= 1;

  const imageHeight = isHero
    ? "h-56 sm:h-72 lg:h-80"
    : isColumn
      ? "h-48 lg:h-56"
      : isLargeGrid
        ? "h-48 lg:h-56"
        : "h-36 lg:h-40";

  const headingSize = isHero
    ? "text-xl sm:text-2xl lg:text-3xl"
    : isColumn
      ? "text-lg"
      : isLargeGrid
        ? "text-lg"
        : "text-base";

  return (
    <motion.article
      ref={ref}
      variants={fadeUp}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      custom={index}
      role="article"
      tabIndex={0}
      aria-label={article.title}
      onClick={handleOpen}
      onKeyDown={handleKeyDown}
      className={cn(cardVariants({ variant, size }), className)}
    >
      {/* Image */}
      <figure className={cn("relative overflow-hidden", imageHeight)}>
        <img
          src={article.image}
          alt={article.title}
          loading={isHero ? "eager" : "lazy"}
          className="size-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        <figcaption className="absolute top-3 left-3 flex items-center gap-2">
          {isHero && (
            <span className="bg-primary text-primary-foreground text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              Breaking
            </span>
          )}
          <CategoryBadge category={article.category} />
        </figcaption>
      </figure>

      {/* Content */}
      <div className={cn("flex flex-col flex-1", isHero ? "p-6 lg:p-8" : isColumn ? "p-5 lg:p-6" : isLargeGrid ? "p-5" : "p-4")}>
        <h3
          className={cn(
            "font-bold text-foreground leading-snug mb-2 group-hover:text-primary transition-colors duration-300 line-clamp-2",
            headingSize,
          )}
        >
          {article.title}
        </h3>

        <p
          className={cn(
            "text-muted-foreground leading-relaxed flex-1",
            isHero ? "text-sm line-clamp-2 mb-5" : isColumn ? "text-sm line-clamp-3 mb-4" : isLargeGrid ? "text-sm line-clamp-3 mb-4" : "text-xs line-clamp-2 mb-3",
          )}
        >
          {article.excerpt}
        </p>

        <div className={cn("flex items-center justify-between", !isHero && "pt-3 border-t border-border")}>
          <ArticleMeta article={article} compact={!isHero} />
          {isHero ? (
            <span
              role="link"
              className="inline-flex items-center gap-1.5 text-primary font-semibold text-sm group-hover:gap-2.5 transition-all"
            >
              Read More <ArrowRight size={15} aria-hidden />
            </span>
          ) : (
            <ArrowRight
              size={15}
              aria-hidden
              className="text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all duration-300 shrink-0"
            />
          )}
        </div>
      </div>
    </motion.article>
  );
}

/* ━━━━━━━━━━━━  Section Header  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

interface SectionHeaderProps {
  loading: boolean;
  hasArticles: boolean;
}

function SectionHeader({ loading, hasArticles }: SectionHeaderProps) {
  return (
    <header className="flex items-end justify-between mb-14">
      <div>
        <span className="inline-flex items-center gap-2 text-sm font-semibold text-primary uppercase tracking-wider">
          Latest Updates
          {!loading && hasArticles && <LiveBadge />}
        </span>
        <h2 className="text-3xl md:text-5xl font-extrabold mt-3 text-foreground leading-tight">
          Stories from the
          <br />
          <span className="text-primary">Real Estate World</span>
        </h2>
        <p className="text-muted-foreground mt-3 max-w-md text-sm leading-relaxed">
          Expert analysis, breaking news, and market insights — curated for smarter property decisions.
        </p>
      </div>
      <Link
        to="/latest-updates"
        className="hidden md:inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-border bg-card text-sm font-semibold text-foreground hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition"
      >
        View All <ArrowRight size={14} aria-hidden />
      </Link>
    </header>
  );
}

/* ━━━━━━━━━━━━  Loading Skeleton  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

function Skeleton() {
  return (
    <div className="animate-pulse space-y-10" role="status" aria-label="Loading articles">
      <div className="rounded-2xl overflow-hidden bg-card border border-border">
        <div className="h-64 bg-muted" />
        <div className="p-6 space-y-3">
          <div className="h-3 bg-muted rounded-full w-1/6" />
          <div className="h-6 bg-muted rounded w-3/4" />
          <div className="h-4 bg-muted rounded w-full" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[0, 1].map((i) => (
          <div key={i} className="rounded-2xl overflow-hidden bg-card border border-border">
            <div className="h-48 bg-muted" />
            <div className="p-5 space-y-3">
              <div className="h-3 bg-muted rounded-full w-1/5" />
              <div className="h-5 bg-muted rounded w-2/3" />
              <div className="h-4 bg-muted rounded w-full" />
            </div>
          </div>
        ))}
      </div>
      <span className="sr-only">Loading…</span>
    </div>
  );
}

/* ━━━━━━━━━━━━  Divider  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

function SectionDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-4 my-10" role="separator">
      <div className="flex-1 h-px bg-border" />
      <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest select-none">
        {label}
      </span>
      <div className="flex-1 h-px bg-border" />
    </div>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   MAIN SECTION — Newspaper Latest Updates
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

const NewspaperLatestUpdates = () => {
  const { articles, loading } = useArticleManager(12);

  const hero = articles.find((a) => a.importance === 3);
  const columns = articles.filter((a) => a.importance === 2);
  const editorial = articles.filter((a) => a.importance <= 1);

  return (
    <section className="py-20 px-6 section-alt overflow-hidden" aria-labelledby="news-section-heading">
      <div className="max-w-7xl mx-auto">
        <SectionHeader loading={loading} hasArticles={articles.length > 0} />

        {loading ? (
          <Skeleton />
        ) : (
          <>
            {/* ── Top grid: hero (left) + 2 columns (right) ── */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-6 mb-4">
              {hero && <ArticleCard article={hero} variant="hero" index={0} />}
              <div className="flex flex-col gap-6">
                {columns.slice(0, 2).map((a, i) => (
                  <ArticleCard key={a.id} article={a} variant="column" index={i + 1} />
                ))}
              </div>
            </div>

            <SectionDivider label="More Stories" />

            {/* ── Editorial grid: responsive auto-fill ── */}
            {editorial.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {editorial.map((a, i) => (
                  <ArticleCard key={a.id} article={a} variant="grid" index={i} />
                ))}
              </div>
            )}

            {/* Mobile CTA */}
            <div className="flex justify-center mt-12 md:hidden">
              <Link
                to="/latest-updates"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition"
              >
                View All Updates <ArrowRight size={15} aria-hidden />
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default NewspaperLatestUpdates;
