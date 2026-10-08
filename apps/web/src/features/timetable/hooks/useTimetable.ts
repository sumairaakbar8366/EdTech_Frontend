import { useQuery } from '@tanstack/react-query';
import { timetableService, type SlotQuery } from '@/features/timetable/services/timetableService';
import { useAction } from '@/lib/hooks/useAction';

export const TIMETABLE_KEY = ['timetable'] as const;

export const useSectionTimetable = (sectionId: string) =>
  useQuery({ queryKey: [...TIMETABLE_KEY, 'section', sectionId], queryFn: () => timetableService.section(sectionId), enabled: !!sectionId });
export const useSectionAssignments = (sectionId: string, enabled: boolean) =>
  useQuery({ queryKey: ['academics', 'assignments', sectionId], queryFn: () => timetableService.sectionAssignments(sectionId), enabled });
/** Teachers for a period with their availability; only once the subject and a valid time are set. */
export const useTeacherOptions = (q: SlotQuery, enabled: boolean) =>
  useQuery({ queryKey: [...TIMETABLE_KEY, 'teacher-options', q], queryFn: () => timetableService.teacherOptions(q), enabled, staleTime: 0 });
export const useMyTimetable = (enabled = true) => useQuery({ queryKey: [...TIMETABLE_KEY, 'me'], queryFn: timetableService.mine, enabled });
export const useChildrenTimetable = () => useQuery({ queryKey: [...TIMETABLE_KEY, 'children'], queryFn: timetableService.children });
/** Live monitor; refreshes every 30 s. */
export const useClassMonitor = (date: string) =>
  useQuery({ queryKey: [...TIMETABLE_KEY, 'monitor', date], queryFn: () => timetableService.monitor(date), refetchInterval: 30_000 });
/** The teacher's classes today; refreshes every minute. */
export const useTodaysClasses = () => useQuery({ queryKey: [...TIMETABLE_KEY, 'today'], queryFn: timetableService.today, refetchInterval: 60_000 });

export function useTimetableAction<T>(fn: (v: T) => Promise<unknown>, success: string, onDone?: () => void) {
  return useAction(fn, { success, invalidate: [TIMETABLE_KEY], onDone });
}
