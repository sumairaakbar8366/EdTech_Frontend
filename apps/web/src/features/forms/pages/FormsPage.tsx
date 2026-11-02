import { BookUser, Briefcase, GraduationCap, KeyRound, Save, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Alert, Button, PageHeader, Spinner } from '@/components/ui';
import { useToast } from '@/components/ui/Toast/Toast';
import { FormDesigner } from '@/features/forms/components/FormDesigner';
import { FORMS_KEY, formsService, useSchoolForms, type CustomForm, type FormKind } from '@/features/forms/forms';
import { errorMessage } from '@/lib/errors';

const KINDS: { kind: FormKind; label: string; icon: typeof Users; where: string }[] = [
  { kind: 'teacher', label: 'Teachers', icon: BookUser, where: 'the “Add staff member” and edit forms for teachers, and on a teacher’s profile' },
  { kind: 'staff', label: 'Other staff', icon: Briefcase, where: 'the “Add staff member” and edit forms for non-teaching staff, and on their profile' },
  { kind: 'student', label: 'Students', icon: GraduationCap, where: 'the “Add student” and edit forms, and on a student’s profile' },
  { kind: 'guardian', label: 'Parents', icon: Users, where: 'a parent’s details on the student’s profile' },
  { kind: 'access', label: 'Access request', icon: KeyRound, where: 'the “Request access” page of your school’s sign-in, where people ask for a login' },
];

/**
 * Registration forms: the admin and the principal decide what the school asks about teachers, staff,
 * students, parents and people who request a login. The standard details stay; what is added here
 * appears wherever that person is registered, edited or viewed.
 */
export function FormsPage() {
  const forms = useSchoolForms();
  const qc = useQueryClient();
  const toast = useToast();
  const [kind, setKind] = useState<FormKind>('teacher');
  const [drafts, setDrafts] = useState<Partial<Record<FormKind, CustomForm>>>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => { setError(null); }, [kind]);

  if (forms.isLoading) return <Spinner />;
  const saved = forms.data?.find((f) => f.kind === kind)?.form ?? { intro: null, fields: [] };
  const draft = drafts[kind] ?? saved;
  const dirty = JSON.stringify(draft) !== JSON.stringify(saved);
  const info = KINDS.find((k) => k.kind === kind)!;

  async function save() {
    setBusy(true);
    setError(null);
    try {
      const cleaned: CustomForm = { intro: draft.intro, fields: draft.fields.filter((f) => f.label.trim()).map((f) => ({ ...f, options: f.options.map((o) => o.trim()).filter(Boolean) })) };
      await formsService.save(kind, cleaned);
      await qc.invalidateQueries({ queryKey: FORMS_KEY });
      setDrafts((d) => ({ ...d, [kind]: undefined }));
      toast.success(`${info.label} form saved`);
    } catch (e) {
      setError(errorMessage(e, 'The form could not be saved.'));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <PageHeader title="Registration forms" sub="Decide what your school asks about each kind of person" icon={BookUser} tone="teal" actions={<Button icon={Save} loading={busy} disabled={!dirty} onClick={() => void save()}>Save form</Button>} />
      <div role="tablist" className="surface mb-5 inline-flex flex-wrap gap-1 rounded-xl p-1" data-tour="forms-tabs">
        {KINDS.map((k) => (
          <button key={k.kind} role="tab" aria-selected={k.kind === kind} onClick={() => setKind(k.kind)} className={`focus-ring inline-flex items-center gap-2 rounded-lg px-4 py-2 text-base font-bold uppercase tracking-wide transition-colors ${k.kind === kind ? 'bg-brand text-white' : 'text-slate-600 hover:bg-slate-500/10 dark:text-slate-300'}`}>
            <k.icon size={16} /> {k.label}{(drafts[k.kind] && JSON.stringify(drafts[k.kind]) !== JSON.stringify(forms.data?.find((f) => f.kind === k.kind)?.form)) ? ' •' : ''}
          </button>
        ))}
      </div>
      {error && <div className="mb-4"><Alert>{error}</Alert></div>}
      <FormDesigner value={draft} allowFiles={kind !== 'access'} withSections onChange={(f) => setDrafts((d) => ({ ...d, [kind]: f }))} fixedNote={`The standard details (name, contact, and the details the system needs) are always asked. Fields you add here appear in ${info.where}. Changes apply everywhere at once: the dashboard, the website and the profile pages. The school’s online admission form has its own designer under Website.${kind === 'access' ? ' People asking for access are not yet on record, so this form cannot ask for documents.' : ''}`} />
    </div>
  );
}
