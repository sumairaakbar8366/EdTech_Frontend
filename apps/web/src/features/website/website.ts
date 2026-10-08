import { useQuery } from '@tanstack/react-query';
import { useAction } from '@/lib/hooks/useAction';
import { api, upload } from '@/services/api/http';

// School public website: types, service and hooks.

export interface PublicSite {
  school: { name: string; slug: string; logoUrl: string | null; primaryColor: string | null };
  published: boolean;
  tagline: string;
  about: string;
  principalName: string | null;
  principalMessage: string | null;
  contact: { phone: string | null; email: string | null; address: string | null; mapUrl: string | null; facebookUrl: string | null };
  admissionsOpen: boolean;
  careersOpen: boolean;
  heroMediaId: string | null;
  stats: { students: number; teachers: number; classes: number; campuses: number };
  campuses: { id: string; name: string; address: string | null }[];
  classes: { id: string; name: string }[];
  sessions: { id: string; name: string; isCurrent: boolean }[];
  jobs: { id: string; title: string; staffType: 'teaching' | 'non_teaching'; department: string | null; description: string | null; openings: number; closingDate: string | null; campus: { name: string } }[];
  media: { id: string; category: MediaCategory; caption: string | null }[];
}

export type MediaCategory = 'campus' | 'students' | 'events' | 'achievements';
export const CATEGORY_LABEL: Record<MediaCategory, string> = { campus: 'Campus', students: 'Students', events: 'Events & functions', achievements: 'Achievements' };

export interface WebsiteSettings {
  published: boolean;
  tagline: string | null;
  about: string | null;
  principalName: string | null;
  principalMessage: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  mapUrl: string | null;
  facebookUrl: string | null;
  admissionsOpen: boolean;
  careersOpen: boolean;
  heroMediaId: string | null;
}

export interface WebsiteMedia { id: string; category: MediaCategory; caption: string | null; fileName: string; createdAt: string }

export const mediaUrl = (id: string) => `/api/public/media/${id}`;

export const websiteService = {
  site: () => api<PublicSite>('/public/site'),
  applyAdmission: (body: Record<string, unknown>) => api<{ applicationNo: string }>('/public/admissions', { method: 'POST', body }),
  applyJob: (postId: string, body: Record<string, unknown>) => api<{ received: boolean }>(`/public/careers/${postId}/apply`, { method: 'POST', body }),
  get: () => api<{ website: Partial<WebsiteSettings>; media: WebsiteMedia[] }>('/website'),
  save: (body: Partial<WebsiteSettings>) => api('/website', { method: 'PUT', body }),
  uploadPhoto: ({ file, category, caption }: { file: File; category: MediaCategory; caption: string }) => {
    const form = new FormData();
    form.append('category', category);
    if (caption.trim()) form.append('caption', caption.trim());
    form.append('file', file);
    return upload<WebsiteMedia>('/website/media', form);
  },
  removePhoto: (id: string) => api(`/website/media/${id}`, { method: 'DELETE' }),
};

const KEY = ['website'] as const;
export const usePublicSite = () => useQuery({ queryKey: [...KEY, 'public'], queryFn: websiteService.site, staleTime: 60_000 });
export const useWebsiteAdmin = () => useQuery({ queryKey: [...KEY, 'admin'], queryFn: websiteService.get });
export function useWebsiteAction<TVars, TResult = unknown>(fn: (v: TVars) => Promise<TResult>, success?: string, onDone?: () => void) {
  return useAction(fn, { success, onDone, invalidate: [KEY] });
}
