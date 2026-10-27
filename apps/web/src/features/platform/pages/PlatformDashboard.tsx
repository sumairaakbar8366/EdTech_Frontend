import type { LucideIcon } from 'lucide-react';
import { ArrowRight, ArrowUpCircle, Building2, CalendarClock, ChartColumn, CircleCheck, ClipboardList, Crown, Hourglass, ListChecks, Percent, School, Sparkles, Wallet } from 'lucide-react';
import type { ReactNode } from 'react';
import { Badge, Card, CompactNumber, EmptyState, IconTile, Spinner } from '@/components/ui';
import { BarChart } from '@/components/charts/BarChart';
import { AreaLink } from '@/app/router/area';
import { METHOD_LABEL, type PaymentMethod } from '@/features/billing/billing';
import { useFinance, useGrowth } from '@/features/platform/hooks/useConsole';
import { useSchoolApplications, useSchools, useTiers } from '@/features/platform/hooks/usePlatform';
import { compactNumber, formatDate } from '@/lib/format';

const DAY = 86_400_000;
const pkr = (n: number) => `PKR ${Math.round(n).toLocaleString('en-PK')}`;
const monthLabel = (m: string) => new Date(`${m}-01T00:00:00Z`).toLocaleDateString(undefined, { month: 'short', timeZone: 'UTC' });
const daysUntil = (iso: string) => Math.ceil((new Date(iso).getTime() - Date.now()) / DAY);
const percent = (part: number, whole: number) => (whole ? Math.round((part / whole) * 100) : 0);

/** Compact KPI tile: the label wraps instead of being cut off, a "share of" bar, and the note pinned to the bottom so tiles in a row line up. */
function ReportStat({ label, value, icon, note, progress }: { label: string; value: ReactNode; icon: LucideIcon; note?: string; progress?: number }) {
  return (
    <div className="surface card-3d flex h-full flex-col gap-3 p-4 sm:p-5">
      <div className="flex items-center gap-3">
        <IconTile icon={icon} size="sm" />
        <span className="min-w-0 text-sm font-semibold leading-snug text-slate-600 dark:text-slate-300">{label}</span>
      </div>
      <div className="font-display text-2xl font-bold tabular-nums text-(--ink) sm:text-3xl dark:text-white">{value}</div>
      {progress !== undefined && (
        <div className="flex items-center gap-2">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-500/10">
            <div className="h-full rounded-full bg-emerald-500 transition-all duration-700" style={{ width: `${Math.min(100, progress)}%` }} />
          </div>
          <span className="text-xs font-semibold tabular-nums text-slate-500">{progress}%</span>
        </div>
      )}
      {note && <p className="mt-auto text-xs leading-snug text-slate-500 dark:text-slate-400">{note}</p>}
    </div>
  );
}

