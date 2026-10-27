import { Camera } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui';
import { useCan, useSchoolUser } from '@/features/auth/usePermissions';
import { DashboardHero } from '@/features/dashboards/components/DashboardHero';
import { useLearnerHeroSlides } from '@/features/dashboards/hooks/useHeroSlides';
import { QuickAccess } from '@/features/dashboards/components/QuickAccess';
import { AssignmentsDueWidget } from '@/features/dashboards/widgets/AssignmentsDueWidget';
import { ChildrenWidget } from '@/features/dashboards/widgets/ChildrenWidget';
import { FeesDueWidget } from '@/features/dashboards/widgets/FeesDueWidget';
import { RecentNotificationsWidget } from '@/features/dashboards/widgets/RecentNotificationsWidget';
import { RecentResultsWidget } from '@/features/dashboards/widgets/RecentResultsWidget';
import { useChildSwitch } from '@/features/lms/hooks/useChildSwitch';
import { MyPhotoModal } from '@/features/photos/MyPhotoModal';

/** Parent: every child at a glance (picture, attendance, fees, result), notifications; homework and results follow the selected child. */
export function ParentDashboard() {
  const can = useCan();
  const me = useSchoolUser();
  const [photo, setPhoto] = useState(false);
  const { childId, ready, switcher } = useChildSwitch();
  const slides = useLearnerHeroSlides({ studentId: childId, ready, parent: true });
  return (
    <div className="dash space-y-6">
      {!me.user.photoKey && (
        <div className="surface card-3d flex flex-wrap items-center gap-3 px-5 py-3">
          <Camera size={18} className="text-primary-600" />
          <p className="flex-1 text-sm text-slate-600 dark:text-slate-300">Upload a picture of the father or guardian for your dashboard. It is optional.</p>
          <Button variant="secondary" onClick={() => setPhoto(true)}>Add picture</Button>
        </div>
      )}
      <div className="grid gap-6 lg:grid-cols-3">
        <ChildrenWidget className="lg:col-span-2" />
        <RecentNotificationsWidget />
      </div>
      <DashboardHero slides={slides} />
      {can('fees.own') && <FeesDueWidget to="/fees" />}
      {switcher}
      <div className="grid gap-6 lg:grid-cols-2">
        {can('assignment.view') && <AssignmentsDueWidget studentId={childId} ready={ready} to="/homework" />}
        {can('results.view') && <RecentResultsWidget studentId={childId} ready={ready} />}
      </div>
      <QuickAccess />
      <MyPhotoModal open={photo} onClose={() => setPhoto(false)} />
    </div>
  );
}
