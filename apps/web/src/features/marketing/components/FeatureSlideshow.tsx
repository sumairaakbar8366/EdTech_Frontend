import { Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion, type PanInfo } from 'motion/react';
import { useCallback, useEffect, useState } from 'react';
import { IconTile } from '@/components/ui';
import { photo } from '@/config/site';
import { SectionHeading } from '@/features/marketing/components/Reveal';
import { FEATURES } from '@/features/marketing/content/landing.content';

const AUTOPLAY_MS = 7000;

const slide = {
  enter: (dir: number) => ({ opacity: 0, x: dir * 120, rotateY: dir * -18, scale: 0.94 }),
  center: { opacity: 1, x: 0, rotateY: 0, scale: 1 },
  exit: (dir: number) => ({ opacity: 0, x: dir * -120, rotateY: dir * 18, scale: 0.94 }),
};

/** Feature carousel: autoplays, pauses on hover/focus, swipes, and answers the arrow keys. */
export function FeatureSlideshow() {
  const reduce = useReducedMotion();
  const [[index, dir], setState] = useState<[number, number]>([0, 1]);
  const [paused, setPaused] = useState(false);
  const go = useCallback((next: number, d: number) => setState([(next + FEATURES.length) % FEATURES.length, d]), []);
  const f = FEATURES[index]!;

  useEffect(() => {
    if (paused || reduce) return;
    const t = setTimeout(() => go(index + 1, 1), AUTOPLAY_MS);
    return () => clearTimeout(t);
  }, [index, paused, reduce, go]);

  function onDragEnd(_: unknown, info: PanInfo) {
    if (info.offset.x < -80) go(index + 1, 1);
    else if (info.offset.x > 80) go(index - 1, -1);
  }

  return (
    <section id="features" className="relative overflow-hidden py-16 sm:py-20">
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-96 bg-[radial-gradient(60%_80%_at_50%_0%,rgb(29_60_103/0.035),transparent)]" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-8">
        <SectionHeading kicker="Features" title="Built around how schools work" text="Every workflow follows a real school process, from the first application to the final report card." />

        <div
          className="mt-8"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocus={() => setPaused(true)}
          onBlur={() => setPaused(false)}
          onKeyDown={(e) => {
            if (e.key === 'ArrowRight') go(index + 1, 1);
            if (e.key === 'ArrowLeft') go(index - 1, -1);
          }}
          role="region"
          aria-roledescription="carousel"
          aria-label="Product features"
          tabIndex={0}
        >
          {/* Slide tabs with autoplay progress */}
          <div role="tablist" className="mb-6 grid grid-cols-2 gap-2 sm:grid-cols-5">
            {FEATURES.map((s, i) => (
              <button
                key={s.kicker}
                role="tab"
                aria-selected={i === index}
                onClick={() => go(i, i > index ? 1 : -1)}
                className={`focus-ring relative overflow-hidden border px-3 py-2.5 text-left transition ${i === index ? 'surface border-l-2 border-l-orange-500' : 'border-transparent hover:bg-slate-50 dark:hover:bg-white/5'}`}
              >
                <span className={`block text-xs font-semibold ${i === index ? 'text-primary-700 dark:text-primary-200' : 'text-slate-500'}`}>{s.kicker}</span>
                <span className="absolute inset-x-0 bottom-0 h-1 bg-slate-500/10">
                  {i === index && (
                    <motion.span
                      key={`${index}-${paused}`}
                      className="block h-full bg-brand"
                      initial={{ width: paused || reduce ? '100%' : '0%' }}
                      animate={{ width: '100%' }}
                      transition={{ duration: paused || reduce ? 0 : AUTOPLAY_MS / 1000, ease: 'linear' }}
                    />
                  )}
                </span>
              </button>
            ))}
          </div>

          <div className="relative [perspective:1400px]">
            <AnimatePresence mode="wait" custom={dir} initial={false}>
              <motion.div
                key={index}
                custom={dir}
                variants={slide}
                initial={reduce ? false : 'enter'}
                animate="center"
                exit={reduce ? undefined : 'exit'}
                transition={{ duration: 0.55, ease: [0.2, 0.8, 0.2, 1] }}
                drag={reduce ? false : 'x'}
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.18}
                onDragEnd={onDragEnd}
                className="grid cursor-grab items-center gap-10 active:cursor-grabbing lg:grid-cols-2"
              >
                <div className="relative">
                  <div aria-hidden className="absolute -inset-3 bg-linear-to-br from-primary-500/8 to-magenta-500/6 blur-2xl" />
                  <motion.div
                    initial={reduce ? false : { scale: 1.08 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 1.2, ease: [0.2, 0.8, 0.2, 1] }}
                    className="relative aspect-[4/3] overflow-hidden border border-slate-200 shadow-depth-2 dark:border-white/10"
                  >
                    <img {...photo(f.photo)} sizes="(min-width: 1024px) 50vw, 100vw" alt={f.alt} draggable={false} className="h-full w-full select-none object-cover" />
                    <div aria-hidden className="absolute inset-0 bg-linear-to-t from-[#0f1e3d]/50 via-transparent to-transparent" />
                    <span className="absolute bottom-3 left-3 border-l-2 border-orange-500 bg-white/95 px-2.5 py-1 text-xs font-semibold text-slate-800 backdrop-blur dark:bg-[#0f1e3d]/90 dark:text-white">
                      {index + 1} / {FEATURES.length}
                    </span>
                  </motion.div>
                </div>
                <div>
                  <IconTile icon={f.icon} tone={f.tone} size="lg" />
                  <p className="mt-3 text-xs font-semibold uppercase tracking-[0.14em] text-magenta-600 dark:text-magenta-300">{f.kicker}</p>
                  <h3 className="mt-1 font-display font-semibold text-slate-900 dark:text-white">{f.title}</h3>
                  <p className="mt-2 text-base leading-7 text-slate-600 dark:text-slate-300">{f.text}</p>
                  <ul className="mt-4 space-y-2">
                    {f.points.map((p, i) => (
                      <motion.li
                        key={p}
                        initial={reduce ? false : { opacity: 0, x: 24 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.25 + i * 0.1 }}
                        className="flex items-center gap-2.5 text-sm text-slate-700 dark:text-slate-200"
                      >
                        <span className="flex h-5 w-5 items-center justify-center border-l-2 border-orange-500 bg-primary-50 text-primary-700 dark:bg-primary-500/15 dark:text-primary-300"><Check size={12} strokeWidth={2.5} /></span>
                        {p}
                      </motion.li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            </AnimatePresence>

            <div className="mt-6 flex items-center justify-center gap-2">
              <button aria-label="Previous feature" onClick={() => go(index - 1, -1)} className="focus-ring surface p-2 text-slate-700 transition hover:-translate-x-0.5 dark:text-slate-200"><ChevronLeft size={18} strokeWidth={1.75} /></button>
              <button aria-label="Next feature" onClick={() => go(index + 1, 1)} className="focus-ring border border-orange-500 bg-brand p-2 text-white transition hover:translate-x-0.5"><ChevronRight size={18} strokeWidth={1.75} /></button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
