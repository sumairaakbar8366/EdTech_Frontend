import { ChevronLeft, ChevronRight, Clock, PlayCircle } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Reveal, SectionHeading } from '@/features/marketing/components/Reveal';
import { mmss, VideoPlayer } from '@/features/marketing/components/VideoPlayer';
import { GUIDE_VIDEOS, videoById, type SiteVideo } from '@/features/marketing/video/videos.config';
import { GUIDES } from '@/features/marketing/video/guides';

const EVENT = 'skool:watch';
/** Opens a guide video from anywhere on the page. */
export function watchVideo(id: string) {
  window.dispatchEvent(new CustomEvent(EVENT, { detail: id }));
  document.getElementById('videos')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function Slide({ video, active, onPick }: { video: SiteVideo; active: boolean; onPick: () => void }) {
  const Icon = video.icon;
  return (
    <button
      type="button"
      onClick={onPick}
      aria-pressed={active}
      className={`group relative flex w-[17rem] shrink-0 snap-start flex-col overflow-hidden rounded-2xl bg-white text-left transition duration-300 dark:bg-[#171e29] ${active ? 'ring-2 ring-orange-500 shadow-[0_18px_40px_-18px_rgb(249_115_22/0.55)]' : 'ring-1 ring-slate-200 hover:-translate-y-1 dark:ring-white/10'}`}
    >
      <span className="relative block aspect-video overflow-hidden bg-slate-900">
        <img src={video.poster} alt="" loading="lazy" draggable={false} className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]" />
        <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-slate-900/35 via-transparent to-transparent" />
        <span className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-orange-600 shadow transition group-hover:scale-110"><PlayCircle size={18} /></span>
      </span>
      <span className="flex items-start gap-2.5 p-3">
        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-orange-500/10 text-orange-600"><Icon size={17} /></span>
        <span className="min-w-0"><span className="block text-[11px] font-bold uppercase tracking-wider text-orange-600">{video.role}</span><span className="block text-sm font-bold leading-snug text-slate-900 dark:text-white">{video.title}</span></span>
      </span>
    </button>
  );
}

/** Landing page: a guide video for every role, as slides under the player. Register first, then the administrator. */
export function RoleGuidesSection() {
  const [id, setId] = useState(GUIDE_VIDEOS[0]!.id);
  const [picked, setPicked] = useState(false);
  const row = useRef<HTMLUListElement>(null);
  const player = useRef<HTMLDivElement>(null);
  const video = videoById(id) ?? GUIDE_VIDEOS[0]!;

  const pick = (next: string, scroll = false) => {
    if (!videoById(next)) return;
    setId(next);
    setPicked(true);
    if (scroll) player.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };
  useEffect(() => {
    const on = (e: Event) => pick(String((e as CustomEvent).detail));
    window.addEventListener(EVENT, on);
    return () => window.removeEventListener(EVENT, on);
  }, []);
  const slide = (dir: number) => row.current?.scrollBy({ left: dir * 300, behavior: 'smooth' });

  return (
    <section id="videos" className="relative scroll-mt-16 border-y border-slate-200 bg-white py-16 sm:py-20 dark:border-white/5 dark:bg-[#0f141c]">
      <div className="mx-auto max-w-7xl px-4 sm:px-8">
        <SectionHeading kicker="Guides by role" title="Watch the guide for your role" text="Start with how to register. Then pick who you are: the administrator’s guide shows how to set up a new, empty school, step by step. Every video has a voice-over." />

        <Reveal className="mt-10 grid items-start gap-6 lg:grid-cols-[1.6fr_1fr]">
          <div ref={player}><VideoPlayer key={`${video.id}:${picked}`} video={video} autoPlay={picked} /></div>
          <div className="rounded-2xl bg-slate-50 p-6 ring-1 ring-slate-200 dark:bg-white/[0.04] dark:ring-white/10">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-500/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-orange-600">{video.role}</span>
            <h3 className="mt-3 text-2xl font-bold text-slate-900 dark:text-white">{video.title}</h3>
            <p className="mt-2 leading-7 text-slate-600 dark:text-slate-300">{video.blurb}</p>
            <ol className="mt-4 space-y-1.5">
              {GUIDES.find((g) => g.id === video.id)!.clips.map((c, i) => (
                <li key={c.id} className="flex items-start gap-2.5 text-sm text-slate-700 dark:text-slate-200"><span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-orange-500 text-[11px] font-bold text-white">{i + 1}</span>{c.title}</li>
              ))}
            </ol>
            <div className="mt-5 flex items-center gap-4 text-sm text-slate-500"><span className="inline-flex items-center gap-1.5"><Clock size={15} /> {mmss(video.seconds)}</span></div>
          </div>
        </Reveal>

        <div className="mt-10 flex items-center justify-between">
          <h3 className="text-lg font-bold uppercase tracking-wide text-slate-700 dark:text-slate-200">All guides</h3>
          <div className="flex gap-2">
            <button type="button" onClick={() => slide(-1)} aria-label="Previous guides" className="flex h-9 w-9 items-center justify-center rounded-full bg-white shadow ring-1 ring-slate-200 hover:bg-slate-50 dark:bg-white/5 dark:ring-white/10"><ChevronLeft size={18} /></button>
            <button type="button" onClick={() => slide(1)} aria-label="Next guides" className="flex h-9 w-9 items-center justify-center rounded-full bg-white shadow ring-1 ring-slate-200 hover:bg-slate-50 dark:bg-white/5 dark:ring-white/10"><ChevronRight size={18} /></button>
          </div>
        </div>
        <ul ref={row} className="mt-4 flex snap-x gap-4 overflow-x-auto pb-4 [scrollbar-width:thin]">
          {GUIDE_VIDEOS.map((v) => <li key={v.id}><Slide video={v} active={v.id === video.id} onPick={() => pick(v.id, true)} /></li>)}
        </ul>
      </div>
    </section>
  );
}
