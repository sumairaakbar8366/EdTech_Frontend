import { useEffect, useState } from 'react';
import { Alert, Button, Modal } from '@/components/ui';
import { useAcademicsAction, useClasses } from '@/features/academics/hooks/useAcademics';
import { academicsService } from '@/features/academics/services/academicsService';
import type { SchoolClass } from '@/features/academics/types/academics.types';

/** "Same as this class": adds this class's sections and/or subjects to the classes you tick. Existing ones are kept. */
export function CopySetupModal({ source, onClose }: { source: SchoolClass | null; onClose: () => void }) {
  const classes = useClasses(!!source);
  const others = (classes.data ?? []).filter((c) => c.id !== source?.id);
  const [targets, setTargets] = useState<Set<string>>(new Set());
  const [sections, setSections] = useState(true);
  const [subjects, setSubjects] = useState(true);
  useEffect(() => {
    if (source) { setTargets(new Set()); setSections(true); setSubjects(true); }
  }, [source]);
  const copy = useAcademicsAction(
    () => academicsService.copyClassSetup(source!.id, { targetClassIds: [...targets], sections, subjects }),
    'Copied to the selected classes',
    onClose,
  );
  const allOn = others.length > 0 && targets.size === others.length;
  const toggle = (id: string) => setTargets((prev) => { const next = new Set(prev); if (next.has(id)) next.delete(id); else next.add(id); return next; });
  return (
    <Modal
      open={!!source}
      title={`Copy setup · ${source?.name ?? ''}`}
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button loading={copy.isPending} disabled={targets.size === 0 || (!sections && !subjects)} onClick={() => copy.mutate(undefined)}>Copy to {targets.size || ''} {targets.size === 1 ? 'class' : 'classes'}</Button>
        </>
      }
    >
      <div className="space-y-4">
        <p className="text-sm text-slate-500">Give other classes the same as {source?.name}. What they already have is kept; only the missing parts are added.</p>
        <div className="flex flex-wrap gap-4 text-sm text-slate-700 dark:text-slate-200">
          <label className="flex items-center gap-2"><input type="checkbox" className="h-4 w-4 accent-primary-600" checked={sections} onChange={(e) => setSections(e.target.checked)} />Sections ({source?.sections.length ?? 0})</label>
          <label className="flex items-center gap-2"><input type="checkbox" className="h-4 w-4 accent-primary-600" checked={subjects} onChange={(e) => setSubjects(e.target.checked)} />Subjects ({source?.classSubjects.length ?? 0})</label>
        </div>
        {others.length === 0 ? (
          <Alert tone="info">There are no other classes yet.</Alert>
        ) : (
          <>
            <div className="flex items-center justify-between text-sm text-slate-500">
              <span>{targets.size} of {others.length} classes selected</span>
              <button type="button" className="text-xs font-semibold text-primary-600 hover:underline" onClick={() => setTargets(allOn ? new Set() : new Set(others.map((c) => c.id)))}>{allOn ? 'Clear all' : 'Select all'}</button>
            </div>
            <div className="grid max-h-64 grid-cols-2 gap-2 overflow-y-auto">
              {others.map((c) => (
                <label key={c.id} className={`flex cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm ring-1 ring-inset transition ${targets.has(c.id) ? 'bg-primary-500/10 ring-primary-500/30' : 'ring-slate-500/15 hover:bg-slate-500/5'}`}>
                  <input type="checkbox" className="h-4 w-4 accent-primary-600" checked={targets.has(c.id)} onChange={() => toggle(c.id)} />
                  <span className="font-medium text-slate-800 dark:text-slate-100">{c.name}</span>
                </label>
              ))}
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
