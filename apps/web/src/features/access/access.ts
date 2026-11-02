import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api/http';
import type { Answers, CustomForm } from '@/features/forms/forms';

export type RequestRole = 'student' | 'parent' | 'teacher' | 'non_teaching_staff' | 'accounts';

export interface AccessFormInfo { schoolName: string; roles: { key: RequestRole; label: string }[]; form: CustomForm }

export interface AccessRequest {
  id: string;
  email: string;
  emailMethod: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  requestedRole: RequestRole;
  roleLabel: string;
  note: string | null;
  answers: Answers | null;
  status: 'pending' | 'approved' | 'rejected';
  decisionNote: string | null;
  decidedAt: string | null;
  createdAt: string;
}

export interface PersonMatch { id: string; name: string; detail: string; emailMatches: boolean }

export const ROLE_HELP: Record<RequestRole, { label: string; note: string }> = {
  student: { label: 'Student', note: 'Your class and admission number' },
  parent: { label: 'Parent / guardian', note: 'Your child’s name and class' },
  teacher: { label: 'Teacher', note: 'The subjects and classes you teach' },
  non_teaching_staff: { label: 'Staff member', note: 'Your job and department' },
  accounts: { label: 'Accounts officer', note: 'Your job and department' },
};

export const accessService = {
  form: () => api<AccessFormInfo>('/public/access/form'),
  emailCode: (email: string) => api<{ verificationId: string; resendInSeconds: number }>('/public/access/email-code', { method: 'POST', body: { email } }),
  emailVerify: (b: { email: string; verificationId: string; code: string }) => api<{ email: string; proof: string }>('/public/access/email-verify', { method: 'POST', body: b }),
  submit: (b: { firstName: string; lastName: string; phone?: string; role: RequestRole; note: string; email: string; emailProof: string; answers: Answers }) => api<{ id: string; message: string }>('/public/access/request', { method: 'POST', body: b }),
  list: (status?: string) => api<{ items: AccessRequest[]; counts: Record<string, number> }>(`/access-requests${status ? `?status=${status}` : ''}`),
  matches: (id: string) => api<{ type: 'staff' | 'guardian' | 'student'; items: PersonMatch[] }>(`/access-requests/${id}/matches`),
  approve: (id: string, body: { personType?: string; personId?: string; designation?: string }) => api<{ id: string; credentialsSentTo: string }>(`/access-requests/${id}/approve`, { method: 'POST', body }),
  reject: (id: string, note?: string) => api(`/access-requests/${id}/reject`, { method: 'POST', body: { note } }),
};

export const REQUESTS_KEY = ['access-requests'] as const;
export const useAccessRequests = (status?: string) => useQuery({ queryKey: [...REQUESTS_KEY, status ?? 'all'], queryFn: () => accessService.list(status), refetchInterval: 60_000 });
