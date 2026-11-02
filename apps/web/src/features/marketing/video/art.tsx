import { useId, type CSSProperties, type ReactNode } from 'react';

/** Small drawing kit for the marketing video's illustrated scenes (flat style, 1280×720 stage). Everything is a function of time. */

export const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const easeOut = (x: number) => 1 - (1 - clamp(x)) ** 3;
export const easeInOut = (x: number) => { const t = clamp(x); return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2; };
export const back = (x: number) => { const t = clamp(x); const c = 1.70158; return 1 + (c + 1) * (t - 1) ** 3 + c * (t - 1) ** 2; };
/** 0→1 over `dur` ms starting at `at`. */
export const appear = (t: number, at: number, dur = 500) => easeOut((t - at) / dur);
export const pop = (t: number, at: number, dur = 450) => back((t - at) / dur);
/** A deterministic pseudo-random number in [0,1) from an index. */
export const rnd = (i: number) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

export const C = {
  navy: '#1f2f46', steel: '#4a6a92', orange: '#f97316', orangeSoft: '#fdba74', sky: '#dbeafe', cream: '#fff7ed', ink: '#0f172a',
  wood: '#a16207', woodDark: '#854d0e', paper: '#ffffff', green: '#16a34a', red: '#dc2626', yellow: '#fde047', slate: '#64748b',
};

export type Mood = 'stress' | 'tired' | 'happy' | 'neutral' | 'angry' | 'sad';

const mix = (hex: string, to: string, k: number) => {
  const p = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const [r1, g1, b1] = p(hex), [r2, g2, b2] = p(to);
  return `rgb(${Math.round(r1 + (r2 - r1) * k)} ${Math.round(g1 + (g2 - g1) * k)} ${Math.round(b1 + (b2 - b1) * k)})`;
};

