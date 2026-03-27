import { useEffect, useRef, useCallback } from "react";

/**
 * "Cartographic Murmur" — Generative vector map background
 *
 * Procedurally generates a technical city map using Binary Space Partitioning (BSP).
 * Creates a subtle, intricate lattice of streets and blocks as a textured overlay.
 */

interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

const MIN_BLOCK_SIZE = 8;
const STREET_WIDTH = 1.5;
const MAX_DEPTH = 14;
const VARIANCE = 0.35;

const HeroBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const blocksRef = useRef<Rect[]>([]);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const generateCity = useCallback((width: number, height: number) => {
    const blocks: Rect[] = [];
    const queue: { rect: Rect; depth: number }[] = [
      { rect: { x: 0, y: 0, w: width, h: height }, depth: 0 },
    ];

    while (queue.length > 0) {
      const item = queue.shift();
      if (!item) break;
      const { rect, depth } = item;

      const tooSmall = rect.w < MIN_BLOCK_SIZE * 3 || rect.h < MIN_BLOCK_SIZE * 3;
      const randomStop = depth > 4 && Math.random() < 0.08;

      if (depth >= MAX_DEPTH || tooSmall || randomStop) {
        blocks.push(rect);
        continue;
      }

      let splitHorizontally = rect.h > rect.w;
      if (Math.random() < 0.2) splitHorizontally = !splitHorizontally;

      const randomOffset = (Math.random() - 0.5) * VARIANCE;
      const splitPct = 0.5 + randomOffset;

      if (splitHorizontally) {
        const h1 = Math.floor(rect.h * splitPct);
        const h2 = rect.h - h1;
        if (h1 < MIN_BLOCK_SIZE || h2 < MIN_BLOCK_SIZE) { blocks.push(rect); continue; }
        queue.push({ rect: { ...rect, h: h1 }, depth: depth + 1 });
        queue.push({ rect: { ...rect, y: rect.y + h1, h: h2 }, depth: depth + 1 });
      } else {
        const w1 = Math.floor(rect.w * splitPct);
        const w2 = rect.w - w1;
        if (w1 < MIN_BLOCK_SIZE || w2 < MIN_BLOCK_SIZE) { blocks.push(rect); continue; }
        queue.push({ rect: { ...rect, w: w1 }, depth: depth + 1 });
        queue.push({ rect: { ...rect, x: rect.x + w1, w: w2 }, depth: depth + 1 });
      }
    }

    return blocks;
  }, []);

  const draw = useCallback(
    (ctx: CanvasRenderingContext2D, width: number, height: number, blocks: Rect[]) => {
      ctx.clearRect(0, 0, width, height);
      ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
      ctx.lineWidth = 1;
      ctx.fillStyle = "rgba(255, 255, 255, 0.015)";

      ctx.beginPath();
      blocks.forEach((block) => {
        const x = block.x + STREET_WIDTH / 2;
        const y = block.y + STREET_WIDTH / 2;
        const w = Math.max(0, block.w - STREET_WIDTH);
        const h = Math.max(0, block.h - STREET_WIDTH);
        ctx.rect(x, y, w, h);
      });
      ctx.fill();
      ctx.stroke();
    },
    []
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const handleResize = () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        const { offsetWidth, offsetHeight } = canvas;
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = offsetWidth * dpr;
        canvas.height = offsetHeight * dpr;
        ctx.resetTransform();
        ctx.scale(dpr, dpr);
        const blocks = generateCity(offsetWidth, offsetHeight);
        blocksRef.current = blocks;
        draw(ctx, offsetWidth, offsetHeight, blocks);
      }, 200);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [draw, generateCity]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none opacity-20 mix-blend-plus-lighter"
      style={{ zIndex: 0 }}
      aria-hidden="true"
    />
  );
};

export default HeroBackground;
