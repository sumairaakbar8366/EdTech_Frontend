import { ROLE_NAVIGATION } from '@schoolerp/shared';
import { Navigate, Route } from 'react-router';
import { AreaProvider } from '@/app/router/area';
import { NotificationBell } from '@/features/communication/components/NotificationBell';
import type { AreaRoutes } from '@/app/router/types';
import { can as canFor } from '@/config/permissions';
import { AREAS, areaForRole, type AreaSlug } from '@/config/roleAreas';
import { ModulePlaceholderPage } from '@/components/common/ModulePlaceholderPage';
import { SchoolShell } from '@/features/billing/components/SchoolShell';
import type { ShellNavItem } from '@/layouts/AppShell/types';
import type { Me } from '@/types/session';

type SchoolMe = Extract<Me, { scope: 'school' }>;

/** The area's menu (board page 4) with full URLs; the dashboard entry matches exactly. */
export function areaNav(area: AreaSlug): ShellNavItem[] {
  return ROLE_NAVIGATION[AREAS[area].role].map((item) => ({
    label: item.label,
    path: item.path === '/' ? `/${area}` : `/${area}${item.path}`,
    end: item.path === '/',
  }));
}

/**
 * Builds the <Route> tree of one role area: its shell, its pages (filtered by capability), a
 * "coming soon" page for menu entries not built yet, and a fallback to the area dashboard.
 * Returned as elements (not a component) because <Routes> only accepts <Route> children.
 */
export function areaRouteTree(area: AreaSlug, routes: AreaRoutes, me: SchoolMe, brandColor: string | null) {
  const can = (c: Parameters<typeof canFor>[1]) => canFor(me.permissions, c);
  const pages = routes(can).filter((r) => !r.capability || can(r.capability));
  const nav = areaNav(area);
  const built = new Set(pages.map((p) => p.path));
  const areas = me.roles.map((r) => areaForRole(r.key)).map((slug) => ({ slug, label: AREAS[slug].label, href: `/${slug}` }));

  return (
    <Route
      key={area}
      path={area}
      element={
        <AreaProvider area={area}>
          <SchoolShell
            area={area}
            isAdmin={me.roles.some((r) => r.key === 'school_admin')}
            title={me.school?.name ?? 'SchoolERP'}
            subtitle={AREAS[area].label}
            nav={nav}
            userName={`${me.user.firstName} ${me.user.lastName}`}
            userDetail={me.user.email ?? me.user.loginId}
            brandColor={brandColor}
            areas={areas}
            titleOffset={1}
            headerActions={<NotificationBell />}
          />
        </AreaProvider>
      }
    >
      {pages.map((p) => (p.path === '' ? <Route key="index" index element={p.element} /> : <Route key={p.path} path={p.path} element={p.element} />))}
      {nav
        .map((n) => n.path.slice(area.length + 2))
        .filter((path) => path && !built.has(path))
        .map((path) => (
          <Route key={path} path={path} element={<ModulePlaceholderPage label={nav.find((n) => n.path === `/${area}/${path}`)!.label} />} />
        ))}
      <Route path="*" element={<Navigate to={`/${area}`} replace />} />
    </Route>
  );
}
