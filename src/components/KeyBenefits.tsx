import { motion } from "framer-motion";
import {
  Home,
  Percent,
  ShieldCheck,
  Clock,
  Banknote,
  FileCheck,
  Users,
  Sparkles,
} from "lucide-react";

const benefits = [
  {
    icon: Home,
    title: "Verified Listings Only",
    desc: "Every property is legally vetted and RERA-compliant before you ever see it. No surprises after signing.",
    span: "md:col-span-2 md:row-span-1",
  },
  {
    icon: Percent,
    title: "Lowest Interest Rates",
    desc: "We compare 30+ lenders in real-time to get you rates starting at 8.25% p.a. — rates your bank won't offer walk-ins.",
    span: "md:col-span-1 md:row-span-2",
    highlight: true,
  },
  {
    icon: ShieldCheck,
    title: "RBI Registered",
    desc: "Fully licensed and regulated. Your funds, documents and data are protected end-to-end.",
    span: "md:col-span-1 md:row-span-1",
  },
  {
    icon: Clock,
    title: "48-Hour Loan Approval",
    desc: "From application to sanction in just 2 business days — no branch visits, no paperwork queues.",
    span: "md:col-span-1 md:row-span-1",
  },
  {
    icon: Banknote,
    title: "Zero Hidden Fees",
    desc: "Transparent, flat pricing. No processing fees, no surprise charges — ever.",
    span: "md:col-span-1 md:row-span-1",
  },
  {
    icon: FileCheck,
    title: "End-to-End Documentation",
    desc: "We handle everything — property registration, loan agreements, NOCs — so you don't have to lift a finger.",
    span: "md:col-span-2 md:row-span-1",
  },
  {
    icon: Users,
    title: "Dedicated Relationship Manager",
    desc: "One person, your entire journey. Reachable by call, WhatsApp or email — 7 days a week.",
    span: "md:col-span-1 md:row-span-1",
  },
  {
    icon: Sparkles,
    title: "Buy + Finance Advantage",
    desc: "Save up to 3 lakh when you buy and finance through Taathya together.",
    span: "md:col-span-1 md:row-span-1",
    highlight: true,
  },
];

const KeyBenefits = () => {
  return (
    <section className="py-24 px-6 bg-background">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <span className="text-sm font-semibold text-primary uppercase tracking-wider">
            Why Taathya
          </span>
          <h2 className="text-3xl md:text-5xl font-extrabold mt-3 text-foreground">
            Benefits That{" "}
            <span className="text-primary">Set Us Apart</span>
          </h2>
          <p className="mt-4 text-muted-foreground max-w-xl mx-auto font-body">
            A smarter way to buy property and secure financing all under one roof.
          </p>
        </motion.div>

        {/* Asymmetric grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 auto-rows-auto gap-5">
          {benefits.map((b, i) => (
            <motion.div
              key={b.title}
              className={[
                b.span,
                "group relative flex flex-col justify-between",
                "rounded-2xl p-7 overflow-hidden",
                "transition-shadow duration-300 hover:shadow-2xl",
                b.highlight
                  ? "hero-gradient text-primary-foreground"
                  : "bg-card border border-border hover:border-primary/25",
              ].join(" ")}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
              whileHover={{ y: -3 }}
            >
              {/* Sheen on highlight cards */}
              {b.highlight && (
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              )}

              {/* Tinted hover bg on normal cards */}
              {!b.highlight && (
                <div className="pointer-events-none absolute inset-0 bg-primary/[0.03] opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
              )}

              <div className="relative z-10">
                {/* Icon */}
                <div
                  className={[
                    "w-12 h-12 rounded-xl flex items-center justify-center mb-5",
                    "transition-transform duration-300 group-hover:scale-110",
                    b.highlight ? "bg-primary-foreground/15" : "bg-secondary",
                  ].join(" ")}
                >
                  <b.icon
                    size={22}
                    className={b.highlight ? "text-primary-foreground" : "text-primary"}
                    strokeWidth={1.8}
                  />
                </div>

                <h3
                  className={[
                    "text-lg font-bold mb-2",
                    b.highlight ? "text-primary-foreground" : "text-foreground",
                  ].join(" ")}
                >
                  {b.title}
                </h3>

                <p
                  className={[
                    "text-sm font-body leading-relaxed",
                    b.highlight ? "text-primary-foreground/80" : "text-muted-foreground",
                  ].join(" ")}
                >
                  {b.desc}
                </p>
              </div>

            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default KeyBenefits;