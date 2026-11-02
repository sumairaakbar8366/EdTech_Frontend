import { api } from '@/services/api/http';

export type ActivityLevel = 'critical' | 'warning' | 'info';

export interface ActivityItem {
  id: string;
  kind: 'signin' | 'change' | 'platform';
  level: ActivityLevel;
  title: string;
  detail: string | null;
  actorName: string | null;
  roles: string | null;
  campus: string | null;
  ip: string | null;
  /** A successful sign-in from a network this person never used before. */
  newDevice: boolean;
  /** Added by the main admin / owner. */
  note: string | null;
  /** The title was changed by the main admin / owner. */
  edited: boolean;
  at: string;
}

export interface LogEdit {
  title?: string | null;
  note?: string | null;
}

export interface ActivityPage {
  items: ActivityItem[];
  page: number;
  pageSize: number;
  hasMore: boolean;
  campuses: { id: string; name: string; code: string }[];
  /** Last 7 days. */
  summary: { critical: number; warning: number; signins: number; failedSignins: number };
}

export interface ActivityFilters {
  page: number;
  days: number;
  level?: ActivityLevel | '';
  kind?: 'signin' | 'change' | '';
  campusId?: string;
  q?: string;
}

const qs = (o: Record<string, string | number | undefined>) => new URLSearchParams(Object.entries(o).filter(([, v]) => v !== undefined && v !== '').map(([k, v]) => [k, String(v)]));

/** Activity monitor: sign-ins and sensitive changes, for the school's admins or the platform owner. */
export const activityService = {
  school: (f: ActivityFilters) => api<ActivityPage>(`/activity?${qs({ ...f })}`),
  platform: (schoolId: string, f: ActivityFilters) => api<ActivityPage>(`/platform/console/activity?${qs({ ...f, schoolId })}`),
  /** The owner team's own sign-ins and console changes. */
  team: (f: { page: number; days: number; q?: string }) => api<Omit<ActivityPage, 'campuses' | 'summary'>>(`/platform/console/activity/team?${qs({ ...f })}`),

  // Main admin (school) / main owner (platform) only.
  editSchool: (i: ActivityItem, body: LogEdit) => api(`/activity/${i.kind}/${i.id}`, { method: 'PATCH', body }),
  removeSchool: (i: ActivityItem) => api(`/activity/${i.kind}/${i.id}`, { method: 'DELETE' }),
  editPlatform: (schoolId: string | null, i: ActivityItem, body: LogEdit) => api(`/platform/console/activity/${i.kind}/${i.id}${schoolId ? `?schoolId=${schoolId}` : ''}`, { method: 'PATCH', body }),
  removePlatform: (schoolId: string | null, i: ActivityItem) => api(`/platform/console/activity/${i.kind}/${i.id}${schoolId ? `?schoolId=${schoolId}` : ''}`, { method: 'DELETE' }),
};
