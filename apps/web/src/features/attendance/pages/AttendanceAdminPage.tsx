import { ClipboardCheck, Fingerprint, MapPin, Plane, TriangleAlert, UserCheck, Users } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { PageHeader, Tabs } from '@/components/ui';
import { GeofencesTab } from '@/features/attendance/components/admin/GeofencesTab';
import { ProblemsTab } from '@/features/attendance/components/admin/ProblemsTab';
import { attendanceService } from '@/features/attendance/services/attendanceService';
import { PhonesTab } from '@/features/attendance/components/admin/PhonesTab';
import { StaffCheckinsTab } from '@/features/attendance/components/admin/StaffCheckinsTab';
import { StudentsDayTab } from '@/features/attendance/components/admin/StudentsDayTab';
import { LeaveApprovals } from '@/features/leave/components/LeaveApprovals';

type Tab = 'staff' | 'problems' | 'phones' | 'leave' | 'students' | 'geofences';

/** Admin attendance hub: staff check-ins, leave approvals, class attendance and geofences. */
export function AttendanceAdminPage({ canEdit, canApproveLeave }: { canEdit: boolean; canApproveLeave: boolean }) {
  const [tab, setTab] = useState<Tab>('staff');
  const open = useQuery({ queryKey: ['attendance', 'issues', 'count'], queryFn: attendanceService.issueCount, refetchInterval: 60_000 }).data?.open ?? 0;
  const tabs = [
    { id: 'staff' as const, label: 'Staff check-ins', icon: UserCheck },
    { id: 'problems' as const, label: open ? `Problems · ${open}` : 'Problems', icon: TriangleAlert },
    { id: 'phones' as const, label: 'Staff phones', icon: Fingerprint },
    { id: 'leave' as const, label: 'Leave', icon: Plane },
    { id: 'students' as const, label: 'Students', icon: Users },
    ...(canEdit ? [{ id: 'geofences' as const, label: 'Geofences', icon: MapPin }] : []),
  ];
  return (
    <div>
      <PageHeader title="Attendance" sub="Staff GPS check-ins, leave and class attendance" icon={ClipboardCheck} tone="teal" />
      <Tabs tabs={tabs} value={tab} onChange={setTab} />
      {tab === 'staff' && <StaffCheckinsTab canReview={canEdit} />}
      {tab === 'problems' && <ProblemsTab canEdit={canEdit} />}
      {tab === 'phones' && <PhonesTab canEdit={canEdit} />}
      {tab === 'leave' && <LeaveApprovals canDecide={canApproveLeave} />}
      {tab === 'students' && <StudentsDayTab />}
      {tab === 'geofences' && <GeofencesTab />}
    </div>
  );
}
