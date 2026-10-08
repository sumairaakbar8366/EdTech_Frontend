import { useQuery } from '@tanstack/react-query';
import { lmsService } from '@/features/lms/services/lmsService';
import { useAction } from '@/lib/hooks/useAction';

export const LMS_KEY = ['lms'] as const;

export const useLmsChildren = () => useQuery({ queryKey: [...LMS_KEY, 'children'], queryFn: lmsService.children });
export const useCourses = (studentId: string | undefined, enabled = true) =>
  useQuery({ queryKey: [...LMS_KEY, 'courses', studentId], queryFn: () => lmsService.courses(studentId), enabled });
export const useCourse = (id: string | undefined, studentId?: string) =>
  useQuery({ queryKey: [...LMS_KEY, 'course', id, studentId], queryFn: () => lmsService.course(id!, studentId), enabled: !!id });
export const useMaterialComments = (materialId: string) => useQuery({ queryKey: [...LMS_KEY, 'comments', materialId], queryFn: () => lmsService.comments(materialId) });
export const useMyAssignments = (studentId: string | undefined, enabled = true) =>
  useQuery({ queryKey: [...LMS_KEY, 'my-assignments', studentId], queryFn: () => lmsService.assignments(studentId), enabled });
export const useAssignment = (id: string | undefined, studentId?: string) =>
  useQuery({ queryKey: [...LMS_KEY, 'assignment', id, studentId], queryFn: () => lmsService.assignment(id!, studentId), enabled: !!id });

/** An LMS write: optional toast, then refresh every LMS query. */
export function useLmsAction<TVars, TResult = unknown>(
  fn: (v: TVars) => Promise<TResult>,
  options: { success?: string | ((r: TResult) => string); onDone?: (r: TResult) => void; toastErrors?: boolean } = {},
) {
  return useAction(fn, { ...options, invalidate: [LMS_KEY] });
}
