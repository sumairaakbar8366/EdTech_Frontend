import type { LucideIcon } from 'lucide-react';
import { motion } from 'motion/react';
import type { ReactNode } from 'react';
import { CountUp } from '@/components/motion/CountUp';
import { CompactNumber } from '@/components/ui/CompactNumber/CompactNumber';
import { IconTile } from '@/components/ui/IconTile/IconTile';
import type { Tone } from '@/components/ui/tones';

/**
 * KPI tile: icon and label on top, the figure, then the hint pinned to the bottom so tiles in a row
 * line up. The label and hint wrap instead of being cut off. Numbers below 1,000 count up; larger
 * ones are abbreviated (12.5k, 3.2M) with the exact value in a tooltip, so the figure never overflows.
 */
export function StatCard({ label, value, icon, tone, hint }: { label: string; value: ReactNode; icon: LucideIcon; tone: Tone; hint?: string }) {
  return (
    <motion.div
      data-tone={tone}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="surface card-3d stat-brick relative flex h-full flex-col gap-3 overflow-hidden p-4 sm:p-5"
    >
      <div className="flex items-center gap-3">
        <IconTile icon={icon} tone={tone} size="sm" />
        <span className="min-w-0 text-sm font-semibold leading-snug text-slate-600 dark:text-slate-300">{label}</span>
      </div>
      <div className="whitespace-nowrap font-display text-2xl font-bold tabular-nums text-(--ink) sm:text-3xl dark:text-white">
        {typeof value === 'number' ? Number.isInteger(value) && Math.abs(value) < 1000 ? <CountUp to={value} /> : <CompactNumber value={value} /> : value}
      </div>
      {hint && <p className="mt-auto text-xs leading-snug text-slate-500 dark:text-slate-400">{hint}</p>}
    </motion.div>
  );
}
