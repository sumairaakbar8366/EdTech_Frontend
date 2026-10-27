import { AdministrationCard } from '@/features/staff/components/AdministrationCard';
import { LiveClassesSlides } from '@/features/timetable/components/monitor/LiveClassesSlides';
import { useCan } from '@/features/auth/usePermissions';
import { RecentActivityWidget } from '@/features/audit/components/RecentActivityWidget';
import { DashboardHero } from '@/features/dashboards/components/DashboardHero';
import { useAdminHeroSlides } from '@/features/dashboards/hooks/useHeroSlides';
import { AdminKpisWidget } from '@/features/dashboards/widgets/AdminKpisWidget';
import { AdmissionsPipelineWidget } from '@/features/dashboards/widgets/AdmissionsPipelineWidget';
import { FeesSnapshotWidget } from '@/features/dashboards/widgets/FeesSnapshotWidget';
import { LeaveApprovalsWidget } from '@/features/dashboards/widgets/LeaveApprovalsWidget';
import { PayrollStatusWidget } from '@/features/dashboards/widgets/PayrollStatusWidget';
import { PeopleWidget } from '@/features/dashboards/widgets/PeopleWidget';
import { SchoolStructureWidget } from '@/features/dashboards/widgets/SchoolStructureWidget';

/**
 * Principal: the whole school from above. Approvals waiting first, the headline figures, what
 * changed this week (risky actions in red), then people, admissions, fees and payroll.
 */
export function PrincipalDashboard() {
  const can = useCan();
  const slides = useAdminHeroSlides();
  return (
    <div className="dash space-y-6">
      <DashboardHero slides={slides} />
      {can('students.view') && can('staff.view') && can('admissions.view') && can('fees.view') && <AdminKpisWidget />}
      {can('attendance.view') && <LiveClassesSlides />}
      {can('staff.view') && <AdministrationCard />}
      {/* Rows of equal-height cards. */}
      <div className="grid gap-6 lg:grid-cols-3 [&>*]:h-full">
        {can('audit.view') && <RecentActivityWidget className="lg:col-span-2" />}
        {can('leave.approve') && <LeaveApprovalsWidget to="/attendance" />}
      </div>
      <div className="grid gap-6 lg:grid-cols-3 [&>*]:h-full">
        {can('admissions.view') && <AdmissionsPipelineWidget />}
        {can('payroll.view') && <PayrollStatusWidget to="/payroll" />}
        {(can('students.view') || can('staff.view')) && <PeopleWidget />}
      </div>
      {can('fees.view') && <FeesSnapshotWidget to="/finance" />}
      {can('academics.view') && <SchoolStructureWidget />}
    </div>
  );
}
