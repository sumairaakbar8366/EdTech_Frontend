import type { AttendanceIssue, BiometricStatus, CampusGeofence, PhoneRow, HeldSlot, Mark, MyAttendance, Roster, SectionDaySession, StaffDay, StaffRecord, StudentAttendanceSummary } from '@/features/attendance/types/attendance.types';
import { api } from '@/services/api/http';

export interface BiometricProof { challengeId: string; response: unknown }

/** Attendance API (page 7: class attendance; staff GPS check-in with geofences). */
export const attendanceService = {
  // Staff check-ins
  staffDay: (date: string) => api<StaffDay>(`/staff-attendance?date=${date}`),
  reviewQueue: () => api<StaffDay>('/staff-attendance?reviewStatus=pending'),
  review: (id: string, decision: 'approved' | 'rejected', note: string | null) => api(`/staff-attendance/${id}/review`, { method: 'POST', body: { decision, note } }),
  mine: (month: string) => api<MyAttendance>(`/staff-attendance/me?month=${month}`),
  checkIn: (body: { latitude?: number; longitude?: number; accuracyMeters?: number; deviceId: string; biometric?: BiometricProof }) => api<StaffRecord>('/staff-attendance/check-in', { method: 'POST', body }),
  checkOut: (biometric?: BiometricProof) => api('/staff-attendance/check-out', { method: 'POST', body: biometric ? { biometric } : {} }),

  // The phone's fingerprint / face lock (WebAuthn)
  biometricStatus: () => api<BiometricStatus>('/staff-attendance/biometric/status'),
  registerOptions: () => api<{ challengeId: string; options: unknown }>('/staff-attendance/biometric/register/options', { method: 'POST' }),
  registerPhone: (body: { challengeId: string; response: unknown; label?: string }) => api('/staff-attendance/biometric/register', { method: 'POST', body }),
  authOptions: () => api<{ challengeId: string; options: unknown }>('/staff-attendance/biometric/options', { method: 'POST' }),
  // The same check from the phone app (a key behind the phone's lock instead of a browser passkey)
  registerApp: (body: { publicKey: string; label?: string }) => api('/staff-attendance/biometric/app/register', { method: 'POST', body }),
  appChallenge: () => api<{ challengeId: string; challenge: string; credentialId: string }>('/staff-attendance/biometric/app/challenge', { method: 'POST' }),
  reportAttempt: (body: { purpose: 'check_in' | 'check_out' | 'register'; outcome: 'failed' | 'error'; reason?: string }) => api<{ failures: number; coolingUntil: string | null }>('/staff-attendance/biometric/attempt', { method: 'POST', body }),
  askForHelp: (message: string) => api('/staff-attendance/help', { method: 'POST', body: { message } }),
  issues: (status?: 'open' | 'resolved') => api<AttendanceIssue[]>(`/staff-attendance/issues${status ? `?status=${status}` : ''}`),
  issueCount: () => api<{ open: number }>('/staff-attendance/issues/count'),
  resolveIssue: (id: string, body: { action: 'manual' | 'reset_phone' | 'dismiss'; note?: string; checkIn?: string; checkOut?: string; date?: string }) => api(`/staff-attendance/issues/${id}/resolve`, { method: 'POST', body }),
  reportIssue: (id: string, note?: string) => api(`/staff-attendance/issues/${id}/report`, { method: 'POST', body: note ? { note } : {} }),
  markByHand: (body: { employeeId: string; date?: string; checkIn: string; checkOut?: string; reason: string }) => api('/staff-attendance/manual', { method: 'POST', body }),
  phones: () => api<PhoneRow[]>('/staff-attendance/biometric/devices'),
  approvePhone: (id: string) => api(`/staff-attendance/biometric/devices/${id}/approve`, { method: 'POST' }),
  resetPhone: (id: string) => api(`/staff-attendance/biometric/devices/${id}/reset`, { method: 'POST' }),
  geofences: () => api<CampusGeofence[]>('/staff-attendance/geofences'),
  setGeofence: (campusId: string, body: { centerLatitude: number; centerLongitude: number; radiusMeters: number }) => api(`/staff-attendance/geofences/${campusId}`, { method: 'PUT', body }),

  // Student attendance
  sectionDay: (sectionId: string, date: string) => api<{ sessions: SectionDaySession[] }>(`/attendance/sections/day?sectionId=${sectionId}&date=${date}`),
  heldToday: () => api<{ slots: HeldSlot[] }>('/class-sessions/today'),
  roster: (sessionId: string) => api<Roster>(`/attendance/sessions/${sessionId}`),
  mark: (sessionId: string, records: { studentId: string; status: Mark }[]) => api(`/attendance/sessions/${sessionId}`, { method: 'POST', body: { records } }),
  studentSummary: (studentId: string) => api<StudentAttendanceSummary>(`/attendance/students/${studentId}/summary`),
};
