import { CompactNumber } from '@/components/ui';
import { ADMISSION_LABEL, ADMISSION_STEPS } from '@/features/admissions/constants';
import { useAdmissionSummary } from '@/features/admissions/hooks/useAdmissions';
import type { AdmissionStatus } from '@/features/admissions/types/admission.types';

const SHOWN: AdmissionStatus[] = [...ADMISSION_STEPS, 'rejected', 'withdrawn'];

/** Count per pipeline stage; clicking a stage filters the list (clicking again clears it). */
export function PipelineStrip({ selected, onSelect }: { selected: '' | AdmissionStatus; onSelect: (s: '' | AdmissionStatus) => void }) {
  const summary = useAdmissionSummary();
  return (
    <div className="mb-6 grid grid-cols-2 gap-2 sm:grid-cols-4 xl:grid-cols-8">
      {SHOWN.map((s) => (
        <button key={s} onClick={() => onSelect(selected === s ? '' : s)} className={`surface min-w-0 rounded-xl px-3 py-3 text-left transition ${selected === s ? 'ring-2 ring-primary-500' : 'hover:shadow-depth-3'}`}>
          <div className="truncate text-sm font-bold uppercase tracking-wider text-slate-500">{ADMISSION_LABEL[s]}</div>
          <div className="whitespace-nowrap font-display text-3xl font-bold tabular-nums text-slate-900 dark:text-white"><CompactNumber value={summary.data?.[s] ?? 0} /></div>
        </button>
      ))}
    </div>
  );
}
