import { DEFAULT_TIERS, SCHOOL_ROLES, TRIAL_LENGTH_MONTHS } from '@schoolerp/shared';
import { animate, motion, useInView, useReducedMotion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { SectionHeading } from '@/features/marketing/components/Reveal';
import { MODULES } from '@/features/marketing/content/landing.content';

/** Counts up from 0 the first time it scrolls into view. */
function CountUp({ to, suffix = '' }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-15% 0px' });
  const reduce = useReducedMotion();
  const [value, setValue] = useState(reduce ? to : 0);
  useEffect(() => {
    if (!inView || reduce) return;
    const controls = animate(0, to, { duration: 1.6, ease: [0.2, 0.8, 0.2, 1], onUpdate: (v) => setValue(Math.round(v)) });
    return () => controls.stop();
  }, [inView, reduce, to]);
  return <span ref={ref} className="tabular-nums">{value}{suffix}</span>;
}

/** Product facts, not marketing claims: every figure comes from the shipped configuration. */
const METRICS = [
  { value: MODULES.length, label: 'Modules', text: 'From admissions to payroll, in one system' },
  { value: SCHOOL_ROLES.length, label: 'Role dashboards', text: 'Each role sees its own day, nothing more' },
  { value: DEFAULT_TIERS.length, label: 'Plans', text: 'From one campus to unlimited campuses' },
  { value: TRIAL_LENGTH_MONTHS, label: TRIAL_LENGTH_MONTHS === 1 ? 'Month free' : 'Months free', text: 'Every feature unlocked during the trial' },
];

export function MetricsSection() {
  return (
    <section id="numbers" className="relative overflow-hidden border-y border-slate-100 bg-slate-50/60 py-16 dark:border-white/5 dark:bg-[#0b1426] sm:py-20">
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(50%_60%_at_20%_30%,rgb(235_116_40/0.035),transparent),radial-gradient(50%_60%_at_80%_70%,rgb(52_93_141/0.035),transparent)]" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-8">
        <SectionHeading kicker="At a glance" title="Everything a school runs on" />
        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {METRICS.map((m, i) => (
            <motion.div
              key={m.label}
              initial={{ opacity: 0, y: 40, rotateX: -25 }}
              whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, type: 'spring', stiffness: 110, damping: 16 }}
              whileHover={{ y: -6 }}
              style={{ transformPerspective: 900 }}
              className="surface relative overflow-hidden border-t-2 border-t-primary-400 p-5"
            >
              <div className="font-display text-4xl font-semibold text-primary-800 dark:text-primary-200">
                <CountUp to={m.value} />
              </div>
              <div className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">{m.label}</div>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{m.text}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
