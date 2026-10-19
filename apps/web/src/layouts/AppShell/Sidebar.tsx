import { ChevronLeft, ChevronRight, Pin, PinOff, X } from 'lucide-react';
import { BrandLockup, BrandMark } from '@/components/brand/BrandLogo';
import { SidebarNav } from '@/layouts/AppShell/SidebarNav';
import { SidebarUser } from '@/layouts/AppShell/SidebarUser';
import type { ShellNavItem } from '@/layouts/AppShell/types';
import { SIDEBAR_MAX, SIDEBAR_MIN, type useSidebarState } from '@/layouts/AppShell/useSidebarState';

type SidebarState = ReturnType<typeof useSidebarState>;
/** "panel": edge-to-edge, expands on hover. "floating": an inset rounded rail, only as tall as its menu and centred vertically, that opens on hover and pins open with its edge toggle. */
export type SidebarVariant = 'panel' | 'floating';

/**
 * EdTech brand header, main menu, user card and the drag handle. On desktop: an icon rail that expands on hover
 * and can be pinned open. Slides in as a drawer on small screens.
 */
export function Sidebar({ nav, userName, userDetail, state, variant = 'panel' }: { nav: readonly ShellNavItem[]; userName: string; userDetail: string; state: SidebarState; variant?: SidebarVariant }) {
  const { open, setOpen, compact, pinned, togglePinned, floating, resizing, width } = state;
  const inset = variant === 'floating';
  const ease = resizing ? 'transition-none' : 'transition-[width,left,transform,box-shadow] duration-300 ease-in-out';
  return (
    <>
      {/* Holds the rail's (or pinned panel's) space in the page layout; the panel itself is fixed. The floating rail is padded around by AppShell instead. */}
      {!inset && <div aria-hidden className={`hidden w-[var(--sidebar-reserved)] shrink-0 lg:block ${resizing ? '' : 'transition-[width] duration-300 ease-in-out'}`} />}
      <aside
        {...state.hoverHandlers}
        className={`app-sidebar fixed inset-y-0 left-0 z-40 flex w-[var(--sidebar-size)] flex-col overflow-hidden lg:translate-x-0 ${ease} ${
          inset ? 'lg:bottom-auto lg:left-3 lg:top-1/2 lg:-translate-y-1/2 lg:max-h-[calc(100dvh-1.5rem)] lg:rounded-2xl lg:shadow-xl lg:shadow-slate-950/25 lg:[&>nav]:flex-[0_1_auto]' : ''
        } ${floating ? 'shadow-2xl shadow-slate-950/40' : ''} ${open ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className={`relative flex items-center gap-3 py-5 ${compact ? 'justify-center px-2' : 'px-5'}`}>
          {compact ? <BrandMark tone="dark" size={inset ? 'sm' : 'md'} /> : <BrandLockup tone="dark" className="flex-1" />}
          {!compact && !inset && (
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

        {pinned && !inset && (
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
      {inset && (
        <button
          onClick={togglePinned}
          aria-expanded={pinned}
          aria-label={pinned ? 'Unpin menu' : 'Keep menu open'}
          title={pinned ? 'Unpin menu' : 'Keep menu open'}
          style={{ left: 'calc(0.75rem + var(--sidebar-size) - 0.875rem)' }}
          className={`fixed top-1/2 z-50 -translate-y-1/2 hidden h-7 w-7 items-center justify-center rounded-full bg-orange-500 text-white shadow-md ring-4 ring-(--page-bg) transition-[left,background-color] duration-300 ease-in-out hover:bg-orange-600 lg:flex`}
        >
          {pinned ? <ChevronLeft size={15} /> : <ChevronRight size={15} />}
        </button>
      )}
    </>
  );
}
