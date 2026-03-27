import { useState, useEffect } from "react";
import { Menu, X, Newspaper } from "lucide-react";
import { Link } from "react-router-dom";
import { Logo } from "./Logo";

const navLinks = [
  { label: "Buy Property", href: "#buy" },
  { label: "Get a Loan", href: "#loan" },
];

const PROPERTIES_HREF = "/Properties-Page/property.html";

interface NavbarProps {
  /** When true the navbar always shows the light/scrolled style (white bg, burgundy text) */
  forceScrolled?: boolean;
}

const Navbar = ({ forceScrolled = false }: NavbarProps) => {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (forceScrolled) return; // page has light bg throughout — no scroll toggling needed
    const handleScroll = () => {
      setScrolled(window.scrollY > window.innerHeight * 0.75);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [forceScrolled]);

  // forceScrolled = light bg page → always white navbar + burgundy logo/text
  const isLight = forceScrolled ? true : scrolled;

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isLight
          ? "bg-primary-foreground/95 backdrop-blur-md shadow-sm"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link
          to="/"
          className="transition-opacity hover:opacity-90 block"
        >
          <Logo scrolled={isLight} />
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className={`text-sm font-medium transition-colors duration-300 ${
                isLight
                  ? "text-muted-foreground hover:text-primary"
                  : "text-text-on-hero-muted hover:text-primary-foreground"
              }`}
            >
              {link.label}
            </a>
          ))}
          <a
            href={PROPERTIES_HREF}
            className={`text-sm font-medium transition-colors duration-300 ${
              isLight
                ? "text-muted-foreground hover:text-primary"
                : "text-text-on-hero-muted hover:text-primary-foreground"
            }`}
          >
            Properties
          </a>
          <Link
            to="/latest-updates"
            className={`inline-flex items-center gap-1.5 text-sm font-medium transition-colors duration-300 ${
              isLight
                ? "text-muted-foreground hover:text-primary"
                : "text-text-on-hero-muted hover:text-primary-foreground"
            }`}
          >
            <Newspaper size={15} />
            Latest Updates
          </Link>
          <a
            href="#cta"
            className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 ${
              isLight
                ? "bg-primary text-primary-foreground hover:opacity-90"
                : "bg-primary-foreground text-primary hover:opacity-90"
            }`}
          >
            Get Started
          </a>
        </div>

        {/* Mobile toggle */}
        <button
          className={`md:hidden transition-colors duration-300 ${
            isLight ? "text-primary" : "text-primary-foreground"
          }`}
          onClick={() => setOpen(!open)}
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div
          className={`md:hidden px-6 pb-6 space-y-4 ${
            isLight ? "bg-background" : "hero-gradient"
          }`}
        >
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className={`block text-sm font-medium transition-colors ${
                isLight
                  ? "text-muted-foreground hover:text-primary"
                  : "text-text-on-hero-muted hover:text-primary-foreground"
              }`}
              onClick={() => setOpen(false)}
            >
              {link.label}
            </a>
          ))}
          <a
            href={PROPERTIES_HREF}
            className={`block text-sm font-medium transition-colors ${
              isLight
                ? "text-muted-foreground hover:text-primary"
                : "text-text-on-hero-muted hover:text-primary-foreground"
            }`}
            onClick={() => setOpen(false)}
          >
            Properties
          </a>
          <Link
            to="/latest-updates"
            className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${
              isLight
                ? "text-muted-foreground hover:text-primary"
                : "text-text-on-hero-muted hover:text-primary-foreground"
            }`}
            onClick={() => setOpen(false)}
          >
            <Newspaper size={15} />
            Latest Updates
          </Link>
          <a
            href="#cta"
            className={`block px-5 py-2.5 rounded-lg text-sm font-semibold text-center ${
              isLight
                ? "bg-primary text-primary-foreground"
                : "bg-primary-foreground text-primary"
            }`}
            onClick={() => setOpen(false)}
          >
            Get Started
          </a>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
