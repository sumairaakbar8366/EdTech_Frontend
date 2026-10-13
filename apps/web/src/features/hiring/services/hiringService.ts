import type { ApplicationDetail, ApplicationRow, ApplicationStatus, JobApplication, JobPost } from '@/features/hiring/types/hiring.types';
import type { StaffType } from '@/features/staff/types/staff.types';
import type { ApiCredentials } from '@/features/users/users';
import { api } from '@/services/api/http';

export interface JobPostPayload {
  campusId: string;
  title: string;
  department: string | null;
  description: string | null;
  openings: number;
  status: JobPost['status'];
  closingDate: string | null;
}

/** Hiring API (page 6: vacancy → applicants → interview → selection → hire). */
export const hiringService = {
  posts: () => api<JobPost[]>('/hiring/posts'),
  summary: () => api<{ openPosts: number; inPipeline: number; interviewsUpcoming: number }>('/hiring/summary'),
  createPost: (body: JobPostPayload & { staffType: StaffType }) => api<JobPost>('/hiring/posts', { method: 'POST', body }),
  updatePost: (id: string, body: JobPostPayload) => api<JobPost>(`/hiring/posts/${id}`, { method: 'PATCH', body }),
  applications: (postId: string) => api<{ post: JobPost; applications: JobApplication[] }>(`/hiring/posts/${postId}/applications`),
  addApplicant: (postId: string, body: Record<string, string | number | null>) => api<JobApplication>(`/hiring/posts/${postId}/applications`, { method: 'POST', body }),
  /** The applicants table (all posts or one), newest change first. */
  allApplications: (q: { postId?: string; status?: ApplicationStatus | ''; q?: string; page: number }) => {
    const p = new URLSearchParams({ page: String(q.page) });
    if (q.postId) p.set('postId', q.postId);
    if (q.status) p.set('status', q.status);
    if (q.q?.trim()) p.set('q', q.q.trim());
    return api<{ items: ApplicationRow[]; total: number; page: number; pageSize: number; byStatus: Partial<Record<ApplicationStatus, number>> }>(`/hiring/applications?${p}`);
  },
  application: (id: string) => api<ApplicationDetail>(`/hiring/applications/${id}`),
  move: (applicationId: string, status: ApplicationStatus, note?: string | null) => api(`/hiring/applications/${applicationId}/status`, { method: 'POST', body: { status, note: note ?? null } }),
  scheduleInterview: (applicationId: string, body: { scheduledAt: string; mode: string; interviewer: string }) => api(`/hiring/applications/${applicationId}/interviews`, { method: 'POST', body }),
  recordInterview: (interviewId: string, body: { score: number | null; recommendation: string | null; notes: string | null }) => api(`/hiring/interviews/${interviewId}`, { method: 'PATCH', body }),
  hire: (applicationId: string, body: { joinDate: string; login?: { roles: string[] } }) => api<{ employeeNo: string; credentials: ApiCredentials | null }>(`/hiring/applications/${applicationId}/hire`, { method: 'POST', body }),
};
