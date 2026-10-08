import { useEffect, useState } from 'react';
import { useAreaNavigate } from '@/app/router/area';
import { Alert, Button, Field, Input, Modal, Select } from '@/components/ui';
import { useAcademicYears } from '@/features/academics/hooks/useAcademics';
import { useExamsAction } from '@/features/exams/hooks/useExams';
import { examService } from '@/features/exams/services/examService';
import { errorMessage } from '@/lib/errors';
import { onSubmit } from '@/lib/forms';

/** Create or edit an exam; a new exam opens straight after saving. */
export function ExamModal({ open, exam, onClose }: { open: boolean; exam?: { id: string; name: string; startDate: string; endDate: string; term: { id: string } | null }; onClose: () => void }) {
  const navigate = useAreaNavigate();
  const today = new Date().toISOString().slice(0, 10);
  const [form, setForm] = useState({ name: '', termId: '', startDate: today, endDate: today });
  const years = useAcademicYears(open);
  const save = useExamsAction(() => examService.save(exam?.id, { ...form, termId: form.termId || null }), {
    success: exam ? 'Exam saved' : 'Exam created',
    onDone: (r) => {
      onClose();
      if (!exam && r && typeof r === 'object' && 'id' in r) navigate(`/exams/${(r as { id: string }).id}`);
    },
    toastErrors: false,
  });
  const terms = years.data?.find((y) => y.isCurrent)?.terms ?? [];
  useEffect(() => {
    if (!open) return;
    save.reset();
    setForm(exam ? { name: exam.name, termId: exam.term?.id ?? '', startDate: exam.startDate.slice(0, 10), endDate: exam.endDate.slice(0, 10) } : { name: '', termId: '', startDate: today, endDate: today });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, exam]);
  return (
    <Modal open={open} title={exam ? 'Edit exam' : 'New exam'} onClose={onClose} footer={<><Button variant="secondary" onClick={onClose}>Cancel</Button><Button type="submit" form="exam" loading={save.isPending}>Save</Button></>}>
      <form id="exam" onSubmit={onSubmit(() => save.mutate(undefined))} className="grid gap-4 sm:grid-cols-2">
        {save.error && <div className="sm:col-span-2"><Alert>{errorMessage(save.error, 'Could not save the exam.')}</Alert></div>}
        <div className="sm:col-span-2"><Field label="Name"><Input required maxLength={80} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Mid-term examination" /></Field></div>
        <div className="sm:col-span-2">
          <Field label="Term" hint="Optional">
            <Select value={form.termId} onChange={(e) => setForm({ ...form, termId: e.target.value })}>
              <option value="">Whole year</option>
              {terms.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </Select>
          </Field>
        </div>
        <Field label="Starts"><Input type="date" required value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} /></Field>
        <Field label="Ends"><Input type="date" required min={form.startDate} value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} /></Field>
      </form>
    </Modal>
  );
}
