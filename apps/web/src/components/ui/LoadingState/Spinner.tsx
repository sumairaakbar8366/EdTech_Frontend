import { LoaderCircle } from 'lucide-react';

/** Inline loading indicator (the app's LoadingState). */
export function Spinner({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="flex items-center gap-2 py-6 text-sm text-slate-500 dark:text-slate-400" role="status">
      <LoaderCircle size={18} className="animate-spin text-primary-500" /> {label}
    </div>
  );
}
