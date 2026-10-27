import { MousePointerClick, Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button, Card, ConfirmDialog, Field, FilterBar, SearchSelect, Spinner } from '@/components/ui';
import { useClasses } from '@/features/academics/hooks/useAcademics';
import { useCan } from '@/features/auth/usePermissions';
import { AddPeriodModal, type PeriodPreset } from '@/features/timetable/components/builder/AddPeriodModal';
import { WeekGrid } from '@/features/timetable/components/WeekGrid';
import { useSectionTimetable, useTimetableAction } from '@/features/timetable/hooks/useTimetable';
import { timetableService } from '@/features/timetable/services/timetableService';
import type { TimetableSlot } from '@/features/timetable/types/timetable.types';
import { DAY_NAMES } from '@/lib/format';

/** Pick a section, then add, change (click a period) or remove its weekly periods. */
export function TimetableBuilder() {
  const classes = useClasses();
  const [sectionId, setSectionId] = useState('');
  const canEdit = useCan()('timetable.edit');
  const [adding, setAdding] = useState(false);
  const [preset, setPreset] = useState<PeriodPreset | null>(null);
  const [editing, setEditing] = useState<TimetableSlot | null>(null);
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
              <SearchSelect
                value={sectionId}
                onChange={(v) => v && setSectionId(v)}
                placeholder="Search class or section…"
                options={(classes.data ?? []).flatMap((c) => c.sections.map((s) => ({ value: s.id, label: `${c.name} – ${s.name}`, detail: s.campus.name })))}
                emptyText="No section matches"
              />
            </Field>
          </div>
          {canEdit && (
            <>
              <p className="hidden items-center gap-1.5 text-sm text-slate-500 lg:inline-flex"><MousePointerClick size={15} /> Click a period to change its teacher, room or time</p>
              <div className="ml-auto"><Button icon={Plus} disabled={!sectionId} onClick={() => { setPreset(null); setAdding(true); }}>Add period</Button></div>
            </>
          )}
        </FilterBar>
        <div className="p-4">
          {slots.isLoading && <Spinner />}
          {slots.data && (
            <WeekGrid
              slots={slots.data}
              show="teacher"
              onDelete={canEdit ? setRemoving : undefined}
              onEdit={canEdit ? setEditing : undefined}
              onAdd={canEdit ? (at) => { setPreset(at); setAdding(true); } : undefined}
            />
          )}
        </div>
      </Card>
      {cls && sectionId && <AddPeriodModal open={adding} sectionId={sectionId} cls={cls} preset={preset} onClose={() => setAdding(false)} />}
      {cls && sectionId && <AddPeriodModal open={!!editing} sectionId={sectionId} cls={cls} slot={editing} onClose={() => setEditing(null)} />}
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
