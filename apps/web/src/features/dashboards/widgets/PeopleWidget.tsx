import { GraduationCap, Users } from 'lucide-react';
import { Card } from '@/components/ui';
import { useCan } from '@/features/auth/usePermissions';
import { ViewAll } from '@/features/dashboards/components/ViewAll';
import { useStaffSummary } from '@/features/staff/hooks/useStaff';
import { useStudentSummary } from '@/features/students/hooks/useStudents';

function Split({ parts }: { parts: { label: string; value: number; cls: string }[] }) {
  const total = parts.reduce((t, p) => t + p.value, 0) || 1;
  return (
    <div>
      <div className="flex h-2.5 overflow-hidden rounded-full bg-slate-500/10">
        {parts.map((p) => <div key={p.label} className={p.cls} style={{ width: `${(p.value / total) * 100}%` }} />)}
      </div>
      <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-600 dark:text-slate-300">
        {parts.map((p) => (
          <span key={p.label} className="inline-flex items-center gap-1.5"><span className={`h-2.5 w-2.5 rounded-full ${p.cls}`} /> {p.label} <strong className="tabular-nums">{p.value}</strong></span>
        ))}
      </div>
    </div>
  );
}

/** Student and staff make-up: enrolment, gender, teaching vs non-teaching, logins. */
export function PeopleWidget({ className = '' }: { className?: string }) {
  const can = useCan();
  const st = useStudentSummary(can('students.view')).data;
  const sf = useStaffSummary(can('staff.view')).data;
  return (
    <Card title="People" icon={Users} tone="sky" className={className}>
      <div className="space-y-5">
        {st && (
          <section>
            <div className="mb-2 flex items-center justify-between">
              <h3 className="inline-flex items-center gap-1.5 text-sm font-bold uppercase tracking-wider text-slate-500"><GraduationCap size={15} /> Students · {st.active}</h3>
              <ViewAll to="/students" />
            </div>
            <Split parts={[{ label: 'Enrolled', value: st.enrolled, cls: 'bg-primary-500' }, { label: 'Not enrolled', value: st.notEnrolled, cls: 'bg-amber-400' }]} />
            <div className="mt-3"><Split parts={[{ label: 'Female', value: st.female, cls: 'bg-primary-700' }, { label: 'Male', value: st.male, cls: 'bg-primary-300' }]} /></div>
            <p className="mt-2 text-xs text-slate-500">{st.withParentLogin} with a parent login</p>
          </section>
        )}
        {sf && (
          <section>
            <div className="mb-2 flex items-center justify-between">
              <h3 className="inline-flex items-center gap-1.5 text-sm font-bold uppercase tracking-wider text-slate-500"><Users size={15} /> Staff · {sf.total}</h3>
              <ViewAll to="/staff" />
            </div>
            <Split parts={[{ label: 'Teaching', value: sf.teaching, cls: 'bg-primary-700' }, { label: 'Non-teaching', value: sf.nonTeaching, cls: 'bg-primary-300' }]} />
            <p className="mt-2 text-xs text-slate-500">{sf.onLeave} on leave today · {sf.withLogin} with a login</p>
          </section>
        )}
      </div>
    </Card>
  );
}
