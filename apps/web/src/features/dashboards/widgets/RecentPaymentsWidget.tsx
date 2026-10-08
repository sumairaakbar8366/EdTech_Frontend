import { CreditCard } from 'lucide-react';
import { Badge, Card, EmptyState, Spinner } from '@/components/ui';
import { ViewAll } from '@/features/dashboards/components/ViewAll';
import { METHOD_LABEL } from '@/features/fees/constants';
import { usePayments } from '@/features/fees/hooks/useFees';
import { money, studentName } from '@/features/fees/utils/fee.utils';
import { formatDate } from '@/lib/format';

/** The last few fee payments received. */
export function RecentPaymentsWidget({ to, className = '' }: { to: string; className?: string }) {
  const payments = usePayments({ page: 1, pageSize: 6 });
  const rows = payments.data?.items ?? [];
  return (
    <Card title="Recent payments" icon={CreditCard} tone="emerald" className={className} actions={<ViewAll to={to} />}>
      {payments.isLoading && <Spinner />}
      {payments.isSuccess && rows.length === 0 && <EmptyState icon={CreditCard} title="No payments yet" tone="emerald" />}
      <ul className="divide-y divide-slate-200/70 dark:divide-white/5">
        {rows.map((p) => (
          <li key={p.id} className={`flex items-center gap-3 py-2 ${p.status === 'voided' ? 'opacity-60' : ''}`}>
            <div className="min-w-0 flex-1">
              <div className="truncate font-semibold text-slate-800 dark:text-slate-100">{studentName(p.student)}</div>
              <div className="text-sm text-slate-500">{p.receipt?.receiptNo} · {formatDate(p.paidAt)} · {METHOD_LABEL[p.method]}</div>
            </div>
            {p.status === 'voided' && <Badge tone="rose">voided</Badge>}
            <span className="font-semibold tabular-nums">{money(p.amount)}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}
