import { adminRoutes } from '@/app/router/areas/admin.routes';
import type { AreaRoutes } from '@/app/router/types';
import { PrincipalDashboard } from '@/features/dashboards/pages/PrincipalDashboard';

/** Admin-only pages: school settings, billing, the website and Users & Access stay with the School Admin. */
const ADMIN_ONLY = new Set(['website', 'users-and-access', 'plans-and-billing', 'billing', 'settings']);

/** Principal: the admin's pages (each still gated by the principal's own permissions) and their own dashboard. */
export const principalRoutes: AreaRoutes = (can) =>
  adminRoutes(can)
    .filter((r) => !ADMIN_ONLY.has(r.path))
    .map((r) => (r.path === '' ? { ...r, element: <PrincipalDashboard /> } : r));
