import type { ConsolePerson, Finance, Growth, Paged, Phase, PersonKind, SchoolDetail, SchoolsPage } from '@/features/platform/types/console.types';
import { api } from '@/services/api/http';

const qs = (o: Record<string, string | number | boolean | undefined>) =>
  new URLSearchParams(Object.entries(o).filter(([, v]) => v !== undefined && v !== '').map(([k, v]) => [k, String(v)])).toString();

/** Platform owner console: schools (list and detail), growth, revenue, support sessions and plans. */
export const consoleService = {
  schools: (q: { phase?: Phase | ''; source?: string; q?: string; page: number }) => api<SchoolsPage>(`/platform/console/schools?${qs(q)}`),
  school: (id: string) => api<SchoolDetail>(`/platform/console/schools/${id}`),
  people: (q: { type: PersonKind; schoolId: string; q?: string; page: number }) => api<Paged<ConsolePerson>>(`/platform/console/people?${qs(q)}`),
  growth: () => api<Growth>('/platform/console/growth'),
  finance: () => api<Finance>('/platform/console/finance'),
  /** A one-time link into the school as its hidden support admin (opens in a new tab). */
  support: (schoolId: string) => api<{ url: string }>(`/platform/schools/${schoolId}/support-session`, { method: 'POST' }),
  setSubscription: ({ id, ...body }: { id: string; tierCode: string; status: 'trialing' | 'active'; endsOn: string; billingCycle?: 'monthly' | 'annual' }) =>
    api(`/platform/schools/${id}/subscription`, { method: 'PATCH', body }),
};
