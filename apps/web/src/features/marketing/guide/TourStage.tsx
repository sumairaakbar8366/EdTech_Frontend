import { CheckCircle2, Lock, MousePointer2 } from 'lucide-react';
import { PRODUCT_NAME } from '@/config/brand';
import { areaBox, isPhone, shotUrl, TOUR_BEATS, VIDEO_CHAPTERS, VOICE_MS, type Box, type ShotId, type TourBeat } from '@/features/marketing/guide/tour.beats';

/**
 * One frame of the walkthrough on a fixed 1280×720 stage (the player scales it). Real screenshots sit
 * in a browser window (or a phone); a camera eases in to the part being explained, the cursor glides
 * to the button and clicks it. Every value is a function of the time into the beat, so playing,
 * seeking and the recorded video always look the same.
 */

export const STAGE_W = 1280;
export const STAGE_H = 720;
export const TITLE_MS = 1700;
const CENTER = { x: 640, y: 322 };

const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const easeInOut = (x: number) => { const t = clamp(x); return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2; };
const easeOut = (x: number) => 1 - (1 - clamp(x)) ** 3;
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Where a screenshot sits on the stage: its top-left corner, scale and size. */
interface Frame { x: number; y: number; k: number; w: number; h: number }
const DESKTOP: Frame = { x: 110, y: 46, k: 1060 / 1440, w: 1060, h: 662.5 };
const PHONE: Frame = { x: 492, y: 40, k: 296 / 390, w: 296, h: 640.6 };
const frameOf = (shot: ShotId) => (isPhone(shot) ? PHONE : DESKTOP);

/** A screenshot box in stage coordinates. */
const toStage = (f: Frame, b: Box): Box => [f.x + b[0] * f.k, f.y + b[1] * f.k, b[2] * f.k, b[3] * f.k];

interface Cam { s: number; tx: number; ty: number }
const WIDE: Cam = { s: 1, tx: 0, ty: 0 };
const camAt = (c: Cam, x: number, y: number) => ({ x: c.tx + x * c.s, y: c.ty + y * c.s });
const mixCam = (a: Cam, b: Cam, t: number): Cam => ({ s: lerp(a.s, b.s, t), tx: lerp(a.tx, b.tx, t), ty: lerp(a.ty, b.ty, t) });

/** The camera that frames a box: as close as fits (with a margin), never far past the screen's edges. */
function camFor(shot: ShotId, box: Box | null): Cam {
  if (!box) return WIDE;
  const f = frameOf(shot);
  const [x, y, w, h] = toStage(f, box);
  // Close enough to read; for a tall area, a little further out so nothing hides under the caption.
  const s = clamp(Math.min(1080 / w, 520 / h), 0.8, isPhone(shot) ? 1.55 : 2.3);
  if (s > 0.97 && s < 1.06) return WIDE;
  let tx = CENTER.x - (x + w / 2) * s;
  let ty = CENTER.y - (y + h / 2) * s;
  const chrome = isPhone(shot) ? 10 : 28;
  const [fx, fy, fw, fh] = [f.x, f.y - chrome, f.w, f.h + chrome + (isPhone(shot) ? 10 : 0)];
  if (fw * s > 1200) tx = clamp(tx, 1250 - (fx + fw) * s, 30 - fx * s);
  // The bottom edge may rise to 560: the caption covers the stage below that.
  if (fh * s > 600) ty = clamp(ty, 560 - (fy + fh) * s, 20 - fy * s);
  return { s, tx, ty };
}

/** The camera that frames a beat: its focus, or the area around what it clicks. */
function beatCam(b: TourBeat): Cam {
  const focus = areaBox(b.shot, b.focus);
  const click = areaBox(b.shot, b.click);
  // The button being clicked is always in the picture.
  if (focus && click) {
    const x1 = Math.min(focus[0], click[0] - 20), y1 = Math.min(focus[1], click[1] - 20);
    const x2 = Math.max(focus[0] + focus[2], click[0] + click[2] + 20), y2 = Math.max(focus[1] + focus[3], click[1] + click[3] + 20);
    return camFor(b.shot, [x1, y1, x2 - x1, y2 - y1]);
  }
  if (focus) return camFor(b.shot, focus);
  if (!click) return WIDE;
  const pad = isPhone(b.shot) ? [120, 160] : [420, 220];
  return camFor(b.shot, [click[0] + click[2] / 2 - pad[0], click[1] + click[3] / 2 - pad[1], pad[0] * 2, pad[1] * 2]);
}

