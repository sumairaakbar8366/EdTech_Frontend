import { GraduationCap, KeyRound, UserCheck, Users } from 'lucide-react';
import { StatCard } from '@/components/ui';
import { useStaffSummary } from '@/features/staff/hooks/useStaff';

export function StaffStats() {
  const { data: s } = useStaffSummary();
  return (
    <div className="mb-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
      <StatCard label="Teaching" value={s?.teaching ?? '–'} icon={GraduationCap} tone="magenta" hint="Current staff" />
      <StatCard label="Non-teaching" value={s?.nonTeaching ?? '–'} icon={Users} tone="sky" hint="Current staff" />
      <StatCard label="On leave" value={s?.onLeave ?? '–'} icon={UserCheck} tone="amber" />
      <StatCard label="With login" value={s?.withLogin ?? '–'} icon={KeyRound} tone="teal" />
    </div>
  );
}
