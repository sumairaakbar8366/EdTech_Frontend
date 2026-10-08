import { Check } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useState } from 'react';
import { IconTile } from '@/components/ui';
import { Reveal, SectionHeading } from '@/features/marketing/components/Reveal';
import { ROLE_VIEWS } from '@/features/marketing/content/landing.content';

/** One platform, a dashboard per role: pick a role to see what it puts in front of that person. */
export function RolesSection() {
  const reduce = useReducedMotion();
  const [active, setActive] = useState(ROLE_VIEWS[0]!.key);
  const role = ROLE_VIEWS.find((r) => r.key === active)!;
  return (
    <section id="roles" className="relative overflow-hidden border-y border-slate-100 bg-white py-16 text-slate-800 sm:py-20 dark:border-white/5 dark:bg-[#0b1426] dark:text-white">
      <div className="relative mx-auto max-w-7xl px-4 sm:px-8">
        <SectionHeading kicker="Dashboards" title="A clear view for every role" text="Each person gets a dashboard built around their day, with access limited to what they need." />
        <Reveal delay={0.1} className="mt-9 grid gap-5 lg:grid-cols-[15rem_1fr]">
          <div role="tablist" aria-label="Roles" className="flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible lg:pb-0">
            {ROLE_VIEWS.map((r) => (
              <button
                key={r.key}
                role="tab"
                aria-selected={r.key === active}
                onClick={() => setActive(r.key)}
                className={`focus-ring relative flex shrink-0 items-center gap-3 border-l-2 px-3 py-2 text-left transition ${r.key === active ? 'border-orange-500 text-primary-900 dark:text-white' : 'border-transparent text-slate-500 hover:bg-slate-50 dark:text-primary-100/80 dark:hover:bg-white/5'}`}
              >
                {r.key === active && <motion.span layoutId="role-pill" className="absolute inset-0 bg-primary-50 dark:bg-white/5" transition={{ type: 'spring', stiffness: 300, damping: 30 }} />}
                <span className="relative"><IconTile icon={r.icon} tone={r.tone} size="sm" /></span>
                <span className="relative text-sm font-semibold">{r.name}</span>
              </button>
            ))}
          </div>
          <div className="relative min-h-[20rem] [perspective:1200px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={role.key}
                initial={reduce ? false : { opacity: 0, rotateX: -12, y: 30 }}
                animate={{ opacity: 1, rotateX: 0, y: 0 }}
                exit={reduce ? undefined : { opacity: 0, rotateX: 10, y: -20 }}
                transition={{ duration: 0.45, ease: [0.2, 0.8, 0.2, 1] }}
                className="surface relative p-5 sm:p-7"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary-600 dark:text-primary-200">{role.name} dashboard</p>
                <h3 className="mt-2 font-display font-semibold text-slate-900 dark:text-white">{role.headline}</h3>
                <div className="mt-5 grid gap-2.5 sm:grid-cols-2">
                  {role.items.map((item, i) => (
                    <motion.div
                      key={item}
                      initial={reduce ? false : { opacity: 0, y: 16, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ delay: 0.12 + i * 0.08 }}
                      className="flex items-center gap-3 border border-slate-100 bg-white px-3 py-2.5 dark:border-white/10 dark:bg-white/5"
                    >
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center border-l-2 border-orange-500 bg-primary-50 text-primary-700 dark:bg-primary-500/15 dark:text-primary-200"><Check size={13} strokeWidth={2.5} /></span>
                      <span className="text-sm text-slate-700 dark:text-slate-200">{item}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
