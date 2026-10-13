import { PLATFORM_NAVIGATION } from '@schoolerp/shared';
import { Navigate, Route } from 'react-router';
import { AppShell } from '@/layouts/AppShell/AppShell';
import { PlatformDashboard } from '@/features/platform/pages/PlatformDashboard';
import { ApplicationsPage } from '@/features/platform/pages/ApplicationsPage';
import { SchoolsPage } from '@/features/platform/pages/SchoolsPage';
import { TiersPage } from '@/features/platform/pages/TiersPage';
import { PaymentsPage } from '@/features/platform/pages/PaymentsPage';
import { SystemPage } from '@/features/platform/pages/SystemPage';
import { SchoolDetailPage } from '@/features/platform/pages/SchoolDetailPage';
import { PaymentWatcher } from '@/features/platform/components/PaymentWatcher';
import type { Me } from '@/types/session';

const NAV = PLATFORM_NAVIGATION.map((item) => ({ label: item.label, path: item.path, end: item.path === '/dashboard' }));

/** Platform console (admin host): schools, applications and subscription tiers. */
export function platformRouteTree(me: Extract<Me, { scope: 'platform' }>) {
  return (
    <Route element={<AppShell title="Anet Cyber Solutions" subtitle="SchoolERP Platform Console" nav={NAV} userName={me.admin.name} userDetail={me.admin.email} headerActions={<PaymentWatcher />} />}>
      <Route path="dashboard" element={<PlatformDashboard adminName={me.admin.name} />} />
      <Route path="schools" element={<SchoolsPage />} />
      <Route path="applications" element={<ApplicationsPage />} />
      <Route path="tiers" element={<TiersPage />} />
      <Route path="payments" element={<PaymentsPage />} />
      <Route path="system" element={<SystemPage />} />
      <Route path="schools/:id" element={<SchoolDetailPage />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Route>
  );
}
