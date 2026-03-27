import { ArrowRight, Play, CheckCircle, Zap, TrendingUp, MapPin, IndianRupee, ShieldCheck, Clock, Percent, Calculator } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";

function useCountUp(end: number, duration = 2000) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const start = performance.now();
          const step = (now: number) => {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - (1 - progress) * (1 - progress);
            setValue(Math.floor(eased * end));
            if (progress < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
        }
      },
      { threshold: 0.3 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [end, duration]);

  return { value, ref };
}

const stagger = (i: number) => ({ duration: 0.55, delay: 0.15 + i * 0.08, ease: [0.22, 1, 0.36, 1] as const });

interface HeroSectionProps {
  onIntroComplete: () => void;
  introComplete: boolean;
}

const HeroSection = ({ onIntroComplete }: HeroSectionProps) => {
  const words = ["Ideal Property.", "Right Financing.", "Complete Solution."];
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => { onIntroComplete(); }, [onIntroComplete]);

  const years = useCountUp(15, 1800);
  const loans = useCountUp(500, 2200);
  const customers = useCountUp(10, 2000);

  useEffect(() => {
    const interval = setInterval(() => setCurrentIndex((p) => (p + 1) % words.length), 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative min-h-screen overflow-hidden bg-background">
      {/* Atmospheric layer */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="hero-glow" cx="62%" cy="68%" r="52%">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.09" />
            <stop offset="55%" stopColor="hsl(var(--primary))" stopOpacity="0.035" />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="hero-haze" x1="0" y1="0" x2="0" y2="1">
            <stop offset="45%" stopColor="hsl(var(--primary))" stopOpacity="0" />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.045" />
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#hero-glow)" />
        <rect width="100%" height="100%" fill="url(#hero-haze)" />
        <path d="M0 675 C130 662 230 656 320 662 C410 667 500 688 590 676 C670 666 748 634 860 644 C980 655 1030 705 1160 692 C1260 682 1340 664 1440 670" fill="none" stroke="hsl(var(--primary))" strokeWidth="1.2" opacity="0.13" strokeLinecap="round" />
      </svg>

      {/* NYC Skyline Photo Overlay — full hero */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1534430480872-3498386e7856?w=1800&q=80&fit=crop&crop=bottom"
          alt=""
          className="absolute inset-0 w-full h-full object-cover object-center"
          style={{ opacity: 0.13 }}
        />
        {/* Mask: strong top fade (fully opaque background at top → transparent midway) */}
        <div className="absolute inset-x-0 top-0 h-2/3 bg-gradient-to-b from-background via-background/70 to-transparent" />
        {/* Mask: left side — keeps copy column clean */}
        <div className="absolute inset-y-0 left-0 w-[45%] bg-gradient-to-r from-background/90 to-transparent" />
        {/* Mask: right side */}
        <div className="absolute inset-y-0 right-0 w-[15%] bg-gradient-to-l from-background/60 to-transparent" />
        {/* Mask: bottom */}
        <div className="absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-background to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-36 pb-28 lg:pt-40 lg:pb-32 flex items-center min-h-screen">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center w-full">

          {/* Left: Copy */}
          <div className="lg:col-span-7 xl:col-span-6 relative min-h-[600px] flex flex-col justify-center">
            <div className="relative z-10 py-10 h-full flex flex-col justify-center -mt-12">
              <h1 className="text-[2.75rem] md:text-[3.5rem] lg:text-[3.75rem] font-extrabold leading-[1.1] mb-6 text-foreground tracking-tight">
                <motion.span initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>One Platform.</motion.span>{" "}
                <br />
                <motion.span initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-foreground/90">Find Your</motion.span>{" "}
                <br />
                <motion.span
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                  className="relative inline-block overflow-hidden align-bottom text-primary"
                  style={{ height: "1.15em", width: "100%" }}
                >
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={currentIndex}
                      initial={{ y: "110%" }}
                      animate={{ y: "0%" }}
                      exit={{ y: "-110%" }}
                      transition={{ duration: 0.4, ease: [0.33, 1, 0.68, 1] }}
                      className="absolute left-0 top-0 whitespace-nowrap"
                    >
                      {words[currentIndex]}
                    </motion.span>
                  </AnimatePresence>
                </motion.span>
              </h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                className="text-base md:text-lg text-muted-foreground max-w-lg mb-10 leading-relaxed font-body"
              >
                Explore properties, secure the best financing, or do both — seamlessly, under one roof.
                Backed by 15+ years of lending expertise.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
                className="flex flex-wrap items-center gap-4 mb-14"
              >
                <a href="#cta" className="inline-flex items-center gap-2.5 px-8 py-4 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary/90 transition-all shadow-xl shadow-primary/20">
                  Get Started <ArrowRight size={16} />
                </a>
                <button className="inline-flex items-center gap-2.5 px-8 py-4 rounded-xl text-foreground font-bold text-sm border border-border hover:bg-muted transition-all">
                  <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Play size={13} className="text-primary ml-0.5" />
                  </span>
                  Watch Demo
                </button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
                className="flex items-center gap-8 lg:gap-10 mt-4"
              >
                {[
                  { ref: years.ref, val: `${years.value}+`, label: "Years Expertise" },
                  { ref: loans.ref, val: `${loans.value}Cr+`, label: "Loans Disbursed" },
                  { ref: customers.ref, val: `${customers.value}K+`, label: "Happy Families" },
                ].map((s) => (
                  <div key={s.label} ref={s.ref as React.Ref<HTMLDivElement>} className="flex flex-col">
                    <span className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight">{s.val}</span>
                    <span className="text-xs text-muted-foreground font-medium mt-0.5">{s.label}</span>
                  </div>
                ))}
              </motion.div>
            </div>
          </div>

          {/* Right: Floating cards — scattered random layout */}
          <div className="lg:col-span-5 xl:col-span-6 relative hidden lg:block" style={{ height: 540 }}>

            {/* Property Card — top-left area */}
            <motion.div
              className="absolute z-20 w-[14.5rem] bg-white rounded-2xl shadow-[0_18px_50px_-12px_rgba(0,0,0,0.16)] overflow-hidden border border-black/[0.04]"
              style={{ top: 0, left: 0 }}
              initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={stagger(0)}
            >
              <div className="relative">
                <img src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=500&h=280&fit=crop" alt="Luxury Villa" className="w-full h-[8.5rem] object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                <div className="absolute bottom-2.5 left-3 right-3 flex items-end justify-between">
                  <div>
                    <p className="text-white text-[13px] font-bold drop-shadow-sm">Luxury Villa</p>
                    <p className="text-white/80 text-[10px] flex items-center gap-1"><MapPin size={9} /> Whitefield, Bangalore</p>
                  </div>
                  <span className="text-[9px] font-bold uppercase bg-white/90 text-primary px-2 py-0.5 rounded">New</span>
                </div>
              </div>
              <div className="px-3.5 py-3 flex items-center justify-between">
                <div>
                  <p className="text-[1.05rem] font-extrabold text-foreground">Rs.2.5 Cr</p>
                  <p className="text-[10px] text-muted-foreground">EMI from Rs.1.65L/mo</p>
                </div>
                <button className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center hover:bg-primary/15 transition">
                  <ArrowRight size={13} className="text-primary" />
                </button>
              </div>
            </motion.div>

            {/* Loan Service Card — offset right & down */}
            <motion.div
              className="absolute z-20 w-[14rem] bg-white rounded-2xl shadow-[0_18px_50px_-12px_rgba(0,0,0,0.16)] overflow-hidden border border-primary/10"
              style={{ top: 30, right: 50 }}
              initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={stagger(1)}
            >
              <div className="px-3.5 pt-3.5 pb-2.5 border-b border-gray-100" style={{ background: "linear-gradient(135deg, hsl(340 72% 96%) 0%, hsl(340 60% 98%) 100%)" }}>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: "linear-gradient(135deg, hsl(340 72% 36%) 0%, hsl(340 55% 30%) 100%)" }}>
                    <Calculator size={11} className="text-white" />
                  </div>
                  <p className="text-[12px] font-bold text-foreground">Loan for This Property</p>
                </div>
                <p className="text-[9px] text-muted-foreground">Instant eligibility check</p>
              </div>
              <div className="px-3.5 py-2.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-muted-foreground flex items-center gap-1"><IndianRupee size={9} className="text-primary" /> Loan Amount</span>
                  <span className="text-[13px] font-extrabold text-foreground">Rs.2.12 Cr</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-muted-foreground flex items-center gap-1"><Percent size={9} className="text-primary" /> Interest Rate</span>
                  <span className="text-[13px] font-bold text-foreground">8.5% <span className="text-[9px] font-normal text-muted-foreground">p.a.</span></span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-muted-foreground flex items-center gap-1"><Clock size={9} className="text-primary" /> Tenure</span>
                  <span className="text-[13px] font-bold text-foreground">20 Years</span>
                </div>
                <div className="h-px bg-gray-100" />
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-muted-foreground flex items-center gap-1"><Calculator size={9} className="text-primary" /> Monthly EMI</span>
                  <span className="text-[14px] font-extrabold text-primary">Rs.1.84L</span>
                </div>
              </div>
              <div className="px-3.5 pb-3 pt-0.5 flex items-center justify-between">
                <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded flex items-center gap-1">
                  <ShieldCheck size={9} /> Pre-Approved
                </span>
                <button className="text-[10px] font-bold text-white px-3 py-1.5 rounded-lg transition" style={{ background: "linear-gradient(135deg, hsl(340 72% 36%) 0%, hsl(340 55% 30%) 100%)" }}>
                  Apply Now
                </button>
              </div>
            </motion.div>

            {/* Bangalore ORR chip — top right */}
            <motion.div
              className="absolute z-30 flex items-center gap-2 bg-white rounded-xl shadow-[0_8px_28px_-6px_rgba(0,0,0,0.1)] px-3 py-2 border border-black/[0.04]"
              style={{ top: 0, right: 0 }}
              initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={stagger(3)}
            >
              <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center">
                <TrendingUp size={13} className="text-emerald-600" />
              </div>
              <div>
                <p className="text-[9px] text-foreground/45 font-medium">Bangalore ORR</p>
                <p className="text-[13px] font-bold text-emerald-600">+22% YoY</p>
              </div>
            </motion.div>

            {/* 3 BHK Sea View — bottom-right */}
            <motion.div
              className="absolute z-10 w-[13rem] bg-white rounded-2xl shadow-[0_14px_44px_-10px_rgba(0,0,0,0.13)] overflow-hidden border border-black/[0.04]"
              style={{ bottom: 44, right: 8 }}
              initial={{ opacity: 0, y: 35 }} animate={{ opacity: 1, y: 0 }} transition={stagger(2)}
            >
              <div className="relative">
                <img src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=500&h=240&fit=crop" alt="Sea View" className="w-full h-[7rem] object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                <div className="absolute bottom-2 left-2.5">
                  <p className="text-white text-[12px] font-bold drop-shadow-sm">3 BHK Sea View</p>
                  <p className="text-white/75 text-[10px] flex items-center gap-1"><MapPin size={9} /> Bandra, Mumbai</p>
                </div>
              </div>
              <div className="px-3 py-2.5 flex items-center justify-between">
                <p className="text-[1rem] font-extrabold text-foreground">Rs.1.8 Cr</p>
                <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">Loan Ready</span>
              </div>
            </motion.div>

            {/* Loan Approved — below property card */}
            <motion.div
              className="absolute z-30 w-[14.5rem] rounded-2xl p-3.5 shadow-[0_18px_45px_-8px_rgba(0,0,0,0.25)]"
              style={{ top: 280, left: 0, background: "linear-gradient(135deg, hsl(340 72% 36%) 0%, hsl(340 60% 28%) 100%)", color: "white" }}
              initial={{ opacity: 0, x: -25 }} animate={{ opacity: 1, x: 0 }} transition={stagger(4)}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[12px] font-semibold opacity-85">Loan Approved</span>
                <CheckCircle size={14} className="opacity-80" />
              </div>
              <div className="text-[1.35rem] font-extrabold leading-none mb-1">Rs.1.8 Cr</div>
              <div className="flex items-center justify-between mt-1.5">
                <span className="text-[10px] opacity-65">@ 8.5% p.a.</span>
                <span className="text-[9px] font-bold bg-white/15 px-1.5 py-0.5 rounded">24h Approval</span>
              </div>
            </motion.div>

            {/* Buy + Finance pill — bottom center-right */}
            <motion.div
              className="absolute z-30 flex items-center gap-2.5 rounded-xl px-4 py-3 shadow-[0_10px_35px_-6px_rgba(0,0,0,0.2)]"
              style={{ bottom: 0, left: "44%", background: "linear-gradient(135deg, hsl(340 72% 36%) 0%, hsl(340 55% 30%) 100%)", color: "white" }}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={stagger(5)}
            >
              <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center">
                <Zap size={15} />
              </div>
              <div>
                <p className="text-[13px] font-bold leading-tight">Buy + Finance</p>
                <p className="text-[10px] opacity-65">All in one click</p>
              </div>
            </motion.div>

          </div>
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-background/85 to-transparent z-20 pointer-events-none" />
    </section>
  );
};

export default HeroSection;