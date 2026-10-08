import { AnimatePresence, motion, useReducedMotion, type PanInfo } from 'motion/react';
import { useEffect, useState, type ReactNode } from 'react';

export interface Slide {
  key: string;
  content: ReactNode;
}

/**
 * Auto-advancing slides with progress dots: pauses on hover/focus, swipes on touch, and
 * stays on the first slide (no autoplay) for reduced-motion users. `tone` picks the dot colours.
 */
export function SlideShow({ slides, interval = 6000, tone = 'light', className = '', label = 'Highlights' }: { slides: Slide[]; interval?: number; tone?: 'light' | 'dark'; className?: string; label?: string }) {
  const reduce = useReducedMotion();
  const [[index, dir], setState] = useState<[number, number]>([0, 1]);
  const [paused, setPaused] = useState(false);
  const count = slides.length;
  const go = (next: number, d: number) => setState([((next % count) + count) % count, d]);
  const current = slides[Math.min(index, count - 1)];

  useEffect(() => {
    if (paused || reduce || count < 2) return;
    const t = setTimeout(() => setState(([i]) => [(i + 1) % count, 1]), interval);
    return () => clearTimeout(t);
  }, [index, paused, reduce, count, interval]);

  if (!current) return null;
  function onDragEnd(_: unknown, info: PanInfo) {
    if (info.offset.x < -60) go(index + 1, 1);
    else if (info.offset.x > 60) go(index - 1, -1);
  }
  const dot = tone === 'light' ? 'bg-white/35' : 'bg-slate-400/50';
  const fill = tone === 'light' ? 'bg-white' : 'bg-brand';

  return (
    <div
      className={`relative ${className}`}
      role="region"
      aria-roledescription="carousel"
      aria-label={label}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="relative overflow-hidden [perspective:1200px]">
        <AnimatePresence mode="wait" custom={dir} initial={false}>
          <motion.div
            key={current.key}
            custom={dir}
            variants={{
              enter: (d: number) => ({ opacity: 0, x: d * 60, rotateY: d * -12 }),
              center: { opacity: 1, x: 0, rotateY: 0 },
              exit: (d: number) => ({ opacity: 0, x: d * -60, rotateY: d * 12 }),
            }}
            initial={reduce ? false : 'enter'}
            animate="center"
            exit={reduce ? undefined : 'exit'}
            transition={{ duration: 0.45, ease: [0.2, 0.8, 0.2, 1] }}
            drag={count > 1 && !reduce ? 'x' : false}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.15}
            onDragEnd={onDragEnd}
          >
            {current.content}
          </motion.div>
        </AnimatePresence>
      </div>
      {count > 1 && (
        <div className="mt-4 flex items-center gap-1.5" role="tablist" aria-label={`${label} slides`}>
          {slides.map((s, i) => (
            <button
              key={s.key}
              role="tab"
              aria-selected={i === index}
              aria-label={`Slide ${i + 1} of ${count}`}
              onClick={() => go(i, i > index ? 1 : -1)}
              className={`focus-ring relative h-1.5 overflow-hidden rounded-full transition-all ${i === index ? 'w-10' : 'w-4'} ${dot}`}
            >
              {i === index && (
                <motion.span
                  key={`${index}-${paused}`}
                  className={`absolute inset-y-0 left-0 ${fill}`}
                  initial={{ width: paused || reduce ? '100%' : '0%' }}
                  animate={{ width: '100%' }}
                  transition={{ duration: paused || reduce ? 0 : interval / 1000, ease: 'linear' }}
                />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
