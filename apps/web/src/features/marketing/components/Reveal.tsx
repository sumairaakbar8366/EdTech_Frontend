import { motion, useReducedMotion } from 'motion/react';
import type { ReactNode } from 'react';

/** Fades and lifts its children into place the first time they scroll into view. */
export function Reveal({ children, delay = 0, y = 32, className = '' }: { children: ReactNode; delay?: number; y?: number; className?: string }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y, filter: 'blur(6px)' }}
      whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      viewport={{ once: true, margin: '-12% 0px' }}
      transition={{ duration: 0.7, delay, ease: [0.2, 0.8, 0.2, 1] }}
    >
      {children}
    </motion.div>
  );
}

/** Section heading with kicker, used by every landing section. */
export function SectionHeading({ kicker, title, text, light = false }: { kicker: string; title: string; text?: string; light?: boolean }) {
  return (
    <Reveal className="mx-auto max-w-3xl text-center">
      <span className={`inline-block border-l-2 border-orange-500 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-[0.14em] ${light ? 'bg-white/10 text-primary-200' : 'bg-primary-50 text-primary-700 dark:bg-primary-500/10 dark:text-primary-200'}`}>{kicker}</span>
      <h2 className={`mt-3 font-display font-semibold ${light ? 'text-white' : 'text-slate-900 dark:text-white'}`}>{title}</h2>
      {text && <p className={`mx-auto mt-2 max-w-2xl text-base leading-7 ${light ? 'text-primary-100/90' : 'text-slate-500 dark:text-slate-400'}`}>{text}</p>}
    </Reveal>
  );
}
