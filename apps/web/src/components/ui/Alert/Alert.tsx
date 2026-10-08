import type { ReactNode } from 'react';

/** Inline message box. Errors are announced as alerts; others as status. Also the app's ErrorState. */
export function Alert({ children, tone = 'error' }: { children: ReactNode; tone?: 'error' | 'info' | 'success' }) {
  const styles = {
    error: 'border-rose-500/25 bg-rose-500/10 text-rose-700 dark:text-rose-300',
    info: 'border-primary-500/25 bg-primary-500/10 text-primary-700 dark:text-primary-300',
    success: 'border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
  }[tone];
  return (
    <div role={tone === 'error' ? 'alert' : 'status'} className={`rounded-xl border px-3.5 py-2.5 text-sm ${styles}`}>
      {children}
    </div>
  );
}
