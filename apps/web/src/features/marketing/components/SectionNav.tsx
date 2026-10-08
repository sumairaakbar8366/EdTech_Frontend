import { motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { SECTIONS } from '@/features/marketing/content/landing.content';

/** Slide-style dots on the right edge: shows which section is on screen and jumps between them. */
export function SectionNav() {
  const [active, setActive] = useState<string>(SECTIONS[0].id);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActive(visible.target.id);
      },
      { threshold: [0.25, 0.5, 0.75] },
    );
    for (const s of SECTIONS) {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, []);
  return (
    <nav aria-label="Page sections" className="fixed right-4 top-1/2 z-30 hidden -translate-y-1/2 flex-col gap-3 xl:flex">
      {SECTIONS.map((s) => (
        <a key={s.id} href={`#${s.id}`} aria-label={s.label} aria-current={active === s.id ? 'true' : undefined} className="group relative flex items-center justify-end">
          <span className="pointer-events-none absolute right-6 whitespace-nowrap rounded-md bg-[#0f1e3d]/85 px-2 py-0.5 text-xs font-bold uppercase tracking-wider text-white opacity-0 transition group-hover:opacity-100">{s.label}</span>
          <span className="relative flex h-3 w-3 items-center justify-center">
            <span className="h-2 w-2 rounded-full bg-slate-400/60 transition group-hover:bg-primary-500" />
            {active === s.id && <motion.span layoutId="section-dot" className="absolute inset-[-3px] rounded-full bg-brand shadow-glow" transition={{ type: 'spring', stiffness: 300, damping: 28 }} />}
          </span>
        </a>
      ))}
    </nav>
  );
}
