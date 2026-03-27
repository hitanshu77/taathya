import { useEffect, useRef, useCallback } from "react";

const STREAMLINE_COUNT = 140;
const SEGMENTS = 16;
const STEP_LEN = 7;

type RGB = { r: number; g: number; b: number };

function seeded(n: number) {
  const x = Math.sin(n * 127.1 + n * n * 7.3) * 43758.5453123;
  return x - Math.floor(x);
}

function parseHslVar(varValue: string, fallback: RGB): RGB {
  const parts = varValue.trim().split(/\s+/);
  if (parts.length < 3) return fallback;

  const h = Number.parseFloat(parts[0]);
  const s = Number.parseFloat(parts[1].replace("%", "")) / 100;
  const l = Number.parseFloat(parts[2].replace("%", "")) / 100;
  if ([h, s, l].some((v) => Number.isNaN(v))) return fallback;

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const hh = (h % 360) / 60;
  const x = c * (1 - Math.abs((hh % 2) - 1));
  let r1 = 0;
  let g1 = 0;
  let b1 = 0;

  if (hh >= 0 && hh < 1) [r1, g1, b1] = [c, x, 0];
  else if (hh < 2) [r1, g1, b1] = [x, c, 0];
  else if (hh < 3) [r1, g1, b1] = [0, c, x];
  else if (hh < 4) [r1, g1, b1] = [0, x, c];
  else if (hh < 5) [r1, g1, b1] = [x, 0, c];
  else [r1, g1, b1] = [c, 0, x];

  const m = l - c / 2;
  return {
    r: Math.round((r1 + m) * 255),
    g: Math.round((g1 + m) * 255),
    b: Math.round((b1 + m) * 255),
  };
}

function fieldAngle(x: number, y: number, w: number, h: number, t: number, drift: number): number {
  const nx = x / w;
  const ny = y / h;
  return (
    Math.sin(nx * 6 + ny * 1.6 + t * 0.00025 + drift * 0.2) * Math.PI +
    Math.cos(ny * 7 - nx * 2.5 - t * 0.0002 + drift * 0.3) * 0.6 +
    Math.sin((nx + ny) * 10 + t * 0.0002) * 0.3
  );
}

const HowItWorksBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<number | null>(null);

  const render = useCallback((time: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { offsetWidth: w, offsetHeight: h } = canvas;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = w * dpr;
    canvas.height = h * dpr;

    ctx.resetTransform();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, w, h);

    const styles = getComputedStyle(document.documentElement);
    const primary = parseHslVar(styles.getPropertyValue("--primary"), { r: 155, g: 26, b: 64 });
    const accent = parseHslVar(styles.getPropertyValue("--accent"), { r: 242, g: 196, b: 18 });

    ctx.globalCompositeOperation = "source-over";

    for (let i = 0; i < STREAMLINE_COUNT; i++) {
      const baseX = (seeded(i * 0.71) + ((time * 0.000015 * (0.6 + seeded(i * 1.23))) % 1)) % 1;
      const baseY = seeded(i * 0.37 + 2.1);

      let px = baseX * w;
      let py = baseY * h;

      ctx.beginPath();
      ctx.moveTo(px, py);

      for (let s = 0; s < SEGMENTS; s++) {
        const angle = fieldAngle(px, py, w, h, time, i * 0.09);
        px += Math.cos(angle) * STEP_LEN;
        py += Math.sin(angle) * STEP_LEN;

        if (px < -8 || px > w + 8 || py < -8 || py > h + 8) break;
        ctx.lineTo(px, py);
      }

      const useAccent = i % 9 === 0;
      const color = useAccent ? accent : primary;
      const alpha = useAccent ? 0.05 : 0.03;

      ctx.strokeStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha})`;
      ctx.lineWidth = useAccent ? 0.95 : 0.7;
      ctx.lineCap = "round";
      ctx.stroke();
    }

    for (let p = 0; p < 18; p++) {
      const orbit = (time * 0.00003 + p / 18) % 1;
      const x = orbit * w;
      const y = (0.2 + 0.65 * seeded(p * 1.91)) * h + Math.sin(time * 0.0008 + p) * 5;
      const radius = 0.6 + seeded(p * 2.43) * 1.2;
      const alpha = 0.08 + 0.06 * Math.sin(time * 0.001 + p);

      ctx.beginPath();
      ctx.fillStyle = `rgba(${primary.r}, ${primary.g}, ${primary.b}, ${Math.max(alpha, 0.04)})`;
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }, []);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) {
      render(0);
      return;
    }

    let previousFrame = 0;
    const animate = (time: number) => {
      if (time - previousFrame > 42) {
        render(time);
        previousFrame = time;
      }
      frameRef.current = window.requestAnimationFrame(animate);
    };

    frameRef.current = window.requestAnimationFrame(animate);

    const handleResize = () => render(performance.now());
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (frameRef.current) window.cancelAnimationFrame(frameRef.current);
    };
  }, [render]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 h-full w-full pointer-events-none"
      style={{ zIndex: 0, opacity: 0.92 }}
      aria-hidden="true"
    />
  );
};

export default HowItWorksBackground;
