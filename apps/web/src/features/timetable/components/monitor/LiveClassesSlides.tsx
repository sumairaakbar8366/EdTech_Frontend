import { ArrowRight, MonitorPlay } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { AreaLink } from '@/app/router/area';
import { Avatar, LiveDot, Spinner } from '@/components/ui';
import { useClassMonitor } from '@/features/timetable/hooks/useTimetable';
import type { MonitorRow } from '@/features/timetable/services/timetableService';

const PER_SLIDE = 5;
/** Each slide stays this long, then glides out to the left while the next one comes in. */
const SECONDS = 6;

interface Slide {
  key: string;
  title: string;
  accent: string;
  rows: MonitorRow[];
  page: number;
  pages: number;
  live?: boolean;
}

const GROUPS: { key: string; title: string; accent: string; pick: (r: MonitorRow) => boolean; live?: boolean }[] = [
  { key: 'live', title: 'Live now', accent: 'text-emerald-600 dark:text-emerald-400', pick: (r) => r.state === 'live', live: true },
  { key: 'late', title: 'Late · not started', accent: 'text-amber-600 dark:text-amber-400', pick: (r) => r.state === 'late' },
  { key: 'next', title: 'Up next', accent: 'text-sky-700 dark:text-sky-300', pick: (r) => r.state === 'scheduled' },
  { key: 'missed', title: 'Missed today', accent: 'text-rose-600 dark:text-rose-400', pick: (r) => r.state === 'missed' },
];

/** One group at a time, a few classes per slide; empty groups are skipped. */
function slidesOf(rows: MonitorRow[]): Slide[] {
  const out: Slide[] = [];
  for (const g of GROUPS) {
    let list = rows.filter(g.pick).sort((a, b) => a.startMinute - b.startMinute);
    if (g.key === 'next') list = list.slice(0, PER_SLIDE * 2);
    if (g.key === 'missed') list = list.sort((a, b) => b.startMinute - a.startMinute);
    const pages = Math.ceil(list.length / PER_SLIDE);
    for (let p = 0; p < pages; p++) out.push({ key: `${g.key}-${p}`, title: g.title, accent: g.accent, rows: list.slice(p * PER_SLIDE, (p + 1) * PER_SLIDE), page: p + 1, pages, live: g.live });
  }
  return out;
}

const hhmm = (m: number) => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;

