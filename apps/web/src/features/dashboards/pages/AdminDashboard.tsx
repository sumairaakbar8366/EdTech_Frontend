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
import { PayrollStatusWidget } from '@/features/dashboards/widgets/PayrollStatusWidget';
import { PeopleWidget } from '@/features/dashboards/widgets/PeopleWidget';
import { SchoolStructureWidget } from '@/features/dashboards/widgets/SchoolStructureWidget';

/** School administrator: the whole school at a glance (board page 4: Admin dashboard). */
export function AdminDashboard() {
  const can = useCan();
  const slides = useAdminHeroSlides();
  return (
    <div className="dash space-y-6">
      <DashboardHero slides={slides} />
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
