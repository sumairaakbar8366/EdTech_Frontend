import { ListChecks, Paperclip } from 'lucide-react';
import { Card, InfoItem } from '@/components/ui';
import { SAVE_TARGETS, SECTION_LABEL, type AnswerValue, type FormAnswer, type FormSection } from '@/features/website/admissionForm';
import { formatDate } from '@/lib/format';

function show(a: FormAnswer) {
  const v: AnswerValue = a.value;
  if (typeof v === 'object' && !Array.isArray(v)) return <span className="inline-flex items-center gap-1.5"><Paperclip size={14} /> {v.fileName} <span className="text-slate-400">(in the documents)</span></span>;
  if (Array.isArray(v)) return v.join(', ');
  if (typeof v === 'boolean') return v ? 'Yes' : 'No';
  if (a.type === 'date' && typeof v === 'string') return formatDate(v);
  return String(v);
}

/** Answers to the school's own admission form fields, grouped as on the form. */
export function FormAnswersCard({ answers, title = 'Admission form answers' }: { answers: FormAnswer[]; title?: string }) {
  const sections = (Object.keys(SECTION_LABEL) as FormSection[]).filter((s) => answers.some((a) => a.section === s));
  return (
    <Card title={title} icon={ListChecks} tone="teal">
      <div className="space-y-5">
        {sections.map((s) => (
          <div key={s}>
            {sections.length > 1 && <p className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-slate-400">{SECTION_LABEL[s]}</p>}
            <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {answers.filter((a) => a.section === s).map((a) => (
                <div key={a.fieldId} className={a.type === 'textarea' || a.type === 'file' ? 'col-span-2 sm:col-span-3' : ''}>
                  <InfoItem label={a.label}>{show(a)}</InfoItem>
                  {a.saveTo && SAVE_TARGETS[a.saveTo] && <span className="text-xs text-emerald-600 dark:text-emerald-400">Saved as {SAVE_TARGETS[a.saveTo].label.toLowerCase()} on enrollment</span>}
                </div>
              ))}
            </dl>
          </div>
        ))}
      </div>
    </Card>
  );
}
