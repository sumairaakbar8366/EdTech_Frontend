import type { AssignmentDetail, AssignmentSummary, ChildRef, Comment, CourseDetail, CourseSummary, Material } from '@/features/lms/types/lms.types';
import { studentQuery } from '@/features/lms/utils/lms.utils';
import { api, blobUrl, download, upload } from '@/services/api/http';

/** LMS API (page 10: courses → material + discussion, assignments → submission → grade). */
export const lmsService = {
  children: () => api<ChildRef[]>('/lms/children'),
  courses: (studentId?: string) => api<CourseSummary[]>(`/lms/courses${studentQuery(studentId)}`),
  course: (id: string, studentId?: string) => api<CourseDetail>(`/lms/courses/${id}${studentQuery(studentId)}`),

  /** Posts a file (`file`) or a link (`url`) as course material. */
  addMaterial: (courseId: string, m: { title: string; description: string; url?: string; file?: File | null }) => {
    const form = new FormData();
    form.set('title', m.title);
    if (m.description) form.set('description', m.description);
    if (m.url) form.set('url', m.url);
    else if (m.file) form.set('file', m.file);
    return upload(`/lms/courses/${courseId}/materials`, form);
  },
  togglePublish: (m: Material) => api(`/lms/materials/${m.id}`, { method: 'PATCH', body: { title: m.title, description: m.description, isPublished: !m.isPublished } }),
  deleteMaterial: (id: string) => api(`/lms/materials/${id}`, { method: 'DELETE' }),
  materialPreview: (id: string) => blobUrl(`/lms/materials/${id}/file`),
  downloadMaterial: (m: Pick<Material, 'id' | 'fileName'>) => download(`/lms/materials/${m.id}/file`, m.fileName ?? 'material'),

  comments: (materialId: string) => api<Comment[]>(`/lms/materials/${materialId}/comments`),
  postComment: (materialId: string, body: string, parentCommentId?: string) => api(`/lms/materials/${materialId}/comments`, { method: 'POST', body: { body, parentCommentId } }),
  togglePin: (c: Pick<Comment, 'id' | 'isPinned'>) => api(`/lms/comments/${c.id}/pin`, { method: c.isPinned ? 'DELETE' : 'PUT' }),
  deleteComment: (id: string) => api(`/lms/comments/${id}`, { method: 'DELETE' }),

  assignments: (studentId?: string) => api<AssignmentSummary[]>(`/lms/assignments${studentQuery(studentId)}`),
  assignment: (id: string, studentId?: string) => api<AssignmentDetail>(`/lms/assignments/${id}${studentQuery(studentId)}`),
  addAssignment: (courseId: string, a: { title: string; instructions: string; dueAt: string; maxMarks: string; mode: string; allowLate: boolean; file: File | null }) => {
    const data = new FormData();
    data.set('title', a.title);
    data.set('instructions', a.instructions);
    data.set('dueAt', new Date(a.dueAt).toISOString());
    data.set('maxMarks', a.maxMarks);
    data.set('mode', a.mode);
    data.set('allowLate', String(a.allowLate));
    if (a.file) data.set('file', a.file);
    return upload<{ id: string }>(`/lms/courses/${courseId}/assignments`, data);
  },
  downloadAssignment: (a: Pick<AssignmentDetail, 'id' | 'fileName'>) => download(`/lms/assignments/${a.id}/file`, a.fileName ?? 'assignment'),

  submit: (assignmentId: string, text: string, file: File | null) => {
    const form = new FormData();
    if (text.trim()) form.set('text', text);
    if (file) form.set('file', file);
    return upload(`/lms/assignments/${assignmentId}/submit`, form);
  },
  downloadSubmission: (s: { id: string; fileName: string | null }) => download(`/lms/submissions/${s.id}/file`, s.fileName ?? 'submission'),
  grade: (submissionId: string, marks: string, feedback: string | null) => api(`/lms/submissions/${submissionId}/grade`, { method: 'PUT', body: { marks, feedback } }),
};
