import { UserRound } from 'lucide-react';
import { Card, InfoItem } from '@/components/ui';
import type { AdmissionApplication } from '@/features/admissions/types/admission.types';
import { RELATION_LABEL } from '@/features/students/constants';
import { age } from '@/features/students/utils/student.utils';
import { formatDate } from '@/lib/format';

export function ApplicantCard({ application: a }: { application: AdmissionApplication }) {
  return (
    <Card title="Applicant & parent" icon={UserRound} tone="teal">
      <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <InfoItem label="Date of birth">{formatDate(a.dateOfBirth)} ({age(a.dateOfBirth)} yrs)</InfoItem>
        <InfoItem label="Gender">{a.gender}</InfoItem>
        <InfoItem label="Previous school">{a.previousSchool}</InfoItem>
        <InfoItem label="Parent">{a.guardianFirstName} {a.guardianLastName} ({RELATION_LABEL[a.guardianRelation]})</InfoItem>
        <InfoItem label="Phone">{a.guardianPhone}</InfoItem>
        <InfoItem label="Email">{a.guardianEmail}</InfoItem>
        <div className="col-span-2 sm:col-span-3"><InfoItem label="Address">{a.address}</InfoItem></div>
        {a.notes && <div className="col-span-2 sm:col-span-3"><InfoItem label="Notes">{a.notes}</InfoItem></div>}
      </dl>
    </Card>
  );
}
