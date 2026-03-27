import { motion } from "framer-motion";
import { Bed, Bath, Maximize, ArrowRight } from "lucide-react";

const properties = [
  {
    title: "Modern Villa in Whitefield",
    location: "Whitefield, Bangalore",
    image: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=600&h=400&fit=crop",
    beds: 4,
    baths: 3,
    sqft: "3,200",
    price: "₹2.8 Cr",
    emi: "₹1.85 L/mo",
    tags: ["New Launch", "Loan Ready"],
  },
  {
    title: "Luxury Apartment in Bandra",
    location: "Bandra West, Mumbai",
    image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=600&h=400&fit=crop",
    beds: 3,
    baths: 3,
    sqft: "2,100",
    price: "₹4.5 Cr",
    emi: "₹2.95 L/mo",
    tags: ["Premium", "Loan Ready"],
  },
  {
    title: "Smart Home in Gurgaon",
    location: "Golf Course Road, Gurgaon",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&h=400&fit=crop",
    beds: 4,
    baths: 4,
    sqft: "2,800",
    price: "₹3.2 Cr",
    emi: "₹2.10 L/mo",
    tags: ["Ready to Move", "Loan Ready"],
  },
];

const FeaturedListings = () => {
  return (
    <section id="properties" className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <span className="text-sm font-semibold text-primary uppercase tracking-wider">
              Featured Listings
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold mt-3 text-foreground">
              Handpicked Properties
            </h2>
            <p className="mt-4 text-muted-foreground max-w-lg font-body">
              Premium properties with instant loan eligibility. Buy and finance together.
            </p>
          </div>
          <a
            href="#cta"
            className="mt-6 md:mt-0 inline-flex items-center gap-2 text-primary font-semibold hover:underline"
          >
            View All Properties <ArrowRight size={16} />
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {properties.map((prop, i) => (
            <motion.div
              key={prop.title}
              className="bg-card rounded-2xl overflow-hidden shadow-sm border border-border hover:shadow-lg transition-shadow"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
            >
              <div className="relative">
                <img
                  src={prop.image}
                  alt={prop.title}
                  className="w-full h-52 object-cover"
                />
                <div className="absolute top-3 left-3 flex gap-2">
                  {prop.tags.map((tag) => (
                    <span
                      key={tag}
                      className={`px-2.5 py-1 rounded-md text-xs font-semibold ${
                        tag === "Loan Ready"
                          ? "bg-emerald-500 text-primary-foreground"
                          : "signature-badge"
                      }`}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <div className="p-5">
                <p className="text-xs text-muted-foreground font-body mb-1">{prop.location}</p>
                <h3 className="text-lg font-bold text-foreground mb-3">{prop.title}</h3>
                <div className="flex gap-4 text-sm text-muted-foreground font-body mb-4">
                  <span className="flex items-center gap-1"><Bed size={14} /> {prop.beds} Beds</span>
                  <span className="flex items-center gap-1"><Bath size={14} /> {prop.baths} Baths</span>
                  <span className="flex items-center gap-1"><Maximize size={14} /> {prop.sqft} sqft</span>
                </div>
                <div className="flex items-end justify-between">
                  <div>
                    <span className="text-xl font-extrabold text-foreground">{prop.price}</span>
                    <p className="text-xs text-muted-foreground font-body">EMI from {prop.emi}</p>
                  </div>
                  <a
                    href="#cta"
                    className="text-sm font-semibold text-primary hover:underline"
                  >
                    View Details
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedListings;
