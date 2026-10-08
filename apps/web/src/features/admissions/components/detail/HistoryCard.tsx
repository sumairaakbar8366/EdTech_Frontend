import { History } from 'lucide-react';
import { Card, StatusBadge } from '@/components/ui';
import { ADMISSION_LABEL, ADMISSION_TONE } from '@/features/admissions/constants';
import type { AdmissionApplication } from '@/features/admissions/types/admission.types';

export function HistoryCard({ application: a }: { application: AdmissionApplication }) {
  return (
    <Card title="History" icon={History} tone="slate">
      <ol className="space-y-3">
        {a.statusHistory?.map((h) => (
          <li key={h.id} className="border-l-2 border-slate-200 pl-3 dark:border-white/10">
            <div className="flex flex-wrap items-center gap-1.5">
              <StatusBadge status={h.toStatus} tones={ADMISSION_TONE} labels={ADMISSION_LABEL} />
              <span className="text-sm text-slate-500">{new Date(h.changedAt).toLocaleString()}</span>
            </div>
            {h.note && <p className="text-base text-slate-600 dark:text-slate-300">{h.note}</p>}
          </li>
        ))}
      </ol>
    </Card>
  );
}
