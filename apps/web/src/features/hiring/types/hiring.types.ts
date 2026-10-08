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
  status: ApplicationStatus;
  employeeId: string | null;
  createdAt: string;
  interviews: Interview[];
}
