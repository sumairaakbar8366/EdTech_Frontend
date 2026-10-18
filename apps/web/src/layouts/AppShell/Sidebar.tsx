import { Pin, PinOff, X } from 'lucide-react';
import { BrandLockup, BrandMark } from '@/components/brand/BrandLogo';
import { SidebarNav } from '@/layouts/AppShell/SidebarNav';
import { SidebarUser } from '@/layouts/AppShell/SidebarUser';
import type { ShellNavItem } from '@/layouts/AppShell/types';
import { SIDEBAR_MAX, SIDEBAR_MIN, type useSidebarState } from '@/layouts/AppShell/useSidebarState';

type SidebarState = ReturnType<typeof useSidebarState>;

/**
 * EdTech brand header, main menu, user card and the drag handle. On desktop: an icon rail that expands on hover
 * and can be pinned open. Slides in as a drawer on small screens.
 */
export function Sidebar({ nav, userName, userDetail, state }: { nav: readonly ShellNavItem[]; userName: string; userDetail: string; state: SidebarState }) {
  const { open, setOpen, compact, pinned, togglePinned, floating, resizing, width } = state;
  return (
    <>
      {/* Holds the rail's (or pinned panel's) space in the page layout; the panel itself is fixed. */}
      <div aria-hidden className={`hidden shrink-0 lg:block w-[var(--sidebar-reserved)] ${resizing ? '' : 'transition-[width] duration-300 ease-in-out'}`} />
      <aside
        {...state.hoverHandlers}
        className={`app-sidebar fixed inset-y-0 left-0 z-40 flex w-[var(--sidebar-size)] flex-col overflow-hidden lg:translate-x-0 ${
          resizing ? 'transition-none' : 'transition-[width,transform,box-shadow] duration-300 ease-in-out'
        } ${floating ? 'shadow-2xl shadow-slate-950/40' : ''} ${open ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className={`relative flex items-center gap-3 py-5 ${compact ? 'justify-center px-2' : 'px-5'}`}>
          {compact ? <BrandMark tone="dark" /> : <BrandLockup tone="dark" className="flex-1" />}
          {!compact && (
            <button
              className={`hidden shrink-0 rounded-lg p-1.5 hover:bg-white/10 hover:text-white lg:inline-flex ${pinned ? 'text-orange-300' : 'text-slate-300'}`}
              onClick={togglePinned}
              aria-pressed={pinned}
              aria-label={pinned ? 'Unpin sidebar' : 'Pin sidebar open'}
              title={pinned ? 'Unpin sidebar' : 'Pin sidebar open'}
            >
              {pinned ? <PinOff size={17} /> : <Pin size={17} />}
            </button>
          )}
          <button className="rounded-lg p-1.5 text-slate-300 hover:bg-white/10 hover:text-white lg:hidden" onClick={() => setOpen(false)} aria-label="Close menu">
            <X size={18} />
          </button>
        </div>

        <SidebarNav nav={nav} compact={compact} onNavigate={() => setOpen(false)} />
        <SidebarUser name={userName} detail={userDetail} compact={compact} />

        {pinned && (
          <div
            role="separator"
            aria-label="Resize sidebar"
            aria-orientation="vertical"
            aria-valuenow={width}
            aria-valuemin={SIDEBAR_MIN}
            aria-valuemax={SIDEBAR_MAX}
            tabIndex={0}
            onPointerDown={state.startResize}
            onKeyDown={state.resizeWithKeyboard}
            className="absolute right-0 top-0 hidden h-full w-1.5 cursor-col-resize touch-none transition-colors hover:bg-white/20 focus-visible:bg-white/30 lg:block"
          />
        )}
      </aside>
    </>
  );
}
