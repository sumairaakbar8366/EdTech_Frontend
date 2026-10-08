import { KeyRound, UserCheck, Users, UserX } from 'lucide-react';
import { StatCard } from '@/components/ui';
import { useStudentSummary } from '@/features/students/hooks/useStudents';

/** KPI row of the student directory. */
export function StudentStats() {
  const { data: s } = useStudentSummary();
  return (
    <div className="mb-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
      <StatCard label="Active students" value={s?.active ?? '–'} icon={Users} tone="emerald" hint={s ? `${s.female} ${s.female === 1 ? 'girl' : 'girls'} · ${s.male} ${s.male === 1 ? 'boy' : 'boys'}` : undefined} />
      <StatCard label="Enrolled this year" value={s?.enrolled ?? '–'} icon={UserCheck} tone="primary" />
      <StatCard label="Not enrolled" value={s?.notEnrolled ?? '–'} icon={UserX} tone="amber" hint="Active but no class this year" />
      <StatCard label="Parent logins" value={s?.withParentLogin ?? '–'} icon={KeyRound} tone="teal" />
    </div>
  );
}
