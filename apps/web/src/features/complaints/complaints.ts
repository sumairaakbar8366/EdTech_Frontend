import { useQuery } from '@tanstack/react-query';
import type { Tone } from '@/components/ui';
import { api } from '@/services/api/http';

export type Severity = 'low' | 'normal' | 'high' | 'urgent';
export type ComplaintStatus = 'open' | 'in_review' | 'resolved' | 'closed';
export type AgainstKind = 'teacher' | 'staff' | 'student' | 'parent' | 'principal' | 'admin' | 'school' | 'other';

export interface Category { key: string; label: string; group: string; severity: Severity }
export interface ComplaintMeta { categories: Category[]; againstKinds: AgainstKind[]; severities: Severity[]; statuses: { key: ComplaintStatus; label: string }[] }

export interface ComplaintRow {
  id: string; ticketNo: string; category: string; severity: Severity; subject: string; anonymous: boolean;
  complainantRole?: string; againstKind?: AgainstKind; againstName?: string | null; sentTo?: string | null; status: ComplaintStatus; createdAt: string; lastActivityAt: string; replies?: number;
}
export interface ThreadMessage { id: string; side: 'complainant' | 'handler' | 'system'; kind: 'message' | 'note' | 'event'; body: string; createdAt: string; from: string }
export interface ComplaintDetail {
  id: string; ticketNo: string; category: string; severity: Severity; subject: string; body: string; anonymous: boolean; complainant?: string; againstKind: AgainstKind; againstName: string | null;
  handlerScope?: string; sentTo?: string | null; status: ComplaintStatus; createdAt: string; resolvedAt: string | null; resolutionNote: string | null; resolvedBy?: string | null; messages: ThreadMessage[];
}
export type SendTo = 'management' | 'principal' | 'admin' | 'student_parents' | 'class_parents' | 'teacher';
export interface GroupClass { id: string; name: string; wholeClass: boolean; sections: { id: string; name: string }[] }
export interface PersonHit { userId: string | null; id?: string; name: string; detail: string }

export const STATUS_LABEL: Record<ComplaintStatus, string> = { open: 'Open', in_review: 'Under review', resolved: 'Resolved', closed: 'Closed' };
export const STATUS_TONE: Record<ComplaintStatus, Tone> = { open: 'amber', in_review: 'sky', resolved: 'emerald', closed: 'slate' };
export const SEVERITY_TONE: Record<Severity, Tone> = { low: 'slate', normal: 'primary', high: 'amber', urgent: 'rose' };
export const AGAINST_LABEL: Record<AgainstKind, string> = { teacher: 'A teacher', staff: 'A staff member', student: 'A student', parent: 'A parent', principal: 'The principal', admin: 'The school admin', school: 'The school itself', other: 'Someone / something else' };

export const complaintsService = {
  meta: () => api<ComplaintMeta>('/complaints/meta'),
  people: (kind: AgainstKind, q: string) => api<PersonHit[]>(`/complaints/people?kind=${kind}${q ? `&q=${encodeURIComponent(q)}` : ''}`),
  create: (b: { category: string; severity?: Severity; subject: string; body: string; anonymous: boolean; againstKind: AgainstKind; againstUserId?: string; againstName?: string; sendTo?: SendTo; teacherUserId?: string; studentId?: string; sectionId?: string; classId?: string }) => api<{ id: string; ticketNo: string }>('/complaints', { method: 'POST', body: b }),
  mine: () => api<ComplaintRow[]>('/complaints/mine'),
  groups: () => api<GroupClass[]>('/complaints/groups'),
  received: () => api<ComplaintRow[]>('/complaints/received'),
  receivedOne: (id: string) => api<ComplaintDetail>(`/complaints/received/${id}`),
  replyReceived: (id: string, body: string) => api(`/complaints/received/${id}/messages`, { method: 'POST', body: { body } }),
  mineOne: (id: string) => api<ComplaintDetail>(`/complaints/mine/${id}`),
  reply: (id: string, body: string) => api(`/complaints/mine/${id}/messages`, { method: 'POST', body: { body } }),
  summary: () => api<{ open: number; inReview: number; resolved: number; closed: number; urgentOpen: number }>('/complaints/summary'),
  list: (p: { status?: string; category?: string; severity?: string; q?: string; page: number }) => {
    const qs = new URLSearchParams({ page: String(p.page), pageSize: '20' });
    for (const k of ['status', 'category', 'severity', 'q'] as const) if (p[k]) qs.set(k, p[k]!);
    return api<{ items: ComplaintRow[]; total: number; page: number; pageSize: number }>(`/complaints?${qs}`);
  },
  one: (id: string) => api<ComplaintDetail>(`/complaints/${id}`),
  handle: (id: string, body: string, internal: boolean) => api(`/complaints/${id}/messages`, { method: 'POST', body: { body, internal } }),
  setStatus: (id: string, status: ComplaintStatus, note?: string) => api(`/complaints/${id}/status`, { method: 'POST', body: { status, note } }),
};

export const COMPLAINTS_KEY = ['complaints'] as const;
export const useComplaintMeta = () => useQuery({ queryKey: [...COMPLAINTS_KEY, 'meta'], queryFn: complaintsService.meta, staleTime: Infinity });
export const useReceivedComplaints = (enabled = true) => useQuery({ queryKey: [...COMPLAINTS_KEY, 'received'], queryFn: complaintsService.received, enabled, refetchInterval: 60_000 });
export const useMyComplaints = () => useQuery({ queryKey: [...COMPLAINTS_KEY, 'mine'], queryFn: complaintsService.mine, refetchInterval: 60_000 });
export const useComplaintSummary = (enabled = true) => useQuery({ queryKey: [...COMPLAINTS_KEY, 'summary'], queryFn: complaintsService.summary, enabled, refetchInterval: 60_000 });
