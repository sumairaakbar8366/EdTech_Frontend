import type { CampusGeofence, HeldSlot, Mark, MyAttendance, Roster, SectionDaySession, StaffDay, StaffRecord, StudentAttendanceSummary } from '@/features/attendance/types/attendance.types';
import { api } from '@/services/api/http';

/** Attendance API (page 7: class attendance; staff GPS check-in with geofences). */
export const attendanceService = {
  // Staff check-ins
  staffDay: (date: string) => api<StaffDay>(`/staff-attendance?date=${date}`),
  reviewQueue: () => api<StaffDay>('/staff-attendance?reviewStatus=pending'),
  review: (id: string, decision: 'approved' | 'rejected', note: string | null) => api(`/staff-attendance/${id}/review`, { method: 'POST', body: { decision, note } }),
  mine: (month: string) => api<MyAttendance>(`/staff-attendance/me?month=${month}`),
  checkIn: (body: { latitude?: number; longitude?: number; accuracyMeters?: number; deviceId: string }) => api<StaffRecord>('/staff-attendance/check-in', { method: 'POST', body }),
  checkOut: () => api('/staff-attendance/check-out', { method: 'POST' }),
  geofences: () => api<CampusGeofence[]>('/staff-attendance/geofences'),
  setGeofence: (campusId: string, body: { centerLatitude: number; centerLongitude: number; radiusMeters: number }) => api(`/staff-attendance/geofences/${campusId}`, { method: 'PUT', body }),

  // Student attendance
  sectionDay: (sectionId: string, date: string) => api<{ sessions: SectionDaySession[] }>(`/attendance/sections/day?sectionId=${sectionId}&date=${date}`),
  heldToday: () => api<{ slots: HeldSlot[] }>('/class-sessions/today'),
  roster: (sessionId: string) => api<Roster>(`/attendance/sessions/${sessionId}`),
  mark: (sessionId: string, records: { studentId: string; status: Mark }[]) => api(`/attendance/sessions/${sessionId}`, { method: 'POST', body: { records } }),
  studentSummary: (studentId: string) => api<StudentAttendanceSummary>(`/attendance/students/${studentId}/summary`),
};
