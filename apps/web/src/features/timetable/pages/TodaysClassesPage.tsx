import { DAY_NAMES, formatDate } from '@/lib/format';
import { useTimetableAction, useTodaysClasses } from '@/features/timetable/hooks/useTimetable';
import { timetableService } from '@/features/timetable/services/timetableService';
import { Card, EmptyState, PageHeader, Spinner } from '@/components/ui';
import { Presentation } from 'lucide-react';
import { errorMessage } from '@/lib/errors';
import { ClassSessionCard } from '@/features/timetable/components/today/ClassSessionCard';
import { slotState } from '@/features/timetable/utils/timetable.utils';

/** Page 7: Teacher Dashboard → Start Class → Class Session → End Class. */
export function TodaysClassesPage() {
  const data = useTodaysClasses();
  const start = useTimetableAction((v: { slotId: string; topic: string | null }) => timetableService.startClass(v.slotId, v.topic), 'Class started');
  const end = useTimetableAction((sessionId: string) => timetableService.endClass(sessionId), 'Class ended');
  const now = data.data?.nowMinute ?? 0;
  const live = data.data?.slots.find((s) => s.session?.status === 'live');
  const sub = data.data ? `${DAY_NAMES[new Date(data.data.date + 'T00:00:00Z').getUTCDay() || 7]}, ${formatDate(data.data.date + 'T00:00:00Z')}` : undefined;

  return (
    <div>
      <PageHeader title="Today's Classes" sub={sub} icon={Presentation} tone="magenta" />
      {data.isLoading && <Spinner />}
      {data.error && <Card><EmptyState icon={Presentation} title="No classes available" tone="magenta">{errorMessage(data.error, '')}</EmptyState></Card>}
      {data.data?.slots.length === 0 && <Card><EmptyState icon={Presentation} title="No classes on your timetable today" tone="magenta" /></Card>}
      <div className="space-y-3">
        {data.data?.slots.map((s) => (
          <ClassSessionCard
            key={s.id}
            slot={s}
            state={slotState(s, now)}
            isNow={now >= s.startMinute && now < s.endMinute}
            blocked={!!live}
            starting={start.isPending && start.variables?.slotId === s.id}
            ending={end.isPending}
            onStart={(topic) => start.mutate({ slotId: s.id, topic })}
            onEnd={(id) => end.mutate(id)}
          />
        ))}
      </div>
    </div>
  );
}
