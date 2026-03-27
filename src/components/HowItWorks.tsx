import { motion } from "framer-motion";
import { Search, FileText, Banknote, Home } from "lucide-react";
import HowItWorksBackground from "./HowItWorksBackground";

const steps = [
  {
    num: "01",
    icon: Search,
    title: "Browse & Select",
    desc: "Explore our curated collection of verified properties or tell us exactly what you're looking for.",
  },
  {
    num: "02",
    icon: FileText,
    title: "Apply in Minutes",
    desc: "One simple application for property booking and loan pre-approval. Get an instant decision.",
  },
  {
    num: "03",
    icon: Banknote,
    title: "Get Financed",
    desc: "A dedicated channel partner meets you to discuss the loan process and secure the best rates tailored to your profile.",
  },
  {
    num: "04",
    icon: Home,
    title: "Move In",
    desc: "Collect your keys and start your new chapter. We handle all the paperwork end to end.",
  },
];

const metrics = [
  { value: "24hrs", label: "Average Approval Time" },
  { value: "8.5%", label: "Starting Interest Rate" },
  { value: "30 Years", label: "Max Loan Tenure" },
  { value: "90%", label: "Max LTV Ratio" },
];

const HowItWorks = () => {
  return (
    <section id="how" className="relative py-24 px-6 section-alt overflow-hidden">
      <HowItWorksBackground />
      <div className="pointer-events-none absolute inset-0 z-[1]">
        <motion.div
          className="absolute -top-28 left-[-8%] h-72 w-72 rounded-full bg-primary/12 blur-3xl"
          animate={{ scale: [1, 1.08, 1], opacity: [0.25, 0.42, 0.25] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -bottom-32 right-[-10%] h-80 w-80 rounded-full bg-accent/15 blur-3xl"
          animate={{ scale: [1.05, 0.98, 1.05], opacity: [0.35, 0.2, 0.35] }}
          transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
        />
        <div className="absolute inset-x-0 top-0 h-44 bg-gradient-to-b from-background/55 via-background/30 to-transparent" />
        <motion.div
          className="absolute -left-1/4 top-24 h-16 w-[150%] rotate-[-6deg] bg-gradient-to-r from-transparent via-primary/10 to-transparent blur-2xl"
          animate={{ x: ["-8%", "8%", "-8%"] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-sm font-semibold text-primary uppercase tracking-wider">
            Simple Process
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold mt-3 text-foreground">
            How It Works
          </h2>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto font-body">
            From browsing to owning — we've simplified every step of your journey.
          </p>
        </div>

        <div className="relative mb-16">
          <div className="absolute left-0 right-0 top-[3.4rem] hidden lg:block">
            <div className="mx-10 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, i) => {
              return (
                <motion.div
                  key={step.num}
                  className="relative h-full group/card"
                  whileHover="hover"
                >
                  {/* Strobe Outline Trace on Hover */}
                  <svg className="absolute inset-0 w-full h-full pointer-events-none z-20 overflow-visible" style={{ borderRadius: '1.5rem' }}>
                    <defs>
                      <filter id={`glow-${i}`} x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                        <feMerge>
                          <feMergeNode in="coloredBlur"/>
                          <feMergeNode in="SourceGraphic"/>
                        </feMerge>
                      </filter>
                    </defs>
                    <motion.rect
                      x="1" y="1" width="calc(100% - 2px)" height="calc(100% - 2px)" rx="23"
                      fill="none" stroke="hsl(var(--primary))" strokeWidth="2"
                      filter={`url(#glow-${i})`}
                      initial={{ opacity: 0, pathLength: 0, pathOffset: 0 }}
                      variants={{
                        hover: { pathLength: 0.15, pathOffset: [0, 1], opacity: [0, 1, 1, 0] }
                      }}
                      transition={{ 
                        pathOffset: { duration: 1.2, ease: "linear" },
                        opacity: { duration: 1.2, ease: "linear", times: [0, 0.1, 0.9, 1] }
                      }}
                    />
                    {/* Luminescent Dot at the front of the trace */}
                    <motion.circle
                      r="3"
                      fill="white"
                      filter={`url(#glow-${i})`}
                      initial={{ opacity: 0, offsetDistance: "0%" }}
                      variants={{
                        hover: { offsetDistance: ["0%", "100%"], opacity: [0, 1, 1, 0] }
                      }}
                      transition={{ 
                        offsetDistance: { duration: 1.2, ease: "linear" },
                        opacity: { duration: 1.2, ease: "linear", times: [0, 0.1, 0.9, 1] }
                      }}
                      style={{ offsetPath: `rect(1px 1px calc(100% - 2px) calc(100% - 2px) 23px)` }}
                    />
                  </svg>

                  <motion.div
                    className="group relative overflow-hidden rounded-3xl border border-white/50 bg-card/80 p-6 backdrop-blur-lg shadow-lg shadow-primary/10 h-full"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.15 }}
                    variants={{
                      hover: { y: -5, scale: 1.01 }
                    }}
                  >
                    <motion.div
                      className="pointer-events-none absolute -left-1/3 top-[-30%] h-24 w-[170%] rotate-[-18deg] bg-gradient-to-r from-transparent via-white/30 to-transparent"
                      animate={{ x: ["-10%", "16%", "-10%"] }}
                      transition={{ duration: 7 + i * 0.4, repeat: Infinity, ease: "easeInOut" }}
                    />
                    <div className="pointer-events-none absolute inset-0 rounded-3xl bg-gradient-to-br from-white/65 via-transparent to-primary/10 opacity-90" />
                    <div className="pointer-events-none absolute -bottom-10 left-1/2 h-20 w-20 -translate-x-1/2 rounded-full bg-primary/12 blur-2xl" />

                    <div className="relative z-10 mb-5 flex items-center justify-between">
                      <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 ring-1 ring-primary/25">
                        <motion.div
                          className="absolute inset-0 rounded-2xl border border-primary/35"
                          animate={{ scale: [1, 1.12, 1], opacity: [0.45, 0.08, 0.45] }}
                          transition={{ duration: 4, repeat: Infinity, ease: "easeOut", delay: i * 0.22 }}
                        />
                        <step.icon size={24} className="text-primary" />
                      </div>
                      <span className="text-4xl font-extrabold text-primary/15">{step.num}</span>
                    </div>

                    <div className="relative z-10">
                      <h3 className="text-lg font-bold text-foreground mb-2">{step.title}</h3>
                      <p className="text-sm text-muted-foreground font-body leading-relaxed">{step.desc}</p>
                    </div>

                    <div className="pointer-events-none absolute -inset-px rounded-3xl border border-primary/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  </motion.div>
                </motion.div>
              );
            })}
          </div>
        </div>

        <motion.div
          className="relative overflow-hidden rounded-3xl border border-white/50 bg-card/80 p-6 md:p-8 backdrop-blur-lg shadow-lg shadow-primary/10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45, delay: 0.15 }}
        >
          <motion.div
            className="pointer-events-none absolute -left-[12%] top-3 h-14 w-[124%] rounded-full bg-gradient-to-r from-transparent via-accent/15 to-transparent blur-xl"
            animate={{ x: ["-6%", "8%", "-6%"] }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {metrics.map((m) => (
              <div
                key={m.label}
                className="relative overflow-hidden rounded-2xl border border-border/60 bg-background/75 px-3 py-4 text-center"
              >
                <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-primary/45 to-transparent" />
                <div className="text-2xl md:text-3xl font-extrabold text-primary">{m.value}</div>
                <div className="text-sm text-muted-foreground font-body mt-1">{m.label}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HowItWorks;
