import { LoaderCircle, type LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { IconTile } from '@/components/ui/IconTile/IconTile';

/** Centered message for whole-screen states (loading, not found, suspended). */
export function FullPageMessage({ title, children, icon }: { title: string; children?: ReactNode; icon?: LucideIcon }) {
  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="surface max-w-md rounded-xl p-10 text-center">
        {icon ? <div className="mb-4 flex justify-center"><IconTile icon={icon} tone="magenta" size="lg" /></div> : <LoaderCircle className="mx-auto mb-4 animate-spin text-primary-500" />}
        <h1 className="text-xl font-extrabold text-slate-900 dark:text-white">{title}</h1>
        {children && <div className="mt-2 text-sm text-slate-500 dark:text-slate-400">{children}</div>}
      </div>
    </div>
  );
}
