import { CalendarCheck, CalendarClock, Check, ShieldAlert, UserCheck, X } from 'lucide-react';
import { Card, Spinner, StatCard } from '@/components/ui';
import { MARK_STYLE } from '@/features/attendance/constants';
import { useStudentAttendance } from '@/features/attendance/hooks/useAttendance';
import { attendanceTone } from '@/features/attendance/utils/attendance.utils';
import { formatDate } from '@/lib/format';

/** A student's attendance percentage, counts per mark and recent classes. */
export function AttendanceSummaryView({ studentId, name }: { studentId: string; name?: string }) {
  const data = useStudentAttendance(studentId);
  if (data.isLoading) return <Spinner />;
  if (!data.data) return null;
  const s = data.data;
  return (
    <div className="space-y-4">
      {name && <h2 className="text-2xl font-bold uppercase tracking-wide">{name}</h2>}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <StatCard label="Attendance" value={s.percentage === null ? '–' : `${s.percentage}%`} icon={UserCheck} tone={attendanceTone(s.percentage)} />
        <StatCard label="Present" value={s.counts.present} icon={Check} tone="emerald" />
        <StatCard label="Late" value={s.counts.late} icon={CalendarClock} tone="amber" />
        <StatCard label="Absent" value={s.counts.absent} icon={X} tone="rose" />
        <StatCard label="Excused" value={s.counts.excused} icon={ShieldAlert} tone="sky" />
      </div>
      <Card title="Recent classes" icon={CalendarCheck} tone="slate">
        {s.recent.length === 0 && <p className="text-base text-slate-400">No attendance recorded yet.</p>}
        <ul className="divide-y divide-slate-200/70 dark:divide-white/5">
          {s.recent.map((r, i) => (
            <li key={i} className="flex items-center gap-3 py-2">
              <span className="w-28">{formatDate(r.date + 'T00:00:00Z')}</span>
              <span className="flex-1">{r.subject}</span>
              <span className={`rounded-md px-2 py-0.5 text-sm font-bold uppercase ${MARK_STYLE[r.status]}`}>{r.status}</span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
