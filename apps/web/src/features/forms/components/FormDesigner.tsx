import { ArrowDown, ArrowUp, ClipboardList, Pencil, Plus, Save, Sparkles, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Alert, Badge, Button, Card, ConfirmDialog, EmptyState, Field, IconButton, Input, Modal, Select, TextArea } from '@/components/ui';
import { DynamicFields } from '@/features/forms/components/DynamicFields';
import { emptyField, FIELD_SECTIONS, FIELD_TYPE_LABEL, FIELD_TYPES, type CustomField, type CustomForm, type FieldType } from '@/features/forms/forms';

const MAX_FIELDS = 60;
const TEXT_LIMIT = { text: 200, textarea: 3000 } as const;

/** Ready-made questions: one click opens the editor with the right kind of answer already chosen. */
const PRESETS: { label: string; type: FieldType; section: string; options?: string[] }[] = [
  { label: 'CNIC copy', type: 'file', section: 'Documents' },
  { label: 'Birth certificate / B-Form copy', type: 'file', section: 'Documents' },
  { label: 'Last result card or degree', type: 'file', section: 'Documents' },
  { label: 'Passport-size photo copy', type: 'file', section: 'Documents' },
  { label: 'Needs school transport', type: 'checkbox', section: 'Additional information' },
  { label: 'Languages spoken', type: 'multiselect', section: 'Personal', options: ['Urdu', 'English', 'Punjabi', 'Sindhi', 'Pashto', 'Balochi'] },
  { label: 'Father’s occupation', type: 'text', section: 'Family' },
  { label: 'Number of siblings in this school', type: 'number', section: 'Family' },
  { label: 'Highest qualification', type: 'select', section: 'Education', options: ['Matric', 'Intermediate', 'Bachelor’s', 'Master’s', 'PhD'] },
  { label: 'Years of experience', type: 'number', section: 'Education' },
  { label: 'Hobbies and interests', type: 'textarea', section: 'Additional information' },
  { label: 'Referred by', type: 'text', section: 'Additional information' },
  { label: 'I confirm the information given is correct', type: 'checkbox', section: 'Additional information' },
];

const keyOf = (label: string, taken: Set<string>) => {
  const base = label.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 32) || 'field';
  let k = base;
  for (let n = 2; taken.has(k); n++) k = `${base}-${n}`;
  return k;
};
const num = (v: string) => (v.trim() === '' ? null : Number(v));

