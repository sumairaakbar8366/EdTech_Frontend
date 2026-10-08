import type { EmployeeDetail, EmploymentType, StaffType } from '@/features/staff/types/staff.types';
import { dateOnly } from '@/lib/format';

export const fullName = (e: { firstName: string; lastName: string }) => `${e.firstName} ${e.lastName}`;

export interface StaffForm {
  campusId: string; employeeNo: string; firstName: string; lastName: string; email: string; phone: string;
  gender: '' | 'male' | 'female' | 'other'; dateOfBirth: string;
  staffType: StaffType; designation: string; department: string; employmentType: EmploymentType; joinDate: string;
  address: string; nationalId: string; emergencyContactName: string; emergencyContactPhone: string; bloodGroup: string;
  specialization: string;
  createLogin: boolean; roles: string[];
}

/** Form state for a new staff member, or prefilled from an existing record. */
export function toStaffForm(e?: EmployeeDetail): StaffForm {
  return {
    campusId: e?.campusId ?? '', employeeNo: e?.employeeNo ?? '', firstName: e?.firstName ?? '', lastName: e?.lastName ?? '',
    email: e?.email ?? '', phone: e?.phone ?? '', gender: e?.gender ?? '', dateOfBirth: e?.dateOfBirth ? dateOnly(e.dateOfBirth) : '',
    staffType: e?.staffType ?? 'teaching', designation: e?.designation ?? '', department: e?.department ?? '',
    employmentType: e?.employmentType ?? 'full_time', joinDate: e?.joinDate ? dateOnly(e.joinDate) : new Date().toISOString().slice(0, 10),
    address: e?.profile?.address ?? '', nationalId: e?.profile?.nationalId ?? '',
    emergencyContactName: e?.profile?.emergencyContactName ?? '', emergencyContactPhone: e?.profile?.emergencyContactPhone ?? '',
    bloodGroup: e?.profile?.bloodGroup ?? '', specialization: e?.teacherProfile?.specialization ?? '',
    createLogin: false, roles: ['teacher'],
  };
}

const orNull = (v: string) => (v.trim() === '' ? null : v.trim());

export type StaffPayload = ReturnType<typeof toStaffPayload>;

/** Fields shared by create and update; the teacher profile is only sent for teaching staff. */
export function toStaffPayload(f: StaffForm) {
  return {
    campusId: f.campusId, firstName: f.firstName, lastName: f.lastName, email: orNull(f.email), phone: orNull(f.phone),
    gender: f.gender || null, dateOfBirth: orNull(f.dateOfBirth), staffType: f.staffType, designation: f.designation,
    department: orNull(f.department), employmentType: f.employmentType, joinDate: f.joinDate,
    profile: {
      address: orNull(f.address), nationalId: orNull(f.nationalId),
      emergencyContactName: orNull(f.emergencyContactName), emergencyContactPhone: orNull(f.emergencyContactPhone), bloodGroup: orNull(f.bloodGroup),
    },
    ...(f.staffType === 'teaching' && { teacherProfile: { specialization: orNull(f.specialization) } }),
  };
}
