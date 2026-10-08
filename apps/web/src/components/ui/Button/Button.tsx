import { LoaderCircle, type LucideIcon } from 'lucide-react';
import type { ButtonHTMLAttributes } from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

const STYLES: Record<ButtonVariant, string> = {
  primary: 'bg-brand text-white shadow-depth-1 hover:brightness-[1.15] active:brightness-95',
  secondary:
    'bg-white text-slate-700 ring-1 ring-slate-300 shadow-depth-1 hover:bg-slate-50 dark:bg-white/5 dark:text-slate-200 dark:ring-white/10 dark:hover:bg-white/10',
  ghost: 'text-slate-600 hover:bg-slate-500/10 dark:text-slate-300',
  danger: 'bg-rose-700 text-white shadow-depth-1 hover:bg-rose-800',
};

/** The one button of the app. `loading` shows a spinner and disables it. */
export function Button({
  variant = 'primary',
  icon: Icon,
  loading,
  className = '',
  children,
  disabled,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant; icon?: LucideIcon; loading?: boolean }) {
  return (
    <button
      className={`focus-ring inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-base font-bold uppercase tracking-wide transition-colors duration-150 disabled:pointer-events-none disabled:opacity-50 ${STYLES[variant]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <LoaderCircle size={16} className="animate-spin" /> : Icon && <Icon size={16} strokeWidth={2.4} />}
      {children}
    </button>
  );
}
