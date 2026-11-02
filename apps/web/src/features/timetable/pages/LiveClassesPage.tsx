import { ChevronLeft, ChevronRight, Maximize2, Minimize2, MonitorPlay } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Avatar, Card, EmptyState, IconButton, LiveDot, PageHeader, SearchInput, Spinner } from '@/components/ui';
import { useClassMonitor } from '@/features/timetable/hooks/useTimetable';
import type { MonitorRow } from '@/features/timetable/services/timetableService';
import type { SlotState } from '@/features/timetable/types/timetable.types';
import { matchesText } from '@/lib/textMatch';

const PAGE = 30;
const clock = (iso: string) => new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
const ORDER: SlotState[] = ['live', 'late', 'scheduled', 'missed', 'completed', 'cancelled'];
const STATE: Record<SlotState, { label: string; cls: string; row: string }> = {
  live: { label: 'Live', cls: 'text-emerald-700 dark:text-emerald-300', row: 'bg-emerald-500/[0.06]' },
  late: { label: 'Late', cls: 'text-amber-700 dark:text-amber-300', row: 'bg-amber-500/[0.07]' },
  scheduled: { label: 'Upcoming', cls: 'text-slate-500', row: '' },
  missed: { label: 'Missed', cls: 'text-rose-700 dark:text-rose-300', row: 'bg-rose-500/[0.05]' },
  completed: { label: 'Finished', cls: 'text-primary-700 dark:text-primary-300', row: '' },
  cancelled: { label: 'Cancelled', cls: 'text-slate-400', row: '' },
};
type Tab = 'all' | SlotState;
const TABS: { id: Tab; label: string }[] = [
  { id: 'all', label: 'All' }, { id: 'live', label: 'Live' }, { id: 'late', label: 'Late' }, { id: 'scheduled', label: 'Upcoming' }, { id: 'missed', label: 'Missed' }, { id: 'completed', label: 'Finished' },
];

function timing(r: MonitorRow, now: number | null) {
  if (r.state === 'live' && r.session) return `from ${clock(r.session.startedAt)}${r.startedLateBy ? ` (${r.startedLateBy}m late)` : ''}`;
  if (r.state === 'completed' && r.session) return `${clock(r.session.startedAt)}–${r.session.endedAt ? clock(r.session.endedAt) : '…'}`;
  if (r.state === 'late' && now !== null) return `${now - r.startMinute}m past start`;
  if (r.state === 'scheduled' && now !== null && r.startMinute > now) return `in ${r.startMinute - now}m`;
  return '';
}

/**
 * Today's classes as a compact sheet: every class with its status, time, class, subject, teacher,
 * room and when it started / ended; filter by status, search, page through, or show it full screen.
 * Refreshes every 30 seconds.
 */
