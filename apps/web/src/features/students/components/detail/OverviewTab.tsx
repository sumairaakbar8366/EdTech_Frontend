import { CircleUser, HeartPulse } from 'lucide-react';
import { Card, InfoItem } from '@/components/ui';
import { EmergencyContactsCard } from '@/features/students/components/detail/EmergencyContactsCard';
import { PreviousSchoolsCard } from '@/features/students/components/detail/PreviousSchoolsCard';
import type { StudentDetail } from '@/features/students/types/student.types';
import { age } from '@/features/students/utils/student.utils';
import { formatDate } from '@/lib/format';

/** Personal and medical details, emergency contacts and previous schools. */
export function OverviewTab({ student: s, editable }: { student: StudentDetail; editable: boolean }) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card title="Personal" icon={CircleUser} tone="emerald">
        <dl className="grid grid-cols-2 gap-4">
          <InfoItem label="Date of birth">{formatDate(s.dateOfBirth)} ({age(s.dateOfBirth)} yrs)</InfoItem>
          <InfoItem label="Gender">{s.gender && s.gender[0]!.toUpperCase() + s.gender.slice(1)}</InfoItem>
          <InfoItem label="Admitted">{formatDate(s.admissionDate)}</InfoItem>
          <InfoItem label="B-Form / ID">{s.profile?.nationalId}</InfoItem>
          <InfoItem label="Religion">{s.profile?.religion}</InfoItem>
          <InfoItem label="Nationality">{s.profile?.nationality}</InfoItem>
          <div className="col-span-2"><InfoItem label="Address">{s.profile?.address}</InfoItem></div>
          {s.admissionApplication && <InfoItem label="Admission application">{s.admissionApplication.applicationNo}</InfoItem>}
        </dl>
      </Card>
      <Card title="Medical" icon={HeartPulse} tone="rose">
        <dl className="grid grid-cols-2 gap-4">
          <InfoItem label="Blood group">{s.profile?.bloodGroup}</InfoItem>
          <InfoItem label="Allergies">{s.medical?.allergies}</InfoItem>
          <InfoItem label="Conditions">{s.medical?.conditions}</InfoItem>
          <InfoItem label="Medications">{s.medical?.medications}</InfoItem>
          <InfoItem label="Doctor">{s.medical?.doctorName}{s.medical?.doctorPhone ? ` · ${s.medical.doctorPhone}` : ''}</InfoItem>
        </dl>
      </Card>
      <EmergencyContactsCard student={s} editable={editable} />
      <PreviousSchoolsCard student={s} editable={editable} />
    </div>
  );
}
