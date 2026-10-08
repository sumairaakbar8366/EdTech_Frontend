import { UserCheck } from 'lucide-react';
import { PageHeader } from '@/components/ui';
import { AttendanceSummaryView } from '@/features/attendance/components/student/AttendanceSummaryView';
import { useStudentDetail } from '@/features/students/hooks/useStudents';

/** Student: their own class attendance. */
export function StudentAttendancePage() {
  const me = useStudentDetail('own');
  return (
    <div>
      <PageHeader title="Attendance" sub="Your class attendance" icon={UserCheck} tone="teal" />
      {me.data && <AttendanceSummaryView studentId={me.data.id} />}
    </div>
  );
}
