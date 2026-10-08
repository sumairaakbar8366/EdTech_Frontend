import { useCan } from '@/features/auth/usePermissions';
import { DashboardHero } from '@/features/dashboards/components/DashboardHero';
import { useTeacherHeroSlides } from '@/features/dashboards/hooks/useHeroSlides';
import { QuickAccess } from '@/features/dashboards/components/QuickAccess';
import { LatestPayslipWidget } from '@/features/dashboards/widgets/LatestPayslipWidget';
import { LeaveBalanceWidget } from '@/features/dashboards/widgets/LeaveBalanceWidget';
import { MyCheckInWidget } from '@/features/dashboards/widgets/MyCheckInWidget';
import { TodayClassesWidget } from '@/features/dashboards/widgets/TodayClassesWidget';
import { TodayTimetableWidget } from '@/features/dashboards/widgets/TodayTimetableWidget';

/** Teacher: the day's classes, check-in, leave and pay (board page 4: Teacher dashboard). */
export function TeacherDashboard() {
  const can = useCan();
  const slides = useTeacherHeroSlides();
  return (
    <div className="space-y-6">
      <DashboardHero slides={slides} image="/images/dashboard-teacher.png" />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {can('attendance.mark') ? <TodayClassesWidget /> : can('timetable.view') && <TodayTimetableWidget to="/my-timetable" />}
          <QuickAccess />
        </div>
        <div className="space-y-6">
          {can('attendance.own') && <MyCheckInWidget />}
          {can('leave.own') && <LeaveBalanceWidget />}
          {can('payroll.own') && <LatestPayslipWidget to="/salary-payslips" />}
        </div>
      </div>
    </div>
  );
}