export function LiveClassesPage() {
  const data = useClassMonitor('');
  const d = data.data;
  const [tab, setTab] = useState<Tab>('all');
  const [text, setText] = useState('');
  const [page, setPage] = useState(1);
  const box = useRef<HTMLDivElement>(null);
  const [full, setFull] = useState(false);
  useEffect(() => {
    const change = () => setFull(document.fullscreenElement === box.current);
    document.addEventListener('fullscreenchange', change);
    return () => document.removeEventListener('fullscreenchange', change);
  }, []);
  useEffect(() => setPage(1), [tab, text]);
  const count = (s: Tab) => (s === 'all' ? d?.rows.length ?? 0 : d?.rows.filter((r) => r.state === s).length ?? 0);
  const rows = [...(d?.rows ?? [])]
    .filter((r) => (tab === 'all' || r.state === tab) && matchesText(text, r.section.schoolClass.name, r.section.name, r.subject.name, r.employee.firstName, r.employee.lastName, r.room?.name))
    .sort((a, b) => ORDER.indexOf(a.state) - ORDER.indexOf(b.state) || a.startMinute - b.startMinute);
  const pages = Math.max(1, Math.ceil(rows.length / PAGE));
  const shown = rows.slice((page - 1) * PAGE, page * PAGE);

  return (
    <div>
      <PageHeader title="Live classes" sub="Today's classes: live, late, upcoming, missed and finished" icon={MonitorPlay} tone="emerald" />
      <div ref={box} className={full ? 'overflow-auto bg-(--page-bg) p-6' : ''}>
        <Card padded={false}>
          <div className="flex flex-wrap items-center gap-2 border-b border-(--surface-border) p-3">
            <div className="flex flex-wrap gap-1">
              {TABS.map((t) => (
                <button key={t.id} onClick={() => setTab(t.id)} className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-bold transition ${tab === t.id ? 'bg-primary-600 text-white' : 'text-slate-600 hover:bg-slate-500/10 dark:text-slate-300'}`}>
                  {t.id === 'live' && count('live') > 0 && <LiveDot />}{t.label} <span className="opacity-70">{count(t.id)}</span>
                </button>
              ))}
            </div>
            <div className="ml-auto flex min-w-[14rem] flex-1 items-center gap-2 sm:max-w-xs">
              <SearchInput label="Search classes" value={text} onChange={setText} placeholder="Class, subject, teacher, room…" />
              <IconButton icon={full ? Minimize2 : Maximize2} label={full ? 'Exit full screen' : 'Show on big screen'} onClick={() => (document.fullscreenElement ? void document.exitFullscreen() : void box.current?.requestFullscreen?.())} />
            </div>
          </div>
          {data.isLoading && <div className="p-6"><Spinner /></div>}
          {d && rows.length === 0 && <EmptyState icon={MonitorPlay} title="No classes here" />}
          {shown.length > 0 && (
            <div className="overflow-x-auto">
              <table className={`w-full ${full ? 'text-sm' : 'text-xs'}`}>
                <thead className="border-b border-(--surface-border) bg-slate-50/70 text-left font-semibold uppercase tracking-wider text-slate-500 dark:bg-white/[0.02]">
                  <tr><th className="px-3 py-2">#</th><th className="px-3 py-2">Status</th><th className="px-3 py-2">Time</th><th className="px-3 py-2">Class</th><th className="px-3 py-2">Subject</th><th className="px-3 py-2">Teacher</th><th className="px-3 py-2">Room</th><th className="px-3 py-2">Started / ended</th></tr>
                </thead>
                <tbody className="divide-y divide-(--surface-border)">
                  {shown.map((r, i) => (
                    <tr key={r.id} className={STATE[r.state].row}>
                      <td className="px-3 py-1.5 tabular-nums text-slate-400">{(page - 1) * PAGE + i + 1}</td>
                      <td className={`whitespace-nowrap px-3 py-1.5 font-bold ${STATE[r.state].cls}`}><span className="inline-flex items-center gap-1.5">{r.state === 'live' && <LiveDot />}{STATE[r.state].label}</span></td>
                      <td className="whitespace-nowrap px-3 py-1.5 tabular-nums">{r.startTime}–{r.endTime}</td>
                      <td className="whitespace-nowrap px-3 py-1.5 font-semibold text-slate-800 dark:text-slate-100">{r.section.schoolClass.name} {r.section.name} <span className="font-normal text-slate-400">{r.section.campus.code}</span></td>
                      <td className="px-3 py-1.5">{r.subject.name}</td>
                      <td className="whitespace-nowrap px-3 py-1.5"><span className="inline-flex items-center gap-1.5"><Avatar photoKey={r.employee.photoKey} name={`${r.employee.firstName} ${r.employee.lastName}`} size="xs" />{r.employee.firstName} {r.employee.lastName}</span></td>
                      <td className="px-3 py-1.5">{r.room?.name ?? '—'}</td>
                      <td className="whitespace-nowrap px-3 py-1.5 tabular-nums text-slate-500">{timing(r, d?.nowMinute ?? null)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {pages > 1 && (
            <div className="flex items-center justify-end gap-1 border-t border-(--surface-border) px-4 py-2 text-xs text-slate-600 dark:text-slate-300">
              <IconButton icon={ChevronLeft} label="Previous page" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} />
              <span className="px-2">Page {page} of {pages} · {rows.length} classes</span>
              <IconButton icon={ChevronRight} label="Next page" disabled={page >= pages} onClick={() => setPage((p) => p + 1)} />
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
