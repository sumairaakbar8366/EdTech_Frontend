import { Lock, PieChart, TrendingDown, TrendingUp, Minus } from 'lucide-react';
import { useMemo, useState } from 'react';
import { AreaLink } from '@/app/router/area';
import { Card, Spinner } from '@/components/ui';
import { usePerformance } from '@/features/insights/insights';
import { money } from '@/features/fees/utils/fee.utils';

/** Orange for what the school keeps, smoky grey for what is still owed, dark grey for salaries, light orange for a shortfall. */
const TONES = {
  surplus: { fill: '#f97316', label: 'Surplus kept' },
  owed: { fill: '#9097a0', label: 'Still owed by families' },
  salaries: { fill: '#3a3f46', label: 'Salaries paid' },
  shortfall: { fill: '#fdba74', label: 'Salary shortfall' },
} as const;
type Tone = keyof typeof TONES;
interface Part { tone: Tone; value: number }

const polar = (cx: number, cy: number, r: number, a: number) => [cx + r * Math.cos(a), cy + r * Math.sin(a)] as const;

/** A flat, labelled pie: each slice shows its share, hovering pulls it out; the list beside it gives the amounts. */
function Pie({ parts, active, onActive, blur = false }: { parts: Part[]; active: Tone | null; onActive: (t: Tone | null) => void; blur?: boolean }) {
  const total = parts.reduce((s, p) => s + p.value, 0) || 1;
  const cx = 130, cy = 130, R = 108;
  let acc = -Math.PI / 2;
  const slices = parts.filter((p) => p.value > 0).map((p) => { const from = acc; acc += (p.value / total) * Math.PI * 2; return { ...p, from, to: acc, mid: (from + acc) / 2, pct: (p.value / total) * 100 }; });
  return (
    <svg viewBox="0 0 260 260" role="img" aria-label={`Pie chart: ${slices.map((s) => `${TONES[s.tone].label} ${Math.round(s.pct)}%`).join(', ')}`} className={`mx-auto h-60 w-60 shrink-0 ${blur ? 'blur-[3px]' : ''}`}>
      <ellipse cx={cx} cy={cy + R + 6} rx={R * 0.85} ry="7" fill="rgba(15,23,42,0.16)" />
      {slices.map((s) => {
        const on = active === s.tone;
        const [dx, dy] = on ? [Math.cos(s.mid) * 7, Math.sin(s.mid) * 7] : [0, 0];
        const [x1, y1] = polar(cx, cy, R, s.from), [x2, y2] = polar(cx, cy, R, s.to);
        const d = slices.length === 1 ? `M ${cx - R} ${cy} a ${R} ${R} 0 1 0 ${R * 2} 0 a ${R} ${R} 0 1 0 ${-R * 2} 0` : `M ${cx} ${cy} L ${x1} ${y1} A ${R} ${R} 0 ${s.to - s.from > Math.PI ? 1 : 0} 1 ${x2} ${y2} Z`;
        const [lx, ly] = polar(cx, cy, R * 0.64, s.mid);
        return (
          <g key={s.tone} transform={`translate(${dx} ${dy})`} onMouseEnter={() => onActive(s.tone)} onMouseLeave={() => onActive(null)} className="cursor-pointer transition-transform">
            <title>{`${TONES[s.tone].label}: ${Math.round(s.pct)}%`}</title>
            <path d={d} fill={TONES[s.tone].fill} stroke="#fff" strokeWidth="2.5" strokeLinejoin="round" />
            {s.pct >= 9 && <text x={lx} y={ly} textAnchor="middle" dominantBaseline="central" className="pointer-events-none select-none" fill={s.tone === 'shortfall' ? '#431407' : '#fff'} fontSize="15" fontWeight="700">{Math.round(s.pct)}%</text>}
          </g>
        );
      })}
    </svg>
  );
}

