import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/app/providers/ThemeProvider';

export function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const { resolved, setPreference } = useTheme();
  const dark = resolved === 'dark';
  const Icon = dark ? Sun : Moon;
  const label = dark ? 'Switch to light mode' : 'Switch to dark mode';
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={dark}
      title={label}
      onClick={() => setPreference(dark ? 'light' : 'dark')}
      className={`focus-ring inline-flex items-center justify-center gap-2 border border-slate-300 bg-white text-slate-700 transition-colors hover:border-primary-500 hover:text-primary-800 dark:border-white/15 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10 ${compact ? 'h-8 w-8 sm:w-auto sm:px-2' : 'h-9 px-3 text-sm'}`}
    >
      <Icon size={compact ? 16 : 17} />
      <span className={compact ? 'hidden text-xs font-medium sm:inline' : ''}>{dark ? 'Light' : 'Dark'}</span>
    </button>
  );
}
