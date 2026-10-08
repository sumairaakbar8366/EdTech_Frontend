import type { Tone } from '@/components/ui';
import type { StudentStatus } from '@/features/students/types/student.types';
import type { Relation } from '@/types/common';

export const STUDENT_STATUS_LABEL: Record<StudentStatus, string> = { active: 'Active', inactive: 'Inactive', graduated: 'Graduated', withdrawn: 'Withdrawn' };
export const STUDENT_STATUS_TONE: Record<StudentStatus, Tone> = { active: 'emerald', inactive: 'amber', graduated: 'primary', withdrawn: 'slate' };

export const RELATION_LABEL: Record<Relation, string> = { father: 'Father', mother: 'Mother', guardian: 'Guardian', grandparent: 'Grandparent', sibling: 'Sibling', other: 'Other' };

export const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] as const;

export const STUDENT_DOC_CATEGORIES = [
  { value: 'identity', label: 'B-Form / ID' },
  { value: 'birth_certificate', label: 'Birth certificate' },
  { value: 'photo', label: 'Photo' },
  { value: 'previous_result', label: 'Previous result' },
  { value: 'leaving_certificate', label: 'Leaving certificate' },
  { value: 'medical', label: 'Medical' },
  { value: 'other', label: 'Other' },
];
