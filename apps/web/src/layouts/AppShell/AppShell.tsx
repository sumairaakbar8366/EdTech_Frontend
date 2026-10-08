import { MotionConfig } from 'motion/react';
import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react';
import { useLocation } from 'react-router';
import { PageTransition } from '@/components/motion/PageTransition';
import { Backdrop } from '@/components/effects/Backdrop';
import { Header } from '@/layouts/AppShell/Header';
import { Sidebar } from '@/layouts/AppShell/Sidebar';
import type { AreaOption, ShellNavItem } from '@/layouts/AppShell/types';
import { useSidebarState } from '@/layouts/AppShell/useSidebarState';

interface AppShellProps {
  title: string;
  subtitle: string;
  nav: readonly ShellNavItem[];
  userName: string;
  userDetail: string;
  brandColor?: string | null;
  /** The user's role areas, for the header switcher (school users with several roles). */
  areas?: readonly AreaOption[];
  /** URL segments to skip when deriving a title for pages outside the menu (e.g. the area prefix). */
  titleOffset?: number;
  /** Extra header controls, e.g. the notification bell. */
  headerActions?: ReactNode;
  /** Shown above every page (e.g. the subscription banner). */
  banner?: ReactNode;
  /** Replaces the routed page (e.g. "upgrade to use this feature"). */
  override?: ReactNode;
}

/** Header title for routes outside the menu, e.g. "/admin/payroll/runs/…" → "Payroll". */
function pageTitle(pathname: string, offset: number): string {
  const segment = pathname.split('/').filter(Boolean)[offset];
  if (!segment) return 'Dashboard';
  return segment.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Sidebar layout shared by school role areas and the platform console. */
export function AppShell({ title, subtitle, nav, userName, userDetail, brandColor, areas = [], titleOffset = 0, headerActions, banner, override }: AppShellProps) {
  const sidebar = useSidebarState();
  const { pathname } = useLocation();
  const scroller = useRef<HTMLDivElement>(null);
  // Each page starts at its top, like a new slide.
  useEffect(() => {
    scroller.current?.scrollTo({ top: 0 });
  }, [pathname]);
  const current = [...nav]
    .filter((n) => (n.end ? pathname === n.path || pathname === `${n.path}/` : pathname.startsWith(n.path)))
    .sort((a, b) => b.path.length - a.path.length)[0];

  return (
    <MotionConfig reducedMotion="user">
    <div className="flex h-dvh overflow-hidden" style={{ '--sidebar-size': `${sidebar.size}px`, ...(brandColor ? { '--brand-primary': brandColor, '--brand-action': brandColor } : {}) } as CSSProperties}>
      <Backdrop variant="app" />
      {sidebar.open && <div className="fixed inset-0 z-30 bg-slate-950/50 lg:hidden" onClick={() => sidebar.setOpen(false)} />}
      <Sidebar title={title} subtitle={subtitle} nav={nav} userName={userName} userDetail={userDetail} state={sidebar} />
      <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Header title={title} pageTitle={current?.label ?? pageTitle(pathname, titleOffset)} areas={areas} actions={headerActions} onOpenMenu={() => sidebar.setOpen(true)} />
        <div ref={scroller} className="flex-1 overflow-x-hidden overflow-y-auto">
          <div className="mx-auto w-full max-w-[1480px] px-4 py-5 sm:px-6 sm:py-7 xl:px-10">
            {banner}
            {override ?? <PageTransition />}
          </div>
        </div>
      </main>
    </div>
    </MotionConfig>
  );
}
