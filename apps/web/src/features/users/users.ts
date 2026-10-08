import { keepPreviousData, useQuery } from '@tanstack/react-query';
import type { SchoolRoleKey } from '@schoolerp/shared';
import type { Tone } from '@/components/ui';
import { useAction } from '@/lib/hooks/useAction';
import { api } from '@/services/api/http';

// Small feature: types, service and hooks in one module (as features/tasks).

export type PersonType = 'staff' | 'guardian' | 'student';
export type UserStatusFilter = 'active' | 'disabled' | 'pending';

export interface SchoolLogin {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  status: 'active' | 'disabled';
  mustChangePassword: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  roles: { key: SchoolRoleKey; name: string }[];
  people: { type: PersonType; id: string; detail: string }[];
}

export interface UsersSummary {
  total: number;
  active: number;
  disabled: number;
  pending: number;
  byRole: { key: SchoolRoleKey; name: string; count: number }[];
}

export interface Candidate {
  id: string;
  name: string;
  email: string | null;
  detail: string;
  suggestedRoles: SchoolRoleKey[];
}

export interface Credentials {
  user: SchoolLogin;
  temporaryPassword: string;
}

/** What a credentials hand-over needs: a new login from hiring, staff, enrolment or Users & Access. */
export interface LoginHandover {
  user: Pick<SchoolLogin, 'firstName' | 'lastName' | 'email'> & { roles: { name: string }[] };
  temporaryPassword: string;
}

export const handover = (firstName: string, lastName: string, role: string, c: { email: string; password: string }): LoginHandover => ({
  user: { firstName, lastName, email: c.email, roles: [{ name: role }] },
  temporaryPassword: c.password,
});

export interface UsersQuery {
  q?: string;
  role?: SchoolRoleKey | '';
  status?: UserStatusFilter | '';
  personType?: PersonType | '';
  page: number;
  pageSize?: number;
}

export const PERSON_LABEL: Record<PersonType, string> = { staff: 'Staff', guardian: 'Parent', student: 'Student' };
export const STAFF_ROLE_OPTIONS: { key: SchoolRoleKey; label: string; hint: string }[] = [
  { key: 'teacher', label: 'Teacher', hint: 'Classes, attendance, marks, LMS' },
  { key: 'non_teaching_staff', label: 'Non-teaching staff', hint: 'Own attendance, leave, tasks, payslips' },
  { key: 'accounts', label: 'Accounts', hint: 'Fees, payments, payroll' },
  { key: 'school_admin', label: 'School Admin', hint: 'Everything, including Users & Access' },
];

/** Display status: an active login whose temporary password has not been replaced yet is "pending". */
export function loginStatus(u: SchoolLogin): { label: string; tone: Tone } {
  if (u.status === 'disabled') return { label: 'Disabled', tone: 'rose' };
  if (u.mustChangePassword) return { label: u.lastLoginAt ? 'Password reset' : 'Not signed in yet', tone: 'amber' };
  return { label: 'Active', tone: 'emerald' };
}

const qs = (q: UsersQuery) =>
  new URLSearchParams(Object.entries({ ...q, pageSize: q.pageSize ?? 25 }).filter(([, v]) => v !== undefined && v !== '').map(([k, v]) => [k, String(v)])).toString();

export const usersService = {
  list: (q: UsersQuery) => api<{ items: SchoolLogin[]; total: number; page: number; pageSize: number }>(`/users?${qs(q)}`),
  summary: () => api<UsersSummary>('/users/summary'),
  candidates: (type: PersonType, q: string) => api<Candidate[]>(`/users/candidates?type=${type}${q ? `&q=${encodeURIComponent(q)}` : ''}`),
  grant: (body: { personType: PersonType; personId: string; email?: string; roles?: SchoolRoleKey[] }) => api<Credentials>('/users', { method: 'POST', body }),
  setRoles: ({ id, roles }: { id: string; roles: SchoolRoleKey[] }) => api<SchoolLogin>(`/users/${id}/roles`, { method: 'PATCH', body: { roles } }),
  resetPassword: (id: string) => api<Credentials>(`/users/${id}/reset-password`, { method: 'POST' }),
  setStatus: ({ id, status }: { id: string; status: 'active' | 'disabled' }) => api<SchoolLogin>(`/users/${id}/status`, { method: 'POST', body: { status } }),
};

const USERS_KEY = ['users'] as const;
export const useUsers = (q: UsersQuery) => useQuery({ queryKey: [...USERS_KEY, 'list', q], queryFn: () => usersService.list(q), placeholderData: keepPreviousData });
export const useUsersSummary = () => useQuery({ queryKey: [...USERS_KEY, 'summary'], queryFn: usersService.summary });
export const useCandidates = (type: PersonType, q: string, enabled: boolean) =>
  useQuery({ queryKey: [...USERS_KEY, 'candidates', type, q], queryFn: () => usersService.candidates(type, q), enabled });
export function useUsersAction<TVars, TResult = unknown>(fn: (v: TVars) => Promise<TResult>, options: { success?: string; onDone?: (r: TResult) => void; toastErrors?: boolean } = {}) {
  return useAction(fn, { ...options, invalidate: [USERS_KEY] });
}

/** Text an administrator can paste into WhatsApp/email to hand over a login. */
export function loginMessage(c: LoginHandover, schoolName: string): string {
  return [
    `Assalam o Alaikum ${c.user.firstName},`,
    ``,
    `Your ${schoolName} account is ready.`,
    `Sign in at: ${window.location.origin}/login`,
    `Email: ${c.user.email}`,
    `Temporary password: ${c.temporaryPassword}`,
    ``,
    `You will be asked to choose your own password when you first sign in.`,
  ].join('\n');
}