const Check = ({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) => (
  <label className="inline-flex cursor-pointer items-center gap-2 text-base font-semibold">
    <input type="checkbox" className="h-4 w-4 accent-orange-500" checked={checked} onChange={(e) => onChange(e.target.checked)} /> {label}
  </label>
);

/** Add or change one field: what kind of answer, where it appears, what it is called, and its limits. */
function FieldEditor({ field, allowFiles, withSections, onSave, onClose }: { field: CustomField | null; allowFiles: boolean; withSections: boolean; onSave: (f: CustomField) => void; onClose: () => void }) {
  const [f, setF] = useState<CustomField>(() => emptyField(1));
  const [optionsText, setOptionsText] = useState('');
  const [error, setError] = useState<string | null>(null);
  useEffect(() => { if (field) { setF(field); setOptionsText(field.options.join('\n')); setError(null); } }, [field]);
  const set = <K extends keyof CustomField>(k: K, v: CustomField[K]) => setF((x) => ({ ...x, [k]: v }));
  const choice = f.type === 'select' || f.type === 'multiselect';
  const isText = f.type === 'text' || f.type === 'textarea';
  const types = FIELD_TYPES.filter((t) => allowFiles || t !== 'file');

  const save = () => {
    const options = [...new Set(optionsText.split('\n').map((o) => o.trim()).filter(Boolean))];
    if (!f.label.trim()) return setError('Give the field a label.');
    if (choice && !options.length) return setError('Add at least one choice (one per line).');
    if (options.some((o) => o.length > 100)) return setError('Each choice can be at most 100 characters.');
    if (isText && f.minLength !== null && f.maxLength !== null && f.minLength > f.maxLength) return setError('The shortest answer cannot be longer than the longest.');
    if (f.type === 'number' && f.min !== null && f.max !== null && f.min > f.max) return setError('The smallest number cannot be bigger than the largest.');
    onSave({ ...f, label: f.label.trim(), help: f.help?.trim() || null, section: f.type === 'file' ? 'Documents' : withSections ? f.section : null, options: choice ? options : [], minLength: isText ? f.minLength : null, maxLength: isText ? f.maxLength : null, min: f.type === 'number' ? f.min : null, max: f.type === 'number' ? f.max : null });
  };

  return (
    <Modal open={!!field} size="lg" title={field?.label ? `Edit “${field.label}”` : 'Add a field'} onClose={onClose} footer={<><Button variant="secondary" onClick={onClose}>Cancel</Button><Button icon={Save} onClick={save}>Use this field</Button></>}>
      <div className="grid gap-4">
        {error && <Alert>{error}</Alert>}
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Type of answer">
            <Select value={f.type} onChange={(e) => set('type', e.target.value as FieldType)}>{types.map((t) => <option key={t} value={t}>{FIELD_TYPE_LABEL[t]}</option>)}</Select>
          </Field>
          {withSections && (f.type === 'file' ? <Field label="Section" hint="Uploads are listed under Documents"><Input value="Documents" disabled /></Field> : (
            <Field label="Section"><Select value={f.section ?? 'Additional information'} onChange={(e) => set('section', e.target.value)}>{FIELD_SECTIONS.filter((s) => s !== 'Documents').map((s) => <option key={s}>{s}</option>)}</Select></Field>
          ))}
        </div>
        <Field label="Label" hint={f.type === 'file' ? 'e.g. “CNIC copy”' : f.type === 'checkbox' ? 'e.g. “I confirm the information given is correct”' : 'e.g. “Father’s CNIC number”'} required>
          <Input maxLength={120} value={f.label} onChange={(e) => set('label', e.target.value)} />
        </Field>
        <Field label="Help text (optional)" hint="A short note shown under the field"><Input maxLength={300} value={f.help ?? ''} onChange={(e) => set('help', e.target.value)} /></Field>
        <Check label={f.type === 'checkbox' ? 'Mandatory: the box must be ticked' : f.type === 'file' ? 'Mandatory: the document must be attached' : 'Mandatory: the form cannot be saved without it'} checked={f.required} onChange={(v) => set('required', v)} />
        {choice && <Field label="Choices" hint="One per line" required><TextArea rows={5} value={optionsText} onChange={(e) => setOptionsText(e.target.value)} placeholder={'Yes\nNo'} /></Field>}
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
        {f.type === 'file' && <p className="text-sm text-slate-500">One PDF, Word (.docx), JPG or PNG file of up to 5 MB. It is saved with the person’s documents and shown on their profile.</p>}
      </div>
    </Modal>
  );
}

/**
 * Designs a form the way the admission form is designed: a list of your own fields (each with its kind
 * of answer, section and whether it is mandatory), an "Add a field" window with every kind of answer
 * (text, number, date, choices, tick box, document upload…), ready-made suggestions, and a live preview.
 */
export function FormDesigner({ value, onChange, introLabel = 'Shown at the top of the form (optional)', fixedNote, allowFiles = false, withSections = false }: { value: CustomForm; onChange: (next: CustomForm) => void; introLabel?: string; fixedNote?: string; allowFiles?: boolean; withSections?: boolean }) {
  const fields = value.fields;
  const [editing, setEditing] = useState<CustomField | null>(null);
  const [removing, setRemoving] = useState<CustomField | null>(null);
  const move = (i: number, by: -1 | 1) => {
    const next = [...fields];
    [next[i], next[i + by]] = [next[i + by]!, next[i]!];
    onChange({ ...value, fields: next });
  };
  const upsert = (f: CustomField) => {
    const exists = fields.some((x) => x.id === f.id);
    // A field keeps its key once added (answers are stored under it); a new one gets a key from its label.
    const clean = { ...f, id: exists ? f.id : keyOf(f.label, new Set(fields.map((x) => x.id))) };
    onChange({ ...value, fields: exists ? fields.map((x) => (x.id === f.id ? clean : x)) : [...fields, clean] });
    setEditing(null);
  };
  const preset = (p: (typeof PRESETS)[number]) => setEditing({ ...emptyField(fields.length + 1), label: p.label, type: p.type, section: p.section, options: p.options ?? [] });
  const used = new Set(fields.map((f) => f.label.trim().toLowerCase()));
  const suggestions = PRESETS.filter((p) => (allowFiles || p.type !== 'file') && !used.has(p.label.toLowerCase()));
  const previewForm: CustomForm = { ...value, fields: fields.filter((f) => f.label.trim()) };

  return (
    <div className="space-y-5">
      {fixedNote && <p className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">{fixedNote}</p>}
      <div className="grid gap-6 xl:grid-cols-[1fr_1.4fr]">
        <div className="space-y-6">
          <Card title="Instructions" icon={ClipboardList}>
            <Field label={introLabel}><TextArea rows={4} maxLength={3000} value={value.intro ?? ''} onChange={(e) => onChange({ ...value, intro: e.target.value || null })} /></Field>
          </Card>
          <Card title="Preview" icon={ClipboardList}>
            {previewForm.fields.length ? <DynamicFields form={previewForm} answers={{}} onChange={() => undefined} /> : <p className="text-sm text-slate-400">Your fields appear here as you add them.</p>}
          </Card>
        </div>

        <Card title="Your own fields" icon={ClipboardList} actions={<Button icon={Plus} disabled={fields.length >= MAX_FIELDS} onClick={() => setEditing(emptyField(fields.length + 1))} data-tour="designer-add">Add field</Button>}>
          {suggestions.length > 0 && (
            <div className="mb-4" data-tour="designer-presets">
              <p className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500"><Sparkles size={13} /> Quick start <span className="font-normal normal-case tracking-normal text-slate-400">(name, contact, CNIC, blood group and similar details are already asked)</span></p>
              <div className="flex flex-wrap gap-2">{suggestions.slice(0, 10).map((p) => <button key={p.label} type="button" onClick={() => preset(p)} className="focus-ring inline-flex items-center gap-1 rounded-full border border-slate-300 bg-white px-3 py-1 text-sm font-semibold text-slate-700 transition hover:border-primary-500 hover:bg-primary-500/10 dark:border-white/15 dark:bg-white/5 dark:text-slate-200"><Plus size={13} /> {p.label}</button>)}</div>
            </div>
          )}
          {fields.length === 0 ? (
            <EmptyState icon={ClipboardList} title="No fields of your own yet" tone="slate">Add what you need to know: a CNIC number, blood group, a document upload, a tick box, anything.</EmptyState>
          ) : (
            <ol className="divide-y divide-(--surface-border) rounded-lg border border-(--surface-border)" data-tour="designer-field">
              {fields.map((f, i) => (
                <li key={f.id} className="flex items-start gap-3 p-3">
                  <span className="mt-0.5 w-6 shrink-0 text-right font-mono text-sm text-slate-400">{i + 1}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-slate-800 dark:text-slate-100">{f.label}</p>
                    <div className="mt-1 flex flex-wrap gap-1.5">
                      <Badge tone="sky">{FIELD_TYPE_LABEL[f.type]}</Badge>
                      {withSections && <Badge tone="slate">{f.section ?? 'Additional information'}</Badge>}
                      {f.required ? <Badge tone="rose">Mandatory</Badge> : <Badge tone="slate">Optional</Badge>}
                      {f.options.length > 0 && <Badge tone="slate">{f.options.length} choice{f.options.length === 1 ? '' : 's'}</Badge>}
                    </div>
                  </div>
                  <div className="flex shrink-0">
                    <IconButton icon={ArrowUp} label="Move up" disabled={i === 0} onClick={() => move(i, -1)} />
                    <IconButton icon={ArrowDown} label="Move down" disabled={i === fields.length - 1} onClick={() => move(i, 1)} />
                    <IconButton icon={Pencil} label={`Edit ${f.label}`} onClick={() => setEditing(f)} />
                    <IconButton icon={Trash2} label={`Remove ${f.label}`} tone="danger" onClick={() => setRemoving(f)} />
                  </div>
                </li>
              ))}
            </ol>
          )}
        </Card>
      </div>
      <FieldEditor field={editing} allowFiles={allowFiles} withSections={withSections} onSave={upsert} onClose={() => setEditing(null)} />
      <ConfirmDialog open={!!removing} title="Remove field?" message={`“${removing?.label ?? ''}” will no longer be asked once you save the form.`} confirmLabel="Remove" onConfirm={() => { if (removing) onChange({ ...value, fields: fields.filter((x) => x.id !== removing.id) }); setRemoving(null); }} onClose={() => setRemoving(null)} />
    </div>
  );
}
