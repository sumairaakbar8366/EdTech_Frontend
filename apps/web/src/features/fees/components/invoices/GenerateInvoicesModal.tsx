import { useState } from 'react';
import { Alert, Button, Field, Input, Modal, Select } from '@/components/ui';
import { useAcademicYears, useClasses } from '@/features/academics/hooks/useAcademics';
import { FREQUENCY_LABEL } from '@/features/fees/constants';
import { useFeesAction } from '@/features/fees/hooks/useFees';
import { feeService } from '@/features/fees/services/feeService';
import type { Frequency } from '@/features/fees/types/fee.types';
import { errorMessage } from '@/lib/errors';
import { onSubmit } from '@/lib/forms';

/** Bill every student of a class (or section) with an assigned structure for one period. */
export function GenerateInvoicesModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const today = new Date().toISOString().slice(0, 10);
  const [form, setForm] = useState({ academicYearId: '', classId: '', sectionId: '', periodLabel: '', issueDate: today, dueDate: today, frequencies: ['monthly'] as Frequency[] });
  const years = useAcademicYears(open);
  const classes = useClasses(open);
  const sections = classes.data?.find((c) => c.id === form.classId)?.sections ?? [];
  const generate = useFeesAction(() => feeService.generateInvoices({ ...form, academicYearId: form.academicYearId || undefined, sectionId: form.sectionId || undefined }), {
    success: (r) => `${r.created} invoice(s) created${r.skipped ? `, ${r.skipped} skipped (already billed)` : ''}`,
    onDone: onClose,
    toastErrors: false,
  });
  const toggle = (f: Frequency) =>
    setForm((s) => ({ ...s, frequencies: s.frequencies.includes(f) ? s.frequencies.filter((x) => x !== f) : [...s.frequencies, f] }));

  return (
    <Modal
      open={open}
      title="Generate invoices"
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" form="generate-invoices" loading={generate.isPending} disabled={!form.classId || !form.periodLabel || form.frequencies.length === 0}>
            Generate
          </Button>
        </>
      }
    >
      <form id="generate-invoices" onSubmit={onSubmit(() => generate.mutate(undefined))} className="grid gap-4 sm:grid-cols-2">
        {generate.error && <div className="sm:col-span-2"><Alert>{errorMessage(generate.error, 'Could not generate invoices.')}</Alert></div>}
        <Field label="Academic year" hint="Defaults to the current year">
          <Select value={form.academicYearId} onChange={(e) => setForm({ ...form, academicYearId: e.target.value })}>
            <option value="">Current year</option>
            {years.data?.map((y) => <option key={y.id} value={y.id}>{y.name}</option>)}
          </Select>
        </Field>
        <Field label="Class">
          <Select required value={form.classId} onChange={(e) => setForm({ ...form, classId: e.target.value, sectionId: '' })}>
            <option value="">Choose a class</option>
            {classes.data?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </Select>
        </Field>
        <Field label="Section" hint="Optional">
          <Select value={form.sectionId} onChange={(e) => setForm({ ...form, sectionId: e.target.value })} disabled={!form.classId}>
            <option value="">{form.classId ? 'All sections' : 'Choose a class first'}</option>
            {sections.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </Select>
        </Field>
        <Field label="Billing period" hint='e.g. "October 2026" or "Term 1"'>
          <Input required maxLength={40} value={form.periodLabel} onChange={(e) => setForm({ ...form, periodLabel: e.target.value })} />
        </Field>
        <Field label="Issue date"><Input type="date" required value={form.issueDate} onChange={(e) => setForm({ ...form, issueDate: e.target.value })} /></Field>
        <Field label="Due date"><Input type="date" required min={form.issueDate} value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} /></Field>
        <fieldset className="sm:col-span-2">
          <legend className="mb-1 text-sm font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">Include fee items billed</legend>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(FREQUENCY_LABEL) as Frequency[]).map((f) => (
              <label key={f} className={`cursor-pointer rounded-lg px-3 py-1.5 text-sm font-semibold ring-1 transition ${form.frequencies.includes(f) ? 'bg-primary-500/15 text-primary-700 ring-primary-400 dark:text-primary-200' : 'text-slate-600 ring-slate-300 dark:text-slate-300 dark:ring-white/10'}`}>
                <input type="checkbox" className="sr-only" checked={form.frequencies.includes(f)} onChange={() => toggle(f)} />
                {FREQUENCY_LABEL[f]}
              </label>
            ))}
          </div>
        </fieldset>
        <p className="text-sm text-slate-500 sm:col-span-2">
          Each enrolled student with an assigned structure gets one invoice for this period. Active scholarships and discounts are applied automatically; students already billed for this period are skipped.
        </p>
      </form>
    </Modal>
  );
}
