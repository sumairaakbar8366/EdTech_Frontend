import { Crown } from 'lucide-react';
import { useAuth } from '@/features/auth/AuthProvider';
import { DASHBOARD_SECTIONS } from '@/features/users/leadership';
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
import { ComplaintsWidget } from '@/features/dashboards/widgets/ComplaintsWidget';
import { GrowthPieWidget } from '@/features/dashboards/widgets/GrowthPieWidget';

/**
 * Principal: the whole school from above. Approvals waiting first, the headline figures, what
 * changed this week (risky actions in red), then people, admissions, fees and payroll.
 */
export function PrincipalDashboard() {
  const can = useCan();
  const slides = useAdminHeroSlides();
  const { me } = useAuth();
  const seat = me?.scope === 'school' ? me.seat : null;
  // The school admin chooses which parts of this dashboard each leadership seat sees.
  const show = (section: string) => !seat?.hiddenSections.includes(section);
  const mine = DASHBOARD_SECTIONS.filter((s) => show(s.key));
  return (
    <div className="dash space-y-6">
      <DashboardHero slides={slides} />
      {seat && (
        <div className="surface flex flex-wrap items-center gap-3 rounded-2xl px-4 py-3">
          <Crown size={18} className="text-primary-600" />
          <div className="min-w-0 text-sm">
            <span className="font-bold text-slate-900 dark:text-white">Your role: {seat.titleLabel}.</span>{' '}
            <span className="text-slate-600 dark:text-slate-300">Your dashboard shows {mine.map((s) => s.label.toLowerCase()).join(', ') || 'nothing yet'}. Ask your school admin if you need more.</span>
          </div>
        </div>
      )}
      {show('kpis') && can('students.view') && can('staff.view') && can('admissions.view') && can('fees.view') && <AdminKpisWidget hidden={seat?.hiddenSections} />}
      {show('live_classes') && can('attendance.view') && <LiveClassesSlides />}
      {show('administration') && can('staff.view') && <AdministrationCard />}
      {/* Rows of equal-height cards. */}
      <div className="grid gap-6 lg:grid-cols-3 [&>*]:h-full">
        {show('activity') && can('audit.view') && <RecentActivityWidget className="lg:col-span-2" />}
        {show('leave') && can('leave.approve') && <LeaveApprovalsWidget to="/attendance" />}
      </div>
      {show('growth') && can('reports.all') && <GrowthPieWidget />}
      {show('complaints') && can('complaints.handle') && <ComplaintsWidget />}
      <div className="grid gap-6 lg:grid-cols-3 [&>*]:h-full">
        {show('admissions') && can('admissions.view') && <AdmissionsPipelineWidget />}
        {show('payroll') && can('payroll.view') && <PayrollStatusWidget to="/payroll" />}
        {show('people') && (can('students.view') || can('staff.view')) && <PeopleWidget />}
      </div>
      {show('fees') && can('fees.view') && <FeesSnapshotWidget to="/finance" />}
      {show('structure') && can('academics.view') && <SchoolStructureWidget />}
    </div>
  );
}
