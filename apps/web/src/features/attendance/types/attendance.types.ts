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
