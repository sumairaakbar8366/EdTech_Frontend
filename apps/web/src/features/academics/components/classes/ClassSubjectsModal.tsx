import { useEffect, useState } from 'react';
import { Button, Modal } from '@/components/ui';
import { useAcademicsAction, useSubjects } from '@/features/academics/hooks/useAcademics';
import { academicsService } from '@/features/academics/services/academicsService';
import type { SchoolClass } from '@/features/academics/types/academics.types';

/** Choose which subjects are taught in a class. */
export function ClassSubjectsModal({ schoolClass, onClose }: { schoolClass: SchoolClass | null; onClose: () => void }) {
  const subjects = useSubjects(!!schoolClass);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  useEffect(() => {
    if (schoolClass) setSelected(new Set(schoolClass.classSubjects.map((cs) => cs.subjectId)));
  }, [schoolClass]);
  const save = useAcademicsAction(() => academicsService.setClassSubjects(schoolClass!.id, [...selected]), 'Subjects updated', onClose);
  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <Modal
      open={!!schoolClass}
      title={`Subjects · ${schoolClass?.name ?? ''}`}
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button loading={save.isPending} onClick={() => save.mutate(undefined)}>Save</Button>
        </>
      }
    >
      {subjects.data?.length ? (
        <div className="grid max-h-80 grid-cols-2 gap-2 overflow-y-auto">
          {subjects.data.map((s) => {
            const checked = selected.has(s.id);
            return (
              <label
                key={s.id}
                className={`flex cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm ring-1 ring-inset transition ${checked ? 'bg-primary-500/10 ring-primary-500/30' : 'ring-slate-500/15 hover:bg-slate-500/5'}`}
              >
                <input type="checkbox" className="h-4 w-4 accent-primary-600" checked={checked} onChange={() => toggle(s.id)} />
                <span className="font-medium text-slate-800 dark:text-slate-100">{s.name}</span>
                <span className="ml-auto font-mono text-xs text-slate-400">{s.code}</span>
              </label>
            );
          })}
        </div>
      ) : (
        <p className="text-sm text-slate-500">Create subjects in the Subjects tab first.</p>
      )}
    </Modal>
  );
}
