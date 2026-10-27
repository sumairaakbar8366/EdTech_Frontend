import { useCan } from '@/features/auth/usePermissions';
import { DashboardHero } from '@/features/dashboards/components/DashboardHero';
import { useStaffHeroSlides } from '@/features/dashboards/hooks/useHeroSlides';
import { QuickAccess } from '@/features/dashboards/components/QuickAccess';
import { LatestPayslipWidget } from '@/features/dashboards/widgets/LatestPayslipWidget';
import { LeaveBalanceWidget } from '@/features/dashboards/widgets/LeaveBalanceWidget';
import { MyCheckInWidget } from '@/features/dashboards/widgets/MyCheckInWidget';

/** Non-teaching staff: check-in, leave and pay. */
export function StaffDashboard() {
  const can = useCan();
  const slides = useStaffHeroSlides();
  return (
    <div className="dash space-y-6">
      <DashboardHero slides={slides} />
      <div className="grid gap-6 lg:grid-cols-3">
        {can('attendance.own') && <MyCheckInWidget />}
        {can('leave.own') && <LeaveBalanceWidget />}
        {can('payroll.own') && <LatestPayslipWidget to="/payslips" />}
      </div>
      <QuickAccess />
    </div>
  );
}
