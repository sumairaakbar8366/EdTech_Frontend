import type { ReactNode } from 'react';

/** Row of search box and filters above a table, inside a Card. */
export function FilterBar({ children, align = 'center' }: { children: ReactNode; align?: 'center' | 'end' }) {
  return <div className={`flex flex-wrap gap-3 border-b border-slate-200 p-4 dark:border-white/5 ${align === 'end' ? 'items-end' : 'items-center'}`}>{children}</div>;
}

/** Fixed-width slot for a select inside a FilterBar. */
export function FilterSlot({ children, width = 'w-40' }: { children: ReactNode; width?: string }) {
  return <div className={width}>{children}</div>;
}
