import { useQuery } from '@tanstack/react-query';
import type { SocialLinks } from '@/features/website/social';
import { api } from '@/services/api/http';

/** The public Skool EdTech site's contact details and social accounts (set by the owner). */
export interface SiteSettings extends SocialLinks {
  contactEmail: string | null;
  phone: string | null;
  address: string | null;
}

export const siteService = {
  publicSettings: () => api<SiteSettings>('/public/site-settings'),
  adminSettings: () => api<SiteSettings>('/platform/site-settings'),
  saveSettings: (body: SiteSettings) => api<SiteSettings>('/platform/site-settings', { method: 'PUT', body }),
};

export const usePublicSiteSettings = () => useQuery({ queryKey: ['public', 'site-settings'], queryFn: siteService.publicSettings, staleTime: 5 * 60_000 });
