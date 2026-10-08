import { ArrowRight, LogIn, Mail } from 'lucide-react';
import { motion, useMotionTemplate, useMotionValue, useReducedMotion, useSpring } from 'motion/react';
import type { PointerEvent, ReactNode } from 'react';

/** A button that leans toward the pointer while it hovers nearby. */
function Magnetic({ children }: { children: ReactNode }) {
  const reduce = useReducedMotion();
  const x = useSpring(0, { stiffness: 200, damping: 15 });
  const y = useSpring(0, { stiffness: 200, damping: 15 });
  function move(e: PointerEvent<HTMLDivElement>) {
    if (reduce) return;
    const r = e.currentTarget.getBoundingClientRect();
    x.set((e.clientX - r.left - r.width / 2) * 0.25);
    y.set((e.clientY - r.top - r.height / 2) * 0.35);
  }
  return (
    <motion.div style={{ x, y }} onPointerMove={move} onPointerLeave={() => { x.set(0); y.set(0); }} className="inline-block p-2">
      {children}
    </motion.div>
  );
}

/** Closing call to action: photo backdrop, pointer spotlight, magnetic buttons. */
export function CtaSection({ demoHref, onFindSchool }: { demoHref: string; onFindSchool: () => void }) {
  const mx = useMotionValue(50);
  const my = useMotionValue(50);
  const spotlight = useMotionTemplate`radial-gradient(500px circle at ${mx}% ${my}%, rgb(142 174 220 / 0.25), transparent 60%)`;
  return (
    <section
      id="contact"
      className="relative overflow-hidden border-y border-slate-200 bg-white dark:border-white/5 dark:bg-[#0b1426]"
      onPointerMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        mx.set(((e.clientX - r.left) / r.width) * 100);
        my.set(((e.clientY - r.top) / r.height) * 100);
      }}
    >
      <motion.div aria-hidden style={{ background: spotlight }} className="pointer-events-none absolute inset-0" />
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 30 }}
        whileInView={{ opacity: 1, scale: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, ease: [0.2, 0.8, 0.2, 1] }}
        className="relative mx-auto max-w-4xl px-4 py-16 text-center text-slate-900 sm:px-8 sm:py-20 dark:text-white"
      >
        <span className="inline-block border-l-2 border-orange-500 bg-primary-50 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-[0.14em] text-primary-700 dark:bg-primary-500/10 dark:text-primary-200">Get started</span>
        <h2 className="mx-auto mt-3 max-w-2xl font-display font-semibold">See SchoolERP with your own school’s data</h2>
        <p className="mx-auto mt-3 max-w-2xl text-base leading-7 text-slate-600 dark:text-primary-100">We set up a free one-month trial for your school and walk your team through it. Every module, every role, from day one.</p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
          <Magnetic>
            <a href={demoHref} className="focus-ring group inline-flex items-center gap-2 border border-orange-500 bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-magenta-600">
              <Mail size={18} /> Book a demo <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
            </a>
          </Magnetic>
          <Magnetic>
            <button onClick={onFindSchool} className="focus-ring inline-flex items-center gap-2 border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 hover:border-primary-500 hover:text-primary-800 dark:border-white/30 dark:text-white dark:hover:bg-white/10">
              <LogIn size={18} /> Sign in to your school
            </button>
          </Magnetic>
        </div>
      </motion.div>
    </section>
  );
}