/** A person drawn from the chest up, around (0,0) at the head's centre. A softly shaded, more natural cartoon. */
export function Person({ x, y, s = 1, mood = 'neutral', shirt = '#3b82f6', skin = '#f1c9a5', hair = '#2b2118', t = 0, arms = 'desk', tie = false, female = false, flip = false, glasses = false, mustache = false, kid = false }: {
  x: number; y: number; s?: number; mood?: Mood; shirt?: string; skin?: string; hair?: string; t?: number; arms?: 'desk' | 'head' | 'up' | 'down'; tie?: boolean; female?: boolean; flip?: boolean; glasses?: boolean; mustache?: boolean; kid?: boolean;
}) {
  const uid = useId().replace(/:/g, '');
  const blink = Math.sin(t / 900) > 0.96 || mood === 'tired';
  const shake = mood === 'stress' ? Math.sin(t / 70) * 1.6 : mood === 'angry' ? Math.sin(t / 55) * 2.2 : 0;
  const bob = mood === 'happy' ? Math.sin(t / 320) * 3 : mood === 'tired' ? Math.sin(t / 700) * 4 : 0;
  const skinHi = mix(skin, '#ffffff', 0.22), skinLo = mix(skin, '#7c4a2a', 0.28);
  const shirtHi = mix(shirt, '#ffffff', 0.18), shirtLo = mix(shirt, '#0f172a', 0.28);
  const hairHi = mix(hair, '#ffffff', 0.25);
  const brows: Record<Mood, [number, number, number]> = { stress: [-7, 7, -2], tired: [3, -3, 4], happy: [-3, 3, -4], neutral: [0, 0, 0], angry: [9, -9, 2], sad: [-8, 8, 0] };
  const [bl, br, by] = brows[mood];
  const sh = kid ? 0.86 : 1;
  const headT = 'translate(0 10) translate(0 18) scale(1.22) translate(0 -18)';
  const armPath = (side: -1 | 1) => {
    const sx = side * 62, sy = 140;
    if (arms === 'head') return `M ${sx} ${sy} Q ${side * 104} 70 ${side * 52} 14`;
    if (arms === 'up') return `M ${sx} ${sy} Q ${side * 112} 86 ${side * 96} ${34 + Math.sin(t / 150 + side) * 12}`;
    return `M ${sx} ${sy} Q ${side * 92} 200 ${side * 50} ${arms === 'desk' ? 218 : 240}`;
  };
  const hand = (side: -1 | 1): [number, number] => (arms === 'head' ? [side * 52, 14] : arms === 'up' ? [side * 96, 34 + Math.sin(t / 150 + side) * 12] : [side * 50, arms === 'desk' ? 218 : 240]);
  const mouth = {
    stress: <path d="M -12 49 q 6 -7 12 -1 q 6 6 12 1" fill="none" stroke="#7f1d1d" strokeWidth="3.2" strokeLinecap="round" />,
    tired: <path d="M -9 50 h 18" stroke="#7f1d1d" strokeWidth="3.2" strokeLinecap="round" />,
    happy: <g><path d="M -15 44 q 15 22 30 0 z" fill="#7f1d1d" /><path d="M -12 44 q 12 7 24 0 v 2 q -12 8 -24 0 z" fill="#fff" /></g>,
    neutral: <path d="M -10 49 q 10 5 20 0" fill="none" stroke="#7f1d1d" strokeWidth="3.2" strokeLinecap="round" />,
    angry: <path d="M -13 53 q 13 -12 26 0" fill="none" stroke="#7f1d1d" strokeWidth="3.4" strokeLinecap="round" />,
    sad: <path d="M -11 53 q 11 -10 22 0" fill="none" stroke="#7f1d1d" strokeWidth="3.2" strokeLinecap="round" />,
  }[mood];
  return (
    <g transform={`translate(${x} ${y + bob}) scale(${flip ? -s * sh : s * sh} ${s * sh})`}>
      <defs>
        <linearGradient id={`sk${uid}`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor={skinHi} /><stop offset="1" stopColor={skinLo} /></linearGradient>
        <linearGradient id={`sh${uid}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={shirtHi} /><stop offset="1" stopColor={shirtLo} /></linearGradient>
        <linearGradient id={`hr${uid}`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor={hairHi} /><stop offset="1" stopColor={hair} /></linearGradient>
      </defs>
      <g transform={`translate(${shake} 0)`}>
        {female && <g transform={headT}><path d="M -52 14 C -60 -52 60 -52 52 14 L 60 126 C 44 138 32 104 30 70 L -30 70 C -32 104 -44 138 -60 126 Z" fill={`url(#hr${uid})`} /></g>}
        {/* torso */}
        <path d="M -92 290 L -90 168 C -90 138 -62 124 -32 120 L 32 120 C 62 124 90 138 90 168 L 92 290 Z" fill={`url(#sh${uid})`} />
        <path d="M -30 118 C -34 150 -34 200 -30 290 M 30 118 C 34 150 34 200 30 290" stroke={shirtLo} strokeWidth="2" opacity=".25" fill="none" />
        {/* arms: sleeves and hands */}
        <path d={armPath(-1)} stroke={`url(#sh${uid})`} strokeWidth="30" strokeLinecap="round" fill="none" />
        <path d={armPath(1)} stroke={`url(#sh${uid})`} strokeWidth="30" strokeLinecap="round" fill="none" />
        {([-1, 1] as const).map((sd) => { const [hx, hy] = hand(sd); return <g key={sd}><ellipse cx={hx} cy={hy} rx="16" ry="14" fill={`url(#sk${uid})`} /><ellipse cx={hx + sd * 12} cy={hy - 6} rx="6" ry="9" fill={skin} transform={`rotate(${sd * 25} ${hx + sd * 12} ${hy - 6})`} /></g>; })}
        {/* neck and collar */}
        <path d="M -16 70 L -16 118 C -8 132 8 132 16 118 L 16 70 Z" fill={skinLo} />
        <path d="M -30 118 L 0 160 L 30 118 L 20 112 L 0 136 L -20 112 Z" fill="#fff" stroke="#e2e8f0" strokeWidth="1.5" />
        {tie ? <g><path d="M -7 134 L 7 134 L 5 144 L -5 144 Z" fill="#b91c1c" /><path d="M -5 144 L 5 144 L 9 200 L 0 212 L -9 200 Z" fill="#dc2626" /></g> : <g fill="#fff" opacity=".9"><circle cx="0" cy="170" r="2.6" /><circle cx="0" cy="196" r="2.6" /></g>}
        {/* head */}
        <g transform={headT}>
        <ellipse cx="-42" cy="18" rx="7" ry="11" fill={skin} /><ellipse cx="42" cy="18" rx="7" ry="11" fill={skin} />
        <path d="M -41 8 C -41 -32 -22 -46 0 -46 C 22 -46 41 -32 41 8 C 41 42 25 70 0 74 C -25 70 -41 42 -41 8 Z" fill={`url(#sk${uid})`} />
        {mood === 'angry' && <ellipse cx="0" cy="18" rx="36" ry="48" fill="#ef4444" opacity=".16" />}
        {mood === 'happy' && <g><ellipse cx="-24" cy="40" rx="9" ry="6" fill="#fb7185" opacity=".35" /><ellipse cx="24" cy="40" rx="9" ry="6" fill="#fb7185" opacity=".35" /></g>}
        {/* hair */}
        {female
          ? <path d="M -44 10 C -50 -44 -14 -58 8 -56 C 36 -54 52 -34 44 12 C 40 -14 22 -26 0 -28 C -22 -28 -38 -18 -44 10 Z" fill={`url(#hr${uid})`} />
          : <path d="M -43 8 C -50 -44 -18 -60 8 -58 C 38 -56 52 -34 43 10 C 40 -8 28 -22 6 -26 C -14 -30 -34 -22 -43 8 Z" fill={`url(#hr${uid})`} />}
        {/* eyes */}
        {([-1, 1] as const).map((sd) => {
          const ex = sd * 17;
          const look = mood === 'stress' ? Math.sin(t / 130) * 2.2 : 0;
          return (
            <g key={sd}>
              <ellipse cx={ex} cy="14" rx="10" ry={blink ? 0.9 : 8.6} fill="#fff" stroke={skinLo} strokeWidth="1" />
              {!blink && <g><circle cx={ex + look} cy="15" r="5.6" fill="#3b2a1f" /><circle cx={ex + look} cy="15" r="2.7" fill="#0b0b0b" /><circle cx={ex + look + 1.8} cy="12.6" r="1.5" fill="#fff" /></g>}
              {mood === 'tired' && <path d={`M ${ex - 9} 23 q 9 7 18 0`} stroke="#8b5e9f" strokeWidth="2" fill="none" opacity=".5" />}
              <path d={`M ${ex - 11} ${2 + by + (sd === -1 ? bl : br) * -0.2} Q ${ex} ${-4 + by} ${ex + 11} ${2 + by + (sd === -1 ? -bl : -br) * -0.2}`} stroke={hair} strokeWidth="4.2" strokeLinecap="round" fill="none" transform={`rotate(${(sd === -1 ? bl : -br) * -0.9} ${ex} 2)`} />
            </g>
          );
        })}
        <path d="M 0 16 q -5 12 -2 19 q 3 3 7 0" stroke={skinLo} strokeWidth="2.4" fill="none" strokeLinecap="round" />
        {mustache && <path d="M -17 41 Q -8 33 0 38 Q 8 33 17 41 Q 8 46 0 43 Q -8 46 -17 41 Z" fill={hair} />}
        <g transform="translate(0 -1)">{mouth}</g>
        {glasses && <g fill="none" stroke="#1f2937" strokeWidth="3"><rect x="-30" y="3" width="25" height="19" rx="7" /><rect x="5" y="3" width="25" height="19" rx="7" /><path d="M -5 11 h 10" /></g>}
        </g>
        {mood === 'stress' && [0, 1, 2].map((i) => {
          const k = (t / 900 + i / 3) % 1;
          return <path key={i} d="M 0 -10 q 7 12 0 18 q -7 -6 0 -18 z" fill="#7dd3fc" opacity={1 - k} transform={`translate(${-66 + i * 66} ${-6 + k * 74})`} />;
        })}
      </g>
    </g>
  );
}

export function Desk({ x, y, w = 560, color = C.wood }: { x: number; y: number; w?: number; color?: string }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x={-w / 2} y="0" width={w} height="26" rx="8" fill={color} />
      <rect x={-w / 2 + 24} y="26" width="26" height="150" fill={C.woodDark} />
      <rect x={w / 2 - 50} y="26" width="26" height="150" fill={C.woodDark} />
    </g>
  );
}

/** A pile of papers with small, fixed tilts. */
export function Papers({ x, y, n, w = 120, spread = 6, color = '#fff' }: { x: number; y: number; n: number; w?: number; spread?: number; color?: string }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      {Array.from({ length: Math.max(0, Math.floor(n)) }).map((_, i) => (
        <g key={i} transform={`translate(${(rnd(i) - 0.5) * spread * 2} ${-i * 9}) rotate(${(rnd(i + 9) - 0.5) * spread * 2.2})`}>
          <rect x={-w / 2} y="-5" width={w} height="10" rx="2" fill={color} stroke="#cbd5e1" />
          <line x1={-w / 2 + 12} y1="0" x2={w / 2 - 20} y2="0" stroke="#cbd5e1" strokeWidth="2" />
        </g>
      ))}
    </g>
  );
}

export function Clock({ x, y, r = 46, hour = 9, minute = 0, spin = 0, color = '#fff' }: { x: number; y: number; r?: number; hour?: number; minute?: number; spin?: number; color?: string }) {
  const m = ((minute + spin) % 60) / 60 * 360, h = ((hour % 12) + (minute + spin) / 60) / 12 * 360;
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle r={r} fill={color} stroke={C.navy} strokeWidth="6" />
      {Array.from({ length: 12 }).map((_, i) => <line key={i} x1="0" y1={-r + 8} x2="0" y2={-r + (i % 3 === 0 ? 17 : 13)} stroke={C.navy} strokeWidth="3" transform={`rotate(${i * 30})`} />)}
      <line x1="0" y1="0" x2="0" y2={-r * 0.52} stroke={C.navy} strokeWidth="6" strokeLinecap="round" transform={`rotate(${h})`} />
      <line x1="0" y1="0" x2="0" y2={-r * 0.78} stroke={C.red} strokeWidth="4" strokeLinecap="round" transform={`rotate(${m})`} />
      <circle r="5" fill={C.navy} />
    </g>
  );
}

