import { motion } from "framer-motion";
import { CheckCircle, ArrowRight } from "lucide-react";

const paths = [
  {
    id: "buy",
    title: "Buy Property",
    subtitle: "Find Your Dream Home",
    description: "Explore curated properties across prime locations. From luxury villas to smart apartments.",
    features: ["Verified Listings", "Virtual Tours", "Price Insights", "Neighborhood Data"],
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&h=400&fit=crop",
    cta: "Explore Buy Property",
  },
  {
    id: "loan",
    title: "Get a Loan",
    subtitle: "Quick & Easy Financing",
    description: "15+ years of lending expertise. Get pre-approved in minutes with the best rates.",
    features: ["Instant Pre-approval", "Lowest Interest Rates", "Flexible Tenure", "Minimal Documentation"],
    image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&h=400&fit=crop",
    cta: "Explore Get a Loan",
  },
  {
    id: "buyfinance",
    title: "Buy + Finance",
    subtitle: "The Complete Solution",
    description: "Our signature offering. Select a property and get instant loan approval — seamlessly integrated.",
    features: ["One Application", "Faster Closure", "Better Deals", "Dedicated Support"],
    image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&h=400&fit=crop",
    cta: "Explore Buy + Finance",
    signature: true,
  },
];

const ThreePaths = () => {
  return (
    <section id="buy" className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-sm font-semibold text-primary uppercase tracking-wider">
            What Sets Us Apart
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold mt-3 text-foreground">
            Three Paths, One Platform
          </h2>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto font-body">
            Whether you're looking to buy, finance, or do both — we've designed the perfect journey for every need.
          </p>
        </div>

        <div className="space-y-20">
          {paths.map((path, index) => (
            <motion.div
              key={path.id}
              id={path.id === "loan" ? "loan" : path.id === "buyfinance" ? "buyfinance" : undefined}
              className={`flex flex-col ${index % 2 === 1 ? "lg:flex-row-reverse" : "lg:flex-row"} gap-12 items-center`}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
            >
              <div className="lg:w-1/2 relative">
                {path.signature && (
                  <span className="absolute -top-3 left-4 z-10 px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-md signature-badge">
                    Signature
                  </span>
                )}
                <img
                  src={path.image}
                  alt={path.title}
                  className="w-full rounded-2xl shadow-lg object-cover aspect-[3/2]"
                />
              </div>
              <div className="lg:w-1/2">
                <h3 className="text-2xl font-extrabold text-foreground mb-2">{path.title}</h3>
                <p className="text-lg font-semibold text-primary mb-3">{path.subtitle}</p>
                <p className="text-muted-foreground font-body mb-6">{path.description}</p>
                <div className="grid grid-cols-2 gap-3 mb-8">
                  {path.features.map((f) => (
                    <div key={f} className="flex items-center gap-2">
                      <CheckCircle size={16} className="text-primary" />
                      <span className="text-sm font-medium text-foreground">{f}</span>
                    </div>
                  ))}
                </div>
                <a
                  href="#cta"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:opacity-90 transition"
                >
                  {path.cta} <ArrowRight size={16} />
                </a>
              </div>
            </motion.div>
          ))}
        </div>

        <p className="text-center mt-16 text-sm text-muted-foreground font-body italic">
          First of its kind — Combining real estate and financing expertise under one roof.
        </p>
      </div>
    </section>
  );
};

export default ThreePaths;
 