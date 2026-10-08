import { Award, CalendarCheck, ChartColumn, CircleDollarSign, Presentation, ShieldAlert, TrendingUp, UserCheck, Wallet } from 'lucide-react';
import { useState } from 'react';
import { BarChart, RateBars } from '@/components/charts/BarChart';
import { Card, EmptyState, PageHeader, Select, Spinner, StatCard, Tabs } from '@/components/ui';
import { METHOD_LABEL } from '@/features/fees/constants';
import type { PaymentMethod } from '@/features/fees/types/fee.types';
import { money } from '@/features/fees/utils/fee.utils';
import { useAcademicReport, useAttendanceReport, useFinanceReport } from '@/features/reports/hooks/useReports';

type Tab = 'finance' | 'attendance' | 'academics';

const monthLabel = (ym: string) => new Date(`${ym}-01T00:00:00Z`).toLocaleDateString(undefined, { month: 'short', timeZone: 'UTC' });

/** The last 12 months, oldest first, with 0 for months without collections. */
function lastTwelve(rows: { month: string; collected: number }[]) {
  const map = new Map(rows.map((r) => [r.month, r.collected]));
  const now = new Date();
  return Array.from({ length: 12 }, (_, i) => {
    const d = new Date(Date.UTC(now.getFullYear(), now.getMonth() - 11 + i, 1));
    const key = d.toISOString().slice(0, 7);
    return { key, label: monthLabel(key), value: map.get(key) ?? 0 };
  });
}

