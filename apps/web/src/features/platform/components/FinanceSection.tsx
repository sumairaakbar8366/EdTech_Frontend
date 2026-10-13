import { CalendarClock, ChartColumn, Repeat, TrendingUp, Wallet } from 'lucide-react';
import { Badge, Card, CompactNumber, EmptyState, Spinner, StatCard } from '@/components/ui';
import { BarChart } from '@/components/charts/BarChart';
import { METHOD_LABEL, type PaymentMethod } from '@/features/billing/billing';
import { useFinance } from '@/features/platform/hooks/useConsole';
import { compactNumber, formatDate } from '@/lib/format';

const pkr = (n: number) => `PKR ${Math.round(n).toLocaleString('en-PK')}`;
const monthLabel = (m: string) => new Date(`${m}-01T00:00:00Z`).toLocaleDateString(undefined, { month: 'short', timeZone: 'UTC' });

/** Owner's money view: recurring revenue, the last 12 months, payment methods and plans ending soon. */
export function FinanceSection() {
  const f = useFinance();
  const d = f.data;
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-4">
        <StatCard label="Monthly recurring revenue" value={d ? <CompactNumber value={d.mrr} prefix="PKR " /> : '–'} icon={Repeat} tone="emerald" hint={d ? `${compactNumber(d.paying)} paying schools` : undefined} />
        <StatCard label="Received this month" value={d ? <CompactNumber value={d.thisMonth} prefix="PKR " /> : '–'} icon={Wallet} tone="primary" />
        <StatCard label="Last 12 months" value={d ? <CompactNumber value={d.revenue12m} prefix="PKR " /> : '–'} icon={TrendingUp} tone="teal" />
        <StatCard label="On free trial" value={d?.trialing ?? '–'} icon={CalendarClock} tone="amber" hint="Possible new customers" />
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <Card title="Revenue by month (PKR)" icon={ChartColumn} className="lg:col-span-2">
          {f.isLoading && <Spinner />}
          {d && <BarChart label="Revenue by month" bars={d.byMonth.map((m) => ({ key: m.month, label: monthLabel(m.month), value: m.amount }))} format={pkr} />}
        </Card>
        <Card title="By payment method" icon={Wallet}>
          {d && d.byMethod.length === 0 && <EmptyState icon={Wallet} title="No payments yet" />}
          <ul className="space-y-2">
            {d?.byMethod.map((m) => (
              <li key={m.method} className="flex items-center justify-between rounded-lg bg-slate-500/5 px-3 py-2 text-sm">
                <span>{METHOD_LABEL[m.method as PaymentMethod] ?? m.method}</span>
                <strong className="tabular-nums"><CompactNumber value={m.amount} prefix="PKR " /></strong>
              </li>
            ))}
          </ul>
        </Card>
      </div>
      <Card title="Trials and plans ending in the next 14 days" icon={CalendarClock}>
        {d && d.endingSoon.length === 0 && <p className="text-sm text-slate-500">Nothing ends in the next two weeks.</p>}
        <ul className="divide-y divide-slate-200 dark:divide-white/10">
          {d?.endingSoon.map((r) => (
            <li key={r.school.id} className="flex flex-wrap items-center justify-between gap-2 py-2 text-sm">
              <span className="font-semibold">{r.school.name}</span>
              <span className="flex items-center gap-2"><Badge tone={r.status === 'trialing' ? 'primary' : 'emerald'}>{r.status === 'trialing' ? 'Trial' : r.plan}</Badge> ends {formatDate(r.endsAt)}</span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
