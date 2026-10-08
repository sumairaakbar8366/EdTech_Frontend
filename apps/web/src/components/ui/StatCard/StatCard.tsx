import type { LucideIcon } from 'lucide-react';
import { motion } from 'motion/react';
import type { ReactNode } from 'react';
import { CountUp } from '@/components/motion/CountUp';
import { IconTile } from '@/components/ui/IconTile/IconTile';
import type { Tone } from '@/components/ui/tones';

/** KPI tile: label, figure (whole numbers count up), icon, with a thin navy accent bar. */
export function StatCard({ label, value, icon, tone, hint }: { label: string; value: ReactNode; icon: LucideIcon; tone: Tone; hint?: string }) {
  return (
    <motion.div
      data-tone={tone}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="surface stat-brick relative overflow-hidden rounded-xl p-5 sm:p-6"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">{label}</div>
          <div className="mt-2 font-display text-3xl font-bold tabular-nums text-(--ink) sm:text-[2.1rem] dark:text-white">
            {typeof value === 'number' && Number.isInteger(value) ? <CountUp to={value} /> : value}
          </div>
          {hint && <div className="mt-1 text-sm text-slate-500 dark:text-slate-400">{hint}</div>}
        </div>
        <IconTile icon={icon} tone={tone} />
      </div>
    </motion.div>
  );
}
