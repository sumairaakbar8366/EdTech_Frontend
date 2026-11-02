import { CircleDollarSign, ClipboardList, GraduationCap, Users } from 'lucide-react';
import { StatCard } from '@/components/ui';
import { useAdmissionSummary } from '@/features/admissions/hooks/useAdmissions';
import { useCan } from '@/features/auth/usePermissions';
import { useFeesSummary } from '@/features/fees/hooks/useFees';
import { useStaffSummary } from '@/features/staff/hooks/useStaff';
import { useStudentSummary } from '@/features/students/hooks/useStudents';
import { compactNumber } from '@/lib/format';

const OPEN_ADMISSION = ['submitted', 'documents_verified', 'interview_scheduled', 'under_review', 'approved'] as const;

/** Headline figures for the school: students, staff, open admissions, fees outstanding. A leadership seat that has Admissions or Fees hidden does not get that figure either. */
export function AdminKpisWidget({ hidden = [] }: { hidden?: readonly string[] }) {
  const can = useCan();
  const students = useStudentSummary(can('students.view')).data;
  const staff = useStaffSummary(can('staff.view')).data;
  const admissions = useAdmissionSummary().data;
  const fees = useFeesSummary().data;
  const openAdmissions = admissions ? OPEN_ADMISSION.reduce((t, s) => t + (admissions[s] ?? 0), 0) : undefined;
  return (
    <div className={`stagger grid grid-cols-2 gap-3 sm:gap-4 ${hidden.length ? 'lg:grid-cols-3' : 'lg:grid-cols-4'}`}>
      <StatCard label="Students" value={students?.active ?? '–'} icon={GraduationCap} tone="primary" hint={students ? `${compactNumber(students.enrolled)} enrolled this year` : undefined} />
      <StatCard label="Staff" value={staff?.total ?? '–'} icon={Users} tone="teal" hint={staff ? `${compactNumber(staff.teaching)} teaching · ${compactNumber(staff.onLeave)} on leave` : undefined} />
      {!hidden.includes('admissions') && <StatCard label="Admissions open" value={openAdmissions ?? '–'} icon={ClipboardList} tone="magenta" hint="In the pipeline" />}
      {!hidden.includes('fees') && <StatCard label="Fees outstanding" value={fees ? Number(fees.outstanding) : '–'} icon={CircleDollarSign} tone="amber" hint={fees ? `${compactNumber(fees.overdueInvoices)} overdue invoices` : undefined} />}
    </div>
  );
}
