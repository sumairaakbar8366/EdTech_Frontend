import { useCan } from '@/features/auth/usePermissions';
import { DashboardHero } from '@/features/dashboards/components/DashboardHero';
import { useLearnerHeroSlides } from '@/features/dashboards/hooks/useHeroSlides';
import { QuickAccess } from '@/features/dashboards/components/QuickAccess';
import { AssignmentsDueWidget } from '@/features/dashboards/widgets/AssignmentsDueWidget';
import { FeesDueWidget } from '@/features/dashboards/widgets/FeesDueWidget';
import { RecentResultsWidget } from '@/features/dashboards/widgets/RecentResultsWidget';
import { TodayTimetableWidget } from '@/features/dashboards/widgets/TodayTimetableWidget';

/** Student: the day's periods, work due, results and fees (board page 4: Student dashboard). */
export function StudentDashboard() {
  const can = useCan();
  const slides = useLearnerHeroSlides();
  return (
    <div className="dash space-y-6">
      <DashboardHero slides={slides} />
      <div className="grid gap-6 lg:grid-cols-3">
        {can('timetable.view') && <TodayTimetableWidget />}
        {can('assignment.view') && <AssignmentsDueWidget to="/assignments" className="lg:col-span-2" />}
        {can('results.view') && <RecentResultsWidget />}
        {can('fees.own') && <FeesDueWidget to="/fees" />}
      </div>
      <QuickAccess />
    </div>
  );
}
