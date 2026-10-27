import { Menu } from 'lucide-react';
import type { ReactNode } from 'react';
import { ThemeToggle } from '@/components/shared/ThemeToggle';
import { RoleSwitcher } from '@/layouts/AppShell/RoleSwitcher';
import type { AreaOption } from '@/layouts/AppShell/types';

/** Top bar: menu button (mobile), school + page title, role switcher and theme toggle. */
export function Header({ title, pageTitle, areas, actions, onOpenMenu, className = '' }: { title: string; pageTitle: string; areas: readonly AreaOption[]; actions?: ReactNode; onOpenMenu: () => void; className?: string }) {
  return (
    <header className={`relative z-20 flex items-center gap-3 border-b border-(--surface-border) bg-(--surface-bg) px-4 py-2.5 sm:px-8 ${className}`}>
      <button onClick={onOpenMenu} className="rounded-lg p-1.5 text-slate-600 hover:bg-slate-500/10 lg:hidden dark:text-slate-300" aria-label="Open menu">
        <Menu size={20} />
      </button>
      <div className="min-w-0 flex-1">
        <div className="truncate text-xs font-medium text-slate-500 dark:text-slate-400">{title}</div>
        <div className="truncate font-display text-xl font-bold uppercase tracking-wide text-slate-900 dark:text-white">{pageTitle}</div>
      </div>
      {actions}
      <RoleSwitcher areas={areas} />
      <ThemeToggle compact />
    </header>
  );
}