/** Where this year's fees go: salaries, what the school keeps, and what families still owe. Plus the growth verdict. */
export function GrowthPieWidget({ className = '' }: { className?: string }) {
  const [ref] = useState(() => new Date().toISOString().slice(0, 10));
  const q = usePerformance('year', ref);
  const [active, setActive] = useState<Tone | null>(null);
  const d = q.data;
  const parts = useMemo<Part[]>(() => {
    if (!d || d.locked) return [];
    const { collected, salaries, outstanding } = d.current;
    return [
      { tone: 'salaries', value: Math.min(salaries, collected) },
      { tone: 'shortfall', value: Math.max(0, salaries - collected) },
      { tone: 'surplus', value: Math.max(0, collected - salaries) },
      { tone: 'owed', value: outstanding },
    ];
  }, [d]);
  const sample: Part[] = [{ tone: 'surplus', value: 38 }, { tone: 'salaries', value: 34 }, { tone: 'owed', value: 28 }];
  const total = parts.reduce((s, p) => s + p.value, 0);

  return (
    <Card title="School growth" icon={PieChart} tone="amber" className={className} actions={<AreaLink to="/reports" className="text-sm font-semibold text-primary-700 hover:underline dark:text-primary-300">Full report →</AreaLink>}>
      {q.isLoading && <Spinner />}
      {d?.locked && (
        <div className="relative">
          <div aria-hidden className="pointer-events-none select-none opacity-80"><Pie parts={sample} active={null} onActive={() => undefined} blur /></div>
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-xl bg-white/70 p-4 text-center dark:bg-[#0b1426]/75">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-500/15 px-3 py-1 text-xs font-bold uppercase tracking-wide text-orange-700 dark:text-orange-300"><Lock size={12} /> Paid plans</span>
            <p className="max-w-xs text-sm font-semibold text-slate-800 dark:text-slate-100">Want to monitor your school’s growth, fees and complaints every month?</p>
            <AreaLink to="/plans-and-billing" className="rounded-lg bg-brand px-4 py-2 text-sm font-bold uppercase tracking-wide text-white shadow-depth-1 hover:brightness-110">See plans</AreaLink>
          </div>
        </div>
      )}
      {d && !d.locked && (
        <div className="grid items-center gap-5 sm:grid-cols-[15rem_1fr]">
          {total > 0 ? <Pie parts={parts} active={active} onActive={setActive} /> : <p className="py-10 text-center text-sm text-slate-500">No fees or salaries recorded yet this year.</p>}
          <div className="space-y-3">
            <p className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-bold ${d.verdict.status === 'growing' ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300' : d.verdict.status === 'declining' ? 'bg-rose-500/15 text-rose-700 dark:text-rose-300' : 'bg-slate-500/15 text-slate-600 dark:text-slate-300'}`}>
              {d.verdict.status === 'growing' ? <TrendingUp size={14} /> : d.verdict.status === 'declining' ? <TrendingDown size={14} /> : <Minus size={14} />} {d.verdict.status === 'growing' ? 'Growing' : d.verdict.status === 'declining' ? 'Needs attention' : 'Steady'} · {d.period.label}
            </p>
            <ul className="space-y-1">
              {parts.filter((p) => p.value > 0).map((p) => (
                <li key={p.tone} onMouseEnter={() => setActive(p.tone)} onMouseLeave={() => setActive(null)} className={`flex items-center justify-between gap-3 rounded-lg px-2 py-1.5 text-sm transition ${active === p.tone ? 'bg-slate-500/10' : ''}`}>
                  <span className="flex min-w-0 items-center gap-2"><span className="h-3 w-3 shrink-0 rounded-sm" style={{ background: TONES[p.tone].fill }} /><span className="truncate text-slate-700 dark:text-slate-200">{TONES[p.tone].label}</span></span>
                  <span className="shrink-0 tabular-nums"><strong className="text-slate-900 dark:text-white">{money(p.value)}</strong> <span className="text-slate-400">· {Math.round((p.value / total) * 100)}%</span></span>
                </li>
              ))}
            </ul>
            <p className="text-xs text-slate-500">Fees received {money(d.current.collected)} this year · {d.current.students} students · {d.complaints.open} complaint(s) open.</p>
          </div>
        </div>
      )}
    </Card>
  );
}
