import { ArrowUpRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button, Field, Modal, Select } from '@/components/ui';
import { useAcademicYears, useClasses } from '@/features/academics/hooks/useAcademics';
import { usePromotionCandidates, useStudentsAction } from '@/features/students/hooks/useStudents';
import { studentService } from '@/features/students/services/studentService';

/** Page 5 "Promotion → Next Academic Year": move a section's students to a section of another year. */
export function PromoteStudentsModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const years = useAcademicYears(open);
  const classes = useClasses(open);
  const [fromYear, setFromYear] = useState('');
  const [fromSection, setFromSection] = useState('');
  const [toYear, setToYear] = useState('');
  const [toSection, setToSection] = useState('');
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const candidates = usePromotionCandidates(fromYear, fromSection);

  useEffect(() => setPicked(new Set(candidates.data?.map((s) => s.id) ?? [])), [candidates.data]);
  // Default: from the current year to the one after it.
  useEffect(() => {
    if (!open || !years.data) return;
    const sorted = [...years.data].sort((a, b) => a.startDate.localeCompare(b.startDate));
    const current = sorted.findIndex((y) => y.isCurrent);
    setFromYear(sorted[current]?.id ?? '');
    setToYear(sorted[current + 1]?.id ?? '');
  }, [open, years.data]);

  const promote = useStudentsAction(
    () => studentService.promote({ fromAcademicYearId: fromYear, fromSectionId: fromSection, toAcademicYearId: toYear, toSectionId: toSection, studentIds: [...picked] }),
    'Students promoted',
    onClose,
  );
  const toggle = (id: string) =>
    setPicked((p) => {
      const n = new Set(p);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  const sectionOptions = classes.data?.map((c) => (
    <optgroup key={c.id} label={c.name}>
      {c.sections.map((s) => <option key={s.id} value={s.id}>{c.name} – {s.name} ({s.campus.code})</option>)}
    </optgroup>
  ));
  const yearOptions = years.data?.map((y) => <option key={y.id} value={y.id}>{y.name}</option>);

  return (
    <Modal
      open={open}
      size="lg"
      title="Promote students to the next year"
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button icon={ArrowUpRight} disabled={!toYear || !toSection || picked.size === 0} loading={promote.isPending} onClick={() => promote.mutate(undefined)}>Promote {picked.size || ''}</Button>
        </>
      }
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="From year"><Select value={fromYear} onChange={(e) => setFromYear(e.target.value)}><option value="">Select…</option>{yearOptions}</Select></Field>
        <Field label="From section"><Select value={fromSection} onChange={(e) => setFromSection(e.target.value)}><option value="">Select…</option>{sectionOptions}</Select></Field>
        <Field label="To year"><Select value={toYear} onChange={(e) => setToYear(e.target.value)}><option value="">Select…</option>{yearOptions}</Select></Field>
        <Field label="To section"><Select value={toSection} onChange={(e) => setToSection(e.target.value)}><option value="">Select…</option>{sectionOptions}</Select></Field>
      </div>
      {fromYear && fromSection && (
        <div className="mt-4">
          <div className="mb-2 text-sm font-bold uppercase tracking-wider text-slate-500">Students ({candidates.data?.length ?? 0})</div>
          {candidates.data?.length === 0 && <p className="text-base text-slate-500">No enrolled students in this section for that year.</p>}
          <div className="grid max-h-60 gap-1.5 overflow-y-auto sm:grid-cols-2">
            {candidates.data?.map((s) => (
              <label key={s.id} className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-base hover:bg-slate-500/5">
                <input type="checkbox" className="h-4 w-4 accent-primary-600" checked={picked.has(s.id)} onChange={() => toggle(s.id)} />
                {s.rollNo ? `${s.rollNo}. ` : ''}{s.firstName} {s.lastName}
              </label>
            ))}
          </div>
        </div>
      )}
    </Modal>
  );
}
