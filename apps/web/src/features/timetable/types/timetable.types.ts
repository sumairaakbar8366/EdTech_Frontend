// --- Timetable & class sessions ------------------------------------------------------

export interface TimetableSlot {
  id: string;
  academicYearId: string;
  sectionId: string;
  subjectId: string;
  employeeId: string;
  roomId: string | null;
  dayOfWeek: number;
  startMinute: number;
  endMinute: number;
  startTime: string;
  endTime: string;
  subject: { id: string; name: string; code: string };
  employee: { id: string; firstName: string; lastName: string; employeeNo: string };
  room: { id: string; name: string } | null;
  section: { id: string; name: string; schoolClass: { id: string; name: string; level: number }; campus: { id: string; code: string } };
}

export interface ClassSession {
  id: string;
  timetableSlotId: string | null;
  sessionDate: string;
  startedAt: string;
  endedAt: string | null;
  status: 'live' | 'completed' | 'cancelled';
  topic: string | null;
}

export type SlotState = 'scheduled' | 'live' | 'completed' | 'missed' | 'cancelled';
