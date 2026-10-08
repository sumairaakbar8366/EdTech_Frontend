import { CalendarRange, Plus } from 'lucide-react';
import { useState } from 'react';
import { AreaLink } from '@/app/router/area';
import { Badge, Button, Card, EmptyState, Spinner, Tilt } from '@/components/ui';
import { money } from '@/features/fees/utils/fee.utils';
import { NewRunModal } from '@/features/payroll/components/runs/NewRunModal';
import { RUN_LABEL, RUN_TONE } from '@/features/payroll/constants';
import { usePayrollRuns } from '@/features/payroll/hooks/usePayroll';
import { formatDate } from '@/lib/format';

/** Payroll runs as cards, newest first. */
export function RunsTab({ canEdit }: { canEdit: boolean }) {
  const [creating, setCreating] = useState(false);
  const runs = usePayrollRuns();
  return (
    <div className="space-y-4">
      {canEdit && (
        <div className="flex justify-end">
          <Button icon={Plus} onClick={() => setCreating(true)}>New payroll run</Button>
        </div>
      )}
      {runs.isLoading && <Spinner />}
      {runs.data?.length === 0 && (
        <Card><EmptyState icon={CalendarRange} title="No payroll runs yet" tone="orange">Set salary structures first, then start a run for the month.</EmptyState></Card>
      )}
      <div className="stagger grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {runs.data?.map((r) => (
          <Tilt key={r.id} max={4} className="rounded-xl">
            <AreaLink to={`/payroll/runs/${r.id}`} data-tone={RUN_TONE[r.status]} className="surface tone-card focus-ring block rounded-xl p-5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-display text-2xl font-bold uppercase tracking-wide text-slate-900 dark:text-white">{r.period.name}</div>
                  <div className="text-sm text-slate-500">{formatDate(r.period.startDate)} – {formatDate(r.period.endDate)}</div>
                </div>
                <Badge tone={RUN_TONE[r.status]}>{RUN_LABEL[r.status]}</Badge>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                {[['Gross', r.totalGross], ['Deductions', r.totalDeductions], ['Net', r.totalNet]].map(([label, v]) => (
                  <div key={label} className="rounded-lg bg-slate-500/5 px-2 py-1.5">
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-500">{label}</div>
                    <div className="font-semibold tabular-nums text-slate-800 dark:text-slate-100">{money(v!)}</div>
                  </div>
                ))}
              </div>
              <div className="mt-3 text-sm text-slate-500">{r._count?.items ?? 0} employees · {r.workingDays} working days</div>
            </AreaLink>
          </Tilt>
        ))}
      </div>
      {canEdit && <NewRunModal open={creating} onClose={() => setCreating(false)} />}
    </div>
  );
}