export function Sticky({ x, y, text, rot = 0, color = '#fde047', s = 1 }: { x: number; y: number; text: string; rot?: number; color?: string; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      <rect x="-46" y="-46" width="92" height="92" fill={color} rx="3" style={{ filter: 'drop-shadow(0 6px 8px rgb(15 23 42 / .25))' }} />
      <text textAnchor="middle" y="6" fontSize="22" fontWeight="800" fill={C.ink} fontFamily="Inter, sans-serif">{text}</text>
    </g>
  );
}

export function PhoneRing({ x, y, t, s = 1 }: { x: number; y: number; t: number; s?: number }) {
  const w = Math.sin(t / 45) * 6;
  return (
    <g transform={`translate(${x} ${y}) scale(${s}) rotate(${w})`}>
      <rect x="-26" y="-44" width="52" height="88" rx="10" fill={C.navy} />
      <rect x="-20" y="-36" width="40" height="64" rx="4" fill="#93c5fd" />
      <circle cx="0" cy="36" r="4" fill="#94a3b8" />
      {[0, 1, 2].map((i) => <path key={i} d={`M ${34 + i * 10} -18 q ${8 + i * 4} 18 0 36`} stroke={C.red} strokeWidth="4" fill="none" strokeLinecap="round" opacity={0.3 + 0.7 * ((Math.sin(t / 110 - i) + 1) / 2)} />)}
    </g>
  );
}

