import { useEffect, useState } from 'react';
import { Alert, Button, Input, Modal } from '@/components/ui';
import type { SchoolClass } from '@/features/academics/types/academics.types';
import { useExamsAction } from '@/features/exams/hooks/useExams';
import { examService } from '@/features/exams/services/examService';
import type { ExamDetail } from '@/features/exams/types/exam.types';
import { errorMessage } from '@/lib/errors';

type Row = { subjectId: string; name: string; on: boolean; examDate: string; maxMarks: string; passMarks: string };

/** Choose which of a class's subjects sit this exam, with dates and marks. */
export function PapersModal({ exam, schoolClass, onClose }: { exam: ExamDetail; schoolClass: SchoolClass | null; onClose: () => void }) {
  const [rows, setRows] = useState<Row[]>([]);
  const save = useExamsAction(
    () => examService.savePapers(exam.id, schoolClass!.id, rows.filter((r) => r.on).map((r) => ({ subjectId: r.subjectId, examDate: r.examDate || null, maxMarks: r.maxMarks, passMarks: r.passMarks }))),
    { success: 'Papers saved', onDone: onClose, toastErrors: false },
  );
  useEffect(() => {
    if (!schoolClass) return;
    save.reset();
    setRows(
      schoolClass.classSubjects.map((cs) => {
        const p = exam.subjects.find((x) => x.classId === schoolClass.id && x.subjectId === cs.subjectId);
        return { subjectId: cs.subjectId, name: cs.subject.name, on: !!p || exam.subjects.every((x) => x.classId !== schoolClass.id), examDate: p?.examDate?.slice(0, 10) ?? '', maxMarks: p ? String(Number(p.maxMarks)) : '100', passMarks: p ? String(Number(p.passMarks)) : '33' };
      }),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [schoolClass, exam.subjects]);
  const set = (i: number, patch: Partial<Row>) => setRows((r) => r.map((x, idx) => (idx === i ? { ...x, ...patch } : x)));
  return (
    <Modal open={!!schoolClass} title={schoolClass ? `Papers · ${schoolClass.name}` : 'Papers'} onClose={onClose} size="lg" footer={<><Button variant="secondary" onClick={onClose}>Cancel</Button><Button loading={save.isPending} onClick={() => save.mutate(undefined)}>Save papers</Button></>}>
      {save.error && <div className="mb-3"><Alert>{errorMessage(save.error, 'Could not save.')}</Alert></div>}
      {rows.length === 0 && <Alert tone="info">This class has no subjects yet (Academics → Classes).</Alert>}
      <div className="space-y-2">
        {rows.map((r, i) => (
          <div key={r.subjectId} className={`grid grid-cols-[1.5rem_1fr_9.5rem_5.5rem_5.5rem] items-center gap-2 ${r.on ? '' : 'opacity-50'}`}>
            <input type="checkbox" aria-label={`Include ${r.name}`} className="h-4 w-4 accent-primary-600" checked={r.on} onChange={(e) => set(i, { on: e.target.checked })} />
            <span className="font-semibold text-slate-700 dark:text-slate-200">{r.name}</span>
            <Input type="date" aria-label="Date" value={r.examDate} disabled={!r.on} onChange={(e) => set(i, { examDate: e.target.value })} />
            <Input aria-label="Max marks" inputMode="decimal" value={r.maxMarks} disabled={!r.on} onChange={(e) => set(i, { maxMarks: e.target.value })} />
            <Input aria-label="Pass marks" inputMode="decimal" value={r.passMarks} disabled={!r.on} onChange={(e) => set(i, { passMarks: e.target.value })} />
          </div>
        ))}
      </div>
      {rows.length > 0 && <p className="mt-2 text-sm text-slate-500">Columns: date (optional), maximum marks, pass marks.</p>}
    </Modal>
  );
}
