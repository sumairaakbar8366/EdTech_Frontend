import { PLATFORM_NAVIGATION } from '@schoolerp/shared';
import { PRODUCT_NAME } from '@/config/brand';
import { Navigate, Route } from 'react-router';
import { AppShell } from '@/layouts/AppShell/AppShell';
import { PlatformDashboard } from '@/features/platform/pages/PlatformDashboard';
import { SchoolsPage } from '@/features/platform/pages/SchoolsPage';
import { TiersPage } from '@/features/platform/pages/TiersPage';
import { PaymentsPage } from '@/features/platform/pages/PaymentsPage';
import { SystemPage } from '@/features/platform/pages/SystemPage';
import { SchoolDetailPage } from '@/features/platform/pages/SchoolDetailPage';
import { NotificationBell } from '@/features/platform/components/NotificationBell';
import { PaymentWatcher } from '@/features/platform/components/PaymentWatcher';
import { NotificationsPage } from '@/features/platform/pages/NotificationsPage';
import { SiteSettingsPage } from '@/features/platform/pages/SiteSettingsPage';
import { PlatformActivityPage } from '@/features/platform/pages/PlatformActivityPage';
import { TeamPage } from '@/features/platform/pages/TeamPage';
import { RegistrationsPage } from '@/features/platform/pages/RegistrationsPage';
import { ScholarshipsPage } from '@/features/platform/pages/ScholarshipsPage';
import { PostsPage } from '@/features/platform/pages/PostsPage';
import type { Me } from '@/types/session';

const NAV = [...PLATFORM_NAVIGATION, { label: 'Scholarships', path: '/scholarships' }, { label: 'Website posts', path: '/posts' }, { label: 'Activity', path: '/activity' }, { label: 'Leadership', path: '/team' }, { label: 'Public site', path: '/site' }, { label: 'Notifications', path: '/notifications' }].map((item) => ({ label: item.label, path: item.path, end: item.path === '/dashboard' }));

/** Platform console (admin host): schools, applications and subscription tiers. */
export function platformRouteTree(me: Extract<Me, { scope: 'platform' }>) {
  return (
    <Route element={<AppShell title={PRODUCT_NAME} subtitle="Platform Console" dashboardTitle="Owner" tourArea="platform" nav={NAV} userName={me.admin.label ? `${me.admin.name} (${me.admin.label})` : me.admin.name} userDetail={me.admin.email} headerActions={<><NotificationBell /><PaymentWatcher /></>} />}>
      <Route path="dashboard" element={<PlatformDashboard adminName={me.admin.name} />} />
      <Route path="schools" element={<SchoolsPage />} />
      <Route path="applications" element={<RegistrationsPage />} />
      <Route path="registrations" element={<Navigate to="/applications" replace />} />
      <Route path="scholarships" element={<ScholarshipsPage />} />
      <Route path="posts" element={<PostsPage />} />
      <Route path="tiers" element={<TiersPage />} />
      <Route path="payments" element={<PaymentsPage />} />
      <Route path="system" element={<SystemPage />} />
      <Route path="notifications" element={<NotificationsPage />} />
      <Route path="site" element={<SiteSettingsPage />} />
      <Route path="activity" element={<PlatformActivityPage />} />
      <Route path="team" element={<TeamPage />} />
      <Route path="schools/:id" element={<SchoolDetailPage />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Route>
  );
}
