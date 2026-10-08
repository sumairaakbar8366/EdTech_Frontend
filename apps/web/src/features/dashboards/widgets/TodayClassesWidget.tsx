import { Presentation } from 'lucide-react';
import { Badge, Card, EmptyState, Spinner, StatusBadge } from '@/components/ui';
import { ViewAll } from '@/features/dashboards/components/ViewAll';
import { SLOT_STATE_LABEL, SLOT_STATE_TONE } from '@/features/timetable/constants';
import { useTodaysClasses } from '@/features/timetable/hooks/useTimetable';
import { slotState } from '@/features/timetable/utils/timetable.utils';

/** A teacher's periods today with their live / completed / missed state. */
export function TodayClassesWidget({ className = '' }: { className?: string }) {
  const today = useTodaysClasses();
  const d = today.data;
  return (
    <Card title="Today's classes" icon={Presentation} tone="magenta" className={className} actions={<ViewAll to="/todays-classes" label="Start / end class" />}>
      {today.isLoading && <Spinner />}
      {d?.slots.length === 0 && <EmptyState icon={Presentation} title="No classes today" tone="magenta">Enjoy the free day.</EmptyState>}
      <ul className="space-y-2">
        {d?.slots.map((s) => {
          const state = slotState(s, d.nowMinute);
          const isNow = d.nowMinute >= s.startMinute && d.nowMinute < s.endMinute;
          return (
            <li key={s.id} className={`flex items-center gap-3 rounded-xl px-3 py-2 ${isNow ? 'bg-primary-500/10 ring-1 ring-primary-400/50' : 'bg-slate-500/5'}`}>
              <span className="w-24 shrink-0 font-semibold tabular-nums text-slate-600 dark:text-slate-300">{s.startTime}–{s.endTime}</span>
              <div className="min-w-0 flex-1">
                <div className="truncate font-semibold text-slate-800 dark:text-slate-100">{s.subject.name}</div>
                <div className="text-sm text-slate-500">{s.section.schoolClass.name} {s.section.name}{s.room && ` · ${s.room.name}`}</div>
              </div>
              {isNow && state === 'scheduled' && <Badge tone="primary">Now</Badge>}
              <StatusBadge status={state} tones={SLOT_STATE_TONE} labels={SLOT_STATE_LABEL} />
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
