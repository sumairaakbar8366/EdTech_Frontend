import { Maximize2, Pause, Play, RotateCcw, SkipBack, SkipForward, Volume2, VolumeX } from 'lucide-react';
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { shotUrl, TOUR_BEATS, VIDEO_CHAPTERS, VOICE_MS, voiceUrl, type TourBeat } from '@/features/marketing/guide/tour.beats';
import { beatTiming, STAGE_H, STAGE_W, TITLE_MS, TourStage, VOICE_AT } from '@/features/marketing/guide/TourStage';

/** Below this stage scale, captions move under the video so they stay readable. */
const SMALL = 0.62;

/** Every beat on one timeline; a chapter's first beat starts with its title card. */
const TIMELINE = (() => {
  const flat = VIDEO_CHAPTERS.flatMap((c, ci) => TOUR_BEATS[c.id]!.map((b, bi) => ({ ci, bi, b })));
  let start = 0;
  return flat.map(({ ci, bi, b }, i) => {
    const prev: TourBeat | null = i > 0 ? flat[i - 1]!.b : null;
    const next = flat[i + 1];
    const exitZoom = !next || next.b.shot !== b.shot || next.bi === 0;
    const lead = bi === 0 ? TITLE_MS : 0;
    const seg = { ci, bi, b, prev: bi === 0 ? null : prev, exitZoom, start, lead, dur: lead + beatTiming(b, exitZoom).duration };
    start += seg.dur;
    return seg;
  });
})();
const ALL_SHOTS = [...new Set(TIMELINE.map((s) => s.b.shot))];

/** Loads the screenshots (all of them before a recording; otherwise in the background). */
function preload(urls: string[]) {
  return Promise.all(urls.map((u) => new Promise<void>((done) => { const img = new Image(); img.onload = img.onerror = () => done(); img.src = u; })));
}
export const TOUR_TOTAL_MS = TIMELINE.reduce((n, s) => n + s.dur, 0);
/** Where each beat starts and its key moments (for checking frames). */
export const TOUR_MARKS = TIMELINE.map((s) => ({ id: `${VIDEO_CHAPTERS[s.ci]!.id}.${s.bi}`, start: s.start + s.lead, ...beatTiming(s.b, s.exitZoom) }));
if (typeof window !== 'undefined') (window as unknown as { __tourMarks?: unknown }).__tourMarks = TOUR_MARKS;
const chapterStart = (ci: number) => TIMELINE.find((s) => s.ci === ci)!.start;
const fmt = (ms: number) => `${Math.floor(ms / 60000)}:${String(Math.floor((ms % 60000) / 1000)).padStart(2, '0')}`;

declare global {
  interface Window { __tourDone?: boolean }
}

/**
 * The "How it works" walkthrough: an animated tour of the product in chapters, with captions and a
 * narrator's voice (muted with the speaker button). `record`: plays once, silent, without controls.
 */
