import { BookOpen, CalendarRange, DoorOpen, Layers } from 'lucide-react';
import { useState } from 'react';
import { Badge, PageHeader, Tabs } from '@/components/ui';
import { ClassesTab } from '@/features/academics/components/classes/ClassesTab';
import { RoomsTab } from '@/features/academics/components/rooms/RoomsTab';
import { SubjectsTab } from '@/features/academics/components/subjects/SubjectsTab';
import { YearsTab } from '@/features/academics/components/years/YearsTab';

type Tab = 'years' | 'classes' | 'subjects' | 'rooms';

const TABS = [
  { id: 'years' as const, label: 'Years & Terms', icon: CalendarRange },
  { id: 'classes' as const, label: 'Classes & Sections', icon: Layers },
  { id: 'subjects' as const, label: 'Subjects', icon: BookOpen },
  { id: 'rooms' as const, label: 'Rooms', icon: DoorOpen },
];

/** Page 10 "Academic Structure": year → class → section → subject, plus rooms. */
export function AcademicsPage({ readOnly }: { readOnly: boolean }) {
  const [tab, setTab] = useState<Tab>('years');
  return (
    <div>
      <PageHeader title="Academics" sub="Academic years, classes, sections, subjects and rooms" icon={Layers} tone="magenta" actions={readOnly && <Badge tone="slate">View only</Badge>} />
      <Tabs tabs={TABS} value={tab} onChange={setTab} />
      {tab === 'years' && <YearsTab readOnly={readOnly} />}
      {tab === 'classes' && <ClassesTab readOnly={readOnly} />}
      {tab === 'subjects' && <SubjectsTab readOnly={readOnly} />}
      {tab === 'rooms' && <RoomsTab readOnly={readOnly} />}
    </div>
  );
}
