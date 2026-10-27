import { motion, MotionConfig, type TargetAndTransition } from 'motion/react';
import { useEffect, useState } from 'react';
import { BRAND_LOGO_SRC } from '@/components/brand/BrandLogo';
import { PRODUCT_NAME } from '@/config/brand';

/** Replays the intro every so often, like a slide. */
const REPLAY_MS = 9000;

/** Image coordinates (of 1254 × 1254) → a CSS polygon over the same logo file. */
const poly = (points: [number, number][]) => `polygon(${points.map(([x, y]) => `${((x / 1254) * 100).toFixed(2)}% ${((y / 1254) * 100).toFixed(2)}%`).join(', ')})`;

interface Part {
  key: string;
  clip: string;
  from: TargetAndTransition;
  delay: number;
  spring?: boolean;
}

/**
 * Each part is the logo file clipped to one piece; together they cover the whole square (the artwork's
 * background is shaded, so every pixel must belong to a piece). The edges between S, cap and T follow
 * the white gaps in the artwork.
 */
const PARTS: Part[] = [
  { key: 's', clip: poly([[0, 190], [455, 190], [702, 295], [702, 865], [0, 865]]), from: { x: '-45%', opacity: 0 }, delay: 0, spring: true },
  { key: 't', clip: poly([[702, 295], [820, 345], [1100, 222], [1100, 520], [1254, 520], [1254, 865], [702, 865]]), from: { x: '45%', opacity: 0 }, delay: 0.4, spring: true },
  { key: 'cap', clip: poly([[0, 0], [1254, 0], [1254, 520], [1100, 520], [1100, 222], [820, 345], [702, 295], [455, 190], [0, 190]]), from: { y: '-55%', rotate: -14, opacity: 0 }, delay: 0.85, spring: true },
  { key: 'skool', clip: poly([[0, 865], [569, 865], [569, 1070], [0, 1070]]), from: { y: '12%', opacity: 0 }, delay: 1.45 },
  { key: 'edtech', clip: poly([[569, 865], [1254, 865], [1254, 1070], [569, 1070]]), from: { y: '12%', opacity: 0 }, delay: 1.7 },
  { key: 'tagline', clip: poly([[0, 1070], [1254, 1070], [1254, 1254], [0, 1254]]), from: { opacity: 0, scale: 0.92 }, delay: 2.0 },
];

/**
 * The Skool EdTech logo built up piece by piece: the S slides in, then the T, the cap lands on top, and the
 * name and tagline follow. Uses the logo file as-is (one layer per piece, multiplied onto white).
 */
export function AnimatedBrandLogo({ className = '' }: { className?: string }) {
  const [run, setRun] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setRun((r) => r + 1), REPLAY_MS);
    return () => clearInterval(id);
  }, []);

  return (
    <MotionConfig reducedMotion="user">
      <div role="img" aria-label={PRODUCT_NAME} className={`brand-logo-3d relative isolate aspect-square overflow-hidden bg-white ${className}`}>
        {PARTS.map((p) => (
          <motion.img
            key={`${p.key}-${run}`}
            src={BRAND_LOGO_SRC}
            alt=""
            draggable={false}
            className="absolute inset-[7%] h-[86%] w-[86%] object-contain mix-blend-multiply"
            style={{ clipPath: p.clip }}
            initial={p.from}
            animate={{ x: 0, y: 0, rotate: 0, scale: 1, opacity: 1 }}
            transition={p.spring ? { delay: p.delay, type: 'spring', stiffness: 170, damping: 14, opacity: { delay: p.delay, duration: 0.25 } } : { delay: p.delay, duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
          />
        ))}
      </div>
    </MotionConfig>
  );
}
