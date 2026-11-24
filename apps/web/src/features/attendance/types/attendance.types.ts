/** Where a staff check-in was made relative to the campus geofence. */
export type GeoStatus = 'valid' | 'flagged' | 'unknown';
export type ReviewStatus = 'pending' | 'approved' | 'rejected';
/** A student's mark for one class session. */
export type Mark = 'present' | 'absent' | 'late' | 'excused';

export interface StaffRecord {
  id: string;
  date: string;
  checkInAt: string;
  checkOutAt: string | null;
  distanceMeters: number | null;
  accuracyMeters: number | null;
  geofenceStatus: GeoStatus;
  deviceId: string | null;
  biometricVerified?: boolean;
  reviewStatus: ReviewStatus | null;
  reviewNote: string | null;
  employee?: { id: string; firstName: string; lastName: string; employeeNo: string; designation: string; campus: { name: string; code: string } };
}

export interface StaffDay {
  totals: Record<string, number>;
  records: StaffRecord[];
}

export interface MyAttendance {
  today: StaffRecord | null;
  date: string;
  geofenceConfigured: boolean;
  records: StaffRecord[];
  summary: Record<string, number>;
}

export interface CampusGeofence {
  id: string;
  name: string;
  code: string;
  geofences: { centerLatitude: string; centerLongitude: string; radiusMeters: number }[];
}

export interface SectionDaySession {
  id: string;
  subject: string;
  teacher: string;
  status: string;
  startedAt: string;
  counts: Record<string, number>;
}

/** Today's held classes, for the teacher's class picker. */
export interface HeldSlot {
  id: string;
  startTime: string;
  endTime: string;
  subject: { name: string };
  section: { name: string; schoolClass: { name: string } };
  session: { id: string; status: string } | null;
}

export interface Roster {
  session: { id: string; status: string; subject: { name: string }; section: { name: string; schoolClass: { name: string } } };
  students: { id: string; firstName: string; lastName: string; admissionNo: string; rollNo: number | null; mark: { status: Mark } | null }[];
}

export interface StudentAttendanceSummary {
  counts: Record<Mark, number>;
  percentage: number | null;
  recent: { date: string; subject: string; status: Mark; remarks: string | null }[];
}

/** A teacher's own phone, enrolled with its fingerprint / face lock. */
export interface BiometricStatus {
  required: boolean;
  devices: { id: string; label: string | null; status: 'pending' | 'active'; createdAt: string; lastUsedAt: string | null }[];
  /** A cooling period after too many misses: when it ends. */
  coolingUntil: string | null;
  failures: number;
  issues: { id: string; kind: string; message: string | null; status: 'open' | 'resolved'; resolution: string | null; resolutionNote: string | null; createdAt: string; resolvedAt: string | null }[];
}
export type IssueKind = 'fingerprint_failed' | 'cooling' | 'system_error' | 'help';
export interface AttendanceIssue {
  id: string;
  kind: IssueKind;
  message: string | null;
  attempts: number;
  status: 'open' | 'resolved';
  resolution: string | null;
  resolutionNote: string | null;
  resolvedAt: string | null;
  reportedAt: string | null;
  reportNote: string | null;
  createdAt: string;
  employee: { id: string; employeeNo: string; firstName: string; lastName: string; designation: string };
  recentTries: { purpose: string; outcome: string; reason: string | null; createdAt: string }[];
}
export interface PhoneRow {
  id: string;
  label: string | null;
  status: 'pending' | 'active';
  createdAt: string;
  approvedAt: string | null;
  lastUsedAt: string | null;
  employee: { id: string; employeeNo: string; firstName: string; lastName: string; designation: string };
}
