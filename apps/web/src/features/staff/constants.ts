import type { Tone } from '@/components/ui';
import type { EmployeeStatus, EmploymentType, StaffType } from '@/features/staff/types/staff.types';

export const STATUS_LABEL: Record<EmployeeStatus, string> = { active: 'Active', on_leave: 'On leave', resigned: 'Resigned', terminated: 'Terminated' };
export const STATUS_TONE: Record<EmployeeStatus, Tone> = { active: 'emerald', on_leave: 'amber', resigned: 'slate', terminated: 'rose' };
export const TYPE_LABEL: Record<StaffType, string> = { teaching: 'Teaching', non_teaching: 'Non-teaching' };
export const TYPE_TONE: Record<StaffType, Tone> = { teaching: 'magenta', non_teaching: 'sky' };
export const EMPLOYMENT_LABEL: Record<EmploymentType, string> = { full_time: 'Full-time', part_time: 'Part-time', contract: 'Contract' };

/** Roles a staff login may hold (students and parents get logins from their own modules). */
export const STAFF_LOGIN_ROLES = [
  { key: 'teacher', label: 'Teacher' },
  { key: 'non_teaching_staff', label: 'Non-teaching staff' },
  { key: 'accounts', label: 'Accounts' },
  { key: 'school_admin', label: 'School admin' },
  { key: 'principal', label: 'Principal' },
] as const;

export const roleLabel = (key: string) => STAFF_LOGIN_ROLES.find((r) => r.key === key)?.label ?? key;

/** The default login role for a staff type. */
export const defaultRoleFor = (t: StaffType) => (t === 'teaching' ? 'teacher' : 'non_teaching_staff');