/** One line of the to-do list: what is waiting, how many, and where to act on it. Shows a tick when nothing is left. */
function TodoRow({ label, count, detail, to, loading }: { label: string; count: number; detail: string; to: string; loading: boolean }) {
  const done = !loading && count === 0;
  return (
    <li>
      <AreaLink to={to} className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition hover:bg-slate-500/5">
        <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold tabular-nums ${done ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300' : 'bg-amber-500/15 text-amber-700 dark:text-amber-300'}`}>
          {loading ? '–' : done ? <CircleCheck size={16} /> : compactNumber(count)}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-semibold text-slate-800 dark:text-slate-100">{label}</span>
          <span className="block text-xs text-slate-500 dark:text-slate-400">{done ? 'All clear' : detail}</span>
        </span>
        <ArrowRight size={15} className="shrink-0 text-slate-400" />
      </AreaLink>
    </li>
  );
}

function Figure({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="min-w-0">
      <div className="text-xs font-medium text-slate-500 dark:text-slate-400">{label}</div>
      <div className="mt-1 truncate font-display text-lg font-bold tabular-nums text-(--ink) dark:text-white">{value}</div>
    </div>
  );
}

const viewAll = (to: string) => <AreaLink to={to} className="text-sm font-semibold text-primary-600 hover:underline dark:text-primary-300">View all</AreaLink>;

/** Platform owner's home, laid out as a report: where things stand, what needs doing, money, growth and the detail lists. */
export function PlatformDashboard(_props: { adminName: string }) {
  const schools = useSchools();
  const applications = useSchoolApplications();
  const tiers = useTiers();
  const growth = useGrowth();
  const finance = useFinance();
  const g = growth.data;
  const f = finance.data;

  const list = schools.data ?? [];
  const active = list.filter((s) => s.status === 'active').length;
  const pending = (applications.data ?? []).filter((a) => a.status === 'pending');
  const approved = (applications.data ?? []).filter((a) => a.status === 'approved');
  const trials = list
    .map((s) => ({ s, sub: s.subscriptions[0] }))
    .filter(({ sub }) => sub?.status === 'trialing' && sub.trialEndsAt)
    .sort((a, b) => a.sub!.trialEndsAt!.localeCompare(b.sub!.trialEndsAt!));
  const endingThisWeek = trials.filter(({ sub }) => daysUntil(sub!.trialEndsAt!) <= 7);
  const byTier = new Map<string, number>();
  for (const s of list) {
    const code = s.subscriptions[0]?.tier.code;
    if (code) byTier.set(code, (byTier.get(code) ?? 0) + 1);
  }
  const tierTotal = [...byTier.values()].reduce((a, b) => a + b, 0);

  return (
    <div className="dash space-y-5">
      {/* Where things stand */}
      <div className="grid grid-cols-2 gap-3 sm:gap-5 xl:grid-cols-4">
        <ReportStat label="Schools" icon={School} value={schools.isLoading ? '–' : <CompactNumber value={list.length} />} progress={schools.isSuccess ? percent(active, list.length) : undefined} note={schools.isSuccess ? `${compactNumber(active)} active · ${compactNumber(list.length - active)} suspended` : undefined} />
        <ReportStat label="Paying schools" icon={ArrowUpCircle} value={g ? <CompactNumber value={g.totals.paying} /> : '–'} progress={g ? percent(g.totals.paying, g.totals.schools) : undefined} note={g ? `${compactNumber(g.totals.everPaid)} have paid at least once` : undefined} />
        <ReportStat label="On free trial" icon={Hourglass} value={schools.isLoading ? '–' : <CompactNumber value={trials.length} />} progress={schools.isSuccess ? percent(trials.length, list.length) : undefined} note={schools.isSuccess ? (endingThisWeek.length ? `${compactNumber(endingThisWeek.length)} end this week` : 'None end this week') : undefined} />
        <ReportStat label="Trial → paid" icon={Percent} value={g ? `${g.totals.conversion}%` : '–'} progress={g?.totals.conversion} note={g ? `${compactNumber(g.totals.selfSignups)} self sign-ups so far` : undefined} />
      </div>

      {/* What needs doing + money summary */}
      <div className="grid gap-5 lg:grid-cols-3">
        <Card title="To do" icon={ListChecks} className="h-full" padded={false}>
          <ul className="space-y-0.5 p-3">
            <TodoRow label="Applications to review" count={pending.length} detail="Schools asking to join" to="/applications" loading={applications.isLoading} />
            <TodoRow label="Approved, not set up yet" count={approved.length} detail="Create tenant, plan and first admin" to="/applications" loading={applications.isLoading} />
            <TodoRow label="Trials ending this week" count={endingThisWeek.length} detail="Follow up before they lapse" to="/schools" loading={schools.isLoading} />
            <TodoRow label="Plans ending in 14 days" count={f?.endingSoon.length ?? 0} detail="Trials and paid plans up for renewal" to="/payments" loading={finance.isLoading} />
          </ul>
        </Card>

        <Card title="Revenue summary" icon={Wallet} className="h-full lg:col-span-2" actions={viewAll('/payments')}>
          {finance.isLoading && <Spinner />}
          {f && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-5 sm:grid-cols-4">
                <Figure label="Monthly recurring" value={<CompactNumber value={f.mrr} prefix="PKR " />} />
                <Figure label="Received this month" value={<CompactNumber value={f.thisMonth} prefix="PKR " />} />
                <Figure label="Last 12 months" value={<CompactNumber value={f.revenue12m} prefix="PKR " />} />
                <Figure label="Paying / on trial" value={`${compactNumber(f.paying)} / ${compactNumber(f.trialing)}`} />
              </div>
              <div>
                <div className="mb-2 text-xs font-medium text-slate-500 dark:text-slate-400">By payment method</div>
                {f.byMethod.length === 0 && <p className="text-sm text-slate-500">No payments yet.</p>}
                <div className="flex flex-wrap gap-2">
                  {f.byMethod.map((m) => (
                    <span key={m.method} className="inline-flex items-center gap-2 rounded-lg bg-slate-500/5 px-3 py-1.5 text-sm">
                      {METHOD_LABEL[m.method as PaymentMethod] ?? m.method}
                      <strong className="tabular-nums"><CompactNumber value={m.amount} prefix="PKR " /></strong>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Trends */}
      <div className="grid gap-5 lg:grid-cols-3">
        <Card title="Revenue by month" icon={ChartColumn} className="h-full lg:col-span-2">
          {finance.isLoading && <Spinner />}
          {f && <BarChart label="Revenue by month" bars={f.byMonth.map((m) => ({ key: m.month, label: monthLabel(m.month), value: m.amount }))} format={pkr} height={180} />}
        </Card>
        <Card title="Schools by plan" icon={Crown} className="h-full">
          {tiers.isLoading && <Spinner />}
          <ul className="space-y-3">
            {tiers.data?.map((t) => {
              const n = byTier.get(t.code) ?? 0;
              return (
                <li key={t.code}>
                  <div className="mb-1 flex items-center justify-between gap-2 text-sm">
                    <span className="inline-flex min-w-0 items-center gap-2 font-semibold text-slate-700 dark:text-slate-200"><Building2 size={14} className="shrink-0 text-slate-400" /> <span className="truncate">{t.name}</span></span>
                    <span className="shrink-0 tabular-nums text-slate-500"><strong className="text-slate-800 dark:text-slate-100"><CompactNumber value={n} /></strong> · {percent(n, tierTotal)}%</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-slate-500/10">
                    <div className="h-full rounded-full bg-brand transition-all duration-700" style={{ width: `${percent(n, tierTotal)}%` }} />
                  </div>
                </li>
              );
            })}
          </ul>
        </Card>
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        <Card title="New sign-ups per month" icon={Sparkles} className="h-full">
          {growth.isLoading && <Spinner />}
          {g && <BarChart label="New sign-ups per month" bars={g.byMonth.map((m) => ({ key: m.month, label: monthLabel(m.month), value: m.signups }))} format={(v) => `${v} school${v === 1 ? '' : 's'}`} height={160} />}
        </Card>
        <Card title="Upgrades to paid per month" icon={ArrowUpCircle} className="h-full">
          {growth.isLoading && <Spinner />}
          {g && <BarChart label="Upgrades per month" bars={g.byMonth.map((m) => ({ key: m.month, label: monthLabel(m.month), value: m.upgrades }))} format={(v) => `${v} upgrade${v === 1 ? '' : 's'}`} height={160} />}
        </Card>
      </div>

      {/* Detail */}
      <div className="grid gap-5 lg:grid-cols-2">
        <Card title="Applications to review" icon={ClipboardList} className="h-full" actions={viewAll('/applications')} padded={false}>
          {applications.isLoading && <div className="p-6"><Spinner /></div>}
          {applications.isSuccess && pending.length === 0 && <div className="p-6"><EmptyState icon={ClipboardList} title="Nothing waiting" /></div>}
          {pending.length > 0 && (
            <table className="w-full text-sm">
              <thead className="text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr><th className="px-6 py-2.5">School</th><th className="px-3 py-2.5">Contact</th><th className="px-6 py-2.5 text-right">Received</th></tr>
              </thead>
              <tbody className="divide-y divide-(--surface-border)">
                {pending.slice(0, 6).map((a) => (
                  <tr key={a.id}>
                    <td className="max-w-0 px-6 py-2.5 font-semibold text-slate-800 dark:text-slate-100"><div className="truncate" title={a.schoolName}>{a.schoolName}</div></td>
                    <td className="px-3 py-2.5 text-slate-500">{a.contactFirstName} {a.contactLastName}</td>
                    <td className="whitespace-nowrap px-6 py-2.5 text-right text-slate-500">{formatDate(a.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
        <Card title="Ending in the next 14 days" icon={CalendarClock} className="h-full" actions={viewAll('/payments')} padded={false}>
          {finance.isLoading && <div className="p-6"><Spinner /></div>}
          {f && f.endingSoon.length === 0 && <div className="p-6"><EmptyState icon={CalendarClock} title="Nothing ends in the next two weeks" /></div>}
          {f && f.endingSoon.length > 0 && (
            <table className="w-full text-sm">
              <thead className="text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr><th className="px-6 py-2.5">School</th><th className="px-3 py-2.5">Plan</th><th className="px-6 py-2.5 text-right">Ends</th></tr>
              </thead>
              <tbody className="divide-y divide-(--surface-border)">
                {f.endingSoon.slice(0, 6).map((r) => {
                  const days = daysUntil(r.endsAt);
                  return (
                    <tr key={r.school.id}>
                      <td className="max-w-0 px-6 py-2.5 font-semibold text-slate-800 dark:text-slate-100"><div className="truncate" title={r.school.name}>{r.school.name}</div></td>
                      <td className="px-3 py-2.5"><Badge tone={r.status === 'trialing' ? 'primary' : 'emerald'}>{r.status === 'trialing' ? 'Trial' : r.plan}</Badge></td>
                      <td className="whitespace-nowrap px-6 py-2.5 text-right">
                        <span className="text-slate-500">{formatDate(r.endsAt)}</span>{' '}
                        <Badge tone={days <= 7 ? 'rose' : 'amber'}>{days > 0 ? `${days}d` : 'ended'}</Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </Card>
      </div>
    </div>
  );
}
