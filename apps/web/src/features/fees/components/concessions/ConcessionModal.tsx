import { useEffect, useState } from 'react';
import { Alert, Button, Field, Input, Modal, Select } from '@/components/ui';
import { useFeeCategories, useFeesAction } from '@/features/fees/hooks/useFees';
import { feeService } from '@/features/fees/services/feeService';
import type { Concession } from '@/features/fees/types/fee.types';
import { errorMessage } from '@/lib/errors';
import { onSubmit } from '@/lib/forms';

const EMPTY = { kind: 'discount' as Concession['kind'], name: '', valueType: 'percentage' as Concession['valueType'], value: '', categoryId: '', isActive: true };

/** Create (concession = 'new') or edit a discount, scholarship or relief. */
export function ConcessionModal({ concession, onClose }: { concession: Concession | 'new' | null; onClose: () => void }) {
  const isNew = concession === 'new';
  const [form, setForm] = useState(EMPTY);
  const categories = useFeeCategories(!!concession);
  const save = useFeesAction(() => feeService.saveConcession(isNew ? undefined : (concession as Concession).id, { ...form, categoryId: form.categoryId || null }), {
    success: 'Concession saved',
    onDone: onClose,
    toastErrors: false,
  });
  useEffect(() => {
    save.reset();
    if (concession && concession !== 'new') setForm({ kind: concession.kind, name: concession.name, valueType: concession.valueType, value: String(Number(concession.value)), categoryId: concession.categoryId ?? '', isActive: concession.isActive });
    else if (concession === 'new') setForm(EMPTY);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [concession]);
  return (
    <Modal
      open={!!concession}
      title={isNew ? 'New concession' : 'Edit concession'}
      onClose={onClose}
      footer={<><Button variant="secondary" onClick={onClose}>Cancel</Button><Button type="submit" form="concession" loading={save.isPending}>Save</Button></>}
    >
      <form id="concession" onSubmit={onSubmit(() => save.mutate(undefined))} className="grid gap-4 sm:grid-cols-2">
        {save.error && <div className="sm:col-span-2"><Alert>{errorMessage(save.error, 'Could not save the concession.')}</Alert></div>}
        <Field label="Name"><Input required maxLength={100} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Sibling discount" /></Field>
        <Field label="Kind">
          <Select value={form.kind} onChange={(e) => setForm({ ...form, kind: e.target.value as Concession['kind'] })}>
            <option value="discount">Discount</option><option value="scholarship">Scholarship</option><option value="relief">Relief</option>
          </Select>
        </Field>
        <Field label="Type">
          <Select value={form.valueType} onChange={(e) => setForm({ ...form, valueType: e.target.value as Concession['valueType'] })}>
            <option value="percentage">Percentage</option><option value="fixed">Fixed amount</option>
          </Select>
        </Field>
        <Field label={form.valueType === 'percentage' ? 'Percent (1–100)' : 'Amount'}>
          <Input required inputMode="decimal" pattern="\d{1,10}(\.\d{1,2})?" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} />
        </Field>
        <Field label="Applies to">
          <Select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}>
            <option value="">All fee categories</option>
            {categories.data?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </Select>
        </Field>
        <label className="flex items-center gap-2 self-end pb-2 text-base text-slate-700 dark:text-slate-200">
          <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="h-4 w-4 accent-primary-600" /> Active
        </label>
      </form>
    </Modal>
  );
}
