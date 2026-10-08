import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { IconTile } from '@/components/ui/IconTile/IconTile';
import type { Tone } from '@/components/ui/tones';

export function EmptyState({ icon, title, children, tone = 'primary' }: { icon: LucideIcon; title: string; children?: ReactNode; tone?: Tone }) {
  return (
    <div className="flex flex-col items-center px-6 py-10 text-center">
      <IconTile icon={icon} tone={tone} size="lg" />
      <h3 className="mt-4 text-base font-bold text-slate-800 dark:text-slate-100">{title}</h3>
      {children && <div className="mt-1 max-w-sm text-sm text-slate-500 dark:text-slate-400">{children}</div>}
    </div>
  );
}
