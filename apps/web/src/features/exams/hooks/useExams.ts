import { useQuery } from '@tanstack/react-query';
import { examService } from '@/features/exams/services/examService';
import { useAction } from '@/lib/hooks/useAction';

export const EXAMS_KEY = ['exams'] as const;

export const useExams = () => useQuery({ queryKey: [...EXAMS_KEY, 'list'], queryFn: examService.list });
export const useExam = (id: string | undefined) => useQuery({ queryKey: [...EXAMS_KEY, 'exam', id], queryFn: () => examService.get(id!), enabled: !!id });
export const useGradingScale = (enabled = true) => useQuery({ queryKey: [...EXAMS_KEY, 'scale'], queryFn: examService.gradingScale, enabled });
export const useMarksProgress = (examId: string) => useQuery({ queryKey: [...EXAMS_KEY, 'progress', examId], queryFn: () => examService.progress(examId) });
export const useMarksheet = (examId: string | undefined, sectionId: string, subjectId: string) =>
  useQuery({ queryKey: [...EXAMS_KEY, 'sheet', examId, sectionId, subjectId], queryFn: () => examService.marksheet(examId!, sectionId, subjectId), enabled: !!examId });
export const useReportCards = (examId: string) => useQuery({ queryKey: [...EXAMS_KEY, 'cards', examId], queryFn: () => examService.reportCards(examId) });
export const useReportCard = (id: string | null) => useQuery({ queryKey: [...EXAMS_KEY, 'card', id], queryFn: () => examService.reportCard(id!), enabled: !!id });
export const useResultChildren = () => useQuery({ queryKey: [...EXAMS_KEY, 'children'], queryFn: examService.children });
export const useMyReportCards = (studentId: string | undefined, enabled = true) =>
  useQuery({ queryKey: [...EXAMS_KEY, 'mine', studentId], queryFn: () => examService.myReportCards(studentId), enabled });

/** An exams write: optional toast, then refresh every exams query. */
export function useExamsAction<TVars, TResult = unknown>(
  fn: (v: TVars) => Promise<TResult>,
  options: { success?: string | ((r: TResult) => string); onDone?: (r: TResult) => void; toastErrors?: boolean } = {},
) {
  return useAction(fn, { ...options, invalidate: [EXAMS_KEY] });
}
