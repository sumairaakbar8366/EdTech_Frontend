import { ArrowDownRight, ArrowUpRight, CalendarCheck, CircleDollarSign, GraduationCap, Lock, Minus, ShieldAlert, Sparkles, TrendingDown, TrendingUp, Wallet } from 'lucide-react';
import { useState } from 'react';
import { BarChart } from '@/components/charts/BarChart';
import { AreaLink } from '@/app/router/area';
import { Alert, Badge, Card, CompactNumber, PageHeader, Select, Spinner, StatCard, type Tone } from '@/components/ui';
import { money } from '@/features/fees/utils/fee.utils';
import { usePerformance } from '@/features/insights/insights';

const VERDICT: Record<'growing' | 'steady' | 'declining', { label: string; tone: Tone; icon: typeof TrendingUp; text: string }> = {
  growing: { label: 'Your school is growing', tone: 'emerald', icon: TrendingUp, text: 'More families, more fees, or better attendance than the period before.' },
  steady: { label: 'Your school is steady', tone: 'sky', icon: Minus, text: 'About the same as the period before.' },
  declining: { label: 'Your school needs attention', tone: 'rose', icon: TrendingDown, text: 'Some key figures fell compared with the period before.' },
};

function Delta({ v }: { v: number | null }) {
  if (v === null) return <span className="text-xs text-slate-400">new</span>;
  if (v === 0) return <span className="text-xs text-slate-400">no change</span>;
  const up = v > 0;
  return <span className={`inline-flex items-center gap-0.5 text-xs font-semibold ${up ? 'text-emerald-600' : 'text-rose-600'}`}>{up ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}{Math.abs(v)}%</span>;
}

