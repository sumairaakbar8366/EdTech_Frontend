import { Link } from 'react-router';
import { useLeadership } from '@/features/users/leadership';
import { LiveClassesSlides } from '@/features/timetable/components/monitor/LiveClassesSlides';
import { useCan } from '@/features/auth/usePermissions';
import { UpgradePopup } from '@/features/billing/components/UpgradePopup';
import { AddonsStrip } from '@/features/billing/components/AddonsStrip';
import { DashboardHero } from '@/features/dashboards/components/DashboardHero';
import { useAdminHeroSlides } from '@/features/dashboards/hooks/useHeroSlides';
import { QuickAccess } from '@/features/dashboards/components/QuickAccess';
import { AcademicYearWidget } from '@/features/dashboards/widgets/AcademicYearWidget';
import { AdminKpisWidget } from '@/features/dashboards/widgets/AdminKpisWidget';
import { AdmissionsPipelineWidget } from '@/features/dashboards/widgets/AdmissionsPipelineWidget';
import { FeesSnapshotWidget } from '@/features/dashboards/widgets/FeesSnapshotWidget';
import { HiringWidget } from '@/features/dashboards/widgets/HiringWidget';
import { LeaveApprovalsWidget } from '@/features/dashboards/widgets/LeaveApprovalsWidget';
import { ComplaintsWidget } from '@/features/dashboards/widgets/ComplaintsWidget';
import { GrowthPieWidget } from '@/features/dashboards/widgets/GrowthPieWidget';
import { PayrollStatusWidget } from '@/features/dashboards/widgets/PayrollStatusWidget';
import { PeopleWidget } from '@/features/dashboards/widgets/PeopleWidget';
import { SchoolStructureWidget } from '@/features/dashboards/widgets/SchoolStructureWidget';

/** School administrator: the whole school at a glance (board page 4: Admin dashboard). */
function PrincipalAccessPrompt() {
  const { data } = useLeadership();
  if (!data || data.seats.some((s) => s.titleKey === 'principal' && s.user.status === 'active')) return null;
  return (
    <div className="surface flex flex-wrap items-center justify-between gap-3 rounded-2xl px-4 py-3">
      <div className="text-sm"><span className="font-bold text-slate-900 dark:text-white">Your principal has no login yet.</span> <span className="text-slate-600 dark:text-slate-300">Add their name and email: their User ID and a one-time password are emailed to them.</span></div>
      <Link to="/users-and-access" className="rounded-lg bg-primary-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-primary-700">Give principal access</Link>
    </div>
  );
}

export function AdminDashboard() {
  const can = useCan();
  const slides = useAdminHeroSlides();
  return (
    <div className="dash space-y-6">
      <DashboardHero slides={slides} />
      {can('settings.manage') && <PrincipalAccessPrompt />}
      {can('students.view') && can('staff.view') && can('admissions.view') && can('fees.view') && <AdminKpisWidget />}
      {can('attendance.view') && <LiveClassesSlides />}
      {/* Rows of equal-height cards. */}
      <div className="grid gap-6 lg:grid-cols-3 [&>*]:h-full">
        {can('admissions.view') && <AdmissionsPipelineWidget />}
        {can('leave.view') && <LeaveApprovalsWidget to="/attendance" />}
        {can('payroll.view') && <PayrollStatusWidget to="/payroll" />}
      </div>
      <div className="grid gap-6 lg:grid-cols-3 [&>*]:h-full">
        {can('fees.view') && <FeesSnapshotWidget to="/finance" className="lg:col-span-2" />}
        {(can('students.view') || can('staff.view')) && <PeopleWidget />}
      </div>
      {can('reports.all') && <GrowthPieWidget />}
      {can('complaints.handle') && <ComplaintsWidget />}
      {can('academics.view') && <SchoolStructureWidget />}
      <div className="grid gap-6 lg:grid-cols-3 [&>*]:h-full">
        <QuickAccess className="lg:col-span-2" />
        <div className="space-y-6">
          {can('academics.view') && <AcademicYearWidget />}
          {can('staff.view') && <HiringWidget />}
        </div>
      </div>
      {can('settings.manage') && <AddonsStrip />}
      {can('settings.manage') && <UpgradePopup />}
    </div>
  );
}
