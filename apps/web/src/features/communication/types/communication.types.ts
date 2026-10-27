import type { SchoolRoleKey } from '@schoolerp/shared';

export interface AppNotification {
  id: string;
  eventType: string;
  title: string;
  body: string | null;
  link: string | null;
  readAt: string | null;
  createdAt: string;
}

export interface NotificationPage {
  items: AppNotification[];
  total: number;
  unread: number;
  page: number;
  pageSize: number;
}

export interface Announcement {
  id: string;
  title: string;
  body: string;
  targetRoles: SchoolRoleKey[];
  /** Individually chosen people (empty for role-wide announcements). */
  targetUserIds?: string[];
  publishedAt: string;
}

export interface Contact {
  userId: string;
  name: string;
  kind: 'teacher' | 'guardian';
  detail: string;
}

export interface StudentContacts {
  studentId: string;
  studentName: string;
  section: string | null;
  contacts: Contact[];
}

export interface ThreadSummary {
  id: string;
  subject: string;
  student: { id: string; firstName: string; lastName: string };
  lastMessageAt: string;
  lastMessage: { body: string; createdAt: string; senderId: string } | null;
  others: { userId: string; name: string }[];
  unread: boolean;
}

export interface ThreadDetail {
  id: string;
  subject: string;
  student: { id: string; firstName: string; lastName: string };
  participants: { userId: string; name: string }[];
  messages: { id: string; body: string; createdAt: string; senderId: string; senderName: string; mine: boolean }[];
}
