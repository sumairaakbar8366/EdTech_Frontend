import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { IconTile } from '@/components/ui/IconTile/IconTile';
import type { Tone } from '@/components/ui/tones';

/** Page title row: icon tile, title, subtitle and page actions. */
export function PageHeader({ title, sub, icon, tone = 'primary', actions }: { title: string; sub?: ReactNode; icon?: LucideIcon; tone?: Tone; actions?: ReactNode }) {
  return (
    <div className="mb-5 flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4 dark:border-white/10">
      <div className="flex min-w-0 items-center gap-3.5">
        {icon && <IconTile icon={icon} tone={tone} size="lg" />}
        <div className="min-w-0">
          <h1 className="text-2xl font-bold uppercase tracking-wide text-slate-900 sm:text-3xl dark:text-white">{title}</h1>
          {sub && <p className="mt-0.5 text-base text-slate-500 dark:text-slate-400">{sub}</p>}
        </div>
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}
