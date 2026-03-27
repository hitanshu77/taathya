import { Award, Shield, Users, Star, Building, ThumbsUp } from "lucide-react";

const items = [
  { icon: Award, label: "15+ Years in Lending" },
  { icon: Shield, label: "RBI Registered" },
  { icon: Users, label: "10,000+ Customers" },
  { icon: Star, label: "Award Winning Service" },
  { icon: Building, label: "500+ Properties Listed" },
  { icon: ThumbsUp, label: "99% Approval Rate" },
];

const TrustTicker = () => {
  return (
    <section className="bg-foreground py-4 overflow-hidden">
      <div className="ticker-track">
        {[...items, ...items, ...items].map((item, i) => (
          <div
            key={i}
            className="flex items-center gap-2 px-8 whitespace-nowrap"
          >
            <item.icon size={16} className="text-gold" />
            <span className="text-sm font-medium text-primary-foreground">
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
};

export default TrustTicker;
