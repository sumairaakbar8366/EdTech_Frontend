import type { EmployeeDetail, EmployeeListItem, EmployeeStatus, StaffSummary, StaffType } from '@/features/staff/types/staff.types';
import type { StaffPayload } from '@/features/staff/utils/staff.utils';
import { api } from '@/services/api/http';
import type { Paged } from '@/types/common';

export interface StaffListQuery {
  page: number;
  pageSize: number;
  q?: string;
  staffType?: StaffType | '';
  status?: EmployeeStatus | '';
  campusId?: string;
}

/** Staff API (page 6: teacher lifecycle) including teacher subject assignments. */
export const staffService = {
  list: (q: StaffListQuery) => {
    const p = new URLSearchParams({ page: String(q.page), pageSize: String(q.pageSize) });
    if (q.q) p.set('q', q.q);
    if (q.staffType) p.set('staffType', q.staffType);
    if (q.status) p.set('status', q.status);
    if (q.campusId) p.set('campusId', q.campusId);
    return api<Paged<EmployeeListItem>>(`/staff?${p}`);
  },
  summary: () => api<StaffSummary>('/staff/summary'),
  get: (id: string) => api<EmployeeDetail>(`/staff/${id}`),
  me: () => api<EmployeeDetail>('/staff/me'),
  create: (body: StaffPayload & { employeeNo?: string; login?: { roles: string[] } }) => api<{ id: string; credentials: { email: string; password: string } | null }>('/staff', { method: 'POST', body }),
  update: (id: string, body: StaffPayload) => api(`/staff/${id}`, { method: 'PATCH', body }),
  setStatus: (id: string, status: EmployeeStatus, reason: string | null) => api(`/staff/${id}/status`, { method: 'POST', body: { status, reason } }),
  createLogin: (id: string, roles: string[]) => api<{ credentials: { email: string; password: string } }>(`/staff/${id}/login`, { method: 'POST', body: { roles } }),
  addQualification: (id: string, body: { degree: string; institution: string; yearCompleted: number | null; grade: string | null }) => api(`/staff/${id}/qualifications`, { method: 'POST', body }),
  removeQualification: (id: string, qid: string) => api(`/staff/${id}/qualifications/${qid}`, { method: 'DELETE' }),
  addExperience: (id: string, body: { organization: string; role: string; startDate: string; endDate: string | null }) => api(`/staff/${id}/experiences`, { method: 'POST', body }),
  removeExperience: (id: string, xid: string) => api(`/staff/${id}/experiences/${xid}`, { method: 'DELETE' }),
  assignTeacher: (body: { sectionId: string; subjectId: string; employeeId: string }) => api('/academics/teacher-assignments', { method: 'POST', body }),
  removeAssignment: (assignmentId: string) => api(`/academics/teacher-assignments/${assignmentId}`, { method: 'DELETE' }),
};
