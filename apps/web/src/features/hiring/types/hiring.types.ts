import { type StaffType } from '@/features/staff/types/staff.types';
import { type CampusRef } from '@/types/common';

// --- Hiring ------------------------------------------------------------------------

export type JobPostStatus = 'draft' | 'open' | 'closed';

export type ApplicationStatus = 'applied' | 'shortlisted' | 'interview' | 'selected' | 'hired' | 'rejected' | 'withdrawn';

export interface JobPost {
  id: string;
  campusId: string;
  title: string;
  staffType: StaffType;
  department: string | null;
  description: string | null;
  openings: number;
  status: JobPostStatus;
  closingDate: string | null;
  campus: CampusRef;
  applicationCount?: number;
  byStatus?: Partial<Record<ApplicationStatus, number>>;
}

export interface Interview {
  id: string;
  scheduledAt: string;
  mode: 'in_person' | 'online' | 'phone';
  interviewer: string;
  score: number | null;
  recommendation: 'strong_yes' | 'yes' | 'no' | 'strong_no' | null;
  notes: string | null;
}

export interface JobApplication {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  education: string | null;
  experienceYears: number | null;
  experience: string | null;
  previousSchools: string | null;
  references: string | null;
  coverNote: string | null;
  // Detailed application
  fatherName: string | null;
  gender: 'male' | 'female' | 'other' | null;
  dateOfBirth: string | null;
  cnic: string | null;
  address: string | null;
  city: string | null;
  highestQualification: string | null;
  institution: string | null;
  graduationYear: number | null;
  majorSubjects: string | null;
  currentEmployer: string | null;
  currentDesignation: string | null;
  subjects: string | null;
  expectedSalary: string | null;
  noticePeriod: string | null;
  availableFrom: string | null;
  languages: string | null;
  skills: string | null;
  linkedinUrl: string | null;
  source: 'office' | 'website';
  status: ApplicationStatus;
  employeeId: string | null;
  createdAt: string;
  updatedAt: string;
  interviews: Interview[];
}

/** One line of an application's status log. */
export interface StatusLog {
  id: string;
  fromStatus: ApplicationStatus | null;
  toStatus: ApplicationStatus;
  note: string | null;
  changedByName: string | null;
  createdAt: string;
}

/** A row of the applicants table (all posts). */
export interface ApplicationRow extends Omit<JobApplication, 'interviews'> {
  jobPost: { id: string; title: string; staffType: StaffType };
  history: StatusLog[];
  interviews: Pick<Interview, 'scheduledAt' | 'score' | 'recommendation'>[];
}

/** The full applicant profile. */
export interface ApplicationDetail extends JobApplication {
  jobPost: JobPost;
  history: StatusLog[];
  hiredCount: number;
}

export const QUALIFICATIONS = ['Matric', 'Intermediate', 'Diploma', 'Bachelor', 'Master', 'MPhil', 'PhD', 'Other'] as const;
