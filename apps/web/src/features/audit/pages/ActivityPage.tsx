import { ShieldAlert } from 'lucide-react';
import { PageHeader } from '@/components/ui';
import { useCan } from '@/features/auth/usePermissions';
import { ActivityMonitor } from '@/features/audit/components/ActivityMonitor';
import { activityService } from '@/features/audit/services/activityService';

/**
 * Principal / School Admin: who signed in and who changed something sensitive, per campus. Only
 * School Admins (not the principal or shared admins) can edit or delete entries.
 */
export function ActivityPage() {
  const can = useCan();
  return (
    <div>
      <PageHeader title="Activity" sub="Sign-ins and sensitive changes across the school; risky ones are shown in red" icon={ShieldAlert} tone="rose" />
      <ActivityMonitor
        queryKey={['activity', 'school']}
        fetch={activityService.school}
        manage={can('settings.manage') ? { edit: activityService.editSchool, remove: activityService.removeSchool } : undefined}
      />
    </div>
  );
}
