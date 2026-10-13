import { CalendarRange, Plus } from 'lucide-react';
import { useState } from 'react';
import { useAreaNavigate } from '@/app/router/area';
import { Badge, Button, Card, CompactNumber, DataTable, EmptyState, Spinner, type Column } from '@/components/ui';
import { NewRunModal } from '@/features/payroll/components/runs/NewRunModal';
import { RUN_LABEL, RUN_TONE } from '@/features/payroll/constants';
import { usePayrollRuns } from '@/features/payroll/hooks/usePayroll';
import { formatDate } from '@/lib/format';

type Run = NonNullable<ReturnType<typeof usePayrollRuns>['data']>[number];

/** Payroll runs as a table, newest first. Amounts use k / M with the exact figure on hover; a row opens the run. */
export function RunsTab({ canEdit }: { canEdit: boolean }) {
  const [creating, setCreating] = useState(false);
  const runs = usePayrollRuns();
  const navigate = useAreaNavigate();
  const amount = (v: string | number | null | undefined) => <span className="font-semibold tabular-nums">{v === null || v === undefined ? '—' : <CompactNumber value={v} />}</span>;
  const cols: Column<Run>[] = [
    { header: 'Month', cell: (r) => <div><div className="font-semibold text-slate-900 dark:text-white">{r.period.name}</div><div className="text-sm text-slate-500">{formatDate(r.period.startDate)} – {formatDate(r.period.endDate)}</div></div> },
    { header: 'Employees', align: 'right', cell: (r) => <span className="tabular-nums">{r._count?.items ?? 0}</span> },
    { header: 'Working days', align: 'right', cell: (r) => <span className="tabular-nums">{r.workingDays}</span> },
    { header: 'Gross', align: 'right', cell: (r) => amount(r.totalGross) },
    { header: 'Deductions', align: 'right', cell: (r) => amount(r.totalDeductions) },
    { header: 'Net pay', align: 'right', cell: (r) => <span className="text-emerald-700 dark:text-emerald-400">{amount(r.totalNet)}</span> },
    { header: 'Status', cell: (r) => <Badge tone={RUN_TONE[r.status]}>{RUN_LABEL[r.status]}</Badge> },
  ];
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
      {!!runs.data?.length && (
        <Card padded={false} title="Payroll runs" icon={CalendarRange}>
          <DataTable columns={cols} rows={runs.data} rowKey={(r) => r.id} onRowClick={(r) => navigate(`/payroll/runs/${r.id}`)} />
          <p className="border-t border-slate-200 px-5 py-3 text-xs text-slate-500 dark:border-white/5">Amounts in the school currency; hover a figure to see it in full. Click a run to open it.</p>
        </Card>
      )}
      {canEdit && <NewRunModal open={creating} onClose={() => setCreating(false)} />}
    </div>
  );
}