function detail(r: MonitorRow, now: number | null) {
  if (r.state === 'live' && r.session) return `Started ${new Date(r.session.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  if (r.state === 'late' && now !== null) return `${now - r.startMinute} min late`;
  if (r.state === 'scheduled' && now !== null && r.startMinute > now) return `in ${r.startMinute - now} min`;
  if (r.state === 'missed') return 'Not held';
  return '';
}

/**
 * Dashboard "TV screen" (light): today's classes as slides that turn by themselves (live, late, up next,
 * missed), five at a time, with the teacher's picture and the room. Pauses while hovered; the full
 * sheet is on the Live Classes page.
 */
export function LiveClassesSlides({ className = '' }: { className?: string }) {
  const data = useClassMonitor('');
  const d = data.data;
  const slides = d ? slidesOf(d.rows) : [];
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (paused || slides.length < 2) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % slides.length), SECONDS * 1000);
    return () => clearInterval(t);
  }, [paused, slides.length]);
  const slide = slides[index % Math.max(1, slides.length)];
  const t = d?.totals;
  const pill = (n: number | undefined, label: string, cls: string, live = false) => (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${cls}`}>{live && !!n && <LiveDot />}{n ?? '–'} {label}</span>
  );

  return (
    <section className={`card-3d overflow-hidden border border-(--surface-border) bg-(--surface-bg) p-3 sm:p-4 ${className}`} aria-label="Live classes">
      {/* The screen */}
      <div className="relative overflow-hidden rounded-xl border border-sky-100 bg-gradient-to-br from-white via-sky-50/60 to-emerald-50/50 text-slate-800 shadow-[inset_0_1px_0_rgb(255_255_255),0_1px_3px_rgb(15_23_42/0.06)] dark:border-white/10 dark:from-slate-800 dark:via-slate-800 dark:to-slate-900 dark:text-slate-100" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
        <div className="flex flex-wrap items-center gap-3 border-b border-sky-100 px-5 py-3 dark:border-white/10">
          <MonitorPlay size={20} className="text-emerald-600 dark:text-emerald-400" />
          <span className="font-display text-lg font-bold uppercase tracking-wider">Live classes</span>
          {d?.nowMinute != null && <span className="font-mono text-sm text-slate-500 dark:text-slate-400">{hhmm(d.nowMinute)}</span>}
          <div className="ml-auto flex flex-wrap gap-1.5">
            {pill(t?.live, 'live', 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300', true)}
            {pill(t?.late, 'late', 'bg-amber-500/15 text-amber-700 dark:text-amber-300')}
            {pill(t?.upcoming, 'upcoming', 'bg-slate-500/10 text-slate-700 dark:text-slate-200')}
            {pill(t?.missed, 'missed', 'bg-rose-500/15 text-rose-700 dark:text-rose-300')}
            {pill(t?.completed, 'finished', 'bg-sky-500/15 text-sky-700 dark:text-sky-300')}
          </div>
        </div>

        {/* Time left on this slide. */}
        {slides.length > 1 && !paused && <div key={`bar-${index}`} className="h-0.5 origin-left bg-emerald-500/70" style={{ animation: `slide-progress ${SECONDS}s linear forwards` }} />}
        <div className="relative min-h-[19rem] overflow-hidden px-5 py-4">
          {data.isLoading && <Spinner />}
          {d && !slide && <p className="py-16 text-center text-lg text-slate-500">No classes running or waiting right now.</p>}
          {slide && (
            <AnimatePresence mode="wait" initial={false}>
            <motion.div key={slide.key} initial={{ x: 80, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -80, opacity: 0 }} transition={{ duration: 0.6, ease: 'easeInOut' }}>
              <div className={`mb-3 flex items-center gap-2 text-base font-bold uppercase tracking-wide ${slide.accent}`}>
                {slide.live && <LiveDot />}{slide.title}{slide.pages > 1 && <span className="font-normal text-slate-400">{slide.page} / {slide.pages}</span>}
              </div>
              <div className="hidden grid-cols-[6.5rem_minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,1.3fr)_minmax(0,0.8fr)_7rem] gap-3 px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-500 md:grid">
                <span>Time</span><span>Class</span><span>Subject</span><span>Teacher</span><span>Room</span><span className="text-right">Status</span>
              </div>
              <ul className="space-y-1.5">
                {slide.rows.map((r) => (
                  <li key={r.id} className="grid grid-cols-[5.5rem_minmax(0,1fr)] items-center gap-x-3 gap-y-0.5 rounded-lg border border-slate-200/70 bg-white/80 px-3 py-2.5 shadow-sm dark:border-white/5 dark:bg-white/[0.04] md:grid-cols-[6.5rem_minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,1.3fr)_minmax(0,0.8fr)_7rem]">
                    <span className="font-mono text-sm font-semibold text-slate-600 dark:text-slate-300">{r.startTime}–{r.endTime}</span>
                    <span className="truncate text-base font-bold text-slate-900 dark:text-white">{r.section.schoolClass.name} {r.section.name}</span>
                    <span className="col-start-2 truncate text-sm text-slate-600 md:col-start-auto dark:text-slate-300">{r.subject.name}</span>
                    <span className="col-start-2 inline-flex min-w-0 items-center gap-2 text-sm text-slate-700 md:col-start-auto dark:text-slate-200">
                      <Avatar photoKey={r.employee.photoKey} name={`${r.employee.firstName} ${r.employee.lastName}`} size="xs" />
                      <span className="truncate">{r.employee.firstName} {r.employee.lastName}</span>
                    </span>
                    <span className="col-start-2 truncate text-sm text-slate-500 md:col-start-auto dark:text-slate-400">{r.room?.name ?? '—'}</span>
                    <span className={`col-start-2 text-sm font-semibold md:col-start-auto md:text-right ${slide.accent}`}>{detail(r, d?.nowMinute ?? null)}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
            </AnimatePresence>
          )}
        </div>

        <div className="flex items-center gap-3 border-t border-sky-100 px-5 py-2.5 dark:border-white/10">
          <div className="flex flex-1 flex-wrap gap-1.5">
            {slides.map((s, i) => (
              <button key={s.key} onClick={() => setIndex(i)} aria-label={`${s.title} ${s.page}`} className={`h-1.5 rounded-full transition-all ${i === index % slides.length ? 'w-6 bg-emerald-500' : 'w-1.5 bg-slate-300 hover:bg-slate-400 dark:bg-white/25'}`} />
            ))}
          </div>
          <AreaLink to="/live-classes" className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-700 hover:underline dark:text-emerald-300">Open class monitor <ArrowRight size={14} /></AreaLink>
        </div>
      </div>
    </section>
  );
}
