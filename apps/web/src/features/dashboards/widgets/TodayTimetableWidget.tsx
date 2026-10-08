import { CalendarDays } from 'lucide-react';
import { Card, EmptyState, Spinner } from '@/components/ui';
import { ViewAll } from '@/features/dashboards/components/ViewAll';
import { useMyTimetable } from '@/features/timetable/hooks/useTimetable';
import { isoWeekdayToday, subjectColor } from '@/features/timetable/utils/timetable.utils';

/** Today's periods from the user's weekly timetable (student: teacher names; teacher: classes). */
export function TodayTimetableWidget({ to = '/timetable', className = '' }: { to?: string; className?: string }) {
  const timetable = useMyTimetable();
  const day = isoWeekdayToday();
  const now = new Date().getHours() * 60 + new Date().getMinutes();
  const slots = (timetable.data?.slots ?? []).filter((s) => s.dayOfWeek === day).sort((a, b) => a.startMinute - b.startMinute);
  return (
    <Card title="Today's timetable" icon={CalendarDays} tone="sky" className={className} actions={<ViewAll to={to} label="Full week" />}>
      {timetable.isLoading && <Spinner />}
      {timetable.isSuccess && slots.length === 0 && <EmptyState icon={CalendarDays} title="No periods today" tone="sky" />}
      {slots.length > 0 && (
        <ol className="relative space-y-2 border-l-2 border-slate-200 pl-4 dark:border-white/10">
          {slots.map((s) => {
            const isNow = now >= s.startMinute && now < s.endMinute;
            const done = now >= s.endMinute;
            return (
              <li key={s.id} className={`relative rounded-xl px-3 py-2 ${isNow ? 'bg-primary-500/10 ring-1 ring-primary-400/50' : 'bg-slate-500/5'} ${done ? 'opacity-60' : ''}`}>
                <span aria-hidden className={`absolute -left-[1.4rem] top-3 h-3 w-3 rounded-full ring-2 ring-white dark:ring-[#0b1220] ${subjectColor(s.subjectId)}`} />
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-slate-800 dark:text-slate-100">{s.subject.name}</span>
                  <span className="text-sm tabular-nums text-slate-500">{s.startTime}–{s.endTime}</span>
                </div>
                <div className="text-sm text-slate-500">
                  {timetable.data?.kind === 'teacher' ? `${s.section.schoolClass.name} ${s.section.name}` : `${s.employee.firstName} ${s.employee.lastName}`}
                  {s.room && ` · ${s.room.name}`}
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </Card>
  );
}
