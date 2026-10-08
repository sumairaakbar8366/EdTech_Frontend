import type { Band, ExamAction, ExamDetail, ExamSummary, MarkEntry, Marksheet, MyReportCard, PaperInput, ProgressRow, ReportCardRow, ReportCardView } from '@/features/exams/types/exam.types';
import { api } from '@/services/api/http';

/** Exams API (page 10: exam → papers → marks → report cards → publish). */
export const examService = {
  list: () => api<ExamSummary[]>('/exams'),
  get: (id: string) => api<ExamDetail>(`/exams/${id}`),
  save: (id: string | undefined, body: { name: string; termId: string | null; startDate: string; endDate: string }) =>
    id ? api<unknown>(`/exams/${id}`, { method: 'PUT', body }) : api<{ id: string }>('/exams', { method: 'POST', body }),
  remove: (id: string) => api(`/exams/${id}`, { method: 'DELETE' }),
  /** Generate report cards, publish or unpublish results. */
  act: (id: string, action: ExamAction) => api<{ generated?: number }>(`/exams/${id}/${action}`, { method: 'POST' }),

  gradingScale: () => api<{ bands: Band[] }>('/exams/grading-scale'),
  saveGradingScale: (bands: Band[]) => api('/exams/grading-scale', { method: 'PUT', body: { bands } }),

  savePapers: (examId: string, classId: string, papers: PaperInput[]) => api(`/exams/${examId}/classes/${classId}/papers`, { method: 'PUT', body: { papers } }),
  progress: (examId: string) => api<ProgressRow[]>(`/exams/${examId}/progress`),
  marksheet: (examId: string, sectionId: string, subjectId: string) => api<Marksheet>(`/exams/${examId}/marksheet?sectionId=${sectionId}&subjectId=${subjectId}`),
  saveMarks: (examId: string, body: { sectionId: string; subjectId: string; entries: MarkEntry[] }) => api<{ saved: number }>(`/exams/${examId}/marksheet`, { method: 'PUT', body }),

  reportCards: (examId: string) => api<ReportCardRow[]>(`/exams/${examId}/report-cards`),
  reportCard: (id: string) => api<ReportCardView>(`/exams/report-cards/${id}`),
  saveRemarks: (id: string, remarks: string | null) => api(`/exams/report-cards/${id}`, { method: 'PATCH', body: { remarks } }),
  children: () => api<{ id: string; firstName: string; lastName: string }[]>('/exams/report-cards/children'),
  myReportCards: (studentId?: string) => api<MyReportCard[]>(`/exams/report-cards/mine${studentId ? `?studentId=${studentId}` : ''}`),
};
