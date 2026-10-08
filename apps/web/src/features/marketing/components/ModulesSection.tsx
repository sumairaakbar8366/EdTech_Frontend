import { motion, useReducedMotion } from 'motion/react';
import { IconTile, Tilt } from '@/components/ui';
import { SectionHeading } from '@/features/marketing/components/Reveal';
import { MODULES, TRUST } from '@/features/marketing/content/landing.content';

/** Every module as a 3D tile, popping in as the grid scrolls into view, plus the trust strip. */
export function ModulesSection() {
  const reduce = useReducedMotion();
  return (
    <section id="modules" className="relative py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-8">
        <SectionHeading kicker="Modules" title="Every module your school needs" text="One login, one database, one source of truth." />
        <motion.div
          className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7"
          initial={reduce ? false : 'hidden'}
          whileInView="shown"
          viewport={{ once: true, margin: '-10% 0px' }}
          variants={{ shown: { transition: { staggerChildren: 0.05 } } }}
        >
          {MODULES.map(([label, Icon, tone]) => (
            <motion.div
              key={label}
              variants={{ hidden: { opacity: 0, y: 30, rotateX: -40, scale: 0.9 }, shown: { opacity: 1, y: 0, rotateX: 0, scale: 1 } }}
              transition={{ type: 'spring', stiffness: 140, damping: 16 }}
              style={{ transformPerspective: 800 }}
            >
              <Tilt data-tone={tone} className="dashboard-link-tile flex h-full flex-col items-center gap-2.5 border-t-2 border-t-primary-300 p-4 text-center">
                <span className="tilt-pop"><IconTile icon={Icon} tone={tone} /></span>
                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{label}</span>
              </Tilt>
            </motion.div>
          ))}
        </motion.div>

        <div className="mt-12 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {TRUST.map(({ icon: Icon, title, text }, i) => (
            <motion.div
              key={title}
              initial={reduce ? false : { opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
              className="surface flex items-start gap-3 border-l-2 border-l-primary-400 p-4"
            >
              <IconTile icon={Icon} tone="primary" size="sm" />
              <div>
                <div className="text-sm font-semibold text-slate-900 dark:text-white">{title}</div>
                <div className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">{text}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
