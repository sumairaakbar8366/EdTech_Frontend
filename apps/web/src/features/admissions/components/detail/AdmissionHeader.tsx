import { Check, Pencil } from 'lucide-react';
import { AreaLink } from '@/app/router/area';
import { Button, StatusBadge } from '@/components/ui';
import { ADMISSION_LABEL, ADMISSION_STEPS, ADMISSION_TONE } from '@/features/admissions/constants';
import type { AdmissionApplication } from '@/features/admissions/types/admission.types';
import { formatDate } from '@/lib/format';

/** Applicant, class and status, with the pipeline progress stepper. */
export function AdmissionHeader({ application: a, canEdit, onEdit }: { application: AdmissionApplication; canEdit: boolean; onEdit: () => void }) {
  const stepIndex = ADMISSION_STEPS.indexOf(a.status as (typeof ADMISSION_STEPS)[number]);
  return (
    <div className="surface mb-6 rounded-xl p-5 animate-fade-up">
      <div className="flex flex-wrap items-center gap-4">
        <div className="min-w-0 flex-1">
          <div className="text-base tabular-nums text-slate-500">{a.applicationNo} · received {formatDate(a.createdAt)}</div>
          <h1 className="font-display text-3xl font-bold uppercase tracking-wide text-slate-900 dark:text-white">{a.firstName} {a.lastName}</h1>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-base text-slate-600 dark:text-slate-300">
            Applying for <strong>{a.schoolClass.name}</strong> · {a.campus.name} · {a.academicYear.name}
            <StatusBadge status={a.status} tones={ADMISSION_TONE} labels={ADMISSION_LABEL} />
            {a.student && <AreaLink to={`/students/${a.student.id}`} className="font-semibold text-primary-600 hover:underline">Student {a.student.admissionNo} →</AreaLink>}
          </div>
        </div>
        {canEdit && <Button variant="secondary" icon={Pencil} onClick={onEdit}>Edit</Button>}
      </div>
      <ol className="mt-5 grid grid-cols-6 gap-1">
        {ADMISSION_STEPS.map((s, i) => {
          const done = stepIndex >= 0 && i < stepIndex;
          const here = i === stepIndex;
          return (
            <li key={s} className="text-center">
              <div className={`mx-auto mb-1 flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${done ? 'bg-emerald-500 text-white' : here ? 'bg-primary-600 text-white ring-4 ring-primary-500/20' : 'bg-slate-200 text-slate-500 dark:bg-white/10'}`}>
                {done ? <Check size={16} /> : i + 1}
              </div>
              <div className={`text-xs font-semibold uppercase tracking-wider sm:text-sm ${here ? 'text-primary-700 dark:text-primary-300' : 'text-slate-500'}`}>{ADMISSION_LABEL[s]}</div>
            </li>
          );
        })}
      </ol>
      {(a.status === 'rejected' || a.status === 'withdrawn') && <p className="mt-3 text-center text-base font-semibold text-rose-600">This application was {a.status}.</p>}
    </div>
  );
}
