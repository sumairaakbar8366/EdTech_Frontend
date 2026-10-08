import type { ReactNode } from 'react';

/** Titled group of fields inside a long form. */
export function FormSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <fieldset className="space-y-3">
      <legend className="mb-2 w-full border-b border-slate-200 pb-1 text-base font-bold uppercase tracking-wider text-primary-700 dark:border-white/10 dark:text-primary-300">{title}</legend>
      {children}
    </fieldset>
  );
}
