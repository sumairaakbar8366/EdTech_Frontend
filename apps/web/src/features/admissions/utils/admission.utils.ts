import type { ApplicationPayload } from '@/features/admissions/services/admissionService';
import type { AdmissionApplication } from '@/features/admissions/types/admission.types';
import type { Gender, Relation } from '@/types/common';

export type ApplicationForm = ReturnType<typeof toApplicationForm>;

/** Form state for a new application, or prefilled from an existing one. */
export function toApplicationForm(a?: AdmissionApplication) {
  return {
    classId: a?.classId ?? '', campusId: a?.campusId ?? '',
    firstName: a?.firstName ?? '', lastName: a?.lastName ?? '', gender: (a?.gender ?? '') as '' | Gender,
    dateOfBirth: a?.dateOfBirth.slice(0, 10) ?? '', previousSchool: a?.previousSchool ?? '',
    guardianFirstName: a?.guardianFirstName ?? '', guardianLastName: a?.guardianLastName ?? '',
    guardianRelation: (a?.guardianRelation ?? 'father') as Relation, guardianPhone: a?.guardianPhone ?? '',
    guardianEmail: a?.guardianEmail ?? '', address: a?.address ?? '', notes: a?.notes ?? '',
  };
}

/** Empty optional fields are sent as null. */
export function toApplicationPayload(f: ApplicationForm): ApplicationPayload {
  return { ...f, gender: f.gender || null, previousSchool: f.previousSchool || null, guardianEmail: f.guardianEmail || null, address: f.address || null, notes: f.notes || null };
}

/** An application in a final state cannot be edited or moved. */
export const isClosed = (a: Pick<AdmissionApplication, 'status'>) => ['rejected', 'withdrawn', 'enrolled'].includes(a.status);
