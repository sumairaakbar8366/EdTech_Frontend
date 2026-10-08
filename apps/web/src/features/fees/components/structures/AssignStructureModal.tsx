import { useState } from 'react';
import { Button, Field, Modal, Select } from '@/components/ui';
import { useClasses } from '@/features/academics/hooks/useAcademics';
import { useFeesAction } from '@/features/fees/hooks/useFees';
import { feeService } from '@/features/fees/services/feeService';
import type { FeeStructure } from '@/features/fees/types/fee.types';

/** Assign a fee structure to every student of its class, or of one section. */
export function AssignStructureModal({ structure, onClose }: { structure: FeeStructure | null; onClose: () => void }) {
  const [sectionId, setSectionId] = useState('');
  const classes = useClasses(!!structure);
  const sections = classes.data?.find((c) => c.id === structure?.schoolClass.id)?.sections ?? [];
  const assign = useFeesAction(() => feeService.assignStructure(structure!.id, sectionId || undefined), {
    success: (r) => `${r.assigned} student(s) assigned${r.alreadyAssigned ? `, ${r.alreadyAssigned} already had it` : ''}`,
    onDone: onClose,
  });
  return (
    <Modal
      open={!!structure}
      title="Assign fee structure"
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button loading={assign.isPending} onClick={() => assign.mutate(undefined)}>Assign</Button>
        </>
      }
    >
      {structure && (
        <div className="space-y-4">
          <p className="text-slate-600 dark:text-slate-300">
            Assign <strong>{structure.name}</strong> to the students enrolled in <strong>{structure.schoolClass.name}</strong> for {structure.academicYear.name}.
          </p>
          <Field label="Section">
            <Select value={sectionId} onChange={(e) => setSectionId(e.target.value)}>
              <option value="">Every section</option>
              {sections.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </Select>
          </Field>
        </div>
      )}
    </Modal>
  );
}
