import { useQuery } from '@tanstack/react-query';
import { attendanceService } from '@/features/attendance/services/attendanceService';
import { useAction } from '@/lib/hooks/useAction';

export const ATTENDANCE_KEY = ['attendance'] as const;

/** One day's check-ins, or the pending-review queue. */
export const useStaffCheckins = (date: string, queue: boolean) =>
  useQuery({ queryKey: [...ATTENDANCE_KEY, 'staff', queue ? 'queue' : date], queryFn: () => (queue ? attendanceService.reviewQueue() : attendanceService.staffDay(date)) });
export const useMyAttendance = (month: string) => useQuery({ queryKey: [...ATTENDANCE_KEY, 'me', month], queryFn: () => attendanceService.mine(month) });
export const useGeofences = () => useQuery({ queryKey: [...ATTENDANCE_KEY, 'geofences'], queryFn: attendanceService.geofences });
export const useSectionDay = (sectionId: string, date: string) =>
  useQuery({ queryKey: [...ATTENDANCE_KEY, 'section-day', sectionId, date], queryFn: () => attendanceService.sectionDay(sectionId, date), enabled: !!sectionId });
export const useHeldToday = () => useQuery({ queryKey: ['timetable', 'today'], queryFn: attendanceService.heldToday });
export const useRoster = (sessionId: string) => useQuery({ queryKey: [...ATTENDANCE_KEY, 'roster', sessionId], queryFn: () => attendanceService.roster(sessionId), enabled: !!sessionId });
export const useStudentAttendance = (studentId: string) =>
  useQuery({ queryKey: [...ATTENDANCE_KEY, 'student', studentId], queryFn: () => attendanceService.studentSummary(studentId), enabled: !!studentId });

export function useAttendanceAction<T>(fn: (v: T) => Promise<unknown>, success: string, onDone?: () => void) {
  return useAction(fn, { success, invalidate: [ATTENDANCE_KEY], onDone });
}
