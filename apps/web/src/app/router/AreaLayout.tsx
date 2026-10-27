import { ROLE_NAVIGATION } from '@schoolerp/shared';
import { PRODUCT_NAME } from '@/config/brand';
import { Navigate, Route } from 'react-router';
import { AreaProvider } from '@/app/router/area';
import { NotificationBell } from '@/features/communication/components/NotificationBell';
import type { AreaRoutes } from '@/app/router/types';
import { can as canFor } from '@/config/permissions';
import { AREAS, DASHBOARD_TITLE, areaForRole, type AreaSlug } from '@/config/roleAreas';
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
  const all = routes(can);
  const pages = all.filter((r) => !r.capability || can(r.capability));
  // Menu entries whose page this login may not open are hidden (e.g. a shared "Admin 2" sees only what was shared).
  const denied = new Set(all.filter((r) => r.capability && !can(r.capability)).map((r) => r.path));
  const nav = areaNav(area).filter((n) => !denied.has(n.path.slice(area.length + 2)));
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
            title={me.school?.name ?? PRODUCT_NAME}
            subtitle={AREAS[area].label}
            dashboardTitle={DASHBOARD_TITLE[area]}
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
