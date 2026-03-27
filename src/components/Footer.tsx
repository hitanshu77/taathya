import { Facebook, Twitter, Instagram, Linkedin, Youtube, Mail, Phone, MapPin } from "lucide-react";

const siteLinks = [
  {
    title: "Explore",
    links: [
      { label: "Buy Property", href: "#buy" },
      { label: "Get a Loan", href: "#loan" },
      { label: "Buy + Finance", href: "#buyfinance" },
      { label: "Featured Listings", href: "#properties" },
      { label: "How It Works", href: "#how" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About Us", href: "#" },
      { label: "Careers", href: "#" },
      { label: "Blog", href: "#" },
      { label: "Press", href: "#" },
      { label: "Contact Us", href: "#" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Terms & Conditions", href: "#" },
      { label: "Privacy Policy", href: "#" },
      { label: "Refund Policy", href: "#" },
      { label: "Disclaimer", href: "#" },
      { label: "Grievance Redressal", href: "#" },
    ],
  },
];

const faqs = [
  {
    q: "How does Buy + Finance work?",
    a: "Select a property, apply for a loan in one step, and get instant pre-approval — all on Taathya.",
  },
  {
    q: "What documents are needed for a loan?",
    a: "Basic KYC (Aadhaar, PAN), income proof, and bank statements. We keep it minimal.",
  },
  {
    q: "Is Taathya RBI registered?",
    a: "Yes, we are a fully RBI-registered NBFC with 15+ years of lending experience.",
  },
  {
    q: "How fast is loan approval?",
    a: "Most loans are pre-approved within 24 hours. Final disbursement in 5-7 business days.",
  },
];

const socials = [
  { icon: Facebook, href: "#", label: "Facebook" },
  { icon: Twitter, href: "#", label: "Twitter" },
  { icon: Instagram, href: "#", label: "Instagram" },
  { icon: Linkedin, href: "#", label: "LinkedIn" },
  { icon: Youtube, href: "#", label: "YouTube" },
];

const Footer = () => {
  return (
    <footer className="bg-foreground text-background">
      {/* FAQs */}
      <div className="max-w-7xl mx-auto px-6 py-16 border-b border-background/10">
        <h3 className="text-2xl font-extrabold mb-8 text-center">Frequently Asked Questions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {faqs.map((faq) => (
            <div key={faq.q} className="p-5 rounded-xl bg-background/5 border border-background/10">
              <h4 className="font-semibold text-sm mb-2 text-background">{faq.q}</h4>
              <p className="text-sm text-background/70 font-body">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Main footer links */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10">
          {/* Brand */}
          <div className="md:col-span-2">
            <a href="#" className="text-2xl font-extrabold tracking-tight text-background">
              Taat<span className="text-gradient-gold">hya</span>
            </a>
            <p className="mt-4 text-sm text-background/60 font-body max-w-xs">
              The only platform where you can explore properties, secure financing,
              or seamlessly do both — all in one place.
            </p>

            <div className="mt-6 space-y-3">
              <a href="#" className="flex items-center gap-2 text-sm text-background/60 hover:text-background transition font-body">
                <Phone size={14} /> +91 98765 43210
              </a>
              <a href="#" className="flex items-center gap-2 text-sm text-background/60 hover:text-background transition font-body">
                <Mail size={14} /> hello@taathya.com
              </a>
              <a href="#" className="flex items-center gap-2 text-sm text-background/60 hover:text-background transition font-body">
                <MapPin size={14} /> Bangalore, India
              </a>
            </div>

            {/* Socials */}
            <div className="flex gap-3 mt-6">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  className="w-9 h-9 rounded-lg bg-background/10 flex items-center justify-center hover:bg-primary transition-colors"
                >
                  <s.icon size={16} className="text-background" />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {siteLinks.map((col) => (
            <div key={col.title}>
              <h4 className="font-bold text-sm uppercase tracking-wider text-background/80 mb-4">
                {col.title}
              </h4>
              <ul className="space-y-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-background/60 hover:text-background transition font-body"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-background/10">
        <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-background/50 font-body">
            © 2024 Taathya. All rights reserved. RBI Registered NBFC.
          </p>
          <div className="flex gap-6">
            <a href="#" className="text-xs text-background/50 hover:text-background transition font-body">
              Terms & Conditions
            </a>
            <a href="#" className="text-xs text-background/50 hover:text-background transition font-body">
              Privacy Policy
            </a>
            <a href="#" className="text-xs text-background/50 hover:text-background transition font-body">
              Sitemap
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
