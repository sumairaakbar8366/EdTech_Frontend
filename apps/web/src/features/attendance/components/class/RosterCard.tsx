import { Save, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button, Card, EmptyState } from '@/components/ui';
import { MarkCountBadges } from '@/features/attendance/components/MarkCountBadges';
import { DEFAULT_MARK, MARKS, MARK_STYLE } from '@/features/attendance/constants';
import { useAttendanceAction } from '@/features/attendance/hooks/useAttendance';
import { attendanceService } from '@/features/attendance/services/attendanceService';
import type { Mark, Roster } from '@/features/attendance/types/attendance.types';
import { countMarks } from '@/features/attendance/utils/attendance.utils';

/** Mark every student of a class session; unmarked students start as present. */
export function RosterCard({ roster }: { roster: Roster }) {
  const [marks, setMarks] = useState<Record<string, Mark>>({});
  useEffect(() => setMarks(Object.fromEntries(roster.students.map((s) => [s.id, s.mark?.status ?? DEFAULT_MARK]))), [roster]);
  const save = useAttendanceAction(
    () => attendanceService.mark(roster.session.id, Object.entries(marks).map(([studentId, status]) => ({ studentId, status }))),
    'Attendance saved',
  );
  const { session } = roster;
  return (
    <Card
      padded={false}
      title={`${session.subject.name} · ${session.section.schoolClass.name} – ${session.section.name}`}
      icon={Users}
      tone="teal"
      actions={
        <div className="flex items-center gap-2">
          <Button variant="secondary" className="px-3 py-1.5 text-sm" onClick={() => setMarks(Object.fromEntries(Object.keys(marks).map((k) => [k, DEFAULT_MARK])))}>All present</Button>
          <Button icon={Save} className="px-3 py-1.5 text-sm" disabled={!roster.students.length} loading={save.isPending} onClick={() => save.mutate(undefined)}>Save</Button>
        </div>
      }
    >
      <div className="flex flex-wrap gap-2 border-b border-slate-200 px-5 py-3 dark:border-white/5"><MarkCountBadges counts={countMarks(marks)} /></div>
      {roster.students.length === 0 && <EmptyState icon={Users} title="No students enrolled in this section" tone="teal" />}
      <ul className="divide-y divide-slate-200/70 dark:divide-white/5">
        {roster.students.map((s) => (
          <li key={s.id} className="flex flex-wrap items-center gap-3 px-5 py-2.5">
            <span className="w-8 text-right tabular-nums text-slate-500">{s.rollNo ?? '—'}</span>
            <span className="min-w-0 flex-1 font-semibold text-slate-800 dark:text-slate-100">{s.firstName} {s.lastName} <span className="text-sm font-normal text-slate-500">{s.admissionNo}</span></span>
            <div role="radiogroup" aria-label={`Attendance for ${s.firstName} ${s.lastName}`} className="flex gap-1">
              {MARKS.map((m) => (
                <button
                  key={m}
                  role="radio"
                  aria-checked={marks[s.id] === m}
                  onClick={() => setMarks({ ...marks, [s.id]: m })}
                  className={`focus-ring h-9 w-9 rounded-lg text-sm font-bold uppercase transition ${marks[s.id] === m ? MARK_STYLE[m] : 'bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-white/5'}`}
                  title={m}
                  aria-label={m}
                >
                  {m[0]}
                </button>
              ))}
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}