function FinanceTab() {
  const r = useFinanceReport();
  if (r.isLoading) return <Spinner />;
  if (!r.data) return null;
  const d = r.data;
  const months = lastTwelve(d.byMonth);
  const year = months.reduce((t, m) => t + m.value, 0);
  const outstanding = d.byClass.reduce((t, c) => t + c.outstanding, 0);
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard label="Collected, 12 months" value={money(year)} icon={TrendingUp} tone="emerald" />
        <StatCard label="This month" value={money(months[11]?.value ?? 0)} icon={CircleDollarSign} tone="primary" />
        <StatCard label="Outstanding this year" value={money(outstanding)} icon={Wallet} tone="amber" />
        <StatCard label="Overdue invoices" value={d.byClass.reduce((t, c) => t + c.overdueInvoices, 0)} icon={ShieldAlert} tone="rose" />
      </div>
      <div className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
        <Card title="Fee collections by month" icon={TrendingUp} tone="emerald">
          <BarChart label="Fee collections by month" bars={months} format={(v) => money(v)} />
        </Card>
        <Card title="By payment method" icon={Wallet} tone="primary" padded={false}>
          {d.byMethod.length === 0 ? <EmptyState icon={Wallet} title="No payments yet" tone="primary" /> : (
            <table className="w-full text-base">
              <tbody className="divide-y divide-slate-200/70 dark:divide-white/5">
                {d.byMethod.map((m) => (
                  <tr key={m.method}>
                    <td className="px-5 py-2.5 text-slate-700 dark:text-slate-200">{METHOD_LABEL[m.method as PaymentMethod] ?? m.method}</td>
                    <td className="px-5 py-2.5 text-right text-sm text-slate-500">{m.payments} payments</td>
                    <td className="px-5 py-2.5 text-right font-semibold tabular-nums">{money(m.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      </div>
      <Card title="Dues by class (current year)" icon={Wallet} tone="amber" padded={false}>
        {d.byClass.length === 0 ? <EmptyState icon={Wallet} title="No invoices this year" tone="amber" /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-base">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/60 text-left text-sm uppercase tracking-wider text-slate-500 dark:border-white/5 dark:bg-white/[0.02]">
                  <th className="px-5 py-3 font-semibold">Class</th>
                  <th className="px-5 py-3 text-right font-semibold">Billed</th>
                  <th className="px-5 py-3 text-right font-semibold">Paid</th>
                  <th className="px-5 py-3 text-right font-semibold">Outstanding</th>
                  <th className="px-5 py-3 font-semibold">Collected</th>
                  <th className="px-5 py-3 text-right font-semibold">Overdue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/70 dark:divide-white/5">
                {d.byClass.map((c) => {
                  const pct = c.billed ? Math.round((c.paid / c.billed) * 100) : 0;
                  return (
                    <tr key={c.className}>
                      <td className="px-5 py-2.5 font-semibold text-slate-800 dark:text-slate-100">{c.className}</td>
                      <td className="px-5 py-2.5 text-right tabular-nums">{money(c.billed)}</td>
                      <td className="px-5 py-2.5 text-right tabular-nums">{money(c.paid)}</td>
                      <td className="px-5 py-2.5 text-right font-semibold tabular-nums">{money(c.outstanding)}</td>
                      <td className="px-5 py-2.5">
                        <div className="flex items-center gap-2">
                          <span className="h-2 w-28 overflow-hidden rounded-full bg-slate-500/10"><span className="block h-full rounded-full bg-primary-500" style={{ width: `${pct}%` }} /></span>
                          <span className="text-sm tabular-nums text-slate-500">{pct}%</span>
                        </div>
                      </td>
                      <td className="px-5 py-2.5 text-right tabular-nums">{c.overdueInvoices}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

function AttendanceTab() {
  const [days, setDays] = useState(30);
  const r = useAttendanceReport(days);
  const d = r.data;
  return (
    <div className="space-y-4">
      <div className="w-48">
        <Select aria-label="Period" value={days} onChange={(e) => setDays(Number(e.target.value))}>
          <option value={7}>Last 7 days</option><option value={30}>Last 30 days</option><option value={90}>Last 90 days</option><option value={365}>Last 12 months</option>
        </Select>
      </div>
      {r.isLoading && <Spinner />}
      {d && (
        <>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            <StatCard label="Classes completed" value={d.sessions.completed ?? 0} icon={Presentation} tone="primary" hint={d.sessions.cancelled ? `${d.sessions.cancelled} cancelled` : undefined} />
            <StatCard label="Staff check-ins" value={d.staff.valid + d.staff.flagged + d.staff.unknown} icon={UserCheck} tone="teal" hint={`${d.staff.valid} inside the geofence`} />
            <StatCard label="Flagged GPS" value={d.staff.flagged} icon={ShieldAlert} tone="rose" hint="Outside the campus range" />
            <StatCard label="Awaiting review" value={d.staff.pendingReview} icon={CalendarCheck} tone="amber" />
          </div>
          <Card title="Student attendance by class" icon={CalendarCheck} tone="teal">
            {d.byClass.length === 0 ? <EmptyState icon={CalendarCheck} title="No attendance marked in this period" tone="teal" /> : (
              <RateBars label="Attendance rate by class" rows={d.byClass.map((c) => ({ key: c.className, label: c.className, value: c.rate, detail: `${c.present} present · ${c.late} late · ${c.absent} absent · ${c.excused} excused` }))} />
            )}
            <p className="mt-3 text-xs text-slate-500">Rate = (present + late) ÷ (present + late + absent); excused absences are not counted against students.</p>
          </Card>
        </>
      )}
    </div>
  );
}

function AcademicsTab() {
  const r = useAcademicReport();
  if (r.isLoading) return <Spinner />;
  if (!r.data?.length) return <Card><EmptyState icon={Award} title="No published results yet" tone="fuchsia">Pass rates appear once an exam's results are published.</EmptyState></Card>;
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {r.data.map((e) => (
        <Card key={e.examId} title={e.name} icon={Award} tone="fuchsia">
          <RateBars label={`${e.name} pass rate by class`} rows={e.classes.map((c) => ({ key: c.className, label: c.className, value: c.passRate, detail: `${c.students} students · average ${c.average}%` }))} />
          <p className="mt-3 text-xs text-slate-500">Pass rate by class · averages: {e.classes.map((c) => `${c.className} ${c.average}%`).join(' · ')}</p>
        </Card>
      ))}
    </div>
  );
}

/** Reports (page 14): admins see finance, attendance and academics; accounts only finance. */
export function ReportsPage({ financeOnly = false }: { financeOnly?: boolean }) {
  const [tab, setTab] = useState<Tab>('finance');
  const tabs = [
    { id: 'finance' as const, label: 'Financial', icon: Wallet },
    ...(financeOnly ? [] : [{ id: 'attendance' as const, label: 'Attendance', icon: CalendarCheck }, { id: 'academics' as const, label: 'Academic', icon: Award }]),
  ];
  return (
    <div>
      <PageHeader title={financeOnly ? 'Financial reports' : 'Reports'} sub="Live figures from your school's records" icon={ChartColumn} tone="primary" />
      {tabs.length > 1 && <Tabs tabs={tabs} value={tab} onChange={setTab} />}
      {tab === 'finance' && <FinanceTab />}
      {tab === 'attendance' && <AttendanceTab />}
      {tab === 'academics' && <AcademicsTab />}
    </div>
  );
}
