import { Banknote } from 'lucide-react';
import { Card, EmptyState, Spinner } from '@/components/ui';
import { ViewAll } from '@/features/dashboards/components/ViewAll';
import { money } from '@/features/fees/utils/fee.utils';
import { useMyPayslips } from '@/features/payroll/hooks/usePayroll';
import { formatDate } from '@/lib/format';

/** The employee's most recent payslip. */
export function LatestPayslipWidget({ to, className = '' }: { to: string; className?: string }) {
  const slips = useMyPayslips();
  const last = slips.data?.[0];
  return (
    <Card title="Latest payslip" icon={Banknote} tone="orange" className={className} actions={<ViewAll to={to} />}>
      {slips.isLoading && <Spinner />}
      {slips.isSuccess && !last && <EmptyState icon={Banknote} title="No payslips yet" tone="orange" />}
      {last && (
        <div>
          <div className="font-display text-xl font-bold uppercase tracking-wide text-slate-900 dark:text-white">{last.run.period.name}</div>
          <div className="text-sm text-slate-500">
            {last.payslip?.payslipNo}
            {last.run.paidAt && ` · paid ${formatDate(last.run.paidAt)}`}
          </div>
          <div className="mt-3 flex items-end justify-between gap-3">
            <div className="text-sm text-slate-500">
              <div>Gross {money(last.gross)}</div>
              <div>Deductions {money(last.totalDeductions)}</div>
            </div>
            <span className="font-display text-3xl font-bold tabular-nums text-emerald-600 dark:text-emerald-400">{money(last.net)}</span>
          </div>
        </div>
      )}
    </Card>
  );
}
