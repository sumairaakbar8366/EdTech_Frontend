import type { TeacherAssignment } from '@/features/staff/types/staff.types';
import type { ClassSession, SlotState, TimetableSlot } from '@/features/timetable/types/timetable.types';
import { api } from '@/services/api/http';

export interface MonitorRow extends TimetableSlot {
  session: ClassSession | null;
  state: SlotState;
  startedLateBy: number | null;
}
export interface MonitorData {
  date: string;
  dayOfWeek: number;
  totals: Record<string, number>;
  rows: MonitorRow[];
}
export interface TeacherOption {
  id: string;
  name: string;
  employeeNo: string;
  campus: string;
  sameCampus: boolean;
  onLeave: boolean;
  /** The section's teacher for this subject. */
  assigned: boolean;
  /** Teaches this subject in some section this year. */
  teachesSubject: boolean;
  periodsThatDay: number;
  /** What they already teach at this time, e.g. "Grade 2-B (Maths, 08:00–08:40)". */
  busyWith: string | null;
}
export interface TeacherOptions {
  assignedEmployeeId: string | null;
  sectionBusy: string | null;
  teachers: TeacherOption[];
}
export interface SlotQuery {
  sectionId: string;
  subjectId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  /** When editing a period: leave it out of the clash checks. */
  excludeSlotId?: string;
}

export interface TodaySlot extends TimetableSlot {
  session: ClassSession | null;
}

/** Timetable and class-session API (page 7: Timetable → Start Class → Session → End Class). */
export const timetableService = {
  section: (sectionId: string) => api<TimetableSlot[]>(`/timetable/section?sectionId=${sectionId}`),
  addSlot: (body: { sectionId: string; subjectId: string; employeeId: string; roomId: string | null; dayOfWeek: number; startTime: string; endTime: string }) =>
    api('/timetable/slots', { method: 'POST', body }),
  updateSlot: (id: string, body: { sectionId: string; subjectId: string; employeeId: string; roomId: string | null; dayOfWeek: number; startTime: string; endTime: string }) =>
    api(`/timetable/slots/${id}`, { method: 'PATCH', body }),
  removeSlot: (id: string) => api(`/timetable/slots/${id}`, { method: 'DELETE' }),
  teacherOptions: ({ excludeSlotId, ...q }: SlotQuery) =>
    api<TeacherOptions>(`/timetable/teacher-options?${new URLSearchParams({ ...q, dayOfWeek: String(q.dayOfWeek), ...(excludeSlotId && { excludeSlotId }) })}`),
  sectionAssignments: (sectionId: string) => api<TeacherAssignment[]>(`/academics/teacher-assignments?sectionId=${sectionId}`),
  mine: () => api<{ kind: 'teacher' | 'student'; slots: TimetableSlot[] }>('/timetable/me'),
  children: () => api<{ studentId: string; name: string; slots: TimetableSlot[] }[]>('/timetable/children'),
  monitor: (date: string) => api<MonitorData>(`/class-sessions/monitor?date=${date}`),
  today: () => api<{ date: string; nowMinute: number; slots: TodaySlot[] }>('/class-sessions/today'),
  startClass: (timetableSlotId: string, topic: string | null) => api('/class-sessions/start', { method: 'POST', body: { timetableSlotId, topic } }),
  endClass: (sessionId: string) => api(`/class-sessions/${sessionId}/end`, { method: 'POST' }),
};
