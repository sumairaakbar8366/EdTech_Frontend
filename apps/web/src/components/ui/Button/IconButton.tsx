import type { LucideIcon } from 'lucide-react';
import type { ButtonHTMLAttributes } from 'react';

/** Square icon-only button; `label` becomes its accessible name and tooltip. */
export function IconButton({
  icon: Icon,
  label,
  tone = 'default',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { icon: LucideIcon; label: string; tone?: 'default' | 'danger' }) {
  return (
    <button
      aria-label={label}
      title={label}
      className={`focus-ring inline-flex h-8 w-8 items-center justify-center rounded-lg transition-colors disabled:opacity-40 ${
        tone === 'danger'
          ? 'text-rose-500 hover:bg-rose-500/10'
          : 'text-slate-500 hover:bg-slate-500/10 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'
      }`}
      {...props}
    >
      <Icon size={16} />
    </button>
  );
}