/** When a beat's voice starts (ms into the beat). */
export const VOICE_AT = 150;

/** A beat's timing: long enough to read the caption and hear the voice; when the cursor clicks and the camera pulls out. */
export function beatTiming(b: TourBeat, exitZoom: boolean) {
  const spoken = b.voice && VOICE_MS[b.voice] ? VOICE_AT + VOICE_MS[b.voice]! + 250 : 0;
  const read = Math.max(3300, b.caption.split(/\s+/).length * 275, spoken);
  const clickAt = b.click ? read : 0;
  const zoomOutAt = read + (b.click ? (b.toast ? 1400 : 700) : 0);
  return { clickAt, zoomOutAt, duration: zoomOutAt + (exitZoom ? 600 : 200) };
}

/** The address shown in the browser bar for a screenshot. */
function pathOf(shot: ShotId): string {
  if (shot === 'signup') return 'access?mode=signup';
  const [school, rest] = shot.startsWith('b-') ? ['bright-future-school', shot.slice(2)] : shot.startsWith('d-') ? ['demo', shot.slice(2)] : ['demo', shot];
  const page: [RegExp, string][] = [
    [/^(site|job-apply|job-applied)/, ''],
    [/^apply/, '/apply'],
    [/^dashboard/, '/admin'],
    [/^(years|year-|term-|class|section|subject|rooms)/, '/admin/academics'],
    [/^(hiring|job-form|candidate|interview|hired)/, '/admin/staff/hiring'],
    [/^(staff|teacher|accountant)/, '/admin/staff'],
    [/^(admissions|adm-|enrolled|student$)/, '/admin/admissions'],
    [/^(students|import)/, '/admin/students'],
    [/^users/, '/admin/users-and-access'],
    [/^(structures|generate|invoices|finance)/, '/admin/finance'],
    [/^timetable/, '/admin/timetable'],
    [/^exams/, '/admin/exams-and-results'],
    [/^communication/, '/admin/communication'],
  ];
  const found = page.find(([re]) => re.test(rest));
  return `${school}${found ? found[1] : ''}`;
}

/** The screenshot in its device: a browser window or a phone. */
function Device({ shot }: { shot: ShotId }) {
  if (isPhone(shot)) {
    return (
      <div className="absolute rounded-[46px] bg-slate-900 p-[10px] shadow-[0_40px_80px_-30px_rgb(15_23_42/0.55),0_0_0_1px_rgb(15_23_42/0.08)]" style={{ left: PHONE.x - 10, top: PHONE.y - 10, width: PHONE.w + 20, height: PHONE.h + 20 }}>
        <div className="relative h-full w-full overflow-hidden rounded-[36px] bg-white">
          <img src={shotUrl(shot)} alt="" className="block h-full w-full object-cover object-top" draggable={false} />
          <span className="absolute left-1/2 top-2 h-5 w-24 -translate-x-1/2 rounded-full bg-slate-900" />
        </div>
      </div>
    );
  }
  return (
    <div className="absolute overflow-hidden rounded-xl bg-white shadow-[0_40px_90px_-40px_rgb(15_23_42/0.45),0_0_0_1px_rgb(15_23_42/0.07)]" style={{ left: DESKTOP.x, top: DESKTOP.y - 28, width: DESKTOP.w }}>
      <div className="flex h-7 items-center gap-2 border-b border-slate-200 bg-slate-50 px-3">
        <span className="flex gap-1.5"><i className="h-2.5 w-2.5 rounded-full bg-rose-400" /><i className="h-2.5 w-2.5 rounded-full bg-amber-400" /><i className="h-2.5 w-2.5 rounded-full bg-emerald-400" /></span>
        <span className="mx-auto flex items-center gap-1.5 rounded-md bg-white px-3 py-0.5 text-[11px] text-slate-500 ring-1 ring-slate-200"><Lock size={9} /> ed-tech.anetcybersolution.com/{pathOf(shot)}</span>
      </div>
      <img src={shotUrl(shot)} alt="" className="block" style={{ width: DESKTOP.w, height: DESKTOP.h }} draggable={false} />
    </div>
  );
}

