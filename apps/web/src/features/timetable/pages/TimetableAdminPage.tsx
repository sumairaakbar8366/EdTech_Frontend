import { useState } from 'react';
import { PageHeader, Tabs } from '@/components/ui';
import { CalendarDays, MonitorCheck } from 'lucide-react';
import { TimetableBuilder } from '@/features/timetable/components/builder/TimetableBuilder';
import { ClassMonitor } from '@/features/timetable/components/monitor/ClassMonitor';

/** Admin: build the timetable and monitor today's classes. */
export function TimetableAdminPage() {
  const [tab, setTab] = useState<'build' | 'monitor'>('build');
  return (
    <div>
      <PageHeader title="Timetable" sub="Weekly periods per section and live class monitoring" icon={CalendarDays} tone="sky" />
      <Tabs tabs={[{ id: 'build' as const, label: 'Timetable', icon: CalendarDays }, { id: 'monitor' as const, label: 'Class monitor', icon: MonitorCheck }]} value={tab} onChange={setTab} />
      {tab === 'build' ? <TimetableBuilder /> : <ClassMonitor />}
    </div>
  );
}
