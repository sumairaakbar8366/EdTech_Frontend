import { Banknote } from 'lucide-react';
import { Card, Spinner } from '@/components/ui';
import { ViewAll } from '@/features/dashboards/components/ViewAll';
import { money } from '@/features/fees/utils/fee.utils';
import { usePayrollSummary } from '@/features/payroll/hooks/usePayroll';
import { formatDate } from '@/lib/format';

/** Salary set-up coverage, runs awaiting action and the last paid run. */
export function PayrollStatusWidget({ to, className = '' }: { to: string; className?: string }) {
  const summary = usePayrollSummary();
  const s = summary.data;
  return (
    <Card title="Payroll" icon={Banknote} tone="orange" className={className} actions={<ViewAll to={to} />}>
      {summary.isLoading && <Spinner />}
      {s && (
        <div className="space-y-3">
          <div>
            <div className="mb-1 flex justify-between text-sm"><span className="text-slate-600 dark:text-slate-300">Staff with a salary set</span><strong className="tabular-nums">{s.withStructure}/{s.staff}</strong></div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-500/10"><div className="h-full rounded-full bg-brand" style={{ width: `${s.staff ? (s.withStructure / s.staff) * 100 : 0}%` }} /></div>
          </div>
          <div className="flex items-center justify-between rounded-xl bg-amber-500/10 px-3 py-2 text-sm">
            <span className="text-slate-700 dark:text-slate-200">Runs in progress</span>
            <strong className="font-display text-xl tabular-nums">{s.pendingRuns}</strong>
          </div>
          <div className="rounded-xl bg-emerald-500/10 px-3 py-2 text-sm">
            {s.lastPaid ? (
              <>
                <div className="text-slate-600 dark:text-slate-300">Last paid · {s.lastPaid.period.name}</div>
                <div className="font-display text-xl font-bold tabular-nums text-emerald-700 dark:text-emerald-300">{money(s.lastPaid.totalNet)}</div>
                {s.lastPaid.paidAt && <div className="text-xs text-slate-500">on {formatDate(s.lastPaid.paidAt)}</div>}
              </>
            ) : (
              <span className="text-slate-600 dark:text-slate-300">No payroll paid yet.</span>
            )}
          </div>
        </div>
      )}
    </Card>
  );
}
