import { CalendarDays, CirclePlay, CircleStop, Clock, Presentation } from 'lucide-react';
import { useState } from 'react';
import { Badge, Card, DataTable, EmptyState, Field, Input, Spinner, StatCard, StatusBadge, type Column } from '@/components/ui';
import { LATE_START_GRACE_MINUTES, SLOT_STATE_LABEL, SLOT_STATE_TONE } from '@/features/timetable/constants';
import { useClassMonitor } from '@/features/timetable/hooks/useTimetable';
import type { MonitorRow } from '@/features/timetable/services/timetableService';
import { DAY_NAMES } from '@/lib/format';

const COLUMNS: Column<MonitorRow>[] = [
  { header: 'Time', cell: (r) => `${r.startTime}–${r.endTime}`, className: 'tabular-nums font-semibold' },
  { header: 'Class', cell: (r) => <>{r.section.schoolClass.name} – {r.section.name} <span className="text-sm text-slate-500">({r.section.campus.code})</span></> },
  { header: 'Subject', cell: (r) => r.subject.name },
  { header: 'Teacher', cell: (r) => `${r.employee.firstName} ${r.employee.lastName}` },
  {
    header: 'Started',
    cell: (r) => (
      <>
        {r.session ? new Date(r.session.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
        {!!r.startedLateBy && r.startedLateBy > LATE_START_GRACE_MINUTES && <Badge tone="amber">{r.startedLateBy} min late</Badge>}
      </>
    ),
    className: 'text-slate-600 dark:text-slate-300',
  },
  { header: 'Status', cell: (r) => <StatusBadge status={r.state} tones={SLOT_STATE_TONE} labels={SLOT_STATE_LABEL} /> },
];

/** Admin view of every scheduled class on a day: started, live, missed (page 7). */
export function ClassMonitor() {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const data = useClassMonitor(date);
  const t = data.data?.totals;
  return (
    <div>
      <div className="mb-4 flex flex-wrap items-end gap-3">
        <div className="w-52"><Field label="Date"><Input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></Field></div>
        {data.data && <span className="pb-2 text-lg font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">{DAY_NAMES[data.data.dayOfWeek]}</span>}
      </div>
      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-5">
        <StatCard label="Scheduled" value={t?.scheduled ?? '–'} icon={CalendarDays} tone="slate" />
        <StatCard label="Live now" value={t?.live ?? '–'} icon={CirclePlay} tone="emerald" />
        <StatCard label="Completed" value={t?.completed ?? '–'} icon={CircleStop} tone="primary" />
        <StatCard label="Missed" value={t?.missed ?? '–'} icon={Clock} tone="rose" />
        <StatCard label="Upcoming" value={t?.upcoming ?? '–'} icon={Presentation} tone="sky" />
      </div>
      <Card padded={false}>
        {data.isLoading && <div className="px-5"><Spinner /></div>}
        {data.data?.rows.length === 0 && <EmptyState icon={CalendarDays} title="No classes scheduled on this day" tone="sky" />}
        {!!data.data?.rows.length && <DataTable columns={COLUMNS} rows={data.data.rows} rowKey={(r) => r.id} />}
      </Card>
    </div>
  );
}
