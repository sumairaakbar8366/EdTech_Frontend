import { useChildrenTimetable } from '@/features/timetable/hooks/useTimetable';
import { useEffect, useState } from 'react';
import { Card, EmptyState, PageHeader, Spinner, Tabs } from '@/components/ui';
import { CalendarDays } from 'lucide-react';
import { WeekGrid } from '@/features/timetable/components/WeekGrid';

/** A parent's view: one tab per child. */
export function ChildrenTimetablePage() {
  const data = useChildrenTimetable();
  const [child, setChild] = useState('');
  useEffect(() => {
    if (!child && data.data?.[0]) setChild(data.data[0].studentId);
  }, [data.data, child]);
  const current = data.data?.find((c) => c.studentId === child);
  return (
    <div>
      <PageHeader title="Timetable" sub="Your children’s weekly periods" icon={CalendarDays} tone="sky" />
      {data.isLoading && <Spinner />}
      {data.data && data.data.length > 1 && <Tabs tabs={data.data.map((c) => ({ id: c.studentId, label: c.name, icon: CalendarDays }))} value={child} onChange={setChild} />}
      {current && (current.slots.length === 0 ? <Card><EmptyState icon={CalendarDays} title="No timetable yet" tone="sky" /></Card> : <Card><WeekGrid slots={current.slots} show="teacher" /></Card>)}
    </div>
  );
}
