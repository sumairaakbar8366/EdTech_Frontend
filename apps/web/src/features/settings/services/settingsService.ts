import type { SchoolDomain, SchoolSettings, SettingsView } from '@/features/settings/types/settings.types';
import { api, upload } from '@/services/api/http';

/** School configuration: regional settings, branding and custom domains. */
export const settingsService = {
  get: () => api<SettingsView>('/settings/school'),
  update: (body: Partial<Omit<SchoolSettings, 'logoUrl'>>) => api<SchoolSettings>('/settings/school', { method: 'PATCH', body }),
  uploadLogo: (file: File) => {
    const form = new FormData();
    form.set('file', file);
    return upload<{ logoUrl: string }>('/settings/school/logo', form);
  },
  removeLogo: () => api('/settings/school/logo', { method: 'DELETE' }),
  addDomain: (hostname: string) => api<SchoolDomain>('/settings/domains', { method: 'POST', body: { hostname } }),
  verifyDomain: (id: string) => api<SchoolDomain>(`/settings/domains/${id}/verify`, { method: 'POST' }),
  makePrimary: (id: string) => api(`/settings/domains/${id}/primary`, { method: 'POST' }),
  removeDomain: (id: string) => api(`/settings/domains/${id}`, { method: 'DELETE' }),
};
