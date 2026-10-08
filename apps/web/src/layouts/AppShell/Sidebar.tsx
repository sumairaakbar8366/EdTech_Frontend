import { GraduationCap, PanelLeftClose, PanelLeftOpen, X } from 'lucide-react';
import { SidebarNav } from '@/layouts/AppShell/SidebarNav';
import { SidebarUser } from '@/layouts/AppShell/SidebarUser';
import type { ShellNavItem } from '@/layouts/AppShell/types';
import { SIDEBAR_MAX, SIDEBAR_MIN, type useSidebarState } from '@/layouts/AppShell/useSidebarState';

type SidebarState = ReturnType<typeof useSidebarState>;

/** Brand header, main menu, user card and the drag handle. Slides in as a drawer on small screens. */
export function Sidebar({ title, subtitle, nav, userName, userDetail, state }: { title: string; subtitle: string; nav: readonly ShellNavItem[]; userName: string; userDetail: string; state: SidebarState }) {
  const { open, setOpen, compact, toggleCompact, width } = state;
  return (
    <aside
      className={`app-sidebar fixed inset-y-0 left-0 z-40 flex w-[var(--sidebar-size)] shrink-0 flex-col transition-transform duration-300 lg:static lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}
    >
      <div className={`relative flex items-center gap-3 py-5 ${compact ? 'justify-center px-2' : 'px-5'}`}>
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-500 text-white">
          <GraduationCap size={22} />
        </span>
        {!compact && (
          <div className="min-w-0 flex-1">
            <div className="truncate font-display text-lg font-bold leading-tight tracking-wide text-white">{title}</div>
            <div className="truncate text-xs text-slate-300">{subtitle}</div>
          </div>
        )}
        <button
          className="hidden rounded-lg p-1.5 text-slate-300 hover:bg-white/10 hover:text-white lg:inline-flex"
          onClick={toggleCompact}
          aria-label={compact ? 'Expand sidebar' : 'Collapse sidebar'}
          title={compact ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {compact ? <PanelLeftOpen size={17} /> : <PanelLeftClose size={17} />}
        </button>
        <button className="rounded-lg p-1.5 text-slate-300 hover:bg-white/10 hover:text-white lg:hidden" onClick={() => setOpen(false)} aria-label="Close menu">
          <X size={18} />
        </button>
      </div>

      <SidebarNav nav={nav} compact={compact} onNavigate={() => setOpen(false)} />
      <SidebarUser name={userName} detail={userDetail} compact={compact} />

      <div
        role="separator"
        aria-label="Resize sidebar"
        aria-orientation="vertical"
        aria-valuenow={compact ? 72 : width}
        aria-valuemin={SIDEBAR_MIN}
        aria-valuemax={SIDEBAR_MAX}
        tabIndex={0}
        onPointerDown={state.startResize}
        onKeyDown={state.resizeWithKeyboard}
        className="absolute right-0 top-0 hidden h-full w-1.5 cursor-col-resize touch-none transition-colors hover:bg-white/20 focus-visible:bg-white/30 lg:block"
      />
    </aside>
  );
}
