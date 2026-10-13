import { useQuery } from '@tanstack/react-query';
import { communicationService } from '@/features/communication/services/communicationService';
import { useAction } from '@/lib/hooks/useAction';

export const NOTIFICATIONS_KEY = ['notifications'] as const;
export const COMMUNICATION_KEY = ['communication'] as const;

export const useNotifications = (page: number, enabled = true) => useQuery({ queryKey: [...NOTIFICATIONS_KEY, 'list', page], queryFn: () => communicationService.notifications(page), enabled });
/** Unread badge in the header; checked every 15 s while the tab is open, and on focus. */
export const useUnreadCount = (enabled = true) =>
  useQuery({ queryKey: [...NOTIFICATIONS_KEY, 'unread'], queryFn: communicationService.unreadCount, enabled, refetchInterval: 15_000, staleTime: 0 });
export const useAnnouncements = (enabled = true) => useQuery({ queryKey: [...COMMUNICATION_KEY, 'announcements'], queryFn: communicationService.announcements, enabled });
export const useContacts = (enabled = true) => useQuery({ queryKey: [...COMMUNICATION_KEY, 'contacts'], queryFn: communicationService.contacts, enabled });
export const useThreads = () => useQuery({ queryKey: [...COMMUNICATION_KEY, 'threads'], queryFn: communicationService.threads, refetchInterval: 30_000 });
export const useThread = (id: string | null) =>
  useQuery({ queryKey: [...COMMUNICATION_KEY, 'thread', id], queryFn: () => communicationService.thread(id!), enabled: !!id, refetchInterval: 15_000 });

/** A communication write; refreshes notifications and conversations. */
export function useCommunicationAction<TVars, TResult = unknown>(
  fn: (v: TVars) => Promise<TResult>,
  options: { success?: string | ((r: TResult) => string); onDone?: (r: TResult) => void; toastErrors?: boolean } = {},
) {
  return useAction(fn, { ...options, invalidate: [NOTIFICATIONS_KEY, COMMUNICATION_KEY] });
}
