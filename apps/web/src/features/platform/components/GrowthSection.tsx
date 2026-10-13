import { ArrowUpCircle, Percent, Rocket, Sparkles, UserPlus } from 'lucide-react';
import { Card, Spinner, StatCard } from '@/components/ui';
import { BarChart } from '@/components/charts/BarChart';
import { useGrowth } from '@/features/platform/hooks/useConsole';
import { compactNumber } from '@/lib/format';

const monthLabel = (m: string) => new Date(`${m}-01T00:00:00Z`).toLocaleDateString(undefined, { month: 'short', timeZone: 'UTC' });

/** Reach and conversion: how many schools sign up for the free trial, and how many go on to pay. */
export function GrowthSection() {
  const g = useGrowth();
  const d = g.data;
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-4">
        <StatCard label="Schools signed up" value={d?.totals.schools ?? '–'} icon={UserPlus} tone="primary" hint={d ? `${compactNumber(d.totals.selfSignups)} through the free-trial sign-up` : undefined} />
        <StatCard label="On free trial now" value={d?.totals.onTrial ?? '–'} icon={Rocket} tone="amber" />
        <StatCard label="Paying now" value={d?.totals.paying ?? '–'} icon={ArrowUpCircle} tone="emerald" hint={d ? `${compactNumber(d.totals.everPaid)} have paid at least once` : undefined} />
        <StatCard label="Trial → paid" value={d ? `${d.totals.conversion}%` : '–'} icon={Percent} tone="teal" hint="Schools that upgraded" />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="New sign-ups per month" icon={Sparkles}>
          {g.isLoading && <Spinner />}
          {d && <BarChart label="New sign-ups per month" bars={d.byMonth.map((m) => ({ key: m.month, label: monthLabel(m.month), value: m.signups }))} format={(v) => `${v} school${v === 1 ? '' : 's'}`} height={180} />}
        </Card>
        <Card title="Upgrades to a paid plan per month" icon={ArrowUpCircle}>
          {g.isLoading && <Spinner />}
          {d && <BarChart label="Upgrades per month" bars={d.byMonth.map((m) => ({ key: m.month, label: monthLabel(m.month), value: m.upgrades }))} format={(v) => `${v} upgrade${v === 1 ? '' : 's'}`} height={180} />}
        </Card>
      </div>
    </div>
  );
}
