import { BookOpen, CalendarRange, DoorOpen, Layers, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { Badge, Button, PageHeader, Tabs } from '@/components/ui';
import { ClassesTab } from '@/features/academics/components/classes/ClassesTab';
import { QuickSetupModal } from '@/features/academics/components/setup/QuickSetupModal';
import { useAcademicsSummary } from '@/features/academics/hooks/useAcademics';
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
  const [setupOpen, setSetupOpen] = useState(false);
  const summary = useAcademicsSummary(!readOnly);
  const c = summary.data?.counts;
  const empty = !!c && c.classes === 0 && c.subjects === 0 && c.rooms === 0;
  return (
    <div>
      <PageHeader title="Academics" sub="Academic years, classes, sections, subjects and rooms" icon={Layers} tone="magenta" actions={readOnly ? <Badge tone="slate">View only</Badge> : <Button icon={Sparkles} onClick={() => setSetupOpen(true)}>Quick setup</Button>} />
      {empty && (
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-primary-500/25 bg-primary-500/10 px-4 py-3">
          <div>
            <div className="font-bold text-slate-900 dark:text-white">New school? Set up everything in one minute.</div>
            <div className="text-sm text-slate-600 dark:text-slate-300">Tell us how many classes, sections, subjects and rooms you have, and we add them all together.</div>
          </div>
          <Button icon={Sparkles} onClick={() => setSetupOpen(true)}>Start quick setup</Button>
        </div>
      )}
      <Tabs tabs={TABS} value={tab} onChange={setTab} />
      {tab === 'years' && <YearsTab readOnly={readOnly} />}
      {tab === 'classes' && <ClassesTab readOnly={readOnly} />}
      {tab === 'subjects' && <SubjectsTab readOnly={readOnly} />}
      {tab === 'rooms' && <RoomsTab readOnly={readOnly} />}
      {!readOnly && <QuickSetupModal open={setupOpen} onClose={() => setSetupOpen(false)} />}
    </div>
  );
}
