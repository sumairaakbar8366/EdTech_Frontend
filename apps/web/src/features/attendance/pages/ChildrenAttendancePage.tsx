import { UserCheck } from 'lucide-react';
import { PageHeader } from '@/components/ui';
import { AttendanceSummaryView } from '@/features/attendance/components/student/AttendanceSummaryView';
import { useMyChildren } from '@/features/students/hooks/useStudents';

/** Parent: each child's class attendance. */
export function ChildrenAttendancePage() {
  const kids = useMyChildren();
  return (
    <div>
      <PageHeader title="Attendance" sub="Your children’s class attendance" icon={UserCheck} tone="teal" />
      <div className="space-y-10">{kids.data?.map((k) => <AttendanceSummaryView key={k.id} studentId={k.id} name={`${k.firstName} ${k.lastName}`} />)}</div>
    </div>
  );
}
