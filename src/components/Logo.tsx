import React from "react";

interface LogoProps {
  scrolled?: boolean;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ scrolled = false, className = "" }) => {
  const textColor = scrolled ? "#7a1f3d" : "hsl(var(--warm-white))";
  const taglineColor = scrolled ? "#7a1f3d99" : "hsl(var(--warm-white) / 0.67)";

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* === Logo image — swaps between white and burgundy versions === */}
      <div className="relative h-10 w-10 flex-shrink-0">
        {/* White logo (hero / red background) */}
        <img
          src="/whitee_logo.png"
          alt="Taathya logo"
          className="absolute inset-0 h-full w-full object-contain transition-opacity duration-300"
          style={{ opacity: scrolled ? 0 : 1, transform: "scale(1.18)", transformOrigin: "center" }}
        />
        {/* Burgundy logo (scrolled / white background) */}
        <img
          src="/burgandy_logo.png"
          alt="Taathya logo"
          className="absolute inset-0 h-full w-full object-contain transition-opacity duration-300"
          style={{ opacity: scrolled ? 1 : 0 }}
        />
      </div>

      {/* === Text: Taathya + tagline === */}
      <div className="flex flex-col leading-none gap-[3px]">
        <div className="flex items-start">
          <span
            className="font-black tracking-tight"
            style={{
              fontSize: "1.75rem",
              color: textColor,
              fontFamily: '"Plus Jakarta Sans", sans-serif',
              lineHeight: 1,
              transition: "color 0.3s",
            }}
          >
            Taathya
          </span>
          <span
            style={{
              fontSize: "0.55rem",
              color: textColor,
              opacity: 0.7,
              marginLeft: "2px",
              marginTop: "2px",
              transition: "color 0.3s",
            }}
          >
            ®
          </span>
        </div>
        <span
          style={{
            fontSize: "0.52rem",
            color: taglineColor,
            letterSpacing: "0.18em",
            fontWeight: 600,
            textTransform: "uppercase",
            transition: "color 0.3s",
          }}
        >
          It's All About Benefit
        </span>
      </div>
    </div>
  );
};
