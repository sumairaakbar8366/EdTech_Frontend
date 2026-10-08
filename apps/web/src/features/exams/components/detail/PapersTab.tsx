import { BookOpen, Pencil, Plus } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Card, EmptyState, IconButton } from '@/components/ui';
import { useClasses } from '@/features/academics/hooks/useAcademics';
import type { SchoolClass } from '@/features/academics/types/academics.types';
import { PapersModal } from '@/features/exams/components/detail/PapersModal';
import type { ExamDetail } from '@/features/exams/types/exam.types';
import { formatDate } from '@/lib/format';

/** Papers per class: subject, date, maximum and pass marks. */
export function PapersTab({ exam, canEdit }: { exam: ExamDetail; canEdit: boolean }) {
  const [editingClass, setEditingClass] = useState<SchoolClass | null>(null);
  const classes = useClasses(canEdit);
  const byClass = useMemo(() => {
    const m = new Map<string, ExamDetail['subjects']>();
    for (const p of exam.subjects) m.set(p.classId, [...(m.get(p.classId) ?? []), p]);
    return m;
  }, [exam.subjects]);
  const list = canEdit ? classes.data ?? [] : [...new Map(exam.subjects.map((p) => [p.classId, { id: p.classId, name: p.schoolClass.name }])).values()];
  if (!canEdit && exam.subjects.length === 0) return <Card><EmptyState icon={BookOpen} title="No papers yet" tone="fuchsia" /></Card>;
  return (
    <div className="stagger grid gap-4 lg:grid-cols-2">
      {list.map((c) => {
        const papers = byClass.get(c.id) ?? [];
        return (
          <Card key={c.id} title={c.name} icon={BookOpen} tone={papers.length ? 'fuchsia' : 'slate'} actions={canEdit && <IconButton icon={papers.length ? Pencil : Plus} label="Edit papers" onClick={() => setEditingClass(c as SchoolClass)} />}>
            {papers.length === 0 ? (
              <p className="text-sm text-slate-500">No papers for this class.</p>
            ) : (
              <ul className="divide-y divide-slate-200/70 dark:divide-white/5">
                {papers.map((p) => (
                  <li key={p.id} className="flex items-center justify-between py-1.5">
                    <span className="text-slate-700 dark:text-slate-200">{p.subject.name}{p.examDate && <span className="text-sm text-slate-500"> · {formatDate(p.examDate)}</span>}</span>
                    <span className="text-sm tabular-nums text-slate-500">{Number(p.maxMarks)} max · pass {Number(p.passMarks)}</span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        );
      })}
      {canEdit && <PapersModal exam={exam} schoolClass={editingClass} onClose={() => setEditingClass(null)} />}
    </div>
  );
}
