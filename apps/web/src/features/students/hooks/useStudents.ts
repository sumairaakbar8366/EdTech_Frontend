import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { studentService, type StudentListQuery } from '@/features/students/services/studentService';
import { useAction } from '@/lib/hooks/useAction';

export const STUDENTS_KEY = ['students'] as const;

export const useStudentList = (q: StudentListQuery) =>
  useQuery({ queryKey: [...STUDENTS_KEY, 'list', q], queryFn: () => studentService.list(q), placeholderData: keepPreviousData });
export const useStudentSummary = (enabled = true) => useQuery({ queryKey: [...STUDENTS_KEY, 'summary'], queryFn: studentService.summary, enabled });
export const useChildrenOverview = () => useQuery({ queryKey: [...STUDENTS_KEY, 'my-children', 'overview'], queryFn: studentService.childrenOverview });
export const useMyChildren = (enabled = true) => useQuery({ queryKey: [...STUDENTS_KEY, 'my-children'], queryFn: studentService.myChildren, enabled });

/** Detail by mode: an admin's view of any student, the student's own record, or a parent's child. */
export function useStudentDetail(mode: 'admin' | 'own' | 'child', id?: string, enabled = true) {
  const path = mode === 'own' ? '/students/me' : mode === 'child' ? `/students/my-children/${id}` : `/students/${id}`;
  return useQuery({ queryKey: [...STUDENTS_KEY, 'detail', path], queryFn: () => studentService.detail(path), retry: false, enabled });
}

export function useGuardianSearch(q: string, enabled: boolean) {
  return useQuery({ queryKey: [...STUDENTS_KEY, 'guardians', q], queryFn: () => studentService.searchGuardians(q), enabled: enabled && q.trim().length >= 2 });
}

export function usePromotionCandidates(academicYearId: string, sectionId: string) {
  return useQuery({
    queryKey: [...STUDENTS_KEY, 'promote', academicYearId, sectionId],
    queryFn: () => studentService.promotionCandidates(academicYearId, sectionId),
    enabled: !!academicYearId && !!sectionId,
  });
}

/** A student write: toast, then refresh students, admissions and academics counts. */
export function useStudentsAction<TVars, TResult = unknown>(fn: (vars: TVars) => Promise<TResult>, success: string, onDone?: (r: TResult) => void) {
  return useAction(fn, { success, invalidate: [STUDENTS_KEY, ['admissions'], ['academics']], onDone });
}
