import { useEffect } from 'react';
import { DynamicFields } from '@/features/forms/components/DynamicFields';
import { missingRequired, useAnswers, useSchoolForms, type Answers, type AnswerSubject, type CustomForm, type FormKind, type PendingFiles } from '@/features/forms/forms';

/**
 * The school's extra fields inside an "Add / Edit person" form. The parent owns the answers
 * (`value`) and sends them after the person is saved. When editing, saved answers are loaded once.
 */
export function CustomFieldsSection({ kind, subject, subjectId, value, onChange, showErrors, files, onFiles }: { kind: FormKind; subject: AnswerSubject; subjectId?: string; value: Answers; onChange: (a: Answers) => void; showErrors?: boolean; files?: PendingFiles; onFiles?: (f: PendingFiles) => void }) {
  const forms = useSchoolForms();
  const saved = useAnswers(subject, subjectId);
  const form: CustomForm | undefined = forms.data?.find((f) => f.kind === kind)?.form;
  useEffect(() => { if (saved.data && Object.keys(value).length === 0) onChange(saved.data.answers); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [saved.data]);
  if (!form || form.fields.length === 0) return null;
  return (
    <section className="space-y-3">
      <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">Additional details</h3>
      {form.intro && <p className="text-sm text-slate-600 dark:text-slate-300">{form.intro}</p>}
      <DynamicFields form={form} answers={value} onChange={onChange} files={files} onFiles={onFiles} errors={showErrors ? missingRequired(form, value, files) : {}} />
    </section>
  );
}

/** Whether the school's form for this kind has required fields still empty. */
export function useCustomMissing(kind: FormKind, value: Answers, files: PendingFiles = {}): boolean {
  const form = useSchoolForms().data?.find((f) => f.kind === kind)?.form;
  return !!form && Object.keys(missingRequired(form, value, files)).length > 0;
}
