import type { Tone } from '@/components/ui';
import { type AdmissionStatus } from '@/features/admissions/types/admission.types';

/** Admission pipeline rules and labels. To add a status: add it here and to the server's ADMISSION_TRANSITIONS. */

/** Main path of an application (page 5). */
export const ADMISSION_STEPS = ['submitted', 'documents_verified', 'interview_scheduled', 'under_review', 'approved', 'enrolled'] as const;

export const ADMISSION_LABEL: Record<AdmissionStatus, string> = {
  submitted: 'Submitted',
  documents_verified: 'Docs verified',
  interview_scheduled: 'Interview / test',
  under_review: 'Under review',
  approved: 'Approved',
  rejected: 'Rejected',
  enrolled: 'Enrolled',
  withdrawn: 'Withdrawn',
};

export const ADMISSION_TONE: Record<AdmissionStatus, Tone> = {
  submitted: 'slate',
  documents_verified: 'sky',
  interview_scheduled: 'magenta',
  under_review: 'amber',
  approved: 'teal',
  rejected: 'rose',
  enrolled: 'emerald',
  withdrawn: 'slate',
};

/** Mirrors the server's ADMISSION_TRANSITIONS (manual moves only). */
export const ADMISSION_NEXT: Record<AdmissionStatus, AdmissionStatus[]> = {
  submitted: ['documents_verified', 'rejected', 'withdrawn'],
  documents_verified: ['under_review', 'rejected', 'withdrawn'],
  interview_scheduled: ['under_review', 'rejected', 'withdrawn'],
  under_review: ['approved', 'rejected'],
  approved: ['withdrawn'],
  rejected: [],
  enrolled: [],
  withdrawn: [],
};

export const ADMISSION_DOC_CATEGORIES = [
  { value: 'birth_certificate', label: 'Birth certificate / B-Form' },
  { value: 'photo', label: 'Photo' },
  { value: 'previous_result', label: 'Previous result card' },
  { value: 'leaving_certificate', label: 'School leaving certificate' },
  { value: 'parent_id', label: 'Parent CNIC / ID' },
  { value: 'other', label: 'Other' },
];
