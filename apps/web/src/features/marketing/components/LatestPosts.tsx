import { Award, CalendarDays, HandHeart, MapPin, Newspaper } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { api } from '@/services/api/http';
import { PRODUCT_NAME } from '@/config/brand';
import { Modal } from '@/components/ui';

interface PublicPost { id: string; kind: 'award' | 'scholarship' | 'event' | 'news'; title: string; body: string; eventName: string | null; eventDate: string | null; location: string | null; schoolName: string | null; publishedAt: string; images: { id: string; caption: string | null }[] }
const ICON = { award: Award, scholarship: HandHeart, event: CalendarDays, news: Newspaper } as const;
const LABEL = { award: 'Award', scholarship: 'Scholarship', event: 'Event', news: 'News' } as const;
const img = (id: string) => `/api/public/posts/image/${id}`;
const date = (v: string) => new Date(v).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });

/** "Latest from Skool EdTech": the owner's awards, scholarships and events, with photos, written from the console. */
export function LatestPosts() {
  const posts = useQuery({ queryKey: ['public-posts'], queryFn: () => api<PublicPost[]>('/public/posts?limit=9'), staleTime: 60_000, retry: 0 });
  const [open, setOpen] = useState<PublicPost | null>(null);
  if (!posts.data?.length) return null;
  return (
    <section id="news" className="mx-auto max-w-7xl px-4 py-14 sm:px-8" aria-label={`Latest from ${PRODUCT_NAME}`}>
      <span className="inline-block border-l-2 border-orange-500 bg-primary-50 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-[0.14em] text-primary-700 dark:bg-primary-500/10 dark:text-primary-200">Latest</span>
      <h2 className="mt-3 font-display text-3xl font-semibold text-slate-900 dark:text-white">Latest from {PRODUCT_NAME}</h2>
      <p className="mt-2 max-w-2xl text-slate-600 dark:text-slate-300">Scholarships awarded, events held and schools we are proud to support.</p>
      <ul className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {posts.data.map((p) => {
          const Icon = ICON[p.kind];
          return (
            <li key={p.id}>
              <button onClick={() => setOpen(p)} className="focus-ring group block h-full w-full overflow-hidden rounded-xl border border-slate-200 bg-white text-left shadow-depth-1 transition hover:-translate-y-0.5 hover:shadow-lg dark:border-white/10 dark:bg-white/[0.03]">
                {p.images[0] ? <img src={img(p.images[0].id)} alt={p.images[0].caption ?? p.title} loading="lazy" className="aspect-16/10 w-full object-cover" /> : <div className="flex aspect-16/10 items-center justify-center bg-primary-500/10 text-primary-600"><Icon size={36} /></div>}
                <div className="space-y-2 p-5">
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary-700 dark:text-primary-300"><Icon size={14} /> {LABEL[p.kind]}</span>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">{p.title}</h3>
                  <p className="line-clamp-3 text-sm text-slate-600 dark:text-slate-300">{p.body}</p>
                  <p className="flex flex-wrap items-center gap-x-3 text-xs text-slate-500">{(p.eventName || p.schoolName) && <span>{p.eventName ?? p.schoolName}</span>}{p.location && <span className="inline-flex items-center gap-1"><MapPin size={12} /> {p.location}</span>}<span>{date(p.eventDate ?? p.publishedAt)}</span></p>
                </div>
              </button>
            </li>
          );
        })}
      </ul>
      <Modal open={!!open} size="xl" title={open?.title ?? ''} onClose={() => setOpen(null)}>
        {open && (
          <div className="space-y-4">
            <p className="text-sm text-slate-500">{[LABEL[open.kind], open.eventName, open.schoolName, open.location, date(open.eventDate ?? open.publishedAt)].filter(Boolean).join(' · ')}</p>
            <p className="whitespace-pre-wrap text-slate-800 dark:text-slate-100">{open.body}</p>
            <div className="grid gap-3 sm:grid-cols-2">{open.images.map((i) => <figure key={i.id}><img src={img(i.id)} alt={i.caption ?? open.title} loading="lazy" className="w-full rounded-lg object-cover" />{i.caption && <figcaption className="mt-1 text-xs text-slate-500">{i.caption}</figcaption>}</figure>)}</div>
          </div>
        )}
      </Modal>
    </section>
  );
}
