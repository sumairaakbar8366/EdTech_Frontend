import type { FormAnswer } from '@/features/website/admissionForm';
import { type Gender, type Relation, type SectionRef } from '@/types/common';

// --- Students, guardians, admissions -----------------------------------------------

export type StudentStatus = 'active' | 'inactive' | 'graduated' | 'withdrawn';

export interface StudentListItem {
  /** Profile picture (GET /photos/<key>). */
  photoKey?: string | null;
  id: string;
  admissionNo: string;
  firstName: string;
  lastName: string;
  gender: Gender | null;
  dateOfBirth: string;
  status: StudentStatus;
  userId: string | null;
  enrollments: { rollNo: number | null; status: string; section: SectionRef }[];
  guardians: { relationship: Relation; guardian: { firstName: string; lastName: string; phone: string } }[];
}

export interface GuardianRecord {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string | null;
  occupation: string | null;
  nationalId: string | null;
  address: string | null;
  userId: string | null;
  user: { id: string; email: string; status: string } | null;
  _count: { children: number };
}

export interface StudentDetail {
  /** Profile picture (GET /photos/<key>). */
  photoKey?: string | null;
  id: string;
  admissionNo: string;
  firstName: string;
  lastName: string;
  gender: Gender | null;
  dateOfBirth: string;
  admissionDate: string;
  status: StudentStatus;
  user: { id: string; email: string; status: string; lastLoginAt: string | null } | null;
  profile: { bloodGroup: string | null; nationalId: string | null; religion: string | null; nationality: string | null; address: string | null } | null;
  medical: { allergies: string | null; conditions: string | null; medications: string | null; doctorName: string | null; doctorPhone: string | null; notes: string | null } | null;
  emergencyContacts: { id: string; name: string; relationship: string; phone: string }[];
  previousSchools: { id: string; schoolName: string; lastClass: string | null; leftOn: string | null; reason: string | null }[];
  guardians: { guardianId: string; relationship: Relation; isPrimary: boolean; guardian: GuardianRecord }[];
  enrollments: {
    id: string;
    rollNo: number | null;
    status: 'enrolled' | 'promoted' | 'completed' | 'withdrawn';
    enrolledOn: string;
    endedOn: string | null;
    academicYear: { id: string; name: string; isCurrent: boolean };
    section: SectionRef;
  }[];
  admissionApplication: { id: string; applicationNo: string; source?: 'office' | 'website'; createdAt?: string; formAnswers?: FormAnswer[] } | null;
}

export interface StudentSummary {
  active: number;
  enrolled: number;
  notEnrolled: number;
  female: number;
  male: number;
  withParentLogin: number;
}

/** A parent's child card (GET /students/my-children). */
export interface Child {
  /** Profile picture (GET /photos/<key>). */
  photoKey?: string | null;
  id: string;
  admissionNo: string;
  firstName: string;
  lastName: string;
  status: StudentStatus;
  relationship: Relation;
  enrollments: { rollNo: number | null; section: SectionRef }[];
}

/** Guardian search result when adding a sibling. */
export interface GuardianHit {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string | null;
  _count: { children: number };
}

export interface PromotionCandidate {
  id: string;
  firstName: string;
  lastName: string;
  rollNo: number | null;
}

type Nullable = string | null;

export interface CreateStudentPayload {
  /** Picture uploaded first (POST /photos/upload). */
  photoId?: string;
  admissionNo?: string;
  firstName: string;
  lastName: string;
  gender: Gender | null;
  dateOfBirth: string;
  admissionDate: string;
  profile: { bloodGroup: Nullable; nationalId: Nullable; address: Nullable };
  medical?: { allergies: string };
  guardians: (
    | { guardianId: string; relationship: Relation; isPrimary: true }
    | { details: { firstName: string; lastName: string; phone: string; email: Nullable; occupation: Nullable }; relationship: Relation; isPrimary: true; login?: Record<string, never> }
  )[];
  enrollment?: { sectionId: string; rollNo: number | null };
  login?: { email?: string };
}

export interface UpdateStudentPayload {
  firstName: string;
  lastName: string;
  gender: Gender | null;
  dateOfBirth: string;
  admissionDate: string;
  profile: { bloodGroup: Nullable; nationalId: Nullable; religion: Nullable; nationality: Nullable; address: Nullable };
  medical: { allergies: Nullable; conditions: Nullable; medications: Nullable; doctorName: Nullable; doctorPhone: Nullable };
}

/** A parent's child at a glance (dashboard cards). */
export interface ChildOverview {
  studentId: string;
  /** This academic year; null before any attendance is marked. */
  attendancePercent: number | null;
  feesDue: number;
  overdueInvoices: number;
  nextDueDate: string | null;
  latestResult: { exam: string; grade: string; percentage: number; passed: boolean } | null;
}
