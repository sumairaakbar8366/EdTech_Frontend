import { ClipboardCheck, MapPin, Plane, UserCheck, Users } from 'lucide-react';
import { useState } from 'react';
import { PageHeader, Tabs } from '@/components/ui';
import { GeofencesTab } from '@/features/attendance/components/admin/GeofencesTab';
import { StaffCheckinsTab } from '@/features/attendance/components/admin/StaffCheckinsTab';
import { StudentsDayTab } from '@/features/attendance/components/admin/StudentsDayTab';
import { LeaveApprovals } from '@/features/leave/components/LeaveApprovals';

type Tab = 'staff' | 'leave' | 'students' | 'geofences';

/** Admin attendance hub: staff check-ins, leave approvals, class attendance and geofences. */
export function AttendanceAdminPage({ canEdit, canApproveLeave }: { canEdit: boolean; canApproveLeave: boolean }) {
  const [tab, setTab] = useState<Tab>('staff');
  const tabs = [
    { id: 'staff' as const, label: 'Staff check-ins', icon: UserCheck },
    { id: 'leave' as const, label: 'Leave', icon: Plane },
    { id: 'students' as const, label: 'Students', icon: Users },
    ...(canEdit ? [{ id: 'geofences' as const, label: 'Geofences', icon: MapPin }] : []),
  ];
  return (
    <div>
      <PageHeader title="Attendance" sub="Staff GPS check-ins, leave and class attendance" icon={ClipboardCheck} tone="teal" />
      <Tabs tabs={tabs} value={tab} onChange={setTab} />
      {tab === 'staff' && <StaffCheckinsTab canReview={canEdit} />}
      {tab === 'leave' && <LeaveApprovals canDecide={canApproveLeave} />}
      {tab === 'students' && <StudentsDayTab />}
      {tab === 'geofences' && <GeofencesTab />}
    </div>
  );
}
