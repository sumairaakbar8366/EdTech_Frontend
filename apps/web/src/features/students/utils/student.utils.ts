import type { CreateStudentPayload, StudentDetail, UpdateStudentPayload } from '@/features/students/types/student.types';
import { dateOnly } from '@/lib/format';
import type { Gender, Relation } from '@/types/common';

/** Whole years between a date of birth and today. */
export function age(dob: string): number {
  const d = new Date(dob);
  const now = new Date();
  let years = now.getUTCFullYear() - d.getUTCFullYear();
  if (now.getUTCMonth() < d.getUTCMonth() || (now.getUTCMonth() === d.getUTCMonth() && now.getUTCDate() < d.getUTCDate())) years--;
  return years;
}

const orNull = (v: string) => (v.trim() === '' ? null : v.trim());
export const todayIso = () => new Date().toISOString().slice(0, 10);

/** State of the "Add student" form (all sections). */
export interface AddStudentForm {
  firstName: string; lastName: string; gender: '' | Gender; dateOfBirth: string; admissionDate: string; admissionNo: string;
  bloodGroup: string; nationalId: string; address: string; allergies: string;
  guardianMode: 'new' | 'existing'; guardianId: string; guardianLabel: string; relationship: Relation;
  gFirst: string; gLast: string; gPhone: string; gEmail: string; gOccupation: string;
  parentLogin: boolean;
  sectionId: string; rollNo: string;
  studentLogin: boolean; studentEmail: string;
}

export const emptyAddStudentForm = (): AddStudentForm => ({
  firstName: '', lastName: '', gender: '', dateOfBirth: '', admissionDate: todayIso(), admissionNo: '',
  bloodGroup: '', nationalId: '', address: '', allergies: '',
  guardianMode: 'new', guardianId: '', guardianLabel: '', relationship: 'father',
  gFirst: '', gLast: '', gPhone: '', gEmail: '', gOccupation: '',
  parentLogin: false,
  sectionId: '', rollNo: '',
  studentLogin: false, studentEmail: '',
});

/** Admission in one step (page 5): student, profile, first guardian, optional class and logins. */
export function toCreatePayload(f: AddStudentForm): CreateStudentPayload {
  return {
    ...(f.admissionNo.trim() && { admissionNo: f.admissionNo.trim() }),
    firstName: f.firstName,
    lastName: f.lastName,
    gender: f.gender || null,
    dateOfBirth: f.dateOfBirth,
    admissionDate: f.admissionDate,
    profile: { bloodGroup: orNull(f.bloodGroup), nationalId: orNull(f.nationalId), address: orNull(f.address) },
    ...(f.allergies.trim() && { medical: { allergies: f.allergies.trim() } }),
    guardians: [
      f.guardianMode === 'existing'
        ? { guardianId: f.guardianId, relationship: f.relationship, isPrimary: true }
        : {
            details: { firstName: f.gFirst, lastName: f.gLast, phone: f.gPhone, email: orNull(f.gEmail), occupation: orNull(f.gOccupation) },
            relationship: f.relationship,
            isPrimary: true,
            ...(f.parentLogin && { login: {} }),
          },
    ],
    ...(f.sectionId && { enrollment: { sectionId: f.sectionId, rollNo: f.rollNo ? Number(f.rollNo) : null } }),
    ...(f.studentLogin && { login: f.studentEmail.trim() ? { email: f.studentEmail.trim() } : {} }),
  };
}

/** State of the "Edit student" form. */
export type EditStudentForm = ReturnType<typeof toEditForm>;

export function toEditForm(s: StudentDetail) {
  return {
    firstName: s.firstName, lastName: s.lastName, gender: (s.gender ?? '') as '' | Gender,
    dateOfBirth: dateOnly(s.dateOfBirth), admissionDate: dateOnly(s.admissionDate),
    bloodGroup: s.profile?.bloodGroup ?? '', nationalId: s.profile?.nationalId ?? '', religion: s.profile?.religion ?? '',
    nationality: s.profile?.nationality ?? '', address: s.profile?.address ?? '',
    allergies: s.medical?.allergies ?? '', conditions: s.medical?.conditions ?? '', medications: s.medical?.medications ?? '',
    doctorName: s.medical?.doctorName ?? '', doctorPhone: s.medical?.doctorPhone ?? '',
  };
}

export function toUpdatePayload(f: EditStudentForm): UpdateStudentPayload {
  return {
    firstName: f.firstName, lastName: f.lastName, gender: f.gender || null, dateOfBirth: f.dateOfBirth, admissionDate: f.admissionDate,
    profile: { bloodGroup: orNull(f.bloodGroup), nationalId: orNull(f.nationalId), religion: orNull(f.religion), nationality: orNull(f.nationality), address: orNull(f.address) },
    medical: { allergies: orNull(f.allergies), conditions: orNull(f.conditions), medications: orNull(f.medications), doctorName: orNull(f.doctorName), doctorPhone: orNull(f.doctorPhone) },
  };
}
