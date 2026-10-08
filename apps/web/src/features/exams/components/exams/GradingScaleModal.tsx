import { Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Alert, Button, IconButton, Input, Modal, Spinner } from '@/components/ui';
import { useExamsAction, useGradingScale } from '@/features/exams/hooks/useExams';
import { examService } from '@/features/exams/services/examService';
import type { Band } from '@/features/exams/types/exam.types';
import { errorMessage } from '@/lib/errors';

/** The school's grade bands (A+ from 90%, …), used when report cards are generated. */
export function GradingScaleModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const scale = useGradingScale(open);
  const [bands, setBands] = useState<Band[]>([]);
  useEffect(() => {
    if (scale.data) setBands(scale.data.bands);
  }, [scale.data]);
  const save = useExamsAction(() => examService.saveGradingScale(bands), { success: 'Grading scale saved', onDone: onClose, toastErrors: false });
  const set = (i: number, patch: Partial<Band>) => setBands((rows) => rows.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  return (
    <Modal open={open} title="Grading scale" onClose={onClose} footer={<><Button variant="secondary" onClick={onClose}>Cancel</Button><Button loading={save.isPending} onClick={() => save.mutate(undefined)}>Save</Button></>}>
      {scale.isLoading && <Spinner />}
      {save.error && <div className="mb-3"><Alert>{errorMessage(save.error, 'Could not save.')}</Alert></div>}
      <p className="mb-3 text-sm text-slate-500">Applied when report cards are generated. A grade starts at its minimum percentage; the lowest grade must start at 0%.</p>
      <div className="space-y-2">
        {bands.map((b, i) => (
          <div key={i} className="grid grid-cols-[5rem_7rem_1fr_auto] items-center gap-2">
            <Input aria-label="Grade" maxLength={5} value={b.grade} onChange={(e) => set(i, { grade: e.target.value })} />
            <Input aria-label="Minimum percent" type="number" min={0} max={100} step="0.01" value={b.minPercent} onChange={(e) => set(i, { minPercent: Number(e.target.value) })} />
            <Input aria-label="Remark" maxLength={60} value={b.remark} onChange={(e) => set(i, { remark: e.target.value })} />
            <IconButton icon={Trash2} label="Remove" tone="danger" disabled={bands.length <= 2} onClick={() => setBands((r) => r.filter((_, idx) => idx !== i))} />
          </div>
        ))}
      </div>
      <Button variant="ghost" icon={Plus} className="mt-2" onClick={() => setBands((r) => [...r, { grade: '', minPercent: 0, remark: '' }])}>Add grade</Button>
    </Modal>
  );
}
