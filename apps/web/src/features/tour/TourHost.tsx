import { ArrowLeft, ArrowRight, BookOpenCheck, CircleHelp, PartyPopper, RotateCcw, X } from 'lucide-react';
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useLocation, useNavigate } from 'react-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api/http';
import { TOURS, type Tour, type TourStep } from '@/features/tour/tours';

type Progress = Record<string, 'done' | 'skipped'>;
const PROGRESS_KEY = ['tour-progress'] as const;
const PAD = 8;

/** Finds what a step points at (see tours.ts for the forms of `target`). */
export function findTarget(spec: string | undefined): HTMLElement | null {
  if (!spec) return null;
  const [kind, ...rest] = spec.split(':');
  const value = rest.join(':');
  const visible = (el: Element | null): HTMLElement | null => {
    if (!(el instanceof HTMLElement)) return null;
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0 ? el : null;
  };
  if (kind === 'nav') return visible(document.querySelector(`[data-tour="nav-${CSS.escape(value)}"]`));
  if (kind === 'tour') return visible(document.querySelector(`[data-tour="${CSS.escape(value)}"]`));
  if (kind === 'css') return visible(document.querySelector(value));
  if (kind === 'text') {
    const want = value.trim().toLowerCase();
    const els = document.querySelectorAll('main button, main a, main h1, main h2, main h3, main [role="tab"], main label');
    for (const el of els) if ((el.textContent ?? '').trim().toLowerCase().includes(want) && visible(el)) return el as HTMLElement;
  }
  return null;
}

interface Rect { top: number; left: number; width: number; height: number }

/** The tooltip card: beside the lit element when there is room, else below or above, else a centred card. */
function place(target: Rect | null, card: { w: number; h: number }): { top: number; left: number; side: 'right' | 'left' | 'bottom' | 'top' | 'center'; arrow: number } {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const m = 12;
  if (!target || vw < 640) return { top: Math.max(m, vh - card.h - m - (target ? 0 : vh / 2 - card.h / 2)), left: Math.max(m, (vw - card.w) / 2), side: 'center', arrow: 0 };
  const cx = target.left + target.width / 2;
  const cy = target.top + target.height / 2;
  const clampX = (x: number) => Math.min(Math.max(m, x), vw - card.w - m);
  const clampY = (y: number) => Math.min(Math.max(m, y), vh - card.h - m);
  if (target.left + target.width + card.w + 2 * m < vw) return { left: target.left + target.width + PAD + 14, top: clampY(cy - card.h / 2), side: 'right', arrow: Math.min(Math.max(20, cy - clampY(cy - card.h / 2)), card.h - 20) };
  if (target.top + target.height + card.h + 2 * m < vh) return { top: target.top + target.height + PAD + 14, left: clampX(cx - card.w / 2), side: 'bottom', arrow: Math.min(Math.max(20, cx - clampX(cx - card.w / 2)), card.w - 20) };
  if (target.top - card.h - 2 * m > 0) return { top: target.top - card.h - PAD - 14, left: clampX(cx - card.w / 2), side: 'top', arrow: Math.min(Math.max(20, cx - clampX(cx - card.w / 2)), card.w - 20) };
  return { left: clampX(target.left - card.w - PAD - 14), top: clampY(cy - card.h / 2), side: 'left', arrow: Math.min(Math.max(20, cy - clampY(cy - card.h / 2)), card.h - 20) };
}

