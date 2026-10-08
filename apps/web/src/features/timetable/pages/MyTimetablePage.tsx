import { useMyTimetable } from '@/features/timetable/hooks/useTimetable';
import { useMemo } from 'react';
import { isoWeekdayToday } from '@/features/timetable/utils/timetable.utils';
import { Card, EmptyState, PageHeader, Spinner } from '@/components/ui';
import { CalendarDays } from 'lucide-react';
import { errorMessage } from '@/lib/errors';
import { WeekGrid } from '@/features/timetable/components/WeekGrid';

/** A teacher's or student's own week, today highlighted. */
export function MyTimetablePage() {
  const data = useMyTimetable();
  const today = useMemo(isoWeekdayToday, []);
  return (
    <div>
      <PageHeader title={data.data?.kind === 'student' ? 'Timetable' : 'My Timetable'} sub="Your weekly periods" icon={CalendarDays} tone="sky" />
      {data.isLoading && <Spinner />}
      {data.error && <Card><EmptyState icon={CalendarDays} title="No timetable available" tone="sky">{errorMessage(data.error, '')}</EmptyState></Card>}
      {data.data &&
        (data.data.slots.length === 0 ? (
          <Card><EmptyState icon={CalendarDays} title="No periods on your timetable yet" tone="sky" /></Card>
        ) : (
          <Card><WeekGrid slots={data.data.slots} show={data.data.kind === 'teacher' ? 'section' : 'teacher'} highlightDay={today} /></Card>
        ))}
    </div>
  );
}
