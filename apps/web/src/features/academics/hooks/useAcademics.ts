import { useQuery } from '@tanstack/react-query';
import { academicsService } from '@/features/academics/services/academicsService';
import { useAction } from '@/lib/hooks/useAction';

/** Every academics query lives under this key, so one invalidation refreshes lists and the dashboard. */
export const ACADEMICS_KEY = ['academics'] as const;

export const useAcademicsSummary = (enabled = true) => useQuery({ queryKey: [...ACADEMICS_KEY, 'summary'], queryFn: academicsService.summary, enabled });
export const useAcademicYears = (enabled = true) => useQuery({ queryKey: [...ACADEMICS_KEY, 'years'], queryFn: academicsService.years, enabled });
export const useClasses = (enabled = true) => useQuery({ queryKey: [...ACADEMICS_KEY, 'classes'], queryFn: academicsService.classes, enabled });
export const useSubjects = (enabled = true) => useQuery({ queryKey: [...ACADEMICS_KEY, 'subjects'], queryFn: academicsService.subjects, enabled });
export const useRooms = (enabled = true) => useQuery({ queryKey: [...ACADEMICS_KEY, 'rooms'], queryFn: academicsService.rooms, enabled });

/** The current academic year, or undefined when none is set. */
export function useCurrentYear(enabled = true) {
  const years = useAcademicYears(enabled);
  return { ...years, data: years.data?.find((y) => y.isCurrent) };
}

/** An academics write with a success toast and a refresh of every academics query. */
export function useAcademicsAction<TVars>(fn: (vars: TVars) => Promise<unknown>, success: string, onDone?: () => void) {
  return useAction(fn, { success, invalidate: [ACADEMICS_KEY], onDone });
}
