import { Lock } from 'lucide-react';
import { NavLink } from 'react-router';
import { navVisual } from '@/config/navigationIcons';
import type { ShellNavItem } from '@/layouts/AppShell/types';

/** Main menu on the greyish-blue sidebar; the active item gets a light fill and an orange marker. */
export function SidebarNav({ nav, compact, onNavigate }: { nav: readonly ShellNavItem[]; compact: boolean; onNavigate: () => void }) {
  return (
    <nav className="relative flex-1 space-y-0.5 overflow-y-auto px-3 pb-4" aria-label="Main">
      {nav.map((item) => {
        const [Icon] = navVisual(item.label);
        return (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.end}
            onClick={onNavigate}
            title={compact ? item.label : undefined}
            aria-label={item.label}
            className={({ isActive }) =>
              `group relative flex items-center rounded-lg py-2 text-sm font-semibold transition-all ${compact ? 'justify-center px-2' : 'gap-3 px-3'} ${
                isActive
                  ? 'bg-white/10 text-white'
                  : 'text-slate-300 hover:bg-white/6 hover:text-white'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && <span className="absolute bottom-2 left-0 top-2 w-1 rounded-r-full bg-orange-500" />}
                <span className={`flex h-8 w-8 items-center justify-center rounded-lg transition-all ${isActive ? 'text-orange-300' : 'text-slate-400 group-hover:text-white'}`}>
                  <Icon size={16} />
                </span>
                {!compact && <span className="truncate">{item.label}</span>}
                {!compact && item.locked && <Lock size={13} className="ml-auto shrink-0 text-slate-400" aria-label="Not in your plan" />}
              </>
            )}
          </NavLink>
        );
      })}
    </nav>
  );
}
