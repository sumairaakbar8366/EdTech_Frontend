import { type CampusRef, type Gender, type Relation } from '@/types/common';

export type AdmissionStatus =
  | 'submitted'
  | 'documents_verified'
  | 'interview_scheduled'
  | 'under_review'
  | 'approved'
  | 'rejected'
  | 'enrolled'
  | 'withdrawn';

export interface AdmissionApplication {
  id: string;
  applicationNo: string;
  academicYearId: string;
  classId: string;
  campusId: string;
  firstName: string;
  lastName: string;
  gender: Gender | null;
  dateOfBirth: string;
  previousSchool: string | null;
  guardianFirstName: string;
  guardianLastName: string;
  guardianRelation: Relation;
  guardianPhone: string;
  guardianEmail: string | null;
  address: string | null;
  notes: string | null;
  status: AdmissionStatus;
  createdAt: string;
  academicYear: { id: string; name: string };
  schoolClass: { id: string; name: string; level: number };
  campus: CampusRef;
  assessments?: { id: string; kind: 'interview' | 'test'; scheduledAt: string; conductedBy: string; score: number | null; result: 'pending' | 'pass' | 'fail'; notes: string | null }[];
  statusHistory?: { id: string; fromStatus: AdmissionStatus | null; toStatus: AdmissionStatus; note: string | null; changedAt: string }[];
  student?: { id: string; admissionNo: string } | null;
}
