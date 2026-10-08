import { useCan } from '@/features/auth/usePermissions';
import { DashboardHero } from '@/features/dashboards/components/DashboardHero';
import { useLearnerHeroSlides } from '@/features/dashboards/hooks/useHeroSlides';
import { QuickAccess } from '@/features/dashboards/components/QuickAccess';
import { AssignmentsDueWidget } from '@/features/dashboards/widgets/AssignmentsDueWidget';
import { ChildrenWidget } from '@/features/dashboards/widgets/ChildrenWidget';
import { FeesDueWidget } from '@/features/dashboards/widgets/FeesDueWidget';
import { RecentResultsWidget } from '@/features/dashboards/widgets/RecentResultsWidget';
import { useChildSwitch } from '@/features/lms/hooks/useChildSwitch';

/** Parent: every child at a glance; homework and results follow the selected child. */
export function ParentDashboard() {
  const can = useCan();
  const { childId, ready, switcher } = useChildSwitch();
  const slides = useLearnerHeroSlides({ studentId: childId, ready, parent: true });
  return (
    <div className="space-y-6">
      <DashboardHero slides={slides} image="/images/dashboard-parent.png" />
      <div className="grid gap-6 lg:grid-cols-3">
        <ChildrenWidget className="lg:col-span-2" />
        {can('fees.own') && <FeesDueWidget to="/fees" />}
      </div>
      {switcher}
      <div className="grid gap-6 lg:grid-cols-2">
        {can('assignment.view') && <AssignmentsDueWidget studentId={childId} ready={ready} to="/homework" />}
        {can('results.view') && <RecentResultsWidget studentId={childId} ready={ready} />}
      </div>
      <QuickAccess />
    </div>
  );
}