export function TourPlayer({ record = false, at, initialChapter, showChapters = true }: { record?: boolean; at?: number; initialChapter?: string; showChapters?: boolean }) {
  const startAt = initialChapter ? Math.max(0, VIDEO_CHAPTERS.findIndex((c) => c.id === initialChapter)) : 0;
  const [time, setTime] = useState(() => at ?? (startAt ? chapterStart(startAt) : 0));
  const [playing, setPlaying] = useState(false);
  const [started, setStarted] = useState(record || !!initialChapter);
  const [scale, setScale] = useState(1);
  const [muted, setMuted] = useState(false);
  /** Bumped on every jump, so the voice restarts at the new position. */
  const [jumps, setJumps] = useState(0);
  const voice = useRef<HTMLAudioElement | null>(null);
  const box = useRef<HTMLDivElement>(null);
  const frame = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = box.current;
    if (!el) return;
    const fit = () => setScale(el.clientWidth / STAGE_W);
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Screenshots: a recording waits for all of them before it starts.
  useEffect(() => {
    if (record) void preload(ALL_SHOTS.map(shotUrl)).then(() => { if (at === undefined) { (window as unknown as { __tourStart?: number }).__tourStart = Date.now(); setPlaying(true); } });
  }, [record, at]);

  useEffect(() => {
    if (!playing) return;
    let last = performance.now();
    let raf = requestAnimationFrame(function tick(now) {
      const dt = Math.min(100, now - last);
      last = now;
      setTime((x) => {
        const next = x + dt;
        if (next >= TOUR_TOTAL_MS) {
          setPlaying(false);
          if (record) { window.__tourDone = true; (window as unknown as { __tourEnd?: number }).__tourEnd = Date.now(); }
          return TOUR_TOTAL_MS - 1;
        }
        return next;
      });
      raf = requestAnimationFrame(tick);
    });
    return () => cancelAnimationFrame(raf);
  }, [playing, record]);

  const seg = useMemo(() => TIMELINE.find((s) => time < s.start + s.dur) ?? TIMELINE[TIMELINE.length - 1]!, [time]);
  // On the page, only the screens just ahead are loaded (the whole set is several MB).
  const segIndex = TIMELINE.indexOf(seg);
  useEffect(() => {
    if (record) return;
    const ahead = TIMELINE.slice(segIndex, segIndex + (started ? 6 : 2));
    void preload([...new Set(ahead.map((s) => shotUrl(s.b.shot)))]);
    // The next voice clips into the browser cache (each is a few kB).
    if (started) for (const s of ahead.slice(0, 3)) if (s.b.voice) void fetch(voiceUrl(s.b.voice)).catch(() => {});
  }, [segIndex, started, record]);
  const t = time - seg.start - seg.lead;

  // Recording: note when each beat starts (wall clock), so its voice clip can be laid under the video.
  useEffect(() => {
    if (!record || !playing) return;
    const w = window as unknown as { __beatLog?: { voice: string | undefined; caption: string; chapter: string; title: string; first: boolean; at: number }[] };
    (w.__beatLog ??= []).push({ voice: seg.b.voice, caption: seg.b.caption, chapter: VIDEO_CHAPTERS[seg.ci]!.id, title: VIDEO_CHAPTERS[seg.ci]!.title, first: seg.bi === 0, at: Date.now() + Math.max(0, seg.lead - (time - seg.start)) });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [segIndex, playing, record]);

  // The narrator: the beat's clip plays from where the beat is, and stops when paused or muted.
  const speaking = t >= VOICE_AT;
  useEffect(() => {
    const a = (voice.current ??= new Audio());
    const key = seg.b.voice;
    const offset = (time - seg.start - seg.lead - VOICE_AT) / 1000;
    if (record || !playing || muted || !speaking || !key || offset > (VOICE_MS[key] ?? 0) / 1000) { a.pause(); return; }
    const src = voiceUrl(key);
    if (!a.src.endsWith(src)) a.src = src;
    a.currentTime = Math.max(0, offset);
    void a.play().catch(() => {});
    // Only when the beat, play state, mute or position (a jump) changes, not every frame.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [segIndex, playing, muted, speaking, jumps, record]);
  useEffect(() => () => voice.current?.pause(), []);
  const ended = time >= TOUR_TOTAL_MS - 1;
  const seek = useCallback((ms: number) => { setTime(Math.max(0, Math.min(TOUR_TOTAL_MS - 1, ms))); setJumps((n) => n + 1); }, []);
  const toggle = () => {
    setStarted(true);
    if (ended) { seek(0); setPlaying(true); } else setPlaying((p) => !p);
  };
  const goChapter = (ci: number) => { setStarted(true); seek(chapterStart((ci + VIDEO_CHAPTERS.length) % VIDEO_CHAPTERS.length)); setPlaying(true); };

  const stage = (
    <div ref={box} className="relative w-full overflow-hidden bg-[#eef3fb]" style={{ height: STAGE_H * scale }}>
      {/* Hidden under the cover, so nothing shows through it. */}
      <div className="absolute left-0 top-0 origin-top-left" style={{ transform: `scale(${scale})`, visibility: record || (started && !ended) ? 'visible' : 'hidden' }}>
        <TourStage chapterIndex={seg.ci} beatIndex={seg.bi} t={t} prev={seg.prev} exitZoom={seg.exitZoom} captions={record || scale >= SMALL} />
      </div>
      {!record && (!started || ended) && (
        <button onClick={toggle} className="group absolute inset-0 z-40 flex flex-col items-center justify-center gap-3 overflow-hidden sm:gap-4" aria-label={ended ? 'Watch again' : 'Play the walkthrough'}>
          {/* A blurred glimpse of the real app behind a light veil. */}
          <img src={shotUrl('b-dashboard-after')} alt="" aria-hidden className="absolute inset-0 h-full w-full scale-110 object-cover opacity-60 blur-[6px]" />
          <span aria-hidden className="absolute inset-0 bg-[linear-gradient(135deg,rgb(238_243_251/0.97),rgb(248_250_252/0.93)_50%,rgb(253_241_230/0.97))]" />
          <span className="relative flex h-20 w-20 items-center justify-center rounded-full text-white transition duration-300 group-hover:scale-105 sm:h-24 sm:w-24" style={{ background: 'radial-gradient(circle at 35% 30%, #ffb366 0%, #ff7a1a 45%, #e85d00 100%)', boxShadow: '0 1px 0 rgb(255 255 255 / 0.6) inset, 0 -6px 12px rgb(160 60 0 / 0.35) inset, 0 14px 28px -8px rgb(232 93 0 / 0.65), 0 4px 0 #c24e00' }}>
            {!ended && <span aria-hidden className="absolute inset-0 animate-ping rounded-full bg-orange-400/30 [animation-duration:2.4s]" />}
            {ended ? <RotateCcw size={36} /> : <Play size={38} className="ml-1 drop-shadow-[0_2px_2px_rgb(0_0_0/0.25)]" fill="currentColor" />}
          </span>
          <span className="relative text-xl font-bold sm:text-3xl" style={{ color: '#0f172a' }}>{ended ? 'Watch again' : 'Watch how it works'}</span>
          <span className="relative inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-1.5 text-sm font-medium shadow-[0_1px_0_#fff_inset,0_6px_16px_-8px_rgb(15_23_42/0.35)] ring-1 ring-slate-900/5 sm:text-base" style={{ color: '#334155' }}>
            <Volume2 size={16} className="text-orange-500" /> With voice-over · {VIDEO_CHAPTERS.length} short steps · {fmt(TOUR_TOTAL_MS)}
          </span>
        </button>
      )}
      {!record && started && !ended && <button onClick={toggle} className="absolute inset-0 z-[5]" aria-label={playing ? 'Pause' : 'Play'} />}
    </div>
  );

  // Recording fills the window: 1280 wide records at 1280×720, 1920 wide at full HD (scaled 1.5×).
  if (record) return <div className="tour-player" style={{ width: '100vw' }}>{stage}</div>;

  /** A raised, pressable round button for the control bar. */
  const key3d = 'flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[linear-gradient(180deg,#ffffff,#e8edf3)] text-slate-700 shadow-[0_1px_0_#fff_inset,0_2px_0_#c7d0db,0_6px_12px_-6px_rgb(15_23_42/0.45)] ring-1 ring-slate-300/80 transition active:translate-y-[2px] active:shadow-[0_1px_0_#fff_inset,0_0_0_#c7d0db,0_2px_6px_-4px_rgb(15_23_42/0.45)] hover:text-slate-900';

  return (
    <div className={`tour-player grid gap-6 ${showChapters ? 'lg:grid-cols-[1fr_17rem]' : ''}`}>
      <div className="group/player relative [perspective:1800px]">
        {/* Floor shadow: the player floats above the page. */}
        <div aria-hidden className="absolute inset-x-[8%] -bottom-5 h-10 rounded-[50%] bg-slate-900/25 blur-2xl" />
        <div
          ref={frame}
          className="relative overflow-hidden rounded-2xl bg-[linear-gradient(180deg,#ffffff,#e9eef5)] p-1.5 shadow-[0_1px_0_#fff_inset,0_2px_0_#d5dce5,0_30px_60px_-30px_rgb(15_23_42/0.55),0_18px_36px_-18px_rgb(15_23_42/0.35)] ring-1 ring-slate-900/10 transition-transform duration-500 [transform:rotateX(2.5deg)] group-hover/player:[transform:rotateX(0deg)] sm:p-2"
        >
          <div className="overflow-hidden rounded-xl ring-1 ring-slate-900/10 shadow-[0_2px_6px_rgb(15_23_42/0.18)_inset]">
            {stage}
            {scale < SMALL && started && !ended && (
              <p className="min-h-[4.5rem] border-t border-slate-200 bg-white px-4 py-3 text-center text-[15px] leading-snug" style={{ color: '#1e293b' }}>
                {seg.lead && t < 0 ? <><span className="font-semibold" style={{ color: '#ea580c' }}>Step {seg.ci + 1} of {VIDEO_CHAPTERS.length}:</span> {VIDEO_CHAPTERS[seg.ci]!.title}</> : seg.b.caption}
              </p>
            )}
          </div>
          {/* Control bar: light, glossy, with raised buttons and an inset progress groove. */}
          <div className="mt-1.5 flex items-center gap-2 rounded-xl bg-[linear-gradient(180deg,#ffffff,#eef2f7)] px-2.5 py-2 shadow-[0_1px_0_#fff_inset,0_-1px_0_#dfe5ec_inset,0_3px_8px_-6px_rgb(15_23_42/0.4)] ring-1 ring-slate-200 sm:mt-2 sm:gap-2.5 sm:px-3">
            <button
              onClick={toggle}
              aria-label={playing ? 'Pause' : 'Play'}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white transition active:translate-y-[2px]"
              style={{ background: 'radial-gradient(circle at 35% 30%, #ffb366 0%, #ff7a1a 45%, #e85d00 100%)', boxShadow: '0 1px 0 rgb(255 255 255 / 0.55) inset, 0 3px 0 #c24e00, 0 8px 14px -8px rgb(232 93 0 / 0.8)' }}
            >
              {playing ? <Pause size={18} fill="currentColor" /> : <Play size={18} className="ml-0.5" fill="currentColor" />}
            </button>
            <button onClick={() => goChapter(seg.ci - 1)} className={key3d} aria-label="Previous step"><SkipBack size={15} /></button>
            <button onClick={() => goChapter(seg.ci + 1)} className={key3d} aria-label="Next step"><SkipForward size={15} /></button>
            <div
              className="group relative h-7 min-w-0 flex-1 cursor-pointer"
              role="slider"
              aria-label="Position"
              aria-valuemin={0}
              aria-valuemax={TOUR_TOTAL_MS}
              aria-valuenow={Math.round(time)}
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'ArrowRight') seek(time + 5000); if (e.key === 'ArrowLeft') seek(time - 5000); }}
              onClick={(e) => { const r = e.currentTarget.getBoundingClientRect(); setStarted(true); seek(((e.clientX - r.left) / r.width) * TOUR_TOTAL_MS); }}
            >
              <div className="absolute inset-x-0 top-1/2 flex h-2.5 -translate-y-1/2 gap-[3px] rounded-full bg-slate-200 p-[2px] shadow-[0_1px_2px_rgb(15_23_42/0.25)_inset,0_1px_0_#fff]">
                {VIDEO_CHAPTERS.map((c, ci) => {
                  const s0 = chapterStart(ci);
                  const e = ci + 1 < VIDEO_CHAPTERS.length ? chapterStart(ci + 1) : TOUR_TOTAL_MS;
                  const fill = Math.min(1, Math.max(0, (time - s0) / (e - s0)));
                  return (
                    <div key={c.id} title={c.title} className="relative h-full overflow-hidden rounded-full bg-slate-300/70" style={{ width: `${((e - s0) / TOUR_TOTAL_MS) * 100}%` }}>
                      <div className="h-full rounded-full bg-[linear-gradient(180deg,#ffa04d,#ff6b00)] shadow-[0_0_6px_rgb(255_107_0/0.6)]" style={{ width: `${fill * 100}%` }} />
                    </div>
                  );
                })}
              </div>
            </div>
            <span className="hidden shrink-0 font-mono text-xs tabular-nums sm:inline" style={{ color: '#475569' }}>{fmt(time)} / {fmt(TOUR_TOTAL_MS)}</span>
            <button onClick={() => setMuted((m) => !m)} className={key3d} aria-label={muted ? 'Turn the voice on' : 'Mute the voice'} title={muted ? 'Turn the voice on' : 'Mute the voice'}>{muted ? <VolumeX size={15} /> : <Volume2 size={15} />}</button>
            <button onClick={() => void frame.current?.requestFullscreen?.()} className={`${key3d} hidden sm:flex`} aria-label="Full screen"><Maximize2 size={14} /></button>
          </div>
        </div>
      </div>
      {showChapters && (
        <ol className="hidden max-h-[34rem] space-y-1.5 overflow-y-auto rounded-2xl bg-[linear-gradient(180deg,#ffffff,#f1f5f9)] p-2 shadow-[0_1px_0_#fff_inset,0_2px_0_#dbe2ea,0_20px_40px_-26px_rgb(15_23_42/0.45)] ring-1 ring-slate-900/10 lg:block">
          {VIDEO_CHAPTERS.map((c, ci) => {
            const on = ci === seg.ci && started;
            return (
              <li key={c.id}>
                <button
                  onClick={() => goChapter(ci)}
                  className={`flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left text-sm transition ${on ? 'bg-white font-semibold shadow-[0_1px_0_#fff_inset,0_2px_0_#e2e8f0,0_6px_14px_-8px_rgb(15_23_42/0.4)] ring-1 ring-orange-200' : 'hover:bg-white/70'}`}
                  style={{ color: on ? '#0f172a' : '#475569' }}
                >
                  <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${on ? 'text-white shadow-[0_2px_0_#c24e00]' : 'bg-white shadow-[0_1px_0_#fff_inset,0_1px_0_#d5dce5] ring-1 ring-slate-200'}`} style={on ? { background: 'linear-gradient(180deg,#ff9a3d,#ff6b00)' } : { color: '#64748b' }}><c.icon size={15} /></span>
                  <span className="min-w-0 flex-1 leading-snug">{c.title}</span>
                </button>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
