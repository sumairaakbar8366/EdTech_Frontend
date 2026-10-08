import { NotebookPen, Send } from 'lucide-react';
import { useState } from 'react';
import { Alert, Badge, Button, Card, Field, Input, TextArea } from '@/components/ui';
import { SubmissionView } from '@/features/lms/components/assignments/SubmissionView';
import { LMS_FILE_ACCEPT } from '@/features/lms/constants';
import { useLmsAction } from '@/features/lms/hooks/useLms';
import { lmsService } from '@/features/lms/services/lmsService';
import type { AssignmentDetail } from '@/features/lms/types/lms.types';
import { workState } from '@/features/lms/utils/lms.utils';
import { errorMessage } from '@/lib/errors';
import { onSubmit } from '@/lib/forms';

/** The student's side of an assignment: their submission, grade, and the hand-in form. */
export function StudentWork({ assignment: d, canSubmit }: { assignment: AssignmentDetail; canSubmit: boolean }) {
  const s = d.submission ?? null;
  const [text, setText] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const closed = new Date(d.dueAt) < new Date() && !d.allowLate;
  const submit = useLmsAction(() => lmsService.submit(d.id, text, file), {
    success: 'Work submitted',
    onDone: () => {
      setText('');
      setFile(null);
    },
    toastErrors: false,
  });
  const [state, tone] = workState(d, s);
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card title="Your work" icon={Send} tone={tone} actions={<Badge tone={tone}>{state}</Badge>}>
        {s ? <SubmissionView s={s} /> : <p className="text-slate-500">Nothing submitted yet.</p>}
        {s?.grade && (
          <div className="mt-4 rounded-xl bg-emerald-500/10 p-4">
            <div className="font-display text-3xl font-bold tabular-nums text-emerald-700 dark:text-emerald-300">{Number(s.grade.marks)} / {Number(d.maxMarks)}</div>
            {s.grade.feedback && <p className="mt-1 whitespace-pre-wrap text-slate-700 dark:text-slate-200">{s.grade.feedback}</p>}
          </div>
        )}
      </Card>
      {canSubmit && s?.status !== 'graded' && (
        <Card title={s ? 'Replace your submission' : 'Hand in'} icon={NotebookPen} tone="primary">
          {closed ? (
            <Alert>The due date has passed and this assignment no longer accepts work.</Alert>
          ) : (
            <form onSubmit={onSubmit(() => submit.mutate(undefined))} className="space-y-4">
              {submit.error && <Alert>{errorMessage(submit.error, 'Could not submit.')}</Alert>}
              {d.mode !== 'file' && <Field label="Your answer"><TextArea value={text} maxLength={20000} onChange={(e) => setText(e.target.value)} /></Field>}
              {d.mode !== 'text' && (
                <Field label="File" hint="PDF, Word, JPG, PNG or MP4, up to 50 MB">
                  <Input type="file" accept={LMS_FILE_ACCEPT} onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
                </Field>
              )}
              {new Date(d.dueAt) < new Date() && <Alert tone="info">The due date has passed; this will be marked late.</Alert>}
              <Button type="submit" icon={Send} loading={submit.isPending} disabled={!text.trim() && !file}>Submit</Button>
            </form>
          )}
        </Card>
      )}
    </div>
  );
}