function Overlay({ tour, index, setIndex, onClose, base }: { tour: Tour; index: number; setIndex: (i: number) => void; onClose: (status: 'done' | 'skipped') => void; base: string }) {
  const step: TourStep = tour.steps[index]!;
  const last = index === tour.steps.length - 1;
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [rect, setRect] = useState<Rect | null>(null);
  const [size, setSize] = useState({ w: 360, h: 200 });
  const card = useRef<HTMLDivElement>(null);
  const next = useRef<HTMLButtonElement>(null);

  // Open the page a step belongs to.
  useEffect(() => {
    if (!step.route) return;
    const to = step.route === '/' ? base || '/' : `${base}${step.route}`;
    if (pathname !== to && pathname !== `${to}/`) navigate(to);
  }, [step, base, pathname, navigate]);

  // Follow the element: it may appear late (the page is loading), move (scroll, resize) or never exist.
  const measure = useCallback(() => {
    const el = findTarget(step.target);
    if (!el) return setRect(null);
    const r = el.getBoundingClientRect();
    setRect((old) => (old && Math.abs(old.top - r.top) < 0.5 && Math.abs(old.left - r.left) < 0.5 && old.width === r.width && old.height === r.height ? old : { top: r.top, left: r.left, width: r.width, height: r.height }));
  }, [step.target]);
  useEffect(() => {
    let tries = 0;
    const el0 = findTarget(step.target);
    el0?.scrollIntoView({ block: 'center', behavior: 'smooth' });
    measure();
    const t = setInterval(() => { measure(); if (++tries === 1 || tries === 6) findTarget(step.target)?.scrollIntoView({ block: 'nearest' }); }, 150);
    window.addEventListener('resize', measure);
    window.addEventListener('scroll', measure, true);
    return () => { clearInterval(t); window.removeEventListener('resize', measure); window.removeEventListener('scroll', measure, true); };
  }, [step, pathname, measure]);
  useLayoutEffect(() => { if (card.current) setSize({ w: card.current.offsetWidth, h: card.current.offsetHeight }); }, [index, rect]);
  useEffect(() => { next.current?.focus(); }, [index]);

  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose('skipped');
      else if (e.key === 'ArrowRight') last ? onClose('done') : setIndex(index + 1);
      else if (e.key === 'ArrowLeft' && index > 0) setIndex(index - 1);
    };
    window.addEventListener('keydown', key);
    return () => window.removeEventListener('keydown', key);
  }, [index, last, onClose, setIndex]);

  const pos = place(rect, size);
  // On a phone the card is a sheet across the bottom, never beside the element.
  const narrow = window.innerWidth < 640;
  const reduce = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  return createPortal(
    <div className="fixed inset-0 z-[200]" role="dialog" aria-modal="true" aria-label={`Guide: ${tour.title}`}>
      {/* Blocks clicks behind the guide. With a target, the lit "hole" is a huge shadow around it. */}
      <div className="absolute inset-0" onClick={(e) => e.stopPropagation()} />
      {rect ? (
        <div aria-hidden className={`pointer-events-none absolute rounded-xl ring-2 ring-orange-400 ${reduce ? '' : 'transition-all duration-300'}`} style={{ top: rect.top - PAD, left: rect.left - PAD, width: rect.width + PAD * 2, height: rect.height + PAD * 2, boxShadow: '0 0 0 9999px rgba(8, 15, 30, 0.72)' }} />
      ) : (
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-slate-950/70" />
      )}
      <div ref={card} className={`absolute max-h-[calc(100dvh-1.5rem)] overflow-y-auto rounded-2xl border border-white/10 bg-white p-4 shadow-2xl sm:p-5 dark:bg-[#0e1626] ${reduce ? '' : 'transition-all duration-300'}`} style={{ top: Math.max(12, Math.min(pos.top, window.innerHeight - size.h - 12)), ...(narrow ? { left: 12, right: 12 } : { left: Math.max(12, Math.min(pos.left, window.innerWidth - size.w - 12)), width: 'min(22.5rem, calc(100vw - 1.5rem))' }) }}>
        {pos.side !== 'center' && !narrow && <span aria-hidden className="absolute h-3.5 w-3.5 rotate-45 bg-white dark:bg-[#0e1626]" style={pos.side === 'right' ? { left: -7, top: pos.arrow - 7 } : pos.side === 'left' ? { right: -7, top: pos.arrow - 7 } : pos.side === 'bottom' ? { top: -7, left: pos.arrow - 7 } : { bottom: -7, left: pos.arrow - 7 }} />}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">{last ? <PartyPopper size={20} className="text-orange-500" /> : <CircleHelp size={20} className="text-primary-600" />}<h2 className="text-lg font-bold text-slate-900 dark:text-white">{step.title}</h2></div>
          <button onClick={() => onClose('skipped')} aria-label="Close the guide" className="rounded-lg p-1 text-slate-400 hover:bg-slate-500/10 hover:text-slate-700 dark:hover:text-white"><X size={16} /></button>
        </div>
        <p className="mt-2 text-base leading-relaxed text-slate-600 dark:text-slate-300">{step.body}</p>
        {step.target && !rect && <p className="mt-2 text-xs text-slate-400">(Open the menu with the ☰ button to see this part.)</p>}
        <div className="mt-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-1" aria-label={`Step ${index + 1} of ${tour.steps.length}`}>{tour.steps.map((_, i) => <span key={i} className={`h-1.5 rounded-full transition-all ${i === index ? 'w-5 bg-primary-600' : 'w-1.5 bg-slate-300 dark:bg-white/20'}`} />)}</div>
          <div className="flex items-center gap-2">
            {!last && <button onClick={() => onClose('skipped')} className="px-2 py-1.5 text-sm font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-white">Skip</button>}
            {index > 0 && <button onClick={() => setIndex(index - 1)} className="focus-ring inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-sm font-bold uppercase text-slate-600 ring-1 ring-slate-300 hover:bg-slate-50 dark:text-slate-200 dark:ring-white/15 dark:hover:bg-white/5"><ArrowLeft size={14} /> Back</button>}
            <button ref={next} onClick={() => (last ? onClose('done') : setIndex(index + 1))} className="focus-ring inline-flex items-center gap-1.5 rounded-lg bg-brand px-3.5 py-1.5 text-sm font-bold uppercase text-white shadow-depth-1 hover:brightness-110">{last ? 'Got it' : 'Next'} {!last && <ArrowRight size={14} />}</button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}