export interface StageState {
  chapterIndex: number;
  beatIndex: number;
  /** ms into the beat (negative during the chapter's title card). */
  t: number;
  /** The beat before this one (for the cross-fade). */
  prev: TourBeat | null;
  /** The next beat shows another screen: pull the camera back out at the end. */
  exitZoom: boolean;
}

/** The whole stage: device and camera, cursor, click, confirmation, caption and title card. */
export function TourStage({ chapterIndex, beatIndex, t, prev, exitZoom, captions = true }: StageState & { captions?: boolean }) {
  const chapter = VIDEO_CHAPTERS[chapterIndex]!;
  const beat = TOUR_BEATS[chapter.id]![beatIndex]!;
  const timing = beatTiming(beat, exitZoom);
  const bt = Math.max(0, t);
  const f = frameOf(beat.shot);

  // Camera: in from where the last beat ended (same screen) or from the whole screen, out at the end.
  const sameShot = prev?.shot === beat.shot && beatIndex > 0;
  const start = sameShot && prev ? beatCam(prev) : WIDE;
  let cam = mixCam(start, beatCam(beat), easeInOut((bt - 100) / 900));
  if (exitZoom) cam = mixCam(cam, WIDE, easeInOut((bt - timing.zoomOutAt) / 560));
  if (beat.click) {
    const punch = bt > timing.clickAt ? Math.sin(clamp((bt - timing.clickAt) / 420) * Math.PI) * 0.035 : 0;
    cam = { s: cam.s * (1 + punch), tx: cam.tx * (1 + punch) - CENTER.x * punch, ty: cam.ty * (1 + punch) - CENTER.y * punch };
  }

  // Cross-fade from the previous screen.
  const fadeIn = sameShot || !prev ? 1 : easeOut(bt / 550);

  // Cursor and click, in stage coordinates under the camera.
  const clickBox = areaBox(beat.shot, beat.click);
  let cursor: { x: number; y: number; down: boolean } | null = null;
  let ring: { x: number; y: number; w: number; h: number; o: number } | null = null;
  let ripple: { x: number; y: number; r: number; o: number } | null = null;
  if (clickBox && t >= 0 && bt > timing.clickAt - 1050 && bt < timing.zoomOutAt + 200) {
    const [x, y, w, h] = toStage(f, clickBox);
    const tgt = camAt(cam, x + w / 2, y + h / 2);
    const from = { x: 1120, y: 690 };
    const p = easeInOut((bt - (timing.clickAt - 1000)) / 880);
    const ctrl = { x: lerp(from.x, tgt.x, 0.5) + 90, y: Math.min(from.y, tgt.y) - 80 };
    cursor = {
      x: (1 - p) ** 2 * from.x + 2 * (1 - p) * p * ctrl.x + p * p * tgt.x,
      y: (1 - p) ** 2 * from.y + 2 * (1 - p) * p * ctrl.y + p * p * tgt.y,
      down: bt >= timing.clickAt && bt < timing.clickAt + 180,
    };
    const tl = camAt(cam, x, y);
    const ringO = bt < timing.clickAt - 350 ? 0 : bt < timing.clickAt + 900 ? easeOut((bt - timing.clickAt + 350) / 250) : 1 - easeOut((bt - timing.clickAt - 900) / 350);
    ring = { x: tl.x - 5, y: tl.y - 5, w: w * cam.s + 10, h: h * cam.s + 10, o: clamp(ringO) };
    if (bt >= timing.clickAt && bt < timing.clickAt + 700) {
      const q = (bt - timing.clickAt) / 700;
      ripple = { x: tgt.x, y: tgt.y, r: 8 + easeOut(q) * 46, o: 1 - q };
    }
  }

  const toast = beat.toast && bt > timing.clickAt + 380 ? easeOut((bt - timing.clickAt - 380) / 320) * (1 - easeOut((bt - timing.zoomOutAt + 150) / 300)) : 0;
  const isTitle = beatIndex === 0 && t < 0;
  const title = isTitle ? 1 - easeInOut((t + 400) / 400) : 0;
  const caption = isTitle ? 0 : easeOut(bt / 380);

  return (
    <div className="relative overflow-hidden text-left font-sans antialiased" style={{ width: STAGE_W, height: STAGE_H, background: 'linear-gradient(135deg,#e8eff9 0%,#f6f8fc 48%,#fdf1e6 100%)' }}>
      <div aria-hidden className="absolute -left-40 -top-40 h-[30rem] w-[30rem] rounded-full bg-[#c9d8ef] opacity-60 blur-3xl" />
      <div aria-hidden className="absolute -bottom-48 -right-32 h-[30rem] w-[30rem] rounded-full bg-[#fbd9b8] opacity-50 blur-3xl" />

      {prev && !sameShot && fadeIn < 1 && <div className="absolute inset-0" style={{ opacity: 1 - fadeIn }}><Device shot={prev.shot} /></div>}
      <div className="absolute left-0 top-0 origin-top-left" style={{ width: STAGE_W, height: STAGE_H, opacity: fadeIn, transform: `translate(${cam.tx}px, ${cam.ty}px) scale(${cam.s})` }}>
        <Device shot={beat.shot} />
      </div>

      {ring && ring.o > 0 && (
        <div className="pointer-events-none absolute rounded-xl ring-[3px] ring-orange-500 shadow-[0_0_0_6px_rgb(249_115_22/0.18),0_0_24px_rgb(249_115_22/0.45)]" style={{ left: ring.x, top: ring.y, width: ring.w, height: ring.h, opacity: ring.o }} />
      )}
      {ripple && <div className="pointer-events-none absolute rounded-full border-[3px] border-orange-500" style={{ left: ripple.x - ripple.r, top: ripple.y - ripple.r, width: ripple.r * 2, height: ripple.r * 2, opacity: ripple.o }} />}
      {cursor && (
        <MousePointer2 size={34} strokeWidth={1.6} className="pointer-events-none absolute z-20 fill-white text-slate-900 drop-shadow-[0_3px_4px_rgb(0_0_0/0.3)]" style={{ left: cursor.x - 6, top: cursor.y - 4, transform: cursor.down ? 'scale(0.82)' : undefined, transformOrigin: '6px 4px' }} />
      )}

      {toast > 0 && (
        <div className="absolute left-1/2 top-5 z-20 flex items-center gap-2.5 rounded-full bg-white py-2.5 pl-3 pr-5 text-[17px] font-semibold text-slate-800 shadow-[0_12px_30px_-10px_rgb(15_23_42/0.35)] ring-1 ring-emerald-200" style={{ opacity: toast, transform: `translate(-50%, ${(1 - toast) * -14}px)` }}>
          <CheckCircle2 size={22} className="text-emerald-500" /> {beat.toast}
        </div>
      )}

      {captions && caption > 0 && (
        <div className="absolute inset-x-0 bottom-5 z-10 flex justify-center px-10" style={{ opacity: caption, transform: `translateY(${(1 - caption) * 10}px)` }}>
          <p className="max-w-[1060px] rounded-2xl bg-white/95 px-7 py-3.5 text-center text-[23px] font-medium leading-snug text-slate-800 shadow-[0_14px_40px_-14px_rgb(15_23_42/0.4)] ring-1 ring-slate-900/5">
            <span className="mr-2.5 inline-block h-2.5 w-2.5 -translate-y-0.5 rounded-full bg-orange-500 align-middle" />{beat.caption}
          </p>
        </div>
      )}

      {title > 0 && (
        <div className="absolute inset-0 z-30 flex items-center justify-center" style={{ opacity: title, background: 'linear-gradient(135deg,#eef3fb 0%,#f8fafc 50%,#fdf3ea 100%)' }}>
          <div className="flex max-w-[900px] flex-col items-center text-center" style={{ transform: `scale(${0.96 + 0.04 * easeOut((t + TITLE_MS) / 600)})` }}>
            <span className="flex h-20 w-20 items-center justify-center rounded-2xl bg-orange-500 text-white shadow-[0_18px_40px_-14px_rgb(249_115_22/0.7)]"><chapter.icon size={40} /></span>
            <span className="mt-7 rounded-full bg-white px-4 py-1.5 text-[14px] font-bold uppercase tracking-[0.22em] text-orange-600 ring-1 ring-orange-200">Step {chapterIndex + 1} of {VIDEO_CHAPTERS.length}</span>
            <h2 className="mt-4 text-[48px] font-bold leading-tight text-slate-900">{chapter.title}</h2>
            <p className="mt-4 text-[20px] leading-relaxed text-slate-600">{chapter.summary}</p>
            <span className="mt-8 text-[13px] font-semibold uppercase tracking-[0.2em] text-slate-400">{PRODUCT_NAME} · How it works</span>
          </div>
        </div>
      )}
    </div>
  );
}
