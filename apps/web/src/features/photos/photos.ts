import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api, blobUrl, upload } from '@/services/api/http';
import { useAction } from '@/lib/hooks/useAction';
import { ME_KEY, useAuth } from '@/features/auth/AuthProvider';

export const PHOTOS_KEY = ['photos'] as const;

/** A picture as a local object URL, fetched with the session (pictures are private to the school). */
export const usePhoto = (photoKey: string | null | undefined) =>
  useQuery({ queryKey: [...PHOTOS_KEY, 'file', photoKey], queryFn: () => blobUrl(`/photos/${photoKey}`), enabled: !!photoKey, staleTime: Infinity, gcTime: 30 * 60_000, retry: false });

export interface PhotoRequest {
  id: string;
  subjectType: 'student' | 'employee';
  name: string;
  detail: string;
  currentPhotoKey: string | null;
  newPhotoKey: string;
  createdAt: string;
}

export const photoService = {
  /** Signed in: stores the picture and returns its id for a form to attach. */
  stage: (file: File) => {
    const form = new FormData();
    form.append('file', file);
    return upload<{ photoId: string }>('/photos/upload', form);
  },
  /** School website forms (not signed in). */
  stagePublic: (file: File) => {
    const form = new FormData();
    form.append('file', file);
    return upload<{ photoId: string }>('/public/photos', form);
  },
  setMine: (photoId: string) => api<{ status: 'updated' | 'requested' }>('/photos/me', { method: 'POST', body: { photoId } }),
  setFor: (kind: 'students' | 'staff' | 'guardians' | 'users', id: string, photoId: string) => api<{ photoKey: string }>(`/photos/${kind}/${id}`, { method: 'POST', body: { photoId } }),
  requests: () => api<PhotoRequest[]>('/photos/requests'),
  decide: ({ id, approve, note }: { id: string; approve: boolean; note?: string }) => api(`/photos/requests/${id}`, { method: 'POST', body: { approve, note } }),
};

export const usePhotoRequests = (enabled = true) => useQuery({ queryKey: [...PHOTOS_KEY, 'requests'], queryFn: photoService.requests, enabled });

/**
 * Writes that change pictures refresh every list and profile (pictures show in many places), but not
 * the session query; the signed-in user is reloaded on its own.
 */
export function usePhotoAction<TVars, TResult = unknown>(fn: (v: TVars) => Promise<TResult>, options: { success?: string | ((r: TResult) => string); onDone?: (r: TResult) => void } = {}) {
  const queryClient = useQueryClient();
  const { reload } = useAuth();
  return useAction(fn, {
    ...options,
    onDone: (r) => {
      void queryClient.invalidateQueries({ predicate: (q) => q.queryKey[0] !== ME_KEY[0] });
      void reload();
      options.onDone?.(r);
    },
  });
}