/** What the free trial shows instead of the report: what it contains, and how to get it. */
function TrialAdvert({ covers, daysLeft, label }: { covers: string[]; daysLeft: number | null; label: string }) {
  return (
    <Card tone="amber" className="relative overflow-hidden">
      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr] lg:items-center">
        <div>
          <Badge tone="amber"><Lock size={12} /> Part of the paid plans</Badge>
          <h2 className="mt-3 font-display text-2xl font-bold text-slate-900 dark:text-white">Know how your school is really doing</h2>
          <p className="mt-2 text-slate-600 dark:text-slate-300">Monitor your school’s growth every month and year: students, fees, salaries, attendance and complaints, with a plain answer to “are we growing?”. {daysLeft !== null && <>Your free trial has <strong>{daysLeft} days</strong> left.</>}</p>
          <ul className="mt-4 grid gap-2 sm:grid-cols-2">{covers.map((c) => <li key={c} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-200"><Sparkles size={15} className="mt-0.5 shrink-0 text-amber-500" /> {c}</li>)}</ul>
          <AreaLink to="/plans-and-billing" className="mt-6 inline-flex items-center gap-2 rounded-lg bg-brand px-5 py-2.5 text-base font-bold uppercase tracking-wide text-white shadow-depth-1 hover:brightness-110">See plans &amp; upgrade</AreaLink>
          <p className="mt-2 text-xs text-slate-500">Only the school admin can change the plan. Ask them to upgrade if this is not you.</p>
        </div>
        <div aria-hidden className="pointer-events-none select-none rounded-xl border border-dashed border-slate-300 p-4 opacity-60 blur-[2px] dark:border-white/15">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500">{label} · preview</div>
          <div className="mt-3 grid grid-cols-2 gap-3">{['Students', 'Fees received', 'Salaries', 'Surplus'].map((k) => <div key={k} className="surface rounded-lg p-3"><div className="text-xs text-slate-500">{k}</div><div className="font-display text-xl font-bold">••••</div></div>)}</div>
          <div className="mt-3 flex h-24 items-end gap-2">{[40, 60, 45, 80, 65, 90].map((h, i) => <span key={i} className="flex-1 rounded-t bg-primary-500/60" style={{ height: `${h}%` }} />)}</div>
        </div>
      </div>
    </Card>
  );
}

/** Monthly / yearly growth report for the principal and admin (paid plans; a preview during the trial). */
export function PerformanceTab() {
  const [period, setPeriod] = useState<'month' | 'year'>('month');
  const [ref, setRef] = useState(() => new Date().toISOString().slice(0, 10));
  const q = usePerformance(period, ref);
  const d = q.data;
  const years = Array.from({ length: 4 }, (_, i) => new Date().getUTCFullYear() - i);
  const months = Array.from({ length: 12 }, (_, i) => i);
  const [y, m] = [Number(ref.slice(0, 4)), Number(ref.slice(5, 7)) - 1];

  return (
    <div className="space-y-4" data-tour="performance">
      <div className="flex flex-wrap items-center gap-3">
        <Select aria-label="Report length" className="w-40" value={period} onChange={(e) => setPeriod(e.target.value as 'month' | 'year')}><option value="month">Monthly report</option><option value="year">Yearly report</option></Select>
        <Select aria-label="Year" className="w-28" value={y} onChange={(e) => setRef(`${e.target.value}-${String(m + 1).padStart(2, '0')}-15`)}>{years.map((yy) => <option key={yy}>{yy}</option>)}</Select>
        {period === 'month' && <Select aria-label="Month" className="w-40" value={m} onChange={(e) => setRef(`${y}-${String(Number(e.target.value) + 1).padStart(2, '0')}-15`)}>{months.map((mm) => <option key={mm} value={mm}>{new Date(Date.UTC(2000, mm, 1)).toLocaleDateString(undefined, { month: 'long', timeZone: 'UTC' })}</option>)}</Select>}
      </div>
      {q.isLoading && <Spinner />}
      {q.error && <Alert>The report could not be loaded.</Alert>}
      {d?.locked && <TrialAdvert covers={d.covers} daysLeft={d.daysLeft} label={d.period.label} />}
      {d && !d.locked && (
        <>
          <PageHeader title={d.period.label} sub="Compared with the period before" icon={CalendarCheck} tone="primary" />
          {(() => { const v = VERDICT[d.verdict.status]; return (
            <Card tone={v.tone}>
              <div className="flex flex-wrap items-start gap-4"><div className={`flex h-12 w-12 items-center justify-center rounded-xl ${d.verdict.status === 'growing' ? 'bg-emerald-500/15 text-emerald-600' : d.verdict.status === 'declining' ? 'bg-rose-500/15 text-rose-600' : 'bg-sky-500/15 text-sky-600'}`}><v.icon size={26} /></div>
                <div className="min-w-0 flex-1"><h2 className="text-xl font-bold text-slate-900 dark:text-white">{v.label}</h2><p className="text-sm text-slate-500">{v.text}</p>{d.verdict.reasons.length > 0 && <ul className="mt-2 list-disc pl-5 text-sm text-slate-700 dark:text-slate-200">{d.verdict.reasons.map((r) => <li key={r}>{r}</li>)}</ul>}</div></div>
            </Card>); })()}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            <StatCard label="Students enrolled" value={d.current.students} icon={GraduationCap} tone="emerald" hint={`${d.current.newStudents} joined this period`} />
            <StatCard label="Fees received" value={Number(d.current.collected)} icon={CircleDollarSign} tone="primary" hint={`${d.changes.collected === null ? 'new' : `${d.changes.collected}%`} vs before`} />
            <StatCard label="Salaries paid" value={Number(d.current.salaries)} icon={Wallet} tone="amber" />
            <StatCard label={d.current.surplus >= 0 ? 'Surplus (fees − salaries)' : 'Shortfall (fees − salaries)'} value={Number(d.current.surplus)} icon={d.current.surplus >= 0 ? TrendingUp : TrendingDown} tone={d.current.surplus >= 0 ? 'emerald' : 'rose'} hint="Other running costs are not tracked" />
          </div>
          <div className="grid gap-4 xl:grid-cols-2">
            <Card title="Fees received by month" icon={CircleDollarSign} tone="primary"><BarChart label="Fees received by month" bars={d.trend.map((t) => ({ key: t.month, label: t.label, value: t.collected }))} format={(v) => money(v)} /></Card>
            <Card title="New students by month" icon={GraduationCap} tone="emerald"><BarChart label="New students by month" bars={d.trend.map((t) => ({ key: t.month, label: t.label, value: t.newStudents }))} format={(v) => String(v)} /></Card>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <Card title="Compared with the period before" icon={CalendarCheck} tone="sky" padded={false}>
              <table className="w-full text-base"><tbody className="divide-y divide-slate-200/70 dark:divide-white/5">
                {([['Students', d.current.students, d.previous.students, d.changes.students, false], ['Fees received', d.current.collected, d.previous.collected, d.changes.collected, true], ['Salaries paid', d.current.salaries, d.previous.salaries, d.changes.salaries, true], ['Admission applications', d.current.admissions, d.previous.admissions, d.changes.admissions, false]] as const).map(([k, a, b, c, isMoney]) => (
                  <tr key={k}><td className="px-5 py-2.5 font-semibold text-slate-700 dark:text-slate-200">{k}</td><td className="px-5 py-2.5 text-right tabular-nums"><CompactNumber value={a} /></td><td className="px-5 py-2.5 text-right tabular-nums text-slate-400">{isMoney ? <CompactNumber value={b} /> : b}</td><td className="px-5 py-2.5 text-right"><Delta v={c} /></td></tr>
                ))}
                <tr><td className="px-5 py-2.5 font-semibold text-slate-700 dark:text-slate-200">Attendance</td><td className="px-5 py-2.5 text-right tabular-nums">{d.current.attendancePercent === null ? '—' : `${d.current.attendancePercent}%`}</td><td className="px-5 py-2.5 text-right tabular-nums text-slate-400">{d.previous.attendancePercent === null ? '—' : `${d.previous.attendancePercent}%`}</td><td /></tr>
                <tr><td className="px-5 py-2.5 font-semibold text-slate-700 dark:text-slate-200">Still owed by families</td><td className="px-5 py-2.5 text-right tabular-nums"><CompactNumber value={d.current.outstanding} /></td><td /><td /></tr>
              </tbody></table>
            </Card>
            <Card title="Complaints" icon={ShieldAlert} tone="rose">
              <div className="grid grid-cols-3 gap-3 text-center"><div><div className="font-display text-2xl font-bold">{d.complaints.raised}</div><div className="text-xs uppercase tracking-wide text-slate-500">Raised</div></div><div><div className="font-display text-2xl font-bold text-emerald-600">{d.complaints.resolved}</div><div className="text-xs uppercase tracking-wide text-slate-500">Resolved</div></div><div><div className="font-display text-2xl font-bold text-amber-600">{d.complaints.open}</div><div className="text-xs uppercase tracking-wide text-slate-500">Open now</div></div></div>
              {d.complaints.byCategory.length > 0 && <ul className="mt-4 space-y-1.5 text-sm">{d.complaints.byCategory.slice(0, 6).map((c) => <li key={c.category} className="flex justify-between gap-3"><span className="truncate text-slate-700 dark:text-slate-200">{c.label}</span><span className="font-semibold tabular-nums">{c.count}</span></li>)}</ul>}
              <AreaLink to="/complaints" className="mt-4 inline-block text-sm font-semibold text-primary-700 hover:underline dark:text-primary-300">Open complaints →</AreaLink>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
