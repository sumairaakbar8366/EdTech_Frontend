import { Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button, Card, ConfirmDialog, Field, FilterBar, Select, Spinner } from '@/components/ui';
import { useClasses } from '@/features/academics/hooks/useAcademics';
import { AddPeriodModal } from '@/features/timetable/components/builder/AddPeriodModal';
import { WeekGrid } from '@/features/timetable/components/WeekGrid';
import { useSectionTimetable, useTimetableAction } from '@/features/timetable/hooks/useTimetable';
import { timetableService } from '@/features/timetable/services/timetableService';
import type { TimetableSlot } from '@/features/timetable/types/timetable.types';
import { DAY_NAMES } from '@/lib/format';

/** Pick a section, then add or remove its weekly periods. */
export function TimetableBuilder() {
  const classes = useClasses();
  const [sectionId, setSectionId] = useState('');
  const [adding, setAdding] = useState(false);
  const [removing, setRemoving] = useState<TimetableSlot | null>(null);
  useEffect(() => {
    if (!sectionId && classes.data?.[0]?.sections[0]) setSectionId(classes.data[0].sections[0].id);
  }, [classes.data, sectionId]);
  const slots = useSectionTimetable(sectionId);
  const remove = useTimetableAction((id: string) => timetableService.removeSlot(id), 'Period removed', () => setRemoving(null));
  const cls = classes.data?.find((c) => c.sections.some((s) => s.id === sectionId));

  return (
    <>
      <Card padded={false}>
        <FilterBar align="end">
          <div className="w-72">
            <Field label="Section">
              <Select value={sectionId} onChange={(e) => setSectionId(e.target.value)}>
                {classes.data?.map((c) => (
                  <optgroup key={c.id} label={c.name}>{c.sections.map((s) => <option key={s.id} value={s.id}>{c.name} – {s.name} ({s.campus.code})</option>)}</optgroup>
                ))}
              </Select>
            </Field>
          </div>
          <div className="ml-auto"><Button icon={Plus} disabled={!sectionId} onClick={() => setAdding(true)}>Add period</Button></div>
        </FilterBar>
        <div className="p-4">
          {slots.isLoading && <Spinner />}
          {slots.data && <WeekGrid slots={slots.data} show="teacher" onDelete={setRemoving} />}
        </div>
      </Card>
      {cls && sectionId && <AddPeriodModal open={adding} sectionId={sectionId} cls={cls} onClose={() => setAdding(false)} />}
      <ConfirmDialog
        open={!!removing}
        title="Remove period?"
        message={`${removing?.subject.name} on ${removing ? DAY_NAMES[removing.dayOfWeek] : ''} ${removing?.startTime}–${removing?.endTime} will be removed from the timetable.`}
        confirmLabel="Remove"
        loading={remove.isPending}
        onConfirm={() => removing && remove.mutate(removing.id)}
        onClose={() => setRemoving(null)}
      />
    </>
  );
}
