import { type CampusRef } from '@/types/common';

export interface Campus {
  id: string;
  name: string;
  code: string;
  address: string | null;
  phone: string | null;
  isMain: boolean;
  isActive: boolean;
}

// --- Academics ---------------------------------------------------------------------

export interface Term {
  id: string;
  academicYearId: string;
  name: string;
  startDate: string;
  endDate: string;
}

export interface AcademicYear {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  terms: Term[];
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  _count?: { classSubjects: number };
}

export interface Section {
  id: string;
  classId: string;
  campusId: string;
  name: string;
  capacity: number | null;
  campus: CampusRef;
}

export interface SchoolClass {
  id: string;
  name: string;
  level: number;
  sections: Section[];
  classSubjects: { subjectId: string; subject: Subject }[];
}

export interface Room {
  id: string;
  campusId: string;
  name: string;
  capacity: number | null;
  campus: CampusRef;
}

export interface AcademicsSummary {
  currentYear: AcademicYear | null;
  counts: { classes: number; sections: number; subjects: number; rooms: number; campuses: number };
}
