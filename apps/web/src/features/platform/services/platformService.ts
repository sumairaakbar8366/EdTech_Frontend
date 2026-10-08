import type { SchoolApplication, SchoolSummary, Tier, TierFilter, TierPayload } from '@/features/platform/types/platform.types';
import { api } from '@/services/api/http';

export interface OnboardSchoolPayload {
  name: string;
  slug: string;
  tierCode: string;
  primaryColor?: string;
  timezone: string;
  currency: string;
  campus: { name: string; code: string };
  admin: { firstName: string; lastName: string; email: string; password: string };
  applicationId?: string;
}

/** Platform-owner API: tiers, school tenants and incoming school applications. */
export const platformService = {
  tiers: (f: TierFilter = {}) => api<Tier[]>(`/platform/tiers?${new URLSearchParams(Object.entries(f).filter(([, v]) => v) as [string, string][])}`),
  createTier: (body: TierPayload) => api<Tier>('/platform/tiers', { method: 'POST', body }),
  updateTier: ({ id, ...body }: Partial<TierPayload> & { id: string }) => api<Tier>(`/platform/tiers/${id}`, { method: 'PATCH', body }),
  deleteTier: (id: string) => api(`/platform/tiers/${id}`, { method: 'DELETE' }),
  schools: () => api<SchoolSummary[]>('/platform/schools'),
  /** Creates the tenant, its trial subscription, first campus and first school admin. */
  onboardSchool: (body: OnboardSchoolPayload) => api<{ school: { name: string } }>('/platform/schools', { method: 'POST', body }),
  setSchoolStatus: (id: string, status: SchoolSummary['status']) => api(`/platform/schools/${id}/status`, { method: 'PATCH', body: { status } }),
  applications: () => api<SchoolApplication[]>('/platform/school-applications'),
  reviewApplication: (id: string, status: 'approved' | 'rejected') => api(`/platform/school-applications/${id}`, { method: 'PATCH', body: { status } }),
};
