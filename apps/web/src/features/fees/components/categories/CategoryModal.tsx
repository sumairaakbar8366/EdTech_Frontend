import { useEffect, useState } from 'react';
import { Alert, Button, Field, Input, Modal } from '@/components/ui';
import { useFeesAction } from '@/features/fees/hooks/useFees';
import { feeService } from '@/features/fees/services/feeService';
import type { FeeCategory } from '@/features/fees/types/fee.types';
import { errorMessage } from '@/lib/errors';
import { onSubmit } from '@/lib/forms';

/** Create (category = 'new') or edit a fee category. */
export function CategoryModal({ category, onClose }: { category: FeeCategory | 'new' | null; onClose: () => void }) {
  const isNew = category === 'new';
  const [form, setForm] = useState({ name: '', code: '', isActive: true });
  const save = useFeesAction(() => feeService.saveCategory(isNew ? undefined : (category as FeeCategory).id, form), { success: 'Category saved', onDone: onClose, toastErrors: false });
  useEffect(() => {
    save.reset();
    setForm(category && category !== 'new' ? { name: category.name, code: category.code, isActive: category.isActive } : { name: '', code: '', isActive: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category]);
  return (
    <Modal open={!!category} title={isNew ? 'New fee category' : 'Edit fee category'} onClose={onClose} footer={<><Button variant="secondary" onClick={onClose}>Cancel</Button><Button type="submit" form="fee-category" loading={save.isPending}>Save</Button></>}>
      <form id="fee-category" onSubmit={onSubmit(() => save.mutate(undefined))} className="grid gap-4 sm:grid-cols-2">
        {save.error && <div className="sm:col-span-2"><Alert>{errorMessage(save.error, 'Could not save the category.')}</Alert></div>}
        <Field label="Name"><Input required maxLength={80} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Tuition" /></Field>
        <Field label="Code" hint="Letters, digits, hyphens"><Input required maxLength={15} value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="TUI" /></Field>
        <label className="flex items-center gap-2 text-base text-slate-700 dark:text-slate-200">
          <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="h-4 w-4 accent-primary-600" /> Active
        </label>
      </form>
    </Modal>
  );
}