/** A speech bubble in HTML, positioned on the stage. */
export function Bubble({ x, y, text, o = 1, tone = 'light', w, tail = 'left' }: { x: number; y: number; text: string; o?: number; tone?: 'light' | 'red' | 'dark'; w?: number; tail?: 'left' | 'right' | 'down' }) {
  const bg = tone === 'red' ? '#fee2e2' : tone === 'dark' ? C.navy : '#ffffff';
  const fg = tone === 'red' ? '#991b1b' : tone === 'dark' ? '#fff' : C.ink;
  return (
    <div style={{ position: 'absolute', left: x, top: y, opacity: o, transform: `translateY(${(1 - o) * 10}px)`, width: w, whiteSpace: w ? 'normal' : 'nowrap', background: bg, color: fg, boxShadow: '0 10px 24px -12px rgb(15 23 42 / .5)', border: '1px solid rgb(15 23 42 / .08)' }} className="rounded-2xl px-4 py-2 text-[22px] font-bold leading-tight">
      {text}
      <span style={{ position: 'absolute', width: 16, height: 16, background: bg, transform: 'rotate(45deg)', ...(tail === 'left' ? { left: 18, bottom: -7 } : tail === 'right' ? { right: 18, bottom: -7 } : { left: '50%', bottom: -7, marginLeft: -8 }) }} />
    </div>
  );
}

