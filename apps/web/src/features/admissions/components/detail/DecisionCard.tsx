import { Check } from 'lucide-react';
import { useState } from 'react';
import { Button, Card, Field, Input } from '@/components/ui';
import { ADMISSION_LABEL, ADMISSION_NEXT } from '@/features/admissions/constants';
import { useAdmissionsAction } from '@/features/admissions/hooks/useAdmissions';
import { admissionService } from '@/features/admissions/services/admissionService';
import type { AdmissionApplication, AdmissionStatus } from '@/features/admissions/types/admission.types';

/** Moves the application to its next allowed statuses, with an optional note for the history. */
export function DecisionCard({ application: a }: { application: AdmissionApplication }) {
  const [note, setNote] = useState('');
  const move = useAdmissionsAction((status: AdmissionStatus) => admissionService.move(a.id, status, note || null), 'Application updated', () => setNote(''));
  const next = ADMISSION_NEXT[a.status];
  if (next.length === 0) return null;
  return (
    <Card title="Decision" icon={Check} tone="primary">
      <Field label="Note (saved in history)"><Input maxLength={1000} value={note} onChange={(e) => setNote(e.target.value)} /></Field>
      <div className="mt-3 flex flex-col gap-2">
        {next.map((s) => (
          <Button key={s} variant={s === 'rejected' ? 'danger' : s === 'withdrawn' ? 'secondary' : 'primary'} loading={move.isPending} onClick={() => move.mutate(s)}>
            {s === 'rejected' ? 'Reject' : s === 'withdrawn' ? 'Mark withdrawn' : `Move to: ${ADMISSION_LABEL[s]}`}
          </Button>
        ))}
      </div>
      {a.status === 'documents_verified' && <p className="mt-2 text-sm text-slate-500">Or schedule an interview / test on the left.</p>}
    </Card>
  );
}
