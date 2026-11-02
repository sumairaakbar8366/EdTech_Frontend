import { useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { easeOut } from '@/features/marketing/video/art';
import { VOICE_MS } from '@/features/marketing/guide/tour.beats';

export const STAGE_W = 1280;
export const STAGE_H = 720;
/** Where the narrator starts inside a scene, and the breath after the last word. */
export const SAY_AT = 350;
export const SAY_TAIL = 900;

export interface SceneCtx { t: number; d: number }
export interface Scene {
  /** What the narrator says (its clip is public/guide/voice/<video>-<n>.mp3). */
  say: string;
  /** A short caption shown at the bottom. */
  cap?: string;
  /** Minimum length in ms (a scene lasts as long as its narration needs). */
  min?: number;
  /** Screenshots to load before a recording starts. */
  shots?: string[];
  render: (c: SceneCtx) => ReactNode;
}
export interface SceneVideoDef { id: string; title: string; scenes: Scene[] }

declare global {
  interface Window { __seek?: (ms: number) => void; __timeline?: { start: number; d: number }[]; __videoDone?: boolean; __videoStart?: number; __beatLog?: { voice: string; at: number; scene: number }[] }
}

export const voiceKey = (video: string, i: number) => `${video}-${i}`;

export function timelineOf(def: SceneVideoDef) {
  let start = 0;
  const segs = def.scenes.map((s, i) => {
    const spoken = VOICE_MS[voiceKey(def.id, i)] ?? 0;
    const d = Math.max(s.min ?? 4200, spoken ? SAY_AT + spoken + SAY_TAIL : 0);
    const seg = { i, s, start, d };
    start += d;
    return seg;
  });
  return { segs, total: start };
}

const preload = (urls: string[]) => Promise.all(urls.map((u) => new Promise<void>((done) => { const img = new Image(); img.onload = img.onerror = () => done(); img.src = u; })));

/**
 * The marketing video as a page: illustrated scenes on a 1280×720 stage, each a function of the time
 * into it. `record` plays once from the start for the recorder, which notes when each line starts.
 */
export function SceneVideo({ def, record = false, at }: { def: SceneVideoDef; record?: boolean; at?: number }) {
  const { segs, total } = useMemo(() => timelineOf(def), [def]);
  const [time, setTime] = useState(at ?? 0);
  const [playing, setPlaying] = useState(false);
  const [scale, setScale] = useState(1);
  const box = useRef<HTMLDivElement>(null);
  const logged = useRef(-1);

  useLayoutEffect(() => {
    const el = box.current;
    if (!el) return;
    const fit = () => setScale(el.clientWidth / STAGE_W);
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const urls = [...new Set(def.scenes.flatMap((s) => s.shots ?? []))].map((n) => `/guide/screens/${n}.jpg`);
    void preload(urls).then(() => { if (record && at === undefined) { window.__videoStart = Date.now(); setPlaying(true); } });
  }, [def, record, at]);

  useEffect(() => {
    if (!playing) return;
    let last = performance.now();
    let raf = requestAnimationFrame(function tick(now) {
      const dt = Math.min(100, now - last);
      last = now;
      setTime((x) => {
        const next = x + dt;
        if (next >= total) { setPlaying(false); window.__videoDone = true; return total - 1; }
        return next;
      });
      raf = requestAnimationFrame(tick);
    });
    return () => cancelAnimationFrame(raf);
  }, [playing, total]);

  useEffect(() => { window.__seek = (ms: number) => setTime(ms); window.__timeline = segs.map((g) => ({ start: g.start, d: g.d })); }, [segs]);
  const cur = segs.find((g) => time < g.start + g.d) ?? segs[segs.length - 1]!;
  const prev = cur.i > 0 ? segs[cur.i - 1]! : null;
  const t = time - cur.start;

  // The recorder wants to know when each line begins (wall clock).
  useEffect(() => {
    if (!record || !playing || logged.current === cur.i) return;
    logged.current = cur.i;
    (window.__beatLog ??= []).push({ voice: voiceKey(def.id, cur.i), at: Date.now(), scene: cur.i });
  }, [cur.i, playing, record, def.id]);

  const fade = prev ? easeOut(t / 450) : 1;
  const capIn = easeOut((t - 500) / 400) * (1 - easeOut((t - (cur.d - 500)) / 400));
  return (
    <div ref={box} className="relative w-full overflow-hidden bg-black" style={{ height: STAGE_H * scale }}>
      <div className="absolute left-0 top-0 origin-top-left" style={{ width: STAGE_W, height: STAGE_H, transform: `scale(${scale})` }}>
        {prev && fade < 1 && <div className="absolute inset-0" style={{ opacity: 1 - fade }}>{prev.s.render({ t: prev.d + t, d: prev.d })}</div>}
        <div className="absolute inset-0" style={{ opacity: fade }}>{cur.s.render({ t, d: cur.d })}</div>
        {cur.s.cap && capIn > 0 && (
          <div className="absolute inset-x-0 bottom-5 z-10 flex justify-center px-10" style={{ opacity: capIn, transform: `translateY(${(1 - capIn) * 10}px)` }}>
            <p className="max-w-[1060px] rounded-2xl bg-white/95 px-7 py-3 text-center text-[24px] font-semibold leading-snug text-slate-800 shadow-[0_14px_40px_-14px_rgb(15_23_42/0.4)] ring-1 ring-slate-900/5">
              <span className="mr-2.5 inline-block h-2.5 w-2.5 -translate-y-0.5 rounded-full bg-orange-500 align-middle" />{cur.s.cap}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
