import type { Campus } from '@/features/academics/types/academics.types';
import { api } from '@/services/api/http';

/** Campuses of the school (multi-campus, capped by the subscription tier). */
export const campusService = {
  list: () => api<Campus[]>('/campuses'),
  create: (body: { name: string; code: string; address?: string | null; phone?: string | null }) => api<Campus>('/campuses', { method: 'POST', body }),
  update: (id: string, body: Partial<{ name: string; code: string; address: string | null; phone: string | null; isActive: boolean }>) =>
    api<Campus>(`/campuses/${id}`, { method: 'PATCH', body }),
};
