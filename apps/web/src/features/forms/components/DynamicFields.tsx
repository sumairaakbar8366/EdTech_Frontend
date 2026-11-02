import { Field, Input, Select, TextArea } from '@/components/ui';
import { Paperclip } from 'lucide-react';
import { bySection, type Answers, type AnswerValue, type CustomField, type CustomForm, type PendingFiles } from '@/features/forms/forms';

/** The inputs of a custom form: one control per field, by type. The parent keeps the answers. */
export function DynamicFields({ form, answers, onChange, errors = {}, files = {}, onFiles }: { form: CustomForm; answers: Answers; onChange: (next: Answers) => void; errors?: Record<string, string>; files?: PendingFiles; onFiles?: (next: PendingFiles) => void }) {
  const set = (id: string, v: AnswerValue | undefined) => {
    const next = { ...answers };
    if (v === undefined || v === '') delete next[id];
    else next[id] = v;
    onChange(next);
  };
  const render = (list: CustomField[]) => (
    <div className="grid gap-4 sm:grid-cols-2">
      {list.map((f) => {
        const v = answers[f.id];
        const wide = f.type === 'textarea' || f.type === 'multiselect' || f.type === 'file';
        const common = { label: f.label, hint: f.help ?? undefined, error: errors[f.id], required: f.required };
        return (
          <div key={f.id} className={wide ? 'sm:col-span-2' : ''}>
            {f.type === 'file' ? (
              <Field {...common}>
                <label className="focus-ring flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-slate-300 px-3.5 py-2.5 text-base text-slate-600 transition hover:bg-slate-50 dark:border-white/20 dark:text-slate-300 dark:hover:bg-white/5">
                  <Paperclip size={16} className="shrink-0" />
                  <span className="min-w-0 truncate">{files[f.id]?.name ?? (v && typeof v === 'object' && !Array.isArray(v) ? `${v.fileName} (uploaded)` : 'Choose a file (PDF, Word, JPG or PNG)')}</span>
                  <input type="file" className="sr-only" accept=".pdf,.docx,.jpg,.jpeg,.png" onChange={(e) => { const file = e.target.files?.[0]; if (file && onFiles) onFiles({ ...files, [f.id]: file }); }} />
                </label>
              </Field>
            ) : f.type === 'checkbox' ? (
              <label className="flex items-start gap-2.5 py-1 text-base text-slate-700 dark:text-slate-200">
                <input type="checkbox" className="mt-1 h-4 w-4 accent-[var(--brand-action,#1d4ed8)]" checked={v === true} onChange={(e) => set(f.id, e.target.checked)} />
                <span>{f.label}{f.required && <span className="text-rose-600"> *</span>}{f.help && <span className="block text-xs text-slate-400">{f.help}</span>}{errors[f.id] && <span className="block text-xs text-rose-600">{errors[f.id]}</span>}</span>
              </label>
            ) : f.type === 'multiselect' ? (
              <Field {...common}>
                <div className="flex flex-wrap gap-2">
                  {f.options.map((o) => {
                    const on = Array.isArray(v) && v.includes(o);
                    return (
                      <button key={o} type="button" aria-pressed={on} onClick={() => set(f.id, on ? (v as string[]).filter((x) => x !== o) : [...(Array.isArray(v) ? v : []), o])} className={`focus-ring rounded-lg px-3 py-1.5 text-sm font-semibold ring-1 ring-inset transition ${on ? 'bg-primary-600 text-white ring-primary-600' : 'bg-white text-slate-700 ring-slate-300 hover:bg-slate-50 dark:bg-white/5 dark:text-slate-200 dark:ring-white/10'}`}>{o}</button>
                    );
                  })}
                </div>
              </Field>
            ) : f.type === 'select' ? (
              <Field {...common}>
                <Select value={typeof v === 'string' ? v : ''} onChange={(e) => set(f.id, e.target.value)}>
                  <option value="">Choose…</option>
                  {f.options.map((o) => <option key={o} value={o}>{o}</option>)}
                </Select>
              </Field>
            ) : f.type === 'textarea' ? (
              <Field {...common}><TextArea value={typeof v === 'string' ? v : ''} maxLength={f.maxLength ?? 3000} onChange={(e) => set(f.id, e.target.value)} /></Field>
            ) : (
              <Field {...common}>
                <Input
                  type={f.type === 'number' ? 'number' : f.type === 'email' ? 'email' : f.type === 'phone' ? 'tel' : f.type === 'date' ? 'date' : 'text'}
                  value={v === undefined ? '' : String(v)}
                  min={f.min ?? undefined}
                  max={f.max ?? undefined}
                  maxLength={f.type === 'text' ? f.maxLength ?? 200 : undefined}
                  onChange={(e) => set(f.id, f.type === 'number' ? (e.target.value === '' ? undefined : Number(e.target.value)) : e.target.value)}
                />
              </Field>
            )}
          </div>
        );
      })}
    </div>
  );
  const groups = bySection(form);
  if (groups.length <= 1) return render(form.fields);
  return (
    <div className="space-y-5">
      {groups.map((g) => (
        <section key={g.section}>
          <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">{g.section}</h4>
          {render(g.fields)}
        </section>
      ))}
    </div>
  );
}
