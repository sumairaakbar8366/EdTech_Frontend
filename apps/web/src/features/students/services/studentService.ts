import type { Child, CreateStudentPayload, GuardianHit, PromotionCandidate, UpdateStudentPayload } from '@/features/students/types/student.types';
import type { StudentDetail, StudentListItem, StudentStatus, StudentSummary } from '@/features/students/types/student.types';
import { api } from '@/services/api/http';
import type { Paged, Relation } from '@/types/common';

export interface StudentListQuery {
  page: number;
  pageSize: number;
  q?: string;
  classId?: string;
  sectionId?: string;
  status?: StudentStatus | '';
}

function toParams(q: StudentListQuery): URLSearchParams {
  const p = new URLSearchParams({ page: String(q.page), pageSize: String(q.pageSize) });
  if (q.q) p.set('q', q.q);
  if (q.classId) p.set('classId', q.classId);
  if (q.sectionId) p.set('sectionId', q.sectionId);
  if (q.status) p.set('status', q.status);
  return p;
}

/** Students & guardians API (page 5: student lifecycle). */
export const studentService = {
  list: (q: StudentListQuery) => api<Paged<StudentListItem>>(`/students?${toParams(q)}`),
  summary: () => api<StudentSummary>('/students/summary'),
  /** Admin view (`/students/:id`), the student's own record, or a parent's child. */
  detail: (path: string) => api<StudentDetail>(path),
  create: (body: CreateStudentPayload) => api<{ id: string }>('/students', { method: 'POST', body }),
  update: (id: string, body: UpdateStudentPayload) => api(`/students/${id}`, { method: 'PATCH', body }),
  setStatus: (id: string, status: StudentStatus) => api(`/students/${id}/status`, { method: 'POST', body: { status } }),
  enroll: (id: string, body: { sectionId: string; rollNo: number | null }) => api(`/students/${id}/enrollment`, { method: 'POST', body }),
  createLogin: (id: string, body: { email: string; password: string }) => api(`/students/${id}/login`, { method: 'POST', body }),

  addEmergencyContact: (id: string, body: { name: string; relationship: string; phone: string }) => api(`/students/${id}/emergency-contacts`, { method: 'POST', body }),
  removeEmergencyContact: (id: string, contactId: string) => api(`/students/${id}/emergency-contacts/${contactId}`, { method: 'DELETE' }),
  addPreviousSchool: (id: string, body: { schoolName: string; lastClass: string | null }) => api(`/students/${id}/previous-schools`, { method: 'POST', body }),
  removePreviousSchool: (id: string, schoolId: string) => api(`/students/${id}/previous-schools/${schoolId}`, { method: 'DELETE' }),

  addGuardian: (id: string, body: { details: { firstName: string; lastName: string; phone: string; email: string | null; occupation: string | null }; relationship: Relation; isPrimary: boolean }) =>
    api(`/students/${id}/guardians`, { method: 'POST', body }),
  setPrimaryGuardian: (id: string, guardianId: string) => api(`/students/${id}/guardians/${guardianId}/primary`, { method: 'POST' }),
  unlinkGuardian: (id: string, guardianId: string) => api(`/students/${id}/guardians/${guardianId}`, { method: 'DELETE' }),
  createGuardianLogin: (guardianId: string, password: string) => api(`/guardians/${guardianId}/login`, { method: 'POST', body: { password } }),
  searchGuardians: (q: string) => api<GuardianHit[]>(`/guardians?q=${encodeURIComponent(q)}`),
  /** Parents with exactly this phone number, whatever its formatting (sibling linking). */
  guardiansByPhone: (phone: string) => api<GuardianHit[]>(`/guardians?phone=${encodeURIComponent(phone)}`),

  promotionCandidates: (academicYearId: string, sectionId: string) => api<PromotionCandidate[]>(`/students/promotion-candidates?academicYearId=${academicYearId}&sectionId=${sectionId}`),
  promote: (body: { fromAcademicYearId: string; fromSectionId: string; toAcademicYearId: string; toSectionId: string; studentIds: string[] }) =>
    api<{ promoted: number; toAcademicYear: string }>('/students/promote', { method: 'POST', body }),

  myChildren: () => api<Child[]>('/students/my-children'),
};

export interface TaughtSection {
  sectionId: string;
  name: string;
  subjects: string[];
  students: { id: string; firstName: string; lastName: string; admissionNo: string; rollNo: number | null; attendanceRate: number | null }[];
}

/** Teacher "My Students": sections taught this year with each student's attendance rate. */
export const taughtStudents = () => api<TaughtSection[]>('/students/taught');
