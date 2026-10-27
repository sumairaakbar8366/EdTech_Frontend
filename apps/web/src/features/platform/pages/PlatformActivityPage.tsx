import { School, ShieldAlert, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { PageHeader, SearchSelect, Tabs } from '@/components/ui';
import { useAuth } from '@/features/auth/AuthProvider';
import { ActivityMonitor } from '@/features/audit/components/ActivityMonitor';
import { activityService } from '@/features/audit/services/activityService';
import { useSchools } from '@/features/platform/hooks/usePlatform';

/**
 * Platform owner: the same activity monitor as a school's admin, for any school (and campus), plus
 * the owner team's own log (what each shared owner, "Owner 2"…, did). Only the main owner can edit
 * or delete entries.
 */
export function PlatformActivityPage() {
  const { me } = useAuth();
  const primary = me?.scope === 'platform' && !!me.admin.isPrimary;
  const schools = useSchools();
  const [tab, setTab] = useState<'schools' | 'team'>('schools');
  const [schoolId, setSchoolId] = useState('');
  useEffect(() => {
    if (!schoolId && schools.data?.[0]) setSchoolId(schools.data[0].id);
  }, [schools.data, schoolId]);

  return (
    <div>
      <PageHeader title="Activity" sub="Sign-ins and sensitive changes; risky ones are shown in red" icon={ShieldAlert} tone="rose" />
      <Tabs tabs={[{ id: 'schools' as const, label: 'Schools', icon: School }, { id: 'team' as const, label: 'Owner team', icon: Users }]} value={tab} onChange={setTab} />
      {tab === 'schools' ? (
        <ActivityMonitor
          key={schoolId}
          queryKey={['activity', 'platform', schoolId]}
          fetch={(f) => activityService.platform(schoolId, f)}
          enabled={!!schoolId}
          manage={primary ? { edit: (i, body) => activityService.editPlatform(schoolId, i, body), remove: (i) => activityService.removePlatform(schoolId, i) } : undefined}
          extraFilters={
            <div className="w-full sm:w-64">
              <SearchSelect
                value={schoolId}
                onChange={setSchoolId}
                placeholder="Search school…"
                options={(schools.data ?? []).map((s) => ({ value: s.id, label: s.name, detail: s.slug }))}
                emptyText="No school matches"
              />
            </div>
          }
        />
      ) : (
        <ActivityMonitor
          simple
          queryKey={['activity', 'team']}
          fetch={async (f) => ({ ...(await activityService.team({ page: f.page, days: f.days, q: f.q })), campuses: [], summary: { critical: 0, warning: 0, signins: 0, failedSignins: 0 } })}
          manage={primary ? { edit: (i, body) => activityService.editPlatform(null, i, body), remove: (i) => activityService.removePlatform(null, i) } : undefined}
        />
      )}
    </div>
  );
}
