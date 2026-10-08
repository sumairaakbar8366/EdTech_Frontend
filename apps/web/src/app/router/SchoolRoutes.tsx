import { Navigate, Route, useLocation } from 'react-router';
import { areaRouteTree } from '@/app/router/AreaLayout';
import { AREA_ROUTES } from '@/app/router/areas';
import { areaForRole, isAreaSlug, type AreaSlug } from '@/config/roleAreas';
import type { Me } from '@/types/session';

type SchoolMe = Extract<Me, { scope: 'school' }>;

/** The user's areas in role order (highest role first); the first is their home. */
export function userAreas(me: SchoolMe): AreaSlug[] {
  return [...new Set(me.roles.map((r) => areaForRole(r.key)))];
}

/** Old role-neutral links ("/students/1") and areas the user lacks go to their home area. */
function LegacyRedirect({ home, areas }: { home: AreaSlug; areas: AreaSlug[] }) {
  const { pathname, search } = useLocation();
  const first = pathname.split('/').filter(Boolean)[0];
  if (isAreaSlug(first) && !areas.includes(first)) return <Navigate to={`/${home}`} replace />;
  return <Navigate to={`/${home}${pathname === '/' ? '' : pathname}${search}`} replace />;
}

/** <Route> elements for a signed-in school user: one tree per role area. */
export function schoolRouteTree(me: SchoolMe, brandColor: string | null) {
  const areas = userAreas(me);
  const home = areas[0]!;
  return [
    ...areas.map((area) => areaRouteTree(area, AREA_ROUTES[area], me, brandColor)),
    <Route key="legacy" path="*" element={<LegacyRedirect home={home} areas={areas} />} />,
  ];
}
