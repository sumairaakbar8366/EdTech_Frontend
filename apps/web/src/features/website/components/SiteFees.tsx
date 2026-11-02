import { ChevronDown, Info } from 'lucide-react';
import { Fragment, useState } from 'react';
import { money } from '@/features/fees/utils/fee.utils';
import type { FeeFrequency, PublicFeeStructure, PublicFees, PublicSite } from '@/features/website/website';

const FREQUENCIES: FeeFrequency[] = ['one_time', 'monthly', 'termly', 'annual'];
export const FREQUENCY_TITLE: Record<FeeFrequency, string> = { one_time: 'At admission', monthly: 'Monthly', termly: 'Per term', annual: 'Yearly' };

/** Sum of each kind of fee across a class's structures. */
function totals(structures: PublicFeeStructure[]): Partial<Record<FeeFrequency, number>> {
  const t: Partial<Record<FeeFrequency, number>> = {};
  for (const s of structures) for (const i of s.items) t[i.frequency] = (t[i.frequency] ?? 0) + Number(i.amount);
  return t;
}

/** The fees of one class: each item, then the totals by how often they are paid. */
export function FeeBreakdown({ structures, currency }: { structures: PublicFeeStructure[]; currency: string }) {
  const t = totals(structures);
  return (
    <div className="space-y-4">
      {structures.map((s) => (
        <div key={s.id}>
          {structures.length > 1 && <p className="mb-1 text-xs font-bold uppercase tracking-[0.14em] text-slate-500">{s.name}</p>}
          <ul className="divide-y divide-(--site-line)">
            {s.items.map((i, n) => (
              <li key={n} className="flex items-baseline justify-between gap-4 py-2">
                <span className="text-slate-700">{i.name} <span className="text-sm text-slate-400">· {FREQUENCY_TITLE[i.frequency].toLowerCase()}</span></span>
                <span className="font-semibold tabular-nums text-slate-900">{money(i.amount, currency)}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
      <div className="grid grid-cols-2 gap-3 border-t border-(--site-line) pt-4 sm:grid-cols-4">
        {FREQUENCIES.filter((f) => t[f]).map((f) => (
          <div key={f} className="rounded-md bg-(--site-accent-soft) px-3 py-2">
            <div className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">{FREQUENCY_TITLE[f]}</div>
            <div className="font-semibold tabular-nums text-slate-900">{money(t[f]!, currency)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Fees for the class (and session) an applicant chose, if the school publishes them. */
export function ClassFees({ fees, classId, sessionId, className }: { fees: PublicFees | null; classId: string; sessionId: string; className: string }) {
  const structures = fees?.structures.filter((s) => s.classId === classId && (!sessionId || s.sessionId === sessionId)) ?? [];
  if (!fees || !structures.length) return null;
  return (
    <div className="rounded-md border border-(--site-line) bg-(--site-page) p-5 sm:col-span-2">
      <p className="mb-3 font-semibold text-slate-900">Fees for {className}</p>
      <FeeBreakdown structures={structures} currency={fees.currency} />
      {fees.note && <p className="mt-3 flex gap-2 text-sm text-slate-500"><Info size={15} className="mt-0.5 shrink-0" /> {fees.note}</p>}
    </div>
  );
}

/** Website: every class's fees for a session, as a table; a row opens its breakdown. */
export function SiteFees({ site }: { site: PublicSite }) {
  const fees = site.fees!;
  const sessions = site.sessions.filter((s) => fees.structures.some((f) => f.sessionId === s.id));
  const [sessionId, setSessionId] = useState(() => (sessions.find((s) => !s.isCurrent) ?? sessions[0])?.id ?? '');
  const [open, setOpen] = useState<string | null>(null);
  const classes = site.classes.map((c) => ({ ...c, structures: fees.structures.filter((f) => f.classId === c.id && f.sessionId === sessionId) })).filter((c) => c.structures.length);
  const columns = FREQUENCIES.filter((f) => classes.some((c) => totals(c.structures)[f]));

  return (
    <div>
      {sessions.length > 1 && (
        <div className="mb-5 flex flex-wrap gap-2" role="tablist">
          {sessions.map((s) => (
            <button key={s.id} role="tab" aria-selected={s.id === sessionId} onClick={() => { setSessionId(s.id); setOpen(null); }} className={`rounded px-4 py-2 text-sm font-semibold ring-1 transition ${s.id === sessionId ? 'bg-(--site-accent) text-white ring-(--site-accent)' : 'bg-white text-slate-700 ring-(--site-line) hover:bg-slate-50'}`}>
              Session {s.name}
            </button>
          ))}
        </div>
      )}
      <div className="overflow-x-auto rounded-md border border-(--site-line) bg-white">
        <table className="w-full min-w-[32rem] text-left">
          <thead className="bg-(--site-wash) text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
            <tr>
              <th className="px-5 py-3">Class</th>
              {columns.map((f) => <th key={f} className="px-5 py-3 text-right">{FREQUENCY_TITLE[f]}</th>)}
              <th className="w-10" />
            </tr>
          </thead>
          <tbody className="divide-y divide-(--site-line)">
            {classes.map((c) => {
              const t = totals(c.structures);
              const expanded = open === c.id;
              return (
                <Fragment key={c.id}>
                  <tr onClick={() => setOpen(expanded ? null : c.id)} className="cursor-pointer hover:bg-(--site-page)" aria-expanded={expanded}>
                    <td className="px-5 py-3.5 font-semibold text-slate-900">{c.name}</td>
                    {columns.map((f) => <td key={f} className="px-5 py-3.5 text-right tabular-nums text-slate-700">{t[f] ? money(t[f], fees.currency) : '–'}</td>)}
                    <td className="pr-4 text-slate-400"><ChevronDown size={18} className={`transition ${expanded ? 'rotate-180' : ''}`} /></td>
                  </tr>
                  {expanded && (
                    <tr><td colSpan={columns.length + 2} className="bg-(--site-page) px-5 py-4"><FeeBreakdown structures={c.structures} currency={fees.currency} /></td></tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
      {fees.note && <p className="mt-4 flex gap-2 text-slate-600"><Info size={18} className="mt-0.5 shrink-0 text-(--site-accent)" /> <span className="whitespace-pre-line">{fees.note}</span></p>}
      <p className="mt-2 text-sm text-slate-500">Tap a class to see each fee. Amounts are set by the school and may change; the office confirms them at admission.</p>
    </div>
  );
}
