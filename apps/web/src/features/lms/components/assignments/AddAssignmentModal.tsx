import { Plus } from 'lucide-react';
import { useState } from 'react';
import { useAreaNavigate } from '@/app/router/area';
import { Alert, Button, Field, Input, Modal, Select, TextArea } from '@/components/ui';
import { LMS_FILE_ACCEPT } from '@/features/lms/constants';
import { useLmsAction } from '@/features/lms/hooks/useLms';
import { lmsService } from '@/features/lms/services/lmsService';
import { errorMessage } from '@/lib/errors';
import { onSubmit } from '@/lib/forms';

/** Post an assignment to a course, then open it. */
export function AddAssignmentModal({ open, courseId, onClose }: { open: boolean; courseId: string; onClose: () => void }) {
  const navigate = useAreaNavigate();
  const defaultDue = () => {
    const d = new Date(Date.now() + 7 * 86400000);
    d.setHours(23, 59, 0, 0);
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  };
  const [form, setForm] = useState({ title: '', instructions: '', dueAt: defaultDue(), maxMarks: '10', mode: 'file_or_text', allowLate: true });
  const [file, setFile] = useState<File | null>(null);
  const save = useLmsAction(() => lmsService.addAssignment(courseId, { ...form, file }), {
    success: 'Assignment posted',
    onDone: (a) => {
      onClose();
      navigate(`/lms/assignments/${a.id}`);
    },
    toastErrors: false,
  });
  return (
    <Modal
      open={open}
      title="New assignment"
      onClose={onClose}
      size="lg"
      footer={<><Button variant="secondary" onClick={onClose}>Cancel</Button><Button type="submit" form="assignment" icon={Plus} loading={save.isPending}>Post assignment</Button></>}
    >
      <form id="assignment" onSubmit={onSubmit(() => save.mutate(undefined))} className="grid gap-4 sm:grid-cols-2">
        {save.error && <div className="sm:col-span-2"><Alert>{errorMessage(save.error, 'Could not post the assignment.')}</Alert></div>}
        <div className="sm:col-span-2"><Field label="Title"><Input required maxLength={150} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></Field></div>
        <div className="sm:col-span-2"><Field label="Instructions"><TextArea required maxLength={5000} value={form.instructions} onChange={(e) => setForm({ ...form, instructions: e.target.value })} /></Field></div>
        <Field label="Due"><Input type="datetime-local" required value={form.dueAt} onChange={(e) => setForm({ ...form, dueAt: e.target.value })} /></Field>
        <Field label="Maximum marks"><Input required inputMode="decimal" pattern="\d{1,4}(\.\d{1,2})?" value={form.maxMarks} onChange={(e) => setForm({ ...form, maxMarks: e.target.value })} /></Field>
        <Field label="Students submit">
          <Select value={form.mode} onChange={(e) => setForm({ ...form, mode: e.target.value })}>
            <option value="file_or_text">A file or typed answer</option><option value="file">A file</option><option value="text">A typed answer</option>
          </Select>
        </Field>
        <Field label="Attachment" hint="Optional worksheet"><Input type="file" accept={LMS_FILE_ACCEPT} onChange={(e) => setFile(e.target.files?.[0] ?? null)} /></Field>
        <label className="flex items-center gap-2 text-base text-slate-700 sm:col-span-2 dark:text-slate-200">
          <input type="checkbox" className="h-4 w-4 accent-primary-600" checked={form.allowLate} onChange={(e) => setForm({ ...form, allowLate: e.target.checked })} /> Accept late submissions (marked late)
        </label>
      </form>
    </Modal>
  );
}
