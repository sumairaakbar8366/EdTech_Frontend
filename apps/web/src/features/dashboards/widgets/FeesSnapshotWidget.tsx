import { CalendarClock, CircleDollarSign, TrendingUp, Wallet } from 'lucide-react';
import { Card, CompactNumber, Spinner } from '@/components/ui';
import { ViewAll } from '@/features/dashboards/components/ViewAll';
import { InvoiceStatusBar } from '@/features/fees/components/InvoiceStatusBar';
import { useFeesSummary } from '@/features/fees/hooks/useFees';

/** Collections this month, outstanding and overdue, with invoices by status. */
export function FeesSnapshotWidget({ to, className = '' }: { to: string; className?: string }) {
  const summary = useFeesSummary();
  const s = summary.data;
  const figures = s && [
    { label: 'Collected this month', value: <CompactNumber value={s.collectedThisMonth} />, icon: TrendingUp, cls: 'text-emerald-600 dark:text-emerald-400' },
    { label: 'Outstanding', value: <CompactNumber value={s.outstanding} />, icon: CircleDollarSign, cls: 'text-amber-600 dark:text-amber-400' },
    { label: 'Overdue invoices', value: <CompactNumber value={s.overdueInvoices} />, icon: CalendarClock, cls: 'text-rose-600 dark:text-rose-400' },
  ];
  return (
    <Card title="Fees" icon={Wallet} tone="amber" className={className} actions={<ViewAll to={to} />}>
      {summary.isLoading && <Spinner />}
      {figures && (
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
            {figures.map((f) => (
              <div key={f.label} className="min-w-0 rounded-xl bg-slate-500/5 px-3 py-2.5">
                <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500"><f.icon size={13} /> {f.label}</div>
                <div className={`mt-0.5 whitespace-nowrap font-display text-2xl font-bold tabular-nums ${f.cls}`}>{f.value}</div>
              </div>
            ))}
          </div>
          <InvoiceStatusBar counts={s.byStatus} framed={false} />
          <p className="text-xs text-slate-500">Amounts in {s.currency}.</p>
        </div>
      )}
    </Card>
  );
}