/** A full-stage layer that can hold an SVG scene and HTML overlays. */
export function Stage({ children, bg = 'linear-gradient(180deg,#e8f1fb 0%,#f8fafc 100%)', style }: { children: ReactNode; bg?: string; style?: CSSProperties }) {
  return <div style={{ position: 'absolute', inset: 0, background: bg, overflow: 'hidden', ...style }}>{children}</div>;
}

export const Svg = ({ children }: { children: ReactNode }) => <svg viewBox="0 0 1280 720" width="1280" height="720" style={{ position: 'absolute', inset: 0 }}>{children}</svg>;

/** A rounded card for the digital scenes. */
export function Card({ x, y, w, h, children, o = 1, dy = 0, rot = 0, className = '', style }: { x: number; y: number; w: number; h?: number; children: ReactNode; o?: number; dy?: number; rot?: number; className?: string; style?: CSSProperties }) {
  return (
    <div className={`rounded-2xl bg-white ${className}`} style={{ position: 'absolute', left: x, top: y, width: w, height: h, opacity: o, transform: `translateY(${dy}px) rotate(${rot}deg)`, boxShadow: '0 24px 50px -24px rgb(15 23 42 / .45), 0 0 0 1px rgb(15 23 42 / .06)', ...style }}>{children}</div>
  );
}

/** A browser window frame in HTML. */
export function Browser({ x, y, w, h, url, children, o = 1, s = 1, dy = 0 }: { x: number; y: number; w: number; h: number; url: string; children: ReactNode; o?: number; s?: number; dy?: number }) {
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: w, height: h, opacity: o, transform: `translateY(${dy}px) scale(${s})`, transformOrigin: 'center', boxShadow: '0 40px 80px -36px rgb(15 23 42 / .5), 0 0 0 1px rgb(15 23 42 / .08)' }} className="overflow-hidden rounded-xl bg-white">
      <div className="flex h-8 items-center gap-2 border-b border-slate-200 bg-slate-50 px-3">
        <i className="h-2.5 w-2.5 rounded-full bg-rose-400" /><i className="h-2.5 w-2.5 rounded-full bg-amber-400" /><i className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
        <span className="mx-auto rounded-md bg-white px-3 py-0.5 text-[12px] text-slate-500 ring-1 ring-slate-200">{url}</span>
      </div>
      <div style={{ position: 'relative', height: h - 32 }}>{children}</div>
    </div>
  );
}

/** A phone frame in HTML. */
export function PhoneFrame({ x, y, w = 250, h = 500, children, o = 1, dy = 0, rot = 0 }: { x: number; y: number; w?: number; h?: number; children: ReactNode; o?: number; dy?: number; rot?: number }) {
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: w, height: h, opacity: o, transform: `translateY(${dy}px) rotate(${rot}deg)`, boxShadow: '0 40px 80px -34px rgb(15 23 42 / .6)' }} className="rounded-[38px] bg-slate-900 p-2.5">
      <div className="relative h-full w-full overflow-hidden rounded-[30px] bg-white">
        <span className="absolute left-1/2 top-2 z-10 h-4 w-20 -translate-x-1/2 rounded-full bg-slate-900" />
        <div className="h-full pt-8">{children}</div>
      </div>
    </div>
  );
}