/**
 * Runs the guided tours for one area. The first tour that fits the page and has not been done starts
 * by itself (after the page has drawn); `Guide` in the header replays this page's tour or all of them.
 */
export function TourHost({ area }: { area: string }) {
  const qc = useQueryClient();
  const { pathname } = useLocation();
  const progress = useQuery({ queryKey: PROGRESS_KEY, queryFn: () => api<{ tours: Progress }>('/tours'), staleTime: 300_000, retry: 0 });
  const base = area === 'platform' ? '' : `/${area}`;
  const here = pathname.replace(/\/$/, '') || '/';
  const relative = base && here.startsWith(base) ? here.slice(base.length) || '/' : here;
  // The page a welcome tour starts on: an area's dashboard is its root; the owner console's is /dashboard.
  const home = area === 'platform' ? '/dashboard' : '/';
  const mine = useMemo(() => TOURS.filter((t) => t.area === area), [area]);
  const [active, setActive] = useState<{ key: string; index: number } | null>(null);
  const [menu, setMenu] = useState(false);
  const shown = useRef(new Set<string>());
  const tour = active ? mine.find((t) => t.key === active.key) ?? null : null;

  const finish = useCallback((status: 'done' | 'skipped') => {
    if (!active) return;
    const key = active.key;
    setActive(null);
    qc.setQueryData<{ tours: Progress }>(PROGRESS_KEY, (old) => ({ tours: { ...(old?.tours ?? {}), [key]: status } }));
    void api(`/tours/${key}`, { method: 'PUT', body: { status } }).catch(() => undefined);
  }, [active, qc]);

  // Start the tour that belongs to this page the first time it is opened.
  useEffect(() => {
    if (!progress.data || active) return;
    const due = mine.find((t) => !progress.data.tours[t.key] && !shown.current.has(t.key) && (t.route ? relative === t.route : relative === home));
    if (!due) return;
    const t = setTimeout(() => { shown.current.add(due.key); setActive({ key: due.key, index: 0 }); }, 900);
    return () => clearTimeout(t);
  }, [progress.data, mine, relative, active, home]);

  const start = (key: string) => { setMenu(false); shown.current.add(key); setActive({ key, index: 0 }); };
  const pageTour = mine.find((t) => t.route === relative);
  const welcome = mine.find((t) => !t.route);
  const replayAll = () => {
    setMenu(false);
    void api('/tours', { method: 'DELETE' }).then(() => { shown.current.clear(); qc.setQueryData(PROGRESS_KEY, { tours: {} }); });
  };

  const launcher = (
    <div className="relative">
      <button onClick={() => setMenu(!menu)} aria-haspopup="menu" aria-expanded={menu} className="focus-ring inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-bold uppercase text-slate-600 hover:bg-slate-500/10 dark:text-slate-300" title="Guides">
        <BookOpenCheck size={17} /> <span className="hidden sm:inline">Guide</span>
      </button>
      {menu && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setMenu(false)} />
          <div role="menu" className="absolute right-0 z-50 mt-2 w-64 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-xl dark:border-white/10 dark:bg-[#0e1626]">
            {pageTour && <button role="menuitem" onClick={() => start(pageTour.key)} className="block w-full px-4 py-2.5 text-left text-sm font-semibold text-slate-700 hover:bg-primary-500/10 dark:text-slate-200">Guide for this page</button>}
            {welcome && <button role="menuitem" onClick={() => start(welcome.key)} className="block w-full px-4 py-2.5 text-left text-sm font-semibold text-slate-700 hover:bg-primary-500/10 dark:text-slate-200">{welcome.title}: first steps</button>}
            <button role="menuitem" onClick={replayAll} className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm font-semibold text-slate-700 hover:bg-primary-500/10 dark:text-slate-200"><RotateCcw size={14} /> Show every guide again</button>
          </div>
        </>
      )}
    </div>
  );

  return (
    <>
      {launcher}
      {tour && active && <Overlay key={tour.key} tour={tour} index={active.index} setIndex={(i) => setActive({ key: tour.key, index: i })} onClose={finish} base={base} />}
    </>
  );
}
