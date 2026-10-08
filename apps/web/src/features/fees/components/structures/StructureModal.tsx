import { Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Alert, Button, Field, IconButton, Input, Modal, Select } from '@/components/ui';
import { useClasses } from '@/features/academics/hooks/useAcademics';
import { FREQUENCY_LABEL } from '@/features/fees/constants';
import { useFeeCategories, useFeesAction } from '@/features/fees/hooks/useFees';
import { feeService, type StructurePayload } from '@/features/fees/services/feeService';
import type { FeeStructure, Frequency } from '@/features/fees/types/fee.types';
import { errorMessage } from '@/lib/errors';
import { onSubmit } from '@/lib/forms';

type ItemRow = StructurePayload['items'][number];
const blankRow = (): ItemRow => ({ categoryId: '', amount: '', frequency: 'monthly' });

/** Create (structure = 'new') or edit a class's fee structure and its line items. */
export function StructureModal({ structure, onClose }: { structure: FeeStructure | 'new' | null; onClose: () => void }) {
  const isNew = structure === 'new';
  const [classId, setClassId] = useState('');
  const [name, setName] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [items, setItems] = useState<ItemRow[]>([blankRow()]);
  const classes = useClasses(!!structure);
  const categories = useFeeCategories(!!structure);
  const save = useFeesAction(() => feeService.saveStructure(isNew ? undefined : (structure as FeeStructure).id, { classId, name, isActive, items }), {
    success: isNew ? 'Fee structure created' : 'Fee structure saved',
    onDone: onClose,
    toastErrors: false,
  });

  useEffect(() => {
    save.reset();
    if (structure && structure !== 'new') {
      setClassId(structure.schoolClass.id);
      setName(structure.name);
      setIsActive(structure.isActive);
      setItems(structure.items.map((i) => ({ categoryId: i.categoryId, amount: i.amount, frequency: i.frequency })));
    } else if (structure === 'new') {
      setClassId('');
      setName('');
      setIsActive(true);
      setItems([blankRow()]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [structure]);

  const setItem = (i: number, patch: Partial<ItemRow>) => setItems((rows) => rows.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  const activeCategories = categories.data?.filter((c) => c.isActive) ?? [];

  return (
    <Modal
      open={!!structure}
      title={isNew ? 'New fee structure' : 'Edit fee structure'}
      onClose={onClose}
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" form="fee-structure" loading={save.isPending}>Save</Button>
        </>
      }
    >
      <form id="fee-structure" onSubmit={onSubmit(() => save.mutate(undefined))} className="space-y-4">
        {save.error && <Alert>{errorMessage(save.error, 'Could not save the structure.')}</Alert>}
        {activeCategories.length === 0 && categories.isSuccess && <Alert tone="info">Add fee categories first (Categories tab).</Alert>}
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Class">
            <Select required disabled={!isNew} value={classId} onChange={(e) => setClassId(e.target.value)}>
              <option value="">Choose a class</option>
              {classes.data?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </Select>
          </Field>
          <Field label="Name"><Input required maxLength={100} value={name} onChange={(e) => setName(e.target.value)} placeholder="Standard fees" /></Field>
        </div>
        <div>
          <div className="mb-1 text-sm font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">Fee items</div>
          <div className="space-y-2">
            {items.map((row, i) => (
              <div key={i} className="grid grid-cols-[1fr_8rem_9rem_auto] items-center gap-2">
                <Select aria-label="Category" required value={row.categoryId} onChange={(e) => setItem(i, { categoryId: e.target.value })}>
                  <option value="">Category</option>
                  {activeCategories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </Select>
                <Input aria-label="Amount" required inputMode="decimal" pattern="\d{1,10}(\.\d{1,2})?" placeholder="0.00" value={row.amount} onChange={(e) => setItem(i, { amount: e.target.value })} />
                <Select aria-label="Frequency" value={row.frequency} onChange={(e) => setItem(i, { frequency: e.target.value as Frequency })}>
                  {(Object.keys(FREQUENCY_LABEL) as Frequency[]).map((f) => <option key={f} value={f}>{FREQUENCY_LABEL[f]}</option>)}
                </Select>
                <IconButton icon={Trash2} label="Remove item" tone="danger" disabled={items.length === 1} onClick={() => setItems((r) => r.filter((_, idx) => idx !== i))} />
              </div>
            ))}
          </div>
          <Button type="button" variant="ghost" icon={Plus} className="mt-2" onClick={() => setItems((r) => [...r, blankRow()])}>Add item</Button>
        </div>
        <label className="flex items-center gap-2 text-base text-slate-700 dark:text-slate-200">
          <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="h-4 w-4 accent-primary-600" /> Active
        </label>
        {!isNew && <p className="text-sm text-slate-500">Invoices already issued keep their own amounts.</p>}
      </form>
    </Modal>
  );
}
