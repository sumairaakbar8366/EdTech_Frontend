import { ArrowDown, ArrowLeft, ArrowUp, ClipboardList, ExternalLink, Lock, Pencil, Plus, Save, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { AreaLink } from '@/app/router/area';
import { Alert, Badge, Button, Card, ConfirmDialog, EmptyState, Field, IconButton, Input, Modal, PageHeader, Select, Spinner, TextArea } from '@/components/ui';
import { appRootUrl } from '@/config/site';
import {
  BUILTIN_DEFAULT_LABEL,
  CORE_FIELDS,
  FIELD_TYPE_LABEL,
  FIELD_TYPES,
  SAVE_TARGETS,
  SECTION_LABEL,
  TEXT_LIMIT,
  newFieldId,
  targetsFor,
  useAdmissionFormAdmin,
  useSaveAdmissionForm,
  type AdmissionForm,
  type FieldType,
  type FormField,
  type FormSection,
  type OptionalBuiltin,
  type SaveTarget,
} from '@/features/website/admissionForm';
import { errorMessage } from '@/lib/errors';

type ClassRef = { id: string; name: string };

const Check = ({ label, checked, disabled, onChange }: { label: string; checked: boolean; disabled?: boolean; onChange: (v: boolean) => void }) => (
  <label className={`inline-flex items-center gap-2 text-sm font-semibold ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}>
    <input type="checkbox" className="h-4 w-4 accent-orange-500" checked={checked} disabled={disabled} onChange={(e) => onChange(e.target.checked)} />
    {label}
  </label>
);

const blankField = (): FormField => ({ id: newFieldId(), type: 'text', label: '', section: 'student', help: null, required: false, options: [], minLength: null, maxLength: null, min: null, max: null, classIds: [], saveTo: null });
const num = (v: string) => (v.trim() === '' ? null : Number(v));

/** Add or change one of the school's own fields. */
function FieldEditor({ field, classes, usedTargets, onSave, onClose }: { field: FormField | null; classes: ClassRef[]; usedTargets: SaveTarget[]; onSave: (f: FormField) => void; onClose: () => void }) {
  const [f, setF] = useState<FormField>(blankField);
  const [optionsText, setOptionsText] = useState('');
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (!field) return;
    setF(field);
    setOptionsText(field.options.join('\n'));
    setError(null);
  }, [field]);

  const set = <K extends keyof FormField>(k: K, v: FormField[K]) => setF((x) => ({ ...x, [k]: v }));
  // Student details this type of answer fits and no other field already fills.
  const targets = targetsFor(f.type).filter((t) => t === f.saveTo || !usedTargets.includes(t));
  const changeType = (type: FieldType) => setF((x) => ({ ...x, type, saveTo: x.saveTo && targetsFor(type).includes(x.saveTo) ? x.saveTo : null }));
  const hasOptions = f.type === 'select' || f.type === 'multiselect';
  const isText = f.type === 'text' || f.type === 'textarea';
  const limitedClasses = f.classIds.length > 0;

  const save = () => {
    const options = [...new Set(optionsText.split('\n').map((o) => o.trim()).filter(Boolean))];
    if (!f.label.trim()) return setError('Give the field a label.');
    if (hasOptions && !options.length) return setError('Add at least one choice (one per line).');
    if (options.some((o) => o.length > 100)) return setError('Each choice can be at most 100 characters.');
    if (isText && f.minLength !== null && f.maxLength !== null && f.minLength > f.maxLength) return setError('The shortest answer cannot be longer than the longest.');
    if (f.type === 'number' && f.min !== null && f.max !== null && f.min > f.max) return setError('The smallest number cannot be bigger than the largest.');
    if (limitedClasses && !f.classIds.length) return setError('Choose at least one class.');
    const target = f.saveTo ? SAVE_TARGETS[f.saveTo] : null;
    if (target && options.some((o) => o.length > target.max)) return setError(`For “${target.label}” each choice can be at most ${target.max} characters.`);
    if (f.saveTo === 'student.bloodGroup' && options.some((o) => !/^(A|B|AB|O)[+-]$/i.test(o))) return setError('Blood group choices must be like A+, B-, AB+ or O-.');
    onSave({
      ...f,
      label: f.label.trim(),
      help: f.help?.trim() || null,
      section: f.type === 'file' ? 'documents' : f.section === 'documents' ? 'additional' : f.section,
      options: hasOptions ? options : [],
      minLength: isText ? f.minLength : null,
      maxLength: isText ? f.maxLength : null,
      min: f.type === 'number' ? f.min : null,
      max: f.type === 'number' ? f.max : null,
    });
  };

  return (
    <Modal
      open={!!field}
      title={field?.label ? `Edit “${field.label}”` : 'Add a field'}
      onClose={onClose}
      size="lg"
      footer={<><Button variant="secondary" onClick={onClose}>Cancel</Button><Button icon={Save} onClick={save}>Use this field</Button></>}
    >
      <div className="grid gap-4">
        {error && <Alert>{error}</Alert>}
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Type of answer">
            <Select value={f.type} onChange={(e) => changeType(e.target.value as FieldType)}>
              {FIELD_TYPES.map((t) => <option key={t} value={t}>{FIELD_TYPE_LABEL[t]}</option>)}
            </Select>
          </Field>
          {f.type === 'file' ? (
            <Field label="Section" hint="Uploads are listed under Documents"><Input value={SECTION_LABEL.documents} disabled /></Field>
          ) : (
            <Field label="Section">
              <Select value={f.section} onChange={(e) => set('section', e.target.value as FormSection)}>
                {(['student', 'guardian', 'additional'] as const).map((s) => <option key={s} value={s}>{SECTION_LABEL[s]}</option>)}
              </Select>
            </Field>
          )}
        </div>
        <Field label="Label" hint={f.type === 'file' ? 'e.g. “Birth certificate / B-Form”' : f.type === 'checkbox' ? 'e.g. “I confirm the information given is correct”' : 'e.g. “Father’s CNIC number”'}>
          <Input required maxLength={120} value={f.label} onChange={(e) => set('label', e.target.value)} />
        </Field>
        <Field label="Help text (optional)" hint="A short note shown under the field"><Input maxLength={300} value={f.help ?? ''} onChange={(e) => set('help', e.target.value)} /></Field>
        <Check label={f.type === 'checkbox' ? 'Mandatory: the box must be ticked' : 'Mandatory: the form cannot be sent without it'} checked={f.required} onChange={(v) => set('required', v)} />

        {hasOptions && (
          <Field label="Choices" hint="One per line"><TextArea rows={5} value={optionsText} onChange={(e) => setOptionsText(e.target.value)} placeholder={'Yes\nNo'} /></Field>
        )}
        {isText && (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Shortest answer (characters)"><Input type="number" min={0} max={TEXT_LIMIT[f.type as 'text']} value={f.minLength ?? ''} onChange={(e) => set('minLength', num(e.target.value))} /></Field>
            <Field label="Longest answer (characters)" hint={`Up to ${TEXT_LIMIT[f.type as 'text']}`}><Input type="number" min={1} max={TEXT_LIMIT[f.type as 'text']} value={f.maxLength ?? ''} onChange={(e) => set('maxLength', num(e.target.value))} /></Field>
          </div>
        )}
        {f.type === 'number' && (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Smallest number"><Input type="number" step="any" value={f.min ?? ''} onChange={(e) => set('min', num(e.target.value))} /></Field>
            <Field label="Largest number"><Input type="number" step="any" value={f.max ?? ''} onChange={(e) => set('max', num(e.target.value))} /></Field>
          </div>
        )}
        {targets.length > 0 && (
          <Field label="Save to the student record" hint="On enrollment the answer is copied into this detail of the student’s profile">
            <Select value={f.saveTo ?? ''} onChange={(e) => set('saveTo', (e.target.value || null) as SaveTarget | null)}>
              <option value="">No: keep it with the admission answers only</option>
              {[...new Set(targets.map((t) => SAVE_TARGETS[t].group))].map((g) => (
                <optgroup key={g} label={g}>{targets.filter((t) => SAVE_TARGETS[t].group === g).map((t) => <option key={t} value={t}>{SAVE_TARGETS[t].label}</option>)}</optgroup>
              ))}
            </Select>
          </Field>
        )}
        {f.type === 'file' && <p className="text-sm text-slate-500">Applicants can attach one PDF, Word (.docx), JPG or PNG file of up to 5 MB. It is added to the application’s documents, and to the student’s documents on enrollment.</p>}

        <div className="rounded-lg border border-(--surface-border) p-4">
          <p className="mb-2 text-sm font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">Ask this for</p>
          <div className="flex flex-wrap gap-5">
            <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-semibold"><input type="radio" className="accent-orange-500" checked={!limitedClasses} onChange={() => set('classIds', [])} /> Every class</label>
            <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-semibold"><input type="radio" className="accent-orange-500" checked={limitedClasses} onChange={() => classes[0] && set('classIds', f.classIds.length ? f.classIds : [classes[classes.length - 1]!.id])} disabled={!classes.length} /> Only some classes</label>
          </div>
          {limitedClasses && (
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {classes.map((c) => (
                <Check key={c.id} label={c.name} checked={f.classIds.includes(c.id)} onChange={(v) => set('classIds', v ? [...f.classIds, c.id] : f.classIds.filter((x) => x !== c.id))} />
              ))}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}

/** Admin: designs the school's online admission form; saved changes are live on the website at once. */
export function AdmissionFormBuilderPage() {
  const data = useAdmissionFormAdmin();
  const save = useSaveAdmissionForm();
  const [form, setForm] = useState<AdmissionForm | null>(null);
  const [dirty, setDirty] = useState(false);
  const [editing, setEditing] = useState<FormField | null>(null);
  const [removing, setRemoving] = useState<FormField | null>(null);
  const classes = data.data?.classes ?? [];

  useEffect(() => {
    if (!data.data) return;
    // A class deleted since the form was saved no longer filters its fields.
    const known = new Set(data.data.classes.map((c) => c.id));
    setForm({ ...data.data.form, fields: data.data.form.fields.map((f) => ({ ...f, classIds: f.classIds.filter((c) => known.has(c)) })) });
    setDirty(false);
  }, [data.data]);

  if (data.isLoading || !form) return data.error ? <Alert>{errorMessage(data.error)}</Alert> : <Spinner />;

  const change = (next: AdmissionForm) => { setForm(next); setDirty(true); };
  const setBuiltin = (k: OptionalBuiltin, patch: Partial<AdmissionForm['builtins'][OptionalBuiltin]>) => {
    const b = { ...form.builtins[k], ...patch };
    if (!b.enabled) b.required = false;
    change({ ...form, builtins: { ...form.builtins, [k]: b } });
  };
  const move = (i: number, by: -1 | 1) => {
    const fields = [...form.fields];
    [fields[i], fields[i + by]] = [fields[i + by]!, fields[i]!];
    change({ ...form, fields });
  };
  const upsert = (f: FormField) => {
    const exists = form.fields.some((x) => x.id === f.id);
    change({ ...form, fields: exists ? form.fields.map((x) => (x.id === f.id ? f : x)) : [...form.fields, f] });
    setEditing(null);
  };
  const className = (id: string) => classes.find((c) => c.id === id)?.name ?? '';
  const saveButton = <Button icon={Save} loading={save.isPending} disabled={!dirty} onClick={() => save.mutate(form, { onSuccess: () => setDirty(false) })}>Save form</Button>;

  return (
    <div>
      <AreaLink to="/website" className="mb-4 inline-flex items-center gap-1.5 text-base font-semibold uppercase tracking-wide text-primary-600 hover:underline dark:text-primary-300"><ArrowLeft size={16} /> School website</AreaLink>
      <PageHeader
        title="Admission form"
        sub="Design the online application your website’s “Apply now” button opens: choose what to ask, what is mandatory, and which documents to collect"
        icon={ClipboardList}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            {dirty && <Badge tone="amber">Unsaved changes</Badge>}
            <a href={`${appRootUrl()}apply`} target="_blank" rel="noreferrer" className="focus-ring inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-bold uppercase tracking-wide text-slate-700 ring-1 ring-slate-300 hover:bg-slate-50 dark:bg-white/5 dark:text-slate-200 dark:ring-white/10"><ExternalLink size={16} /> Open form</a>
            {saveButton}
          </div>
        }
      />
      {save.error && <div className="mb-4"><Alert>{errorMessage(save.error)}</Alert></div>}

      <div className="grid gap-6 xl:grid-cols-[1fr_1.4fr]">
        <div className="space-y-6">
          <Card title="Instructions" icon={ClipboardList}>
            <Field label="Shown at the top of the form (optional)" hint="e.g. eligibility, age limits, fees, what happens after applying">
              <TextArea rows={5} maxLength={3000} value={form.intro ?? ''} onChange={(e) => change({ ...form, intro: e.target.value || null })} />
            </Field>
          </Card>

          <Card title="Standard fields" icon={Lock}>
            <p className="mb-3 text-sm text-slate-500 dark:text-slate-400">Always asked and mandatory, because enrolling the student needs them:</p>
            <div className="mb-5 flex flex-wrap gap-1.5">{CORE_FIELDS.map((c) => <Badge key={c} tone="slate">{c}</Badge>)}</div>
            <p className="mb-3 text-sm text-slate-500 dark:text-slate-400">Choose whether to ask these, rename them, or make them mandatory:</p>
            <div className="divide-y divide-(--surface-border) rounded-lg border border-(--surface-border)">
              {(Object.keys(BUILTIN_DEFAULT_LABEL) as OptionalBuiltin[]).map((k) => {
                const b = form.builtins[k];
                return (
                  <div key={k} className="grid gap-2 p-3 sm:grid-cols-[1fr_auto] sm:items-center">
                    <Input aria-label={`Label for ${BUILTIN_DEFAULT_LABEL[k]}`} maxLength={120} placeholder={BUILTIN_DEFAULT_LABEL[k]} value={b.label ?? ''} disabled={!b.enabled} onChange={(e) => setBuiltin(k, { label: e.target.value || null })} />
                    <div className="flex gap-4">
                      <Check label="Ask" checked={b.enabled} onChange={(v) => setBuiltin(k, { enabled: v })} />
                      <Check label="Mandatory" checked={b.required} disabled={!b.enabled} onChange={(v) => setBuiltin(k, { required: v })} />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        <Card title="Your own fields" icon={ClipboardList} actions={<Button icon={Plus} onClick={() => setEditing(blankField())}>Add field</Button>}>
          {form.fields.length === 0 ? (
            <EmptyState icon={ClipboardList} title="No fields of your own yet" tone="slate">
              Add what your school needs, e.g. father’s CNIC, religion, blood group, transport, a B-Form or last result card upload, or an “I agree” declaration.
            </EmptyState>
          ) : (
            <ol className="divide-y divide-(--surface-border) rounded-lg border border-(--surface-border)">
              {form.fields.map((f, i) => (
                <li key={f.id} className="flex items-start gap-3 p-3">
                  <span className="mt-0.5 w-6 shrink-0 text-right font-mono text-sm text-slate-400">{i + 1}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-slate-800 dark:text-slate-100">{f.label}</p>
                    <div className="mt-1 flex flex-wrap gap-1.5">
                      <Badge tone="sky">{FIELD_TYPE_LABEL[f.type]}</Badge>
                      <Badge tone="slate">{SECTION_LABEL[f.section]}</Badge>
                      {f.required ? <Badge tone="rose">Mandatory</Badge> : <Badge tone="slate">Optional</Badge>}
                      {f.classIds.length > 0 && <Badge tone="amber">Only {f.classIds.map(className).join(', ')}</Badge>}
                      {f.options.length > 0 && <Badge tone="slate">{f.options.length} choice{f.options.length === 1 ? '' : 's'}</Badge>}
                      {f.saveTo && <Badge tone="emerald">→ {SAVE_TARGETS[f.saveTo].label}</Badge>}
                    </div>
                  </div>
                  <div className="flex shrink-0">
                    <IconButton icon={ArrowUp} label="Move up" disabled={i === 0} onClick={() => move(i, -1)} />
                    <IconButton icon={ArrowDown} label="Move down" disabled={i === form.fields.length - 1} onClick={() => move(i, 1)} />
                    <IconButton icon={Pencil} label={`Edit ${f.label}`} onClick={() => setEditing(f)} />
                    <IconButton icon={Trash2} label={`Remove ${f.label}`} tone="danger" onClick={() => setRemoving(f)} />
                  </div>
                </li>
              ))}
            </ol>
          )}
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-slate-500">Applications already received keep their answers when you change the form.</p>
            {saveButton}
          </div>
        </Card>
      </div>

      <FieldEditor field={editing} classes={classes} usedTargets={form.fields.flatMap((x) => (x.saveTo && x.id !== editing?.id ? [x.saveTo] : []))} onSave={upsert} onClose={() => setEditing(null)} />
      <ConfirmDialog
        open={!!removing}
        title="Remove field?"
        message={`“${removing?.label}” will no longer be asked once you save the form.`}
        confirmLabel="Remove"
        onConfirm={() => { if (removing) change({ ...form, fields: form.fields.filter((x) => x.id !== removing.id) }); setRemoving(null); }}
        onClose={() => setRemoving(null)}
      />
    </div>
  );
}
