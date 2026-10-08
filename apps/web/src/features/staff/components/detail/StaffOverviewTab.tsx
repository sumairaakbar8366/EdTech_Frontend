import { Briefcase, CircleUser } from 'lucide-react';
import { Card, InfoItem } from '@/components/ui';
import { EMPLOYMENT_LABEL } from '@/features/staff/constants';
import type { EmployeeDetail } from '@/features/staff/types/staff.types';
import { formatDate } from '@/lib/format';

export function StaffOverviewTab({ employee: e }: { employee: EmployeeDetail }) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card title="Employment" icon={Briefcase} tone="sky">
        <dl className="grid grid-cols-2 gap-4">
          <InfoItem label="Campus">{e.campus.name}</InfoItem>
          <InfoItem label="Department">{e.department}</InfoItem>
          <InfoItem label="Employment">{EMPLOYMENT_LABEL[e.employmentType]}</InfoItem>
          <InfoItem label="Joined">{formatDate(e.joinDate)}</InfoItem>
          {e.teacherProfile && <InfoItem label="Specialization">{e.teacherProfile.specialization}</InfoItem>}
          {e.user && <InfoItem label="Login roles">{e.user.userRoles.map((r) => r.role.name).join(', ')}</InfoItem>}
          {e.user && <InfoItem label="Last sign-in">{e.user.lastLoginAt ? new Date(e.user.lastLoginAt).toLocaleString() : 'Never'}</InfoItem>}
        </dl>
      </Card>
      <Card title="Personal" icon={CircleUser} tone="primary">
        <dl className="grid grid-cols-2 gap-4">
          <InfoItem label="Email">{e.email}</InfoItem>
          <InfoItem label="Phone">{e.phone}</InfoItem>
          <InfoItem label="Gender">{e.gender && e.gender[0]!.toUpperCase() + e.gender.slice(1)}</InfoItem>
          <InfoItem label="Date of birth">{e.dateOfBirth && formatDate(e.dateOfBirth)}</InfoItem>
          <InfoItem label="National ID">{e.profile?.nationalId}</InfoItem>
          <InfoItem label="Blood group">{e.profile?.bloodGroup}</InfoItem>
          <div className="col-span-2"><InfoItem label="Address">{e.profile?.address}</InfoItem></div>
          <InfoItem label="Emergency contact">{e.profile?.emergencyContactName}</InfoItem>
          <InfoItem label="Emergency phone">{e.profile?.emergencyContactPhone}</InfoItem>
        </dl>
      </Card>
    </div>
  );
}
