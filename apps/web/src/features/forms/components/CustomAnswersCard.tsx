import { ClipboardList, Pencil } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Alert, Button, Card, InfoItem, Modal } from '@/components/ui';
import { useToast } from '@/components/ui/Toast/Toast';
import { DynamicFields } from '@/features/forms/components/DynamicFields';
import { answerText, bySection, formsService, missingRequired, useAnswers, withUploadedFiles, type Answers, type AnswerSubject, type PendingFiles } from '@/features/forms/forms';
import { errorMessage } from '@/lib/errors';
import { onSubmit } from '@/lib/forms';

/**
 * The extra details the school's own registration form asks about a person, on their profile. Shows
 * nothing when the school has not added any fields. `editable` lets staff with access fill them in.
 */
export function CustomAnswersCard({ subject, id, editable, title = 'Additional details' }: { subject: AnswerSubject; id: string; editable: boolean; title?: string }) {
  const q = useAnswers(subject, id);
  const qc = useQueryClient();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Answers>({});
  const [files, setFiles] = useState<PendingFiles>({});
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  useEffect(() => { if (open) { setDraft(q.data?.answers ?? {}); setFiles({}); setError(null); } }, [open, q.data]);
  if (!q.data || q.data.form.fields.length === 0) return null;
  const { form, answers } = q.data;
  const errors = missingRequired(form, draft, files);

  async function save() {
    setBusy(true);
    setError(null);
    try {
      await formsService.saveAnswers(subject, id, await withUploadedFiles(subject, id, form, draft, files));
      await qc.invalidateQueries({ queryKey: ['documents'] });
      await qc.invalidateQueries({ queryKey: ['custom-answers', subject, id] });
      toast.success('Details saved');
      setOpen(false);
    } catch (e) {
      setError(errorMessage(e, 'Could not save these details.'));
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Card title={title} icon={ClipboardList} tone="teal" actions={editable ? <Button variant="secondary" icon={Pencil} onClick={() => setOpen(true)}>Edit</Button> : undefined}>
        <div className="space-y-5">
          {bySection(form).map((g) => (
            <section key={g.section}>
              {bySection(form).length > 1 && <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">{g.section}</h4>}
              <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {g.fields.map((f) => <InfoItem key={f.id} label={f.label}>{answerText(f, answers[f.id]) === '—' ? '' : answerText(f, answers[f.id])}</InfoItem>)}
              </dl>
            </section>
          ))}
        </div>
      </Card>
      <Modal open={open} title={title} size="lg" onClose={() => setOpen(false)} footer={<><Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button><Button type="submit" form="custom-answers-form" loading={busy}>Save</Button></>}>
        <form id="custom-answers-form" onSubmit={onSubmit(() => { if (Object.keys(errors).length) setError('Fill in the required details.'); else void save(); })} className="space-y-4">
          {error && <Alert>{error}</Alert>}
          {form.intro && <p className="text-sm text-slate-600 dark:text-slate-300">{form.intro}</p>}
          <DynamicFields form={form} answers={draft} onChange={setDraft} files={files} onFiles={setFiles} errors={error ? errors : {}} />
        </form>
      </Modal>
    </>
  );
}
