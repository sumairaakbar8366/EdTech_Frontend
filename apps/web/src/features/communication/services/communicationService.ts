import type { Announcement, NotificationPage, StudentContacts, ThreadDetail, ThreadSummary } from '@/features/communication/types/communication.types';
import { api } from '@/services/api/http';

/** Someone an announcement can be sent to, from the people search. */
export interface PersonOption {
  id: string;
  name: string;
  loginId: string;
  roles: string[];
  detail: string | null;
}

/** In-app notifications, announcements and parent ↔ teacher messages (page 11). */
export const communicationService = {
  notifications: (page = 1) => api<NotificationPage>(`/notifications?page=${page}`),
  unreadCount: () => api<{ unread: number }>('/notifications/unread-count'),
  markRead: (id: string) => api(`/notifications/${id}/read`, { method: 'POST' }),
  markAllRead: () => api<{ updated: number }>('/notifications/read-all', { method: 'POST' }),

  announcements: () => api<Announcement[]>('/announcements'),
  people: (q: { q?: string; role?: string }) => api<PersonOption[]>(`/announcements/people?${new URLSearchParams(Object.entries(q).filter(([, v]) => v) as [string, string][])}`),
  announce: (body: { title: string; body: string; targetRoles: string[]; targetUserIds: string[] }) => api<Announcement & { recipients: number }>('/announcements', { method: 'POST', body }),
  removeAnnouncement: (id: string) => api(`/announcements/${id}`, { method: 'DELETE' }),

  contacts: () => api<StudentContacts[]>('/messages/contacts'),
  threads: () => api<ThreadSummary[]>('/messages/threads'),
  thread: (id: string) => api<ThreadDetail>(`/messages/threads/${id}`),
  startThread: (body: { studentId: string; recipientId: string; subject: string; body: string }) => api<{ id: string }>('/messages/threads', { method: 'POST', body }),
  reply: (id: string, body: string) => api(`/messages/threads/${id}/messages`, { method: 'POST', body: { body } }),
};
