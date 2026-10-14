import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useCallback, useEffect, useState } from 'react';
import { CATEGORY_LABEL, mediaUrl, type MediaCategory, type PublicSite } from '@/features/website/website';

type Photo = PublicSite['media'][number];
const ORDER: MediaCategory[] = ['campus', 'students', 'events', 'achievements'];

/** The website gallery: one tab per category the school has posted to, and a full-screen viewer. */
export function SiteGallery({ media }: { media: Photo[] }) {
  const [filter, setFilter] = useState<MediaCategory | 'all'>('all');
  const [open, setOpen] = useState<number | null>(null);
  const counts = new Map(ORDER.map((c) => [c, media.filter((m) => m.category === c).length]));
  const tabs: (MediaCategory | 'all')[] = ['all', ...ORDER.filter((c) => counts.get(c))];
  const photos = filter === 'all' ? media : media.filter((m) => m.category === filter);

  const step = useCallback((d: number) => setOpen((i) => (i === null ? i : (i + d + photos.length) % photos.length)), [photos.length]);
  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(null);
      if (e.key === 'ArrowRight') step(1);
      if (e.key === 'ArrowLeft') step(-1);
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, step]);

  const current = open !== null ? photos[open] : undefined;
  return (
    <>
      {tabs.length > 2 && (
        <div role="tablist" aria-label="Photo categories" className="mb-8 flex flex-wrap gap-1 border-b border-(--site-line)">
          {tabs.map((c) => {
            const on = filter === c;
            return (
              <button
                key={c}
                role="tab"
                aria-selected={on}
                onClick={() => setFilter(c)}
                className={`-mb-px border-b-2 px-4 py-2.5 text-sm font-semibold tracking-wide transition-colors ${on ? 'border-(--site-accent) text-(--site-accent)' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
              >
                {c === 'all' ? 'All photos' : CATEGORY_LABEL[c]}
                <span className={`ml-2 rounded px-1.5 py-0.5 text-xs tabular-nums ${on ? 'bg-(--site-accent-soft)' : 'bg-slate-100'}`}>{c === 'all' ? media.length : counts.get(c)}</span>
              </button>
            );
          })}
        </div>
      )}

      <motion.div layout className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        <AnimatePresence mode="popLayout">
          {photos.map((m, i) => (
            <motion.button
              layout
              key={m.id}
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.25 }}
              onClick={() => setOpen(i)}
              className="group relative aspect-[4/3] overflow-hidden rounded-md bg-slate-200 text-left shadow-sm ring-1 ring-(--site-line) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--site-accent)"
            >
              <img src={mediaUrl(m.id)} alt={m.caption ?? CATEGORY_LABEL[m.category]} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]" />
              <span className="absolute inset-x-0 bottom-0 translate-y-1 bg-linear-to-t from-slate-950/80 via-slate-950/40 to-transparent px-3 pb-2.5 pt-8 opacity-90 transition group-hover:translate-y-0 group-hover:opacity-100">
                <span className="block text-[11px] font-bold uppercase tracking-[0.14em] text-white/70">{CATEGORY_LABEL[m.category]}</span>
                {m.caption && <span className="block truncate text-sm font-semibold text-white">{m.caption}</span>}
              </span>
            </motion.button>
          ))}
        </AnimatePresence>
      </motion.div>

      <AnimatePresence>
        {current && (
          <motion.div
            role="dialog"
            aria-modal
            aria-label={current.caption ?? 'Photo'}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col bg-slate-950/92 backdrop-blur-sm"
            onClick={() => setOpen(null)}
          >
            <div className="flex items-center justify-between px-4 py-3 text-sm text-white/70 sm:px-6">
              <span className="tabular-nums">{open! + 1} / {photos.length}</span>
              <button onClick={() => setOpen(null)} className="rounded-full p-2 text-white hover:bg-white/10" aria-label="Close"><X /></button>
            </div>
            <div className="relative flex min-h-0 flex-1 items-center justify-center px-4 sm:px-16">
              {photos.length > 1 && (
                <button onClick={(e) => { e.stopPropagation(); step(-1); }} className="absolute left-2 rounded-full bg-white/10 p-3 text-white hover:bg-white/20 sm:left-4" aria-label="Previous photo"><ChevronLeft /></button>
              )}
              <motion.img key={current.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} src={mediaUrl(current.id)} alt={current.caption ?? ''} onClick={(e) => e.stopPropagation()} className="max-h-full max-w-full rounded object-contain shadow-2xl" />
              {photos.length > 1 && (
                <button onClick={(e) => { e.stopPropagation(); step(1); }} className="absolute right-2 rounded-full bg-white/10 p-3 text-white hover:bg-white/20 sm:right-4" aria-label="Next photo"><ChevronRight /></button>
              )}
            </div>
            <div className="px-4 py-4 text-center sm:px-6" onClick={(e) => e.stopPropagation()}>
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/60">{CATEGORY_LABEL[current.category]}</p>
              {current.caption && <p className="mt-1 text-base font-semibold text-white">{current.caption}</p>}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
