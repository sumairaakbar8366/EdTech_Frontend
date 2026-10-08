import { useEffect, useState } from 'react';
import { Button, Field, Input, Modal, TextArea } from '@/components/ui';
import { SubmissionView } from '@/features/lms/components/assignments/SubmissionView';
import { useLmsAction } from '@/features/lms/hooks/useLms';
import { lmsService } from '@/features/lms/services/lmsService';
import type { RosterRow } from '@/features/lms/types/lms.types';
import { formatDateTime } from '@/features/lms/utils/lms.utils';
import { onSubmit } from '@/lib/forms';

/** Mark one student's submission, with feedback. */
export function GradeModal({ row, maxMarks, onClose }: { row: RosterRow | null; maxMarks: string; onClose: () => void }) {
  const [marks, setMarks] = useState('');
  const [feedback, setFeedback] = useState('');
  useEffect(() => {
    setMarks(row?.submission?.grade ? String(Number(row.submission.grade.marks)) : '');
    setFeedback(row?.submission?.grade?.feedback ?? '');
  }, [row]);
  const save = useLmsAction(() => lmsService.grade(row!.submission!.id, marks, feedback || null), { success: 'Grade saved', onDone: onClose });
  return (
    <Modal
      open={!!row}
      title={row ? `Grade · ${row.firstName} ${row.lastName}` : 'Grade'}
      onClose={onClose}
      size="lg"
      footer={<><Button variant="secondary" onClick={onClose}>Cancel</Button><Button type="submit" form="grade" loading={save.isPending}>Save grade</Button></>}
    >
      {row?.submission && (
        <form id="grade" onSubmit={onSubmit(() => save.mutate(undefined))} className="space-y-4">
          <div className="text-sm text-slate-500">Submitted {formatDateTime(row.submission.submittedAt)}{row.submission.isLate && ' · late'}</div>
          <SubmissionView s={row.submission} />
          <div className="grid gap-4 sm:grid-cols-[10rem_1fr]">
            <Field label={`Marks (of ${Number(maxMarks)})`}><Input required inputMode="decimal" pattern="\d{1,4}(\.\d{1,2})?" value={marks} onChange={(e) => setMarks(e.target.value)} /></Field>
            <Field label="Feedback"><TextArea maxLength={2000} value={feedback} onChange={(e) => setFeedback(e.target.value)} /></Field>
          </div>
        </form>
      )}
    </Modal>
  );
}
