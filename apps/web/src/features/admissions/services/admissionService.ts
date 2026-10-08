import type { AdmissionApplication, AdmissionStatus } from '@/features/admissions/types/admission.types';
import { api } from '@/services/api/http';
import type { Gender, Paged, Relation } from '@/types/common';

export interface ApplicationPayload {
  classId: string;
  campusId: string;
  firstName: string;
  lastName: string;
  gender: Gender | null;
  dateOfBirth: string;
  previousSchool: string | null;
  guardianFirstName: string;
  guardianLastName: string;
  guardianRelation: Relation;
  guardianPhone: string;
  guardianEmail: string | null;
  address: string | null;
  notes: string | null;
}

export interface EnrollPayload {
  sectionId: string;
  rollNo: number | null;
  admissionDate: string;
  /** The server generates the logins and returns the temporary passwords once. */
  createParentLogin?: boolean;
  createStudentLogin?: boolean;
}

export interface GeneratedLogin {
  who: 'parent' | 'student';
  name: string;
  email: string;
  password: string;
}

/** Admissions API (page 5: application → documents → interview → decision → enrollment). */
export const admissionService = {
  list: (q: { page: number; pageSize: number; q?: string; status?: AdmissionStatus | '' }) => {
    const p = new URLSearchParams({ page: String(q.page), pageSize: String(q.pageSize) });
    if (q.q) p.set('q', q.q);
    if (q.status) p.set('status', q.status);
    return api<Paged<AdmissionApplication>>(`/admissions?${p}`);
  },
  summary: () => api<Partial<Record<AdmissionStatus, number>>>('/admissions/summary'),
  get: (id: string) => api<AdmissionApplication>(`/admissions/${id}`),
  create: (body: ApplicationPayload) => api<AdmissionApplication>('/admissions', { method: 'POST', body }),
  update: (id: string, body: ApplicationPayload & { academicYearId: string }) => api<AdmissionApplication>(`/admissions/${id}`, { method: 'PATCH', body }),
  move: (id: string, status: AdmissionStatus, note: string | null) => api(`/admissions/${id}/status`, { method: 'POST', body: { status, note } }),
  schedule: (id: string, body: { kind: string; scheduledAt: string; conductedBy: string }) => api(`/admissions/${id}/assessments`, { method: 'POST', body }),
  recordResult: (assessmentId: string, body: { score: number | null; result: string; notes: string | null }) => api(`/admissions/assessments/${assessmentId}`, { method: 'PATCH', body }),
  enroll: (id: string, body: EnrollPayload) => api<{ studentId: string; admissionNo: string; credentials: GeneratedLogin[] }>(`/admissions/${id}/enroll`, { method: 'POST', body }),
};
