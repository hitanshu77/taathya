import React, { useEffect, useRef } from 'react';

interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

const CityMapBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Configuration
  // Adjust these to change the generated city "feel"
  const CONFIG = {
    MIN_BLOCK_SIZE: 15,
    STREET_WIDTH: 4,
    CHAOS_FACTOR: 0.6, // 0 = perfect grid, 1.0 = highly chaotic
    COLORS: {
      BG: '#000000',      // Background color (streets)
      BLOCK: '#1F2937',   // Main block color
      BLOCK_VAR: '#374151', // Variation block color (parks/plazas)
      STROKE: '#222'      // Stroke color
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      // Set canvas size to match window
      if (canvas.width !== window.innerWidth || canvas.height !== window.innerHeight) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }

      const { width, height } = canvas;
      
      // Clear background
      ctx.fillStyle = CONFIG.COLORS.BG;
      ctx.fillRect(0, 0, width, height);

      const blocks: Rect[] = [];
      const initialRect: Rect = { x: 0, y: 0, w: width, h: height };
      
      // Generate the road network using Binary Space Partitioning
      generateBSPCity(initialRect, blocks);

      // Render the blocks
      blocks.forEach(block => {
        // Skip some blocks for open spaces/parks (2% chance)
        if (Math.random() < 0.02) return;

        // Apply street width by shrinking the block
        // We shrink from all sides by half the street width
        const inset = CONFIG.STREET_WIDTH / 2;
        
        const x = block.x + inset;
        const y = block.y + inset;
        const w = block.w - (inset * 2);
        const h = block.h - (inset * 2);

        // Sanity check
        if (w <= 0 || h <= 0) return;

        // Determine block color
        const isHighlight = Math.random() > 0.8;
        ctx.fillStyle = isHighlight ? CONFIG.COLORS.BLOCK_VAR : CONFIG.COLORS.BLOCK;
        
        ctx.beginPath();
        ctx.rect(x, y, w, h);
        ctx.fill();
        
        // Optional: Draw a thin stroke for a "cad/blueprint" style
        ctx.strokeStyle = CONFIG.COLORS.STROKE;
        ctx.lineWidth = 1;
        ctx.stroke();
      });
    };

    /**
     * Recursive function to split a rectangle into smaller city blocks.
     * Use a Binary Space Partitioning (BSP) strategy.
     */
    const generateBSPCity = (rect: Rect, results: Rect[]) => {
      // 1. Stop condition: Block is small enough
      if (rect.w < CONFIG.MIN_BLOCK_SIZE * 4 || rect.h < CONFIG.MIN_BLOCK_SIZE * 4) {
        // Sometimes stop earlier to have larger buildings (variation)
        results.push(rect);
        return;
      }
      
      // 2. Random stop condition (for larger landmarks/blocks)
      // The smaller we get, the less likely we stop early
      if (Math.random() < 0.05) { // 5% chance to stop early
        results.push(rect);
        return;
      }

      // 3. Determine split direction
      // Default: Toggle based on randomly choosing, or favor the longer axis to keep things square-ish
      let splitDelta = 0.5; // Perfect center default
      
      // Calculate a random split point based on chaos factor
      // A chaos factor of 0.6 means the split can be anywhere from 0.2 to 0.8
      const variance = (Math.random() * CONFIG.CHAOS_FACTOR) - (CONFIG.CHAOS_FACTOR / 2);
      let splitPct = 0.5 + variance;
      // Clamp split to avoid super thin slices (keep between 20% and 80%)
      splitPct = Math.max(0.2, Math.min(0.8, splitPct));

      // Decide whether to split Horizontally (cut Y axis) or Vertically (cut X axis)
      // We generally want to cut the longer side
      const splitHorizontal = rect.h > rect.w; // If taller, cut horizontally to make it squarer
      
      // Make it slightly more random so we get long blocks sometimes
      const randomDirection = Math.random() > 0.7; // 30% chance to split the "wrong" way
      const isHorizontalSplit = randomDirection ? !splitHorizontal : splitHorizontal;

      // 4. Perform the split
      if (isHorizontalSplit) {
        const splitH = Math.floor(rect.h * splitPct);
        
        // Top Half
        generateBSPCity({
          x: rect.x,
          y: rect.y,
          w: rect.w,
          h: splitH
        }, results);
        
        // Bottom Half
        generateBSPCity({
          x: rect.x,
          y: rect.y + splitH,
          w: rect.w,
          h: rect.h - splitH
        }, results);
      } else {
        const splitW = Math.floor(rect.w * splitPct);
        
        // Left Half
        generateBSPCity({
          x: rect.x,
          y: rect.y,
          w: splitW,
          h: rect.h
        }, results);
        
        // Right Half
        generateBSPCity({
          x: rect.x + splitW,
          y: rect.y,
          w: rect.w - splitW,
          h: rect.h
        }, results);
      }
    };

    // Initial draw
    draw();

    // Re-draw on resize
    const handleResize = () => {
      draw();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="fixed inset-0 w-full h-full -z-10 opacity-20 pointer-events-none"
      style={{ background: CONFIG.COLORS.BG }}
    />
  );
};

export default CityMapBackground;
