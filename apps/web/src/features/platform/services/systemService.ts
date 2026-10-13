import type { DeliveryChannel, DeliveryFilter, DeliveryPage, JobsOverview } from '@/features/platform/types/system.types';
import { api } from '@/services/api/http';

/** Platform console "System": outbound message log, test messages and scheduled jobs. */
export const systemService = {
  deliveries: (f: DeliveryFilter) => {
    const q = new URLSearchParams({ page: String(f.page) });
    if (f.channel) q.set('channel', f.channel);
    if (f.status) q.set('status', f.status);
    if (f.search?.trim()) q.set('search', f.search.trim());
    return api<DeliveryPage>(`/platform/system/deliveries?${q}`);
  },
  sendTest: (body: { channel: DeliveryChannel; to: string }) => api<{ id: string }>('/platform/system/deliveries/test', { method: 'POST', body }),
  jobs: () => api<JobsOverview>('/platform/system/jobs'),
  runJob: (id: string) => api<{ result: unknown }>(`/platform/system/jobs/${encodeURIComponent(id)}/run`, { method: 'POST' }),
};
