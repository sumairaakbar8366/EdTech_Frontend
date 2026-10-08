import type { ReactNode } from 'react';

/** Read-only "label: value" pair for profile pages; an empty value shows a dash. Use inside a <dl>. */
export function InfoItem({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <dt className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">{label}</dt>
      <dd className="mt-0.5 text-lg text-slate-800 dark:text-slate-100">{children || <span className="text-slate-400">—</span>}</dd>
    </div>
  );
}
