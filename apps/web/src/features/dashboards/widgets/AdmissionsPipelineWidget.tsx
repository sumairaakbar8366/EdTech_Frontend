import { ClipboardList } from 'lucide-react';
import { Badge, Card, CompactNumber, EmptyState, Spinner } from '@/components/ui';
import { ADMISSION_LABEL, ADMISSION_TONE } from '@/features/admissions/constants';
import { useAdmissionSummary } from '@/features/admissions/hooks/useAdmissions';
import type { AdmissionStatus } from '@/features/admissions/types/admission.types';
import { ViewAll } from '@/features/dashboards/components/ViewAll';

const ORDER: AdmissionStatus[] = ['submitted', 'documents_verified', 'interview_scheduled', 'under_review', 'approved', 'enrolled', 'rejected', 'withdrawn'];

/** Applications at each admissions stage (page 6 workflow). */
export function AdmissionsPipelineWidget({ className = '' }: { className?: string }) {
  const summary = useAdmissionSummary();
  const counts = summary.data ?? {};
  const max = Math.max(1, ...ORDER.map((s) => counts[s] ?? 0));
  const total = ORDER.reduce((t, s) => t + (counts[s] ?? 0), 0);
  return (
    <Card title="Admissions pipeline" icon={ClipboardList} tone="magenta" className={className} actions={<ViewAll to="/admissions" />}>
      {summary.isLoading && <Spinner />}
      {summary.isSuccess && total === 0 && <EmptyState icon={ClipboardList} title="No applications yet" tone="magenta" />}
      {total > 0 && (
        <ul className="space-y-2">
          {ORDER.filter((s) => counts[s]).map((s) => (
            <li key={s} className="grid grid-cols-[9.5rem_1fr_2.5rem] items-center gap-3 text-sm">
              <Badge tone={ADMISSION_TONE[s]}>{ADMISSION_LABEL[s]}</Badge>
              <span className="h-2 overflow-hidden rounded-full bg-slate-500/10">
                <span className="block h-full rounded-full bg-brand transition-all" style={{ width: `${((counts[s] ?? 0) / max) * 100}%` }} />
              </span>
              <strong className="text-right tabular-nums text-slate-800 dark:text-slate-100"><CompactNumber value={counts[s] ?? 0} /></strong>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
