import { NavLink } from 'react-router';
import type { AreaOption } from '@/layouts/AppShell/types';

/** For people with several roles: switch between their role areas (e.g. Teaching ↔ Parent). */
export function RoleSwitcher({ areas }: { areas: readonly AreaOption[] }) {
  if (areas.length < 2) return null;
  return (
    <nav aria-label="Switch role" className="hidden rounded-xl bg-slate-500/10 p-1 ring-1 ring-inset ring-slate-500/10 sm:inline-flex">
      {areas.map((a) => (
        <NavLink
          key={a.slug}
          to={a.href}
          className={({ isActive }) =>
            `rounded-lg px-3 py-1 text-sm font-bold uppercase tracking-wide transition ${isActive ? 'bg-brand text-white' : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'}`
          }
        >
          {a.label}
        </NavLink>
      ))}
    </nav>
  );
}
