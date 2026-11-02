import {
  Award, Banknote, Bell, BookOpen, Building2, CalendarCheck, CalendarDays, Check, ChartColumn, ClipboardCheck, Clock, Crown, Database, EyeOff, FileStack, FileText, Globe, GraduationCap, Heart, History,
  KeyRound, Lock, Mail, MapPin, Moon, Palette, FileSpreadsheet, UserPlus, MessageSquare, Receipt, Search, ShieldCheck, Smartphone, Sparkles, Star, TriangleAlert, UserCheck, UserCog, Users, Wallet, type LucideIcon,
} from 'lucide-react';
import type { ReactNode } from 'react';
import { BRAND_LOGO_SRC } from '@/components/brand/BrandLogo';
import { appear, Bubble, Browser, Card, Clock as WallClock, clamp, Desk, easeInOut, easeOut, lerp, Papers, PhoneFrame, PhoneRing, Person, pop, rnd, Stage, Sticky, Svg } from '@/features/marketing/video/art';
import type { SceneVideoDef } from '@/features/marketing/video/SceneVideo';

/**
 * "Skool EdTech: the whole school, made simple": the 5-minute marketing film. A school administrator
 * drowning in paper work (the problem), then the product from admissions to scholarships, the security
 * behind it, how a school registers, and where to find us. Mostly illustrated, a few real screens.
 */

export const SITE_ADDRESS = 'ed-tech.anetcybersolution.com';
const NAVY_BG = 'linear-gradient(180deg,#0b1426 0%,#1f2f46 100%)';

const Chip = ({ icon: Icon, label, o = 1, dy = 0, tone = 'white' }: { icon: LucideIcon; label: string; o?: number; dy?: number; tone?: 'white' | 'red' | 'orange' | 'green' | 'navy' }) => {
  const tones = { white: 'bg-white text-slate-800', red: 'bg-red-600 text-white', orange: 'bg-orange-500 text-white', green: 'bg-emerald-600 text-white', navy: 'bg-[#1f2f46] text-white' };
  return (
    <div className={`flex items-center gap-3 rounded-2xl px-5 py-3 text-[26px] font-bold shadow-[0_18px_40px_-18px_rgb(15_23_42/0.5)] ${tones[tone]}`} style={{ opacity: o, transform: `translateY(${dy}px) scale(${0.9 + 0.1 * o})` }}>
      <Icon size={30} /> {label}
    </div>
  );
};

const at = (x: number, y: number, children: ReactNode, w?: number) => <div style={{ position: 'absolute', left: x, top: y, width: w }}>{children}</div>;

/** A real screen in a browser frame, drifting in toward a focus point. */
function ShotView({ id, t, d, url, focus = [0, 0, 1440, 900], from = 1, x = 130, y = 44, w = 1020 }: { id: string; t: number; d: number; url: string; focus?: [number, number, number, number]; from?: number; x?: number; y?: number; w?: number }) {
  const k = w / 1440;
  const h = Math.round(900 * k * 0.9);
  const p = easeInOut(t / Math.max(1500, d - 600));
  const zoom = lerp(from, Math.min(2.2, 1000 / focus[2]), p);
  const cx = (focus[0] + focus[2] / 2) * k, cy = (focus[1] + focus[3] / 2) * k;
  return (
    <Browser x={x} y={y} w={w} h={h + 32} url={url} o={appear(t, 0, 500)} dy={(1 - appear(t, 0, 600)) * 26}>
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
        <img src={`/guide/screens/${id}.jpg`} alt="" style={{ width: w, transformOrigin: `${cx}px ${cy}px`, transform: `scale(${zoom})`, display: 'block' }} />
      </div>
    </Browser>
  );
}

// --- Act 1: the problem -----------------------------------------------------------------------------

const Office = ({ t, d }: { t: number; d: number }) => {
  const n = clamp(2 + t / 380, 2, 17);
  const notes: [number, number, string, number][] = [[170, 120, 'Fees?', -6], [300, 95, 'Result?', 5], [430, 150, 'Leave!', -3], [990, 100, 'Forms!', 6], [1070, 205, 'Call!', -5]];
  return (
    <Stage bg="linear-gradient(180deg,#fef3c7 0%,#fff7ed 60%,#fde68a 100%)">
      <Svg>
        <rect x="760" y="60" width="150" height="140" rx="8" fill="#bae6fd" stroke="#94a3b8" strokeWidth="8" /><line x1="835" y1="60" x2="835" y2="200" stroke="#94a3b8" strokeWidth="6" /><line x1="760" y1="130" x2="910" y2="130" stroke="#94a3b8" strokeWidth="6" />
        <WallClock x={1180} y={120} spin={t / 55} hour={9} />
        {notes.map(([x, y, tx, r], i) => <g key={tx} opacity={appear(t, 900 + i * 700)} transform={`translate(0 ${(1 - appear(t, 900 + i * 700)) * -40})`}><Sticky x={x} y={y} text={tx} rot={r} s={0.9} /></g>)}
        <Papers x={330} y={470} n={n} spread={18} /><Papers x={950} y={470} n={n * 0.8} spread={18} /><Papers x={470} y={470} n={n * 0.5} spread={10} />
        <Person x={640} y={205} s={1} mood="stress" arms="head" t={t} glasses mustache tie />
        <Desk x={640} y={470} w={760} />
        <PhoneRing x={190} y={430} t={t} /><PhoneRing x={1090} y={430} t={t + 200} />
      </Svg>
      {at(70, 560, <Bubble x={0} y={0} text="Admission forms!" o={appear(t, 1200)} tone="red" />)}
      {at(830, 580, <Bubble x={0} y={0} text="Fee registers!" o={appear(t, 3200)} tone="red" tail="right" />)}
      <div style={{ position: 'absolute', left: 0, right: 0, top: 24, textAlign: 'center', opacity: appear(t, 100, 600) * (1 - appear(t, d - 700, 500)) }} className="text-[22px] font-bold uppercase tracking-[0.25em] text-orange-700">Monday, 8:00 AM</div>
    </Stage>
  );
};

const Fees = ({ t }: { t: number }) => (
  <Stage bg="linear-gradient(180deg,#e0e7ff 0%,#f1f5f9 100%)">
    <Svg>
      {[0, 1, 2, 3, 4].map((i) => (
        <g key={i} transform={`translate(${250 + (i % 2) * 14} ${470 - i * 34}) rotate(${(rnd(i) - 0.5) * 6})`} opacity={appear(t, 200 + i * 350)}>
          <rect x="-150" y="-17" width="300" height="34" rx="5" fill={['#1e3a8a', '#9f1239', '#065f46', '#92400e', '#4c1d95'][i]} /><rect x="-150" y="-17" width="26" height="34" fill="rgb(255 255 255 / .25)" />
        </g>
      ))}
      <Papers x={960} y={470} n={6 + t / 700} spread={14} />
      <Person x={640} y={205} s={1} mood="stress" arms="down" t={t} glasses mustache tie />
      <Desk x={640} y={470} w={760} />
      <rect x="560" y="440" width="76" height="30" rx="6" fill="#334155" /><rect x="568" y="446" width="60" height="8" rx="2" fill="#86efac" />
    </Svg>
    {[['Rs ???', 220, 130, 0], ['Paid?', 960, 170, 1], ['Unpaid?', 1060, 330, 2], ['Rs ???', 130, 330, 3], ['Overdue?', 420, 90, 4]].map(([tx, x, y, i]) => (
      <div key={String(tx) + String(i)} style={{ position: 'absolute', left: Number(x), top: Number(y) + Math.sin(t / 600 + Number(i)) * 10, opacity: appear(t, 500 + Number(i) * 700) }} className="rounded-xl bg-white px-4 py-2 text-[30px] font-extrabold text-red-600 shadow-lg">{tx}</div>
    ))}
  </Stage>
);

const Lost = ({ t }: { t: number }) => (
  <Stage bg="linear-gradient(180deg,#fee2e2 0%,#fff7ed 100%)">
    <Svg>
      {Array.from({ length: 16 }).map((_, i) => {
        const sp = 0.05 + rnd(i) * 0.1;
        const x = ((rnd(i + 3) * 1500 + t * sp) % 1500) - 100;
        const y = 120 + rnd(i + 7) * 420 + Math.sin(t / 500 + i) * 40;
        return <g key={i} transform={`translate(${x} ${y}) rotate(${t / 6 * (rnd(i + 1) - 0.5) + i * 20})`}><rect x="-34" y="-44" width="68" height="88" rx="4" fill="#fff" stroke="#cbd5e1" strokeWidth="2" /><line x1="-20" y1="-24" x2="20" y2="-24" stroke="#cbd5e1" strokeWidth="3" /><line x1="-20" y1="-10" x2="20" y2="-10" stroke="#cbd5e1" strokeWidth="3" /></g>;
      })}
      <Person x={640} y={235} s={1} mood="angry" arms="up" t={t} glasses mustache tie />
      <Desk x={640} y={500} w={760} />
    </Svg>
    <div style={{ position: 'absolute', left: 520, top: 50, opacity: pop(t, 600), transform: `scale(${pop(t, 600)})` }} className="text-[110px] font-black text-red-600">?!</div>
    <Bubble x={820} y={170} text="Where is her file?" o={appear(t, 1800)} tone="red" tail="left" />
    <Bubble x={170} y={190} text="Sir, my leave letter…" o={appear(t, 3800)} tail="right" />
  </Stage>
);

const Parents = ({ t }: { t: number }) => {
  const cols = ['#0ea5e9', '#a855f7', '#10b981'];
  const says = ['Where is the result?', 'I need a fee receipt!', 'My child’s certificate?'];
  return (
    <Stage bg="linear-gradient(180deg,#ecfeff 0%,#f8fafc 100%)">
      <Svg>
        <rect x="760" y="380" width="520" height="340" fill="#cbd5e1" /><rect x="760" y="380" width="520" height="22" fill="#94a3b8" />
        <rect x="800" y="120" width="440" height="270" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="8" rx="10" />
        <Person x={1020} y={260} s={0.62} mood="stress" arms="desk" t={t} tie glasses mustache shirt="#475569" />
        <rect x="760" y="372" width="520" height="30" fill="#64748b" />
        {cols.map((c, i) => <Person key={c} x={170 + i * 210} y={400} s={0.6} mood="angry" arms="up" t={t + i * 90} shirt={c} hair={['#1f2937', '#7c2d12', '#111827'][i]} female={i === 1} skin={['#f1c9a5', '#d9a679', '#f5d5b8'][i]} />)}
        <rect x="0" y="650" width="760" height="70" fill="#e2e8f0" />
      </Svg>
      {says.map((s, i) => at(60 + i * 210, 170 + (i % 2) * 40, <Bubble x={0} y={0} text={s} o={appear(t, 700 + i * 1300)} tone="red" w={200} tail="left" />))}
    </Stage>
  );
};

const Night = ({ t }: { t: number }) => (
  <Stage bg={NAVY_BG}>
    <Svg>
      {Array.from({ length: 40 }).map((_, i) => <circle key={i} cx={rnd(i) * 1280} cy={rnd(i + 20) * 380} r={1 + rnd(i + 9) * 2} fill="#fff" opacity={0.4 + 0.6 * Math.abs(Math.sin(t / 700 + i))} />)}
      <circle cx="1080" cy="110" r="52" fill="#fde68a" /><circle cx="1100" cy="98" r="46" fill="#1f2f46" opacity=".35" />
      <WallClock x={220} y={140} hour={10} minute={5} color="#e2e8f0" />
      <ellipse cx="640" cy="440" rx="420" ry="200" fill="#fde68a" opacity=".12" />
      <Papers x={400} y={520} n={12} spread={16} color="#e2e8f0" /><Papers x={900} y={520} n={9} spread={16} color="#e2e8f0" />
      <Person x={640} y={235} s={1} mood="tired" arms="desk" t={t} shirt="#64748b" />
      <Desk x={640} y={500} w={760} color="#78350f" />
      <path d="M 790 500 l 40 -120 l 60 20 l -36 100 z" fill="#fbbf24" /><circle cx="860" cy="396" r="12" fill="#fef08a" />
    </Svg>
    {[0, 1, 2].map((i) => <div key={i} style={{ position: 'absolute', left: 700 + i * 36, top: 130 - i * 38 - ((t / 14 + i * 40) % 40), opacity: appear(t, 1800 + i * 500) * 0.8 }} className="text-[40px] font-black text-sky-200">z</div>)}
    <div style={{ position: 'absolute', left: 0, right: 0, top: 36, textAlign: 'center', opacity: appear(t, 300, 600) }} className="text-[24px] font-bold uppercase tracking-[0.3em] text-sky-200">10:05 PM · still working</div>
  </Stage>
);

const Problem = ({ t, d }: { t: number; d: number }) => {
  const flip = easeInOut((t - (d - 2600)) / 1200);
  const chips: [LucideIcon, string][] = [[FileStack, 'Paper work'], [Clock, 'Delays'], [TriangleAlert, 'Mistakes'], [EyeOff, 'No full picture']];
  return (
    <Stage bg={`linear-gradient(135deg, ${flip > 0.5 ? '#fff7ed' : '#7f1d1d'} 0%, ${flip > 0.5 ? '#e0f2fe' : '#1f2937'} 100%)`} style={{ transition: 'background 0.6s' }}>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 110, textAlign: 'center', opacity: 1 - flip }} className="text-[56px] font-black text-white">Every school faces this</div>
      <div style={{ position: 'absolute', left: 190, top: 260, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28, opacity: 1 - flip }}>
        {chips.map(([Icon, l], i) => <div key={l} style={{ width: 410 }}><Chip icon={Icon} label={l} tone="red" o={pop(t, 500 + i * 650)} /></div>)}
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 270, textAlign: 'center', opacity: flip, transform: `scale(${0.92 + 0.08 * flip})` }}>
        <Sparkles size={64} className="mx-auto text-orange-500" />
        <div className="mt-4 text-[72px] font-black text-slate-900">There is a better way.</div>
      </div>
    </Stage>
  );
};

// --- Act 2: the solution ----------------------------------------------------------------------------

const Intro = ({ t }: { t: number }) => (
  <Stage bg="linear-gradient(135deg,#eef3fb 0%,#f8fafc 50%,#fdf1e6 100%)">
    <div style={{ position: 'absolute', left: 0, right: 0, top: 60, display: 'flex', justifyContent: 'center', opacity: appear(t, 200, 700), transform: `scale(${0.9 + 0.1 * pop(t, 200, 700)})` }}><img src={BRAND_LOGO_SRC} alt="" width={400} style={{ borderRadius: 28, boxShadow: '0 30px 60px -30px rgb(15 23 42 / .5)' }} /></div>
    <div style={{ position: 'absolute', left: 0, right: 0, top: 545, textAlign: 'center', opacity: appear(t, 1400, 700) }} className="text-[46px] font-extrabold text-slate-800">Your whole school. Digital. Secure. Simple.</div>
  </Stage>
);

const MODULES: [LucideIcon, string][] = [
  [Users, 'Admissions'], [GraduationCap, 'Students'], [UserCog, 'Staff'], [CalendarCheck, 'Attendance'], [CalendarDays, 'Timetable'], [Wallet, 'Fees'],
  [ClipboardCheck, 'Exams'], [BookOpen, 'Learning'], [Banknote, 'Payroll'], [MessageSquare, 'Messages'], [Globe, 'Website'], [ChartColumn, 'Reports'],
];
const Hub = ({ t }: { t: number }) => (
  <Stage bg="linear-gradient(135deg,#eef3fb 0%,#f8fafc 60%,#fdf1e6 100%)">
    <Svg>
      {MODULES.map((_, i) => { const a = (i / 12) * Math.PI * 2 - Math.PI / 2; return <line key={i} x1="640" y1="360" x2={640 + Math.cos(a) * 270 * 1.45} y2={360 + Math.sin(a) * 270} stroke="#94a3b8" strokeWidth="2.5" strokeDasharray="6 8" opacity={appear(t, 500 + i * 220)} />; })}
    </Svg>
    <div style={{ position: 'absolute', left: 540, top: 270, width: 200, height: 180, transform: `scale(${pop(t, 100)})` }} className="flex flex-col items-center justify-center rounded-3xl bg-[#1f2f46] text-white shadow-2xl">
      <Building2 size={56} className="text-orange-400" /><div className="mt-2 text-[28px] font-extrabold">Your school</div>
    </div>
    {MODULES.map(([Icon, label], i) => {
      const a = (i / 12) * Math.PI * 2 - Math.PI / 2;
      const o = pop(t, 500 + i * 220);
      return (
        <div key={label} style={{ position: 'absolute', left: 640 + Math.cos(a) * 270 * 1.45 - 80, top: 360 + Math.sin(a) * 270 - 30, width: 160, transform: `scale(${o}) translateY(${Math.sin(t / 700 + i) * 4}px)` }} className="flex items-center justify-center gap-2 rounded-2xl bg-white px-3 py-2.5 text-[21px] font-bold text-slate-800 shadow-[0_14px_30px_-16px_rgb(15_23_42/0.5)]">
          <Icon size={22} className="text-orange-500" /> {label}
        </div>
      );
    })}
  </Stage>
);

const DashShot = ({ t, d }: { t: number; d: number }) => (
  <Stage bg="linear-gradient(135deg,#e8eff9 0%,#f6f8fc 50%,#fdf1e6 100%)">
    <ShotView id="a-dash" t={t} d={d} url={`${SITE_ADDRESS}/demo/admin`} focus={[292, 100, 1110, 520]} />
  </Stage>
);

const Admissions = ({ t }: { t: number }) => {
  const stages = ['Applied', 'Documents', 'Interview', 'Enrolled'];
  const k = clamp((t - 2600) / 3600) * 3;
  return (
    <Stage bg="linear-gradient(135deg,#eef3fb 0%,#f8fafc 100%)">
      <Browser x={60} y={90} w={470} h={420} url="your-school.skooledtech.com/apply" o={appear(t, 100)}>
        <div className="p-5">
          <div className="text-[26px] font-extrabold text-slate-800">Apply online</div>
          {['Student name', 'Class applying for', 'Parent phone', 'B-Form copy'].map((f, i) => (
            <div key={f} className="mt-3"><div className="text-[14px] font-bold uppercase tracking-wider text-slate-500">{f}</div><div className="mt-1 h-9 overflow-hidden rounded-lg border border-slate-300 bg-slate-50"><div className="h-full bg-orange-200" style={{ width: `${clamp((t - 600 - i * 500) / 700) * 80}%` }} /></div></div>
          ))}
          <div className="mt-4 rounded-xl bg-orange-500 py-2 text-center text-[20px] font-bold text-white" style={{ transform: `scale(${1 + 0.05 * Math.sin(t / 150) * (t > 2600 ? 0 : 1)})` }}>Send</div>
        </div>
      </Browser>
      <div style={{ position: 'absolute', left: 560, top: 290, opacity: appear(t, 2300) }}><div className="text-[60px] text-orange-500">➜</div></div>
      <div style={{ position: 'absolute', left: 640, top: 150, display: 'grid', gridTemplateColumns: 'repeat(4, 140px)', gap: 12, opacity: appear(t, 2400) }}>
        {stages.map((s, i) => <div key={s} className={`rounded-xl px-3 py-2 text-center text-[19px] font-bold ${k >= i ? 'bg-emerald-600 text-white' : 'bg-white text-slate-500'} shadow`}>{s}</div>)}
      </div>
      <Card x={640} y={240} w={570} h={150} o={appear(t, 2600)} className="p-5">
        <div className="flex items-center gap-4"><div className="flex h-14 w-14 items-center justify-center rounded-full bg-orange-100 text-[26px] font-black text-orange-700">H</div><div><div className="text-[26px] font-extrabold text-slate-800">Hania Khan</div><div className="text-[18px] text-slate-500">Grade 3 · Application APP-2026-0001</div></div></div>
        <div className="mt-4 h-3 rounded-full bg-slate-200"><div className="h-3 rounded-full bg-orange-500" style={{ width: `${(k / 3) * 100}%` }} /></div>
      </Card>
      <div style={{ position: 'absolute', left: 640, top: 430, display: 'flex', gap: 14 }}>
        <Chip icon={GraduationCap} label="Student record" tone="green" o={appear(t, 6400)} dy={(1 - appear(t, 6400)) * 20} />
        <Chip icon={KeyRound} label="Parent login" tone="green" o={appear(t, 7000)} dy={(1 - appear(t, 7000)) * 20} />
      </div>
    </Stage>
  );
};

const Attendance = ({ t }: { t: number }) => (
  <Stage bg="linear-gradient(135deg,#ecfdf5 0%,#f8fafc 100%)">
    <PhoneFrame x={120} y={80} w={270} h={540} o={appear(t, 100)} dy={(1 - appear(t, 100)) * 30}>
      <div className="relative h-full bg-[#e8eef5]">
        <div style={{ position: 'absolute', left: 55, top: 150, width: 140, height: 140, borderRadius: '50%', border: '3px dashed #10b981', background: 'rgb(16 185 129 / .12)', transform: `scale(${1 + 0.06 * Math.sin(t / 300)})` }} />
        <MapPin size={44} className="absolute text-orange-600" style={{ left: 103, top: 190 }} />
        <div className="absolute inset-x-4 bottom-4 rounded-xl py-3 text-center text-[20px] font-bold text-white" style={{ background: t > 1800 ? '#16a34a' : '#f97316' }}>{t > 1800 ? '✓ Checked in · 7:52 AM' : 'Check in'}</div>
      </div>
    </PhoneFrame>
    <Card x={450} y={110} w={720} h={470} o={appear(t, 600)} className="p-6">
      <div className="text-[26px] font-extrabold text-slate-800">Class 5-B · Today</div>
      {['Ali Raza', 'Sara Ahmed', 'Hamza Tariq', 'Zainab Khan', 'Omar Farooq', 'Maryam Iqbal'].map((n, i) => {
        const o = appear(t, 1500 + i * 450); const absent = i === 2 || i === 4;
        return <div key={n} className="mt-3 flex items-center justify-between rounded-xl bg-slate-50 px-4 py-2 text-[22px] font-semibold text-slate-700" style={{ opacity: o }}><span>{n}</span><span className={`rounded-full px-4 py-0.5 text-[18px] font-bold text-white ${absent ? 'bg-red-500' : 'bg-emerald-500'}`}>{absent ? 'Absent' : 'Present'}</span></div>;
      })}
    </Card>
  </Stage>
);

const FeesScene = ({ t }: { t: number }) => (
  <Stage bg="linear-gradient(135deg,#fff7ed 0%,#f8fafc 100%)">
    {[0, 1, 2, 3, 4].map((i) => <Card key={i} x={90 + i * 22} y={110 + i * 62} w={380} h={74} o={appear(t, 200 + i * 350)} dy={(1 - appear(t, 200 + i * 350)) * -30} className="flex items-center justify-between px-5"><span className="text-[22px] font-bold text-slate-700">INV-2026-00{430 + i}</span><span className="text-[22px] font-extrabold text-slate-900">PKR 6,000</span></Card>)}
    <div style={{ position: 'absolute', left: 80, top: 80, opacity: appear(t, 300) }} className="rounded-full bg-orange-500 px-4 py-1 text-[20px] font-bold text-white">Generate invoices · 1 click</div>
    <div style={{ position: 'absolute', left: 540, top: 270, opacity: appear(t, 2700) }} className="text-[60px] text-orange-500">➜</div>
    <Card x={620} y={150} w={330} h={400} o={appear(t, 3200)} dy={(1 - appear(t, 3200)) * 40} className="p-5">
      <Receipt size={40} className="text-orange-500" /><div className="mt-2 text-[28px] font-extrabold text-slate-800">Receipt</div>
      <div className="mt-4 space-y-2 text-[20px] text-slate-600"><div className="flex justify-between"><span>Tuition</span><span>5,000</span></div><div className="flex justify-between"><span>Exam fee</span><span>1,000</span></div><div className="mt-3 flex justify-between border-t pt-3 text-[26px] font-extrabold text-slate-900"><span>Paid</span><span>PKR 6,000</span></div></div>
      <div className="mt-5 rounded-xl bg-emerald-600 py-2 text-center text-[22px] font-bold text-white" style={{ opacity: appear(t, 4200) }}>✓ Received</div>
    </Card>
    <PhoneFrame x={1000} y={110} w={230} h={460} o={appear(t, 4800)} dy={(1 - appear(t, 4800)) * 40}>
      <div className="p-3"><div className="rounded-xl bg-emerald-50 p-3 text-[18px] font-bold text-emerald-800" style={{ transform: `translateY(${(1 - appear(t, 5400)) * -40}px)`, opacity: appear(t, 5400) }}><Bell size={20} className="mb-1 inline text-emerald-600" /> Fee received<div className="text-[16px] font-medium">PKR 6,000 · thank you</div></div><div className="mt-3 rounded-xl bg-amber-50 p-3 text-[17px] font-bold text-amber-800" style={{ opacity: appear(t, 6400) }}>Reminder · September fee due soon</div></div>
    </PhoneFrame>
  </Stage>
);

const Exams = ({ t }: { t: number }) => (
  <Stage bg="linear-gradient(135deg,#eef2ff 0%,#f8fafc 100%)">
    <Card x={80} y={120} w={540} h={440} o={appear(t, 100)} className="p-6">
      <div className="text-[26px] font-extrabold text-slate-800">Enter marks · Mid-term · Maths</div>
      {['Ali Raza', 'Sara Ahmed', 'Hamza Tariq', 'Zainab Khan', 'Omar Farooq'].map((n, i) => <div key={n} className="mt-3 flex items-center justify-between rounded-xl bg-slate-50 px-4 py-2 text-[22px] font-semibold text-slate-700"><span>{n}</span><span className="rounded-lg bg-white px-4 py-0.5 font-mono text-[22px] shadow-inner">{Math.round(lerp(0, [88, 92, 71, 95, 64][i]!, clamp((t - 700 - i * 500) / 600)))}</span></div>)}
    </Card>
    <div style={{ position: 'absolute', left: 650, top: 300, opacity: appear(t, 3400) }} className="text-[60px] text-orange-500">➜</div>
    <Card x={740} y={90} w={440} h={520} o={appear(t, 3800)} dy={(1 - appear(t, 3800)) * 40} className="p-6 text-center">
      <GraduationCap size={44} className="mx-auto text-orange-500" /><div className="text-[24px] font-extrabold text-slate-800">Report card</div>
      <div className="mt-3 text-[110px] font-black leading-none text-emerald-600" style={{ transform: `scale(${pop(t, 4400)})` }}>A</div>
      <div className="mt-2 text-[24px] font-bold text-slate-600">Position 1 · 92%</div>
      <div className="mt-5 flex h-28 items-end justify-center gap-3">{[70, 88, 92, 80, 95].map((h, i) => <div key={i} className="w-12 rounded-t-lg bg-orange-400" style={{ height: `${h * clamp((t - 4800 - i * 250) / 500)}%` }} />)}</div>
    </Card>
  </Stage>
);

const Learning = ({ t }: { t: number }) => (
  <Stage bg="linear-gradient(135deg,#f0fdf4 0%,#f8fafc 100%)">
    <Card x={90} y={150} w={400} h={300} o={appear(t, 100)} className="p-6"><BookOpen size={40} className="text-orange-500" /><div className="mt-2 text-[28px] font-extrabold text-slate-800">Assignment</div><div className="text-[22px] text-slate-600">Fractions · due Friday</div><div className="mt-4 rounded-lg bg-orange-50 p-3 text-[19px] font-semibold text-orange-700">+ Material attached</div></Card>
    <div style={{ position: 'absolute', left: 520 + clamp((t - 1200) / 1500) * 60, top: 250, opacity: appear(t, 1000) }} className="text-[70px] text-orange-500">➜</div>
    <PhoneFrame x={640} y={90} w={250} h={500} o={appear(t, 1800)} dy={(1 - appear(t, 1800)) * 40}>
      <div className="p-4"><div className="rounded-xl bg-orange-50 p-3 text-[19px] font-bold text-slate-800">Fractions<div className="text-[15px] font-medium text-slate-500">Due Friday</div></div><div className="mt-3 rounded-xl bg-emerald-600 py-2 text-center text-[19px] font-bold text-white" style={{ opacity: appear(t, 3400) }}>✓ Submitted</div></div>
    </PhoneFrame>
    <Card x={940} y={200} w={260} h={190} o={appear(t, 5200)} dy={(1 - appear(t, 5200)) * 30} className="p-5 text-center"><div className="text-[20px] font-bold text-slate-500">Graded</div><div className="text-[74px] font-black text-emerald-600" style={{ transform: `scale(${pop(t, 5500)})` }}>18/20</div></Card>
  </Stage>
);

const Payroll = ({ t }: { t: number }) => (
  <Stage bg="linear-gradient(135deg,#faf5ff 0%,#f8fafc 100%)">
    <Card x={150} y={100} w={470} h={520} o={appear(t, 100)} className="p-7">
      <div className="text-[22px] font-bold uppercase tracking-widest text-slate-500">Payslip · October</div>
      <div className="mt-2 text-[32px] font-extrabold text-slate-800">Faisal Qureshi</div>
      <div className="mt-6 space-y-2 text-[22px] text-slate-600">{[['Basic', 65000], ['Allowances', 12000], ['Deductions', -4200]].map(([l, v], i) => <div key={String(l)} className="flex justify-between" style={{ opacity: appear(t, 800 + i * 500) }}><span>{l}</span><span>{Number(v).toLocaleString()}</span></div>)}</div>
      <div className="mt-5 border-t pt-4 text-[22px] font-bold text-slate-500">Net pay</div>
      <div className="text-[56px] font-black text-slate-900">PKR {Math.round(lerp(0, 72800, easeOut((t - 2200) / 1200))).toLocaleString()}</div>
    </Card>
    <div className="absolute flex flex-col gap-5" style={{ left: 720, top: 160 }}>
      <Chip icon={CalendarCheck} label="Attendance counted automatically" o={appear(t, 3000)} dy={(1 - appear(t, 3000)) * 20} />
      <Chip icon={Crown} label="Approved by the principal" tone="green" o={appear(t, 4400)} dy={(1 - appear(t, 4400)) * 20} />
      <Chip icon={Lock} label="Bank details stay private" tone="navy" o={appear(t, 5800)} dy={(1 - appear(t, 5800)) * 20} />
    </div>
  </Stage>
);

const ROLES: [LucideIcon, string, string][] = [
  [Crown, 'Principal', 'Approvals and growth'], [UserCog, 'Administrator', 'Runs the school'], [Banknote, 'Accountant', 'Fees and payroll'],
  [GraduationCap, 'Teacher', 'Classes and marks'], [Users, 'Parent', 'Child, fees, results'], [UserCheck, 'Student', 'Timetable and homework'],
];
const Roles = ({ t }: { t: number }) => (
  <Stage bg="linear-gradient(135deg,#eef3fb 0%,#f8fafc 60%,#fdf1e6 100%)">
    <div style={{ position: 'absolute', left: 0, right: 0, top: 50, textAlign: 'center', opacity: appear(t, 100) }} className="text-[44px] font-extrabold text-slate-800">A dashboard for everyone</div>
    <div style={{ position: 'absolute', left: 150, top: 150, display: 'grid', gridTemplateColumns: 'repeat(3, 320px)', gap: 26 }}>
      {ROLES.map(([Icon, n, s], i) => { const o = pop(t, 600 + i * 600); return (
        <div key={n} style={{ transform: `scale(${o}) rotateY(${(1 - clamp(o)) * 40}deg)`, opacity: clamp(o) }} className="rounded-2xl bg-white p-6 text-center shadow-[0_24px_50px_-24px_rgb(15_23_42/0.45)]">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-500 text-white"><Icon size={34} /></span>
          <div className="mt-3 text-[30px] font-extrabold text-slate-800">{n}</div><div className="text-[20px] text-slate-500">{s}</div>
        </div>); })}
    </div>
    <div style={{ position: 'absolute', left: 0, right: 0, top: 590, textAlign: 'center', opacity: appear(t, 4600) }}><span className="inline-flex items-center gap-2 rounded-full bg-[#1f2f46] px-6 py-2.5 text-[24px] font-bold text-white"><Crown size={22} className="text-orange-400" /> Directors, vice principals and more · on paid plans</span></div>
  </Stage>
);

const Scholarships = ({ t }: { t: number }) => {
  const rows: [string, number, number, boolean][] = [['Mahnoor Raza', 90, 85, true], ['Sufyan Ali', 87, 70, true], ['Hamdan Sheikh', 81, 70, true], ['Zoya Abbasi', 60, 20, false], ['Sameen Gondal', 55, 15, false]];
  return (
    <Stage bg="linear-gradient(135deg,#fffbeb 0%,#f8fafc 100%)">
      <Card x={70} y={80} w={780} h={520} o={appear(t, 100)} className="p-6">
        <div className="flex items-center gap-3 text-[26px] font-extrabold text-slate-800"><Award size={30} className="text-orange-500" /> Scholarship candidates · from live data</div>
        {rows.map(([n, m, nd, ok], i) => { const hi = ok && t > 3200 + i * 400; return (
          <div key={n} className={`mt-3 flex items-center gap-4 rounded-xl px-4 py-2.5 ${hi ? 'bg-amber-50 ring-2 ring-amber-400' : 'bg-slate-50'}`} style={{ opacity: appear(t, 500 + i * 350) }}>
            <span className="w-56 text-[22px] font-bold text-slate-700">{n}</span>
            <div className="flex-1"><div className="h-2.5 rounded-full bg-slate-200"><div className="h-2.5 rounded-full bg-sky-500" style={{ width: `${m * clamp((t - 900 - i * 300) / 700)}%` }} /></div><div className="mt-1.5 h-2.5 rounded-full bg-slate-200"><div className="h-2.5 rounded-full bg-orange-500" style={{ width: `${nd * clamp((t - 1000 - i * 300) / 700)}%` }} /></div></div>
            {hi && <Star size={26} className="fill-amber-400 text-amber-500" />}
          </div>); })}
        <div className="mt-3 flex gap-5 text-[16px] font-bold text-slate-500"><span className="text-sky-600">■ Merit</span><span className="text-orange-600">■ Need</span></div>
      </Card>
      <div className="absolute flex flex-col gap-5" style={{ left: 890, top: 150 }}>
        <Chip icon={Heart} label="A sponsor funds it" o={appear(t, 5200)} dy={(1 - appear(t, 5200)) * 20} tone="orange" />
        <Chip icon={Check} label="You confirm the names" o={appear(t, 6600)} dy={(1 - appear(t, 6600)) * 20} tone="green" />
      </div>
    </Stage>
  );
};

const Complaints = ({ t }: { t: number }) => (
  <Stage bg="linear-gradient(135deg,#fef2f2 0%,#f8fafc 100%)">
    <Card x={80} y={110} w={520} h={340} o={appear(t, 100)} className="p-6">
      <div className="flex items-center gap-3 text-[26px] font-extrabold text-slate-800"><EyeOff size={28} className="text-slate-500" /> Complaint · Anonymous</div>
      <div className="mt-3 text-[24px] font-bold text-slate-700">Van arrives late every morning</div>
      <div className="mt-2 text-[20px] text-slate-500">Our children reach school after the bell almost every day this month…</div>
      <div className="mt-4 inline-block rounded-full bg-slate-100 px-4 py-1 text-[18px] font-bold text-slate-600">Handlers never see the name</div>
    </Card>
    <div style={{ position: 'absolute', left: 640, top: 150 }} className="space-y-4">
      <div className="text-[22px] font-bold uppercase tracking-widest text-slate-500" style={{ opacity: appear(t, 1800) }}>Send to</div>
      {['Principal and admin', 'A teacher', 'Parents of a class'].map((l, i) => <div key={l} className={`rounded-xl px-5 py-3 text-[24px] font-bold ${i === 0 && t > 3600 ? 'bg-orange-500 text-white' : 'bg-white text-slate-700'} shadow`} style={{ opacity: appear(t, 2100 + i * 500), width: 400 }}>{l}</div>)}
    </div>
    <div style={{ position: 'absolute', left: 80, top: 500 }}><Chip icon={Check} label="Resolved · the complainant is told" tone="green" o={appear(t, 5400)} dy={(1 - appear(t, 5400)) * 20} /></div>
    <div style={{ position: 'absolute', left: 700, top: 500 }}><Chip icon={Crown} label="Principal sees what is open" tone="navy" o={appear(t, 7000)} dy={(1 - appear(t, 7000)) * 20} /></div>
  </Stage>
);

const FormsGrowth = ({ t }: { t: number }) => {
  const parts: [number, string][] = [[57, '#f97316'], [37, '#475569'], [6, '#cbd5e1']];
  let acc = 0;
  const arcs = parts.map(([v, c]) => { const a0 = acc; acc += v; return { c, a0: (a0 / 100) * Math.PI * 2 - Math.PI / 2, a1: ((a0 + v * clamp((t - 3600) / 1800)) / 100) * Math.PI * 2 - Math.PI / 2 }; });
  const arc = (a0: number, a1: number) => `M 0 0 L ${Math.cos(a0) * 120} ${Math.sin(a0) * 120} A 120 120 0 ${a1 - a0 > Math.PI ? 1 : 0} 1 ${Math.cos(a1) * 120} ${Math.sin(a1) * 120} Z`;
  return (
    <Stage bg="linear-gradient(135deg,#f5f3ff 0%,#f8fafc 100%)">
      <Card x={70} y={90} w={560} h={520} o={appear(t, 100)} className="p-6">
        <div className="text-[26px] font-extrabold text-slate-800">Design your own forms</div>
        {['Student name · Text', 'Date of birth · Date', 'Blood group · Choice', 'B-Form copy · Document upload', 'Father’s CNIC · Text'].map((f, i) => <div key={f} className={`mt-3 rounded-xl border px-4 py-3 text-[21px] font-semibold ${i === 3 ? 'border-orange-400 bg-orange-50 text-orange-800' : 'border-slate-200 bg-slate-50 text-slate-700'}`} style={{ opacity: appear(t, 700 + i * 450), transform: `translateX(${(1 - appear(t, 700 + i * 450)) * -30}px)` }}>{f}</div>)}
      </Card>
      <Card x={680} y={90} w={530} h={520} o={appear(t, 3000)} className="p-6">
        <div className="text-[26px] font-extrabold text-slate-800">Growth report</div>
        <svg viewBox="-150 -150 300 300" width="300" height="300" style={{ margin: '10px auto 0', display: 'block' }}>{arcs.map((a, i) => a.a1 > a.a0 + 0.001 && <path key={i} d={arc(a.a0, a.a1)} fill={a.c} stroke="#fff" strokeWidth="3" />)}</svg>
        <div className="mt-2 space-y-1 text-[19px] font-semibold text-slate-600" style={{ opacity: appear(t, 5400) }}><div><span className="text-orange-500">■</span> Salaries paid</div><div><span className="text-slate-600">■</span> Salary shortfall</div><div><span className="text-slate-300">■</span> Owed by families</div></div>
      </Card>
    </Stage>
  );
};

const Website = ({ t }: { t: number }) => (
  <Stage bg="linear-gradient(135deg,#eef3fb 0%,#f8fafc 100%)">
    <Browser x={110} y={60} w={820} h={560} url="your-school.skooledtech.com" o={appear(t, 100)}>
      <div className="h-full p-0">
        <div className="bg-[#2f3e52] px-8 py-8 text-white"><div className="text-[16px] uppercase tracking-widest text-orange-300">Welcome to</div><div className="text-[40px] font-extrabold">Greenfield Public School</div><div className="mt-3 inline-block rounded-lg bg-orange-500 px-5 py-2 text-[20px] font-bold" style={{ transform: `scale(${1 + 0.05 * Math.sin(t / 250)})` }}>Apply now</div></div>
        <div className="grid grid-cols-3 gap-3 p-5">{[0, 1, 2].map((i) => <div key={i} className="h-28 rounded-xl" style={{ background: ['#fdba74', '#93c5fd', '#86efac'][i], opacity: appear(t, 900 + i * 400) }} />)}</div>
        <div className="mx-5 rounded-xl bg-slate-50 p-4 text-[20px] font-bold text-slate-700" style={{ opacity: appear(t, 2400) }}>Careers · Science teacher · Apply online</div>
      </div>
    </Browser>
    <div className="absolute flex flex-col gap-5" style={{ left: 980, top: 150 }}>
      <Chip icon={Globe} label="Built from your data" o={appear(t, 1400)} dy={(1 - appear(t, 1400)) * 20} />
      <Chip icon={FileText} label="Online admission" o={appear(t, 2600)} dy={(1 - appear(t, 2600)) * 20} />
      <Chip icon={CalendarDays} label="Events and posts" o={appear(t, 3800)} dy={(1 - appear(t, 3800)) * 20} />
    </div>
  </Stage>
);

const Live = ({ t }: { t: number }) => (
  <Stage bg="linear-gradient(135deg,#eef3fb 0%,#f8fafc 100%)">
    <div className="absolute space-y-4" style={{ left: 110, top: 120 }}>
      {[['Leave approved', 'Casual leave · 2 days', Check], ['Fee received', 'PKR 5,200 · Zara Hassan', Wallet], ['Results published', 'Mid-term examination', Award]].map(([a, b, Icon], i) => {
        const I = Icon as LucideIcon; const o = appear(t, 300 + i * 900);
        return <div key={String(a)} className="flex w-[480px] items-center gap-4 rounded-2xl bg-white p-5 shadow-[0_20px_44px_-22px_rgb(15_23_42/0.5)]" style={{ opacity: o, transform: `translateX(${(1 - o) * 120}px)` }}><span className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100 text-orange-600"><I size={26} /></span><div><div className="text-[24px] font-extrabold text-slate-800">{String(a)}</div><div className="text-[19px] text-slate-500">{String(b)}</div></div></div>;
      })}
    </div>
    <Card x={680} y={150} w={470} h={290} o={appear(t, 3200)} dy={(1 - appear(t, 3200)) * 30} className="p-6">
      <div className="flex items-center gap-2 text-[22px] font-extrabold text-slate-800"><Sparkles size={22} className="text-orange-500" /> Welcome to your school</div>
      <div className="mt-3 text-[20px] leading-snug text-slate-600">This is your admin dashboard. We will show you, in order, what to set up first. It takes about a minute.</div>
      <div className="mt-6 flex justify-end"><span className="rounded-lg bg-orange-500 px-5 py-2 text-[20px] font-bold text-white" style={{ transform: `scale(${1 + 0.06 * Math.sin(t / 200)})` }}>Next →</span></div>
    </Card>
    <div style={{ position: 'absolute', left: 680, top: 470, opacity: appear(t, 4600) }} className="text-[28px] font-bold text-slate-700">A guided tour for every new user</div>
  </Stage>
);


const PERKS: [LucideIcon, string][] = [
  [FileSpreadsheet, 'Excel import and export'], [Palette, 'Your colour and logo'], [Globe, 'Your own domain'], [Building2, 'Several campuses'], [MapPin, 'GPS attendance'],
  [FileText, 'Online document requests'], [UserPlus, 'Hiring and careers'], [ClipboardCheck, 'Staff tasks'], [Moon, 'Dark mode'], [Bell, 'Live notifications'],
];
const Perks = ({ t }: { t: number }) => (
  <Stage bg="linear-gradient(135deg,#fff7ed 0%,#f8fafc 60%,#eef3fb 100%)">
    <div style={{ position: 'absolute', left: 0, right: 0, top: 44, textAlign: 'center', opacity: appear(t, 100) }} className="text-[44px] font-extrabold text-slate-800">And much more, included</div>
    <div style={{ position: 'absolute', left: 130, top: 150, display: 'grid', gridTemplateColumns: 'repeat(2, 500px)', gap: 18 }}>
      {PERKS.map(([Icon, l], i) => <div key={l} style={{ opacity: appear(t, 500 + i * 450), transform: `translateX(${(1 - appear(t, 500 + i * 450)) * (i % 2 ? 40 : -40)}px)` }} className="flex items-center gap-4 rounded-2xl bg-white px-5 py-4 text-[26px] font-bold text-slate-800 shadow-[0_18px_40px_-22px_rgb(15_23_42/0.5)]"><span className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500 text-white"><Icon size={26} /></span>{l}</div>)}
    </div>
  </Stage>
);

const SECURITY: [LucideIcon, string][] = [[Database, 'Every school’s data kept separate'], [Mail, 'Owner sign-in with an emailed code'], [Lock, 'Wrong passwords lock the account'], [KeyRound, 'Passwords stored encrypted'], [History, 'Every important action is logged'], [Database, 'Daily backups']];
const Security = ({ t }: { t: number }) => (
  <Stage bg={NAVY_BG}>
    <div style={{ position: 'absolute', left: 140, top: 190, transform: `scale(${0.85 + 0.15 * pop(t, 100)}) rotate(${Math.sin(t / 900) * 2}deg)` }}><ShieldCheck size={330} className="text-orange-400" strokeWidth={1.2} /></div>
    <div className="absolute space-y-3" style={{ left: 560, top: 100 }}>
      {SECURITY.map(([Icon, l], i) => <div key={l} className="flex w-[640px] items-center gap-4 rounded-2xl bg-white/10 px-5 py-3.5 text-[27px] font-bold text-white ring-1 ring-white/15" style={{ opacity: appear(t, 600 + i * 800), transform: `translateX(${(1 - appear(t, 600 + i * 800)) * 60}px)` }}><span className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-500"><Icon size={24} /></span>{l}</div>)}
    </div>
  </Stage>
);

const Register = ({ t }: { t: number }) => {
  const steps: [LucideIcon, string, string][] = [[Smartphone, 'Verify', 'email and phone'], [FileText, 'Apply', 'online, in minutes'], [Search, 'We check', 'CNIC, NTN and school'], [Mail, 'Approved', 'login by email']];
  return (
    <Stage bg="linear-gradient(135deg,#eef3fb 0%,#f8fafc 60%,#fdf1e6 100%)">
      <div style={{ position: 'absolute', left: 0, right: 0, top: 70, textAlign: 'center', opacity: appear(t, 100) }} className="text-[44px] font-extrabold text-slate-800">Only genuine schools get in</div>
      <div style={{ position: 'absolute', left: 90, top: 220, display: 'flex', gap: 22, alignItems: 'center' }}>
        {steps.map(([Icon, a, b], i) => <div key={a} className="flex items-center gap-4"><div className="w-[240px] rounded-2xl bg-white p-6 text-center shadow-[0_24px_50px_-24px_rgb(15_23_42/0.45)]" style={{ opacity: appear(t, 600 + i * 1300), transform: `translateY(${(1 - appear(t, 600 + i * 1300)) * 30}px)` }}><span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-500 text-white"><Icon size={34} /></span><div className="mt-3 text-[30px] font-extrabold text-slate-800">{a}</div><div className="text-[19px] text-slate-500">{b}</div></div>{i < 3 && <span className="text-[44px] text-orange-400" style={{ opacity: appear(t, 1200 + i * 1300) }}>➜</span>}</div>)}
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 520, textAlign: 'center', opacity: appear(t, 6000) }}><span className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-6 py-2.5 text-[26px] font-bold text-white"><Check size={26} /> Nothing is created until our team approves</span></div>
    </Stage>
  );
};

const Happy = ({ t }: { t: number }) => (
  <Stage bg="linear-gradient(180deg,#fff7ed 0%,#fef3c7 55%,#fde68a 100%)">
    <Svg>
      <circle cx="1130" cy="110" r="60" fill="#fde047" opacity=".9" />
      <rect x="800" y="70" width="150" height="140" rx="8" fill="#bae6fd" stroke="#94a3b8" strokeWidth="8" />
      <WallClock x={220} y={130} hour={3} minute={0} />
      <Person x={560} y={215} s={1} mood="happy" arms="up" t={t} tie glasses mustache />
      <Desk x={560} y={480} w={700} />
      <rect x="470" y="430" width="150" height="50" rx="6" fill="#334155" /><rect x="480" y="436" width="130" height="38" rx="3" fill="#93c5fd" />
      <Person x={1010} y={420} s={0.5} mood="happy" arms="up" t={t + 200} shirt="#f97316" female hair="#1f2937" kid />
      <Person x={1150} y={440} s={0.45} mood="happy" arms="up" t={t + 500} shirt="#10b981" kid />
    </Svg>
    <Bubble x={820} y={250} text="Thank you, sir!" o={appear(t, 1800)} w={260} tail="right" />
    <div style={{ position: 'absolute', left: 60, top: 290, opacity: appear(t, 1000) }} className="rounded-2xl bg-white px-5 py-3 text-[28px] font-extrabold text-emerald-700 shadow-lg">3:00 PM · home on time</div>
  </Stage>
);

const Reach = ({ t }: { t: number }) => {
  const typed = 'Skool EdTech'.slice(0, Math.floor(clamp((t - 600) / 1100) * 12));
  return (
    <Stage bg={NAVY_BG}>
      <div style={{ position: 'absolute', left: 240, top: 120, width: 800, opacity: appear(t, 100) }}>
        <div className="flex items-center gap-3 rounded-full bg-white px-6 py-4 text-[32px] font-semibold text-slate-800 shadow-2xl"><Search size={30} className="text-slate-400" /> {typed}<span style={{ opacity: Math.sin(t / 250) > 0 ? 1 : 0 }}>|</span></div>
      </div>
      <Card x={240} y={260} w={800} h={170} o={appear(t, 2200)} dy={(1 - appear(t, 2200)) * 30} className="p-6">
        <div className="text-[34px] font-extrabold text-[#1a56db]">Skool EdTech · School management</div>
        <div className="mt-1 text-[24px] font-semibold text-emerald-700">https://{SITE_ADDRESS}</div>
        <div className="mt-1 text-[20px] text-slate-500">Admissions, fees, exams, payroll, learning and more. Register your school.</div>
      </Card>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 460, textAlign: 'center', opacity: appear(t, 3600) }}><span className="inline-block rounded-2xl bg-orange-500 px-12 py-5 text-[44px] font-black text-white shadow-2xl" style={{ transform: `scale(${1 + 0.05 * Math.sin(t / 220)})` }}>Register · Free trial</span></div>
      <div className="absolute flex justify-center gap-4" style={{ left: 0, right: 0, top: 580, opacity: appear(t, 4800) }}>
        <Chip icon={ShieldCheck} label="Verified schools" tone="navy" /><Chip icon={Sparkles} label="Free trial" tone="navy" />
      </div>
    </Stage>
  );
};

const End = ({ t }: { t: number }) => (
  <Stage bg="linear-gradient(135deg,#eef3fb 0%,#f8fafc 50%,#fdf1e6 100%)">
    <div style={{ position: 'absolute', left: 0, right: 0, top: 60, display: 'flex', justifyContent: 'center', opacity: appear(t, 100, 700) }}><img src={BRAND_LOGO_SRC} alt="" width={340} style={{ borderRadius: 26, boxShadow: '0 30px 60px -30px rgb(15 23 42 / .5)' }} /></div>
    <div style={{ position: 'absolute', left: 0, right: 0, top: 480, textAlign: 'center', opacity: appear(t, 900) }} className="text-[44px] font-extrabold text-slate-800">Your school, made simple.</div>
    <div style={{ position: 'absolute', left: 0, right: 0, top: 540, textAlign: 'center', opacity: appear(t, 1800) }} className="text-[26px] font-semibold text-slate-600">https://{SITE_ADDRESS} · Role guides below</div>
  </Stage>
);

export const MASTER: SceneVideoDef = {
  id: 'master',
  title: 'Skool EdTech: your whole school, made simple',
  scenes: [
    { say: 'Meet Mr. Khan. He runs a school, and this is his morning. Admission forms in piles. Fee registers that never match. Phones ringing from the first bell.', cap: 'Meet Mr. Khan, a school administrator', min: 9000, render: (c) => <Office {...c} /> },
    { say: 'By noon, nobody is sure who has paid, and who has not. One missing page, and the whole month’s accounts are wrong.', cap: 'Who has paid? Nobody is sure', render: (c) => <Fees {...c} /> },
    { say: 'Somewhere in all this paper, a student’s file is lost. A teacher is waiting for a leave letter. And a parent is waiting for an answer.', cap: 'Lost files, waiting teachers, waiting parents', render: (c) => <Lost {...c} /> },
    { say: 'Parents queue at the office for results, receipts, and certificates. Every question needs a trip to the cupboard.', cap: 'Every question means a queue', render: (c) => <Parents {...c} /> },
    { say: 'And when school ends, the paper work comes home with him. Late nights, silly mistakes, and no time left for what really matters: the students.', cap: 'The paper work comes home too', render: (c) => <Night {...c} /> },
    { say: 'Paper work. Delays. Mistakes. And nobody has the full picture. Sound familiar? There is a better way.', cap: 'There is a better way', min: 8500, render: (c) => <Problem {...c} /> },
    { say: 'Meet Skool EdTech. A complete school management system, built for schools like yours. Everything digital, in one safe place.', cap: 'Skool EdTech · everything digital, in one safe place', render: (c) => <Intro {...c} /> },
    { say: 'Admissions, students, staff, attendance, timetables, fees, exams, payroll, learning, messages, and your own school website. All connected, so nothing is entered twice.', cap: 'All connected, so nothing is entered twice', min: 8500, render: (c) => <Hub {...c} /> },
    { say: 'The administrator sees the whole school at a glance: students, staff, fees, and the classes running right now.', cap: 'The whole school at a glance', shots: ['a-dash'], render: (c) => <DashShot {...c} /> },
    { say: 'Admissions go online. Parents apply on your school’s own website. You check the documents, set the interview, and enrol with one click, creating the student record and the parent’s login together.', cap: 'Online admissions: enrol with one click', min: 9000, render: (c) => <Admissions {...c} /> },
    { say: 'Teachers take attendance on their phone, and staff check in from the campus with GPS. Absent and late are flagged at once, and the month’s attendance flows straight into payroll.', cap: 'Attendance and GPS check-in', render: (c) => <Attendance {...c} /> },
    { say: 'Fees become simple. Generate a month’s invoices in one click. Record payments, print receipts, and see who is overdue. Parents get reminders on their phones.', cap: 'Fees: invoices, receipts and reminders', min: 8500, render: (c) => <FeesScene {...c} /> },
    { say: 'Teachers enter marks once. Results, positions and report cards are built for you, and parents see them the moment you publish.', cap: 'Marks, results and report cards', min: 8000, render: (c) => <Exams {...c} /> },
    { say: 'Learning goes digital too. Teachers share material and assignments, students hand in online, and the marks come back graded.', cap: 'Homework and learning, online', min: 8000, render: (c) => <Learning {...c} /> },
    { say: 'Payroll runs every month with approvals. Salary slips and bank details stay private, and every change leaves a record.', cap: 'Payroll with approvals', render: (c) => <Payroll {...c} /> },
    { say: 'Everybody gets their own dashboard. The principal, administrator, accountant, teacher, parent and student each see exactly what they need, and nothing more.', cap: 'A dashboard for everyone', min: 8500, render: (c) => <Roles {...c} /> },
    { say: 'Now, something special. Sponsors can fund scholarships, and your own marks, attendance and fee records find the students who truly deserve them. You choose who is put forward, and nothing is shared until you confirm.', cap: 'Scholarships and sponsors', min: 9500, render: (c) => <Scholarships {...c} /> },
    { say: 'Parents, students and staff can raise a complaint, even anonymously, and choose who should hear it. The right person answers, and the principal always sees what is still open.', cap: 'Complaints, handled safely', min: 9000, render: (c) => <Complaints {...c} /> },
    { say: 'Design your own forms with any field you need, even document uploads. And the principal gets a growth report, a clear picture of fees collected, salaries paid, and what is still owed.', cap: 'Your own forms, and a growth report', min: 9500, render: (c) => <FormsGrowth {...c} /> },
    { say: 'Your school also gets its own public website, built from your data, with online admission, job applications, a photo gallery, and events.', cap: 'Your own school website', min: 8000, render: (c) => <Website {...c} /> },
    { say: 'Approvals, results and receipts arrive live, and a friendly guided tour shows every new user around. Nobody needs training.', cap: 'Live updates and a guided tour', min: 8000, render: (c) => <Live {...c} /> },
    { say: 'And much more, included for every school: import and export with Excel, your own colour and logo, your own web address, several campuses, GPS attendance, online document requests, hiring, staff tasks, dark mode, and live notifications.', cap: 'And much more, included', min: 11000, render: (c) => <Perks {...c} /> },
    { say: 'And all of it is secure. Every school’s data is kept completely separate. Owners sign in with a code sent to their email, wrong passwords lock the account, passwords are stored encrypted, and every important action is logged. Daily backups keep everything safe.', cap: 'Secure by design', min: 10000, render: (c) => <Security {...c} /> },
    { say: 'Only genuine schools get in. You apply online, verify your email and phone, and our team checks your details by hand. Once approved, your school is created, and your login arrives by email.', cap: 'Verified registration', min: 9000, render: (c) => <Register {...c} /> },
    { say: 'And Mr. Khan? His desk is clear, his records are safe, and at three in the afternoon, he goes home on time.', cap: 'Home on time', render: (c) => <Happy {...c} /> },
    { say: 'Ready? Search for Skool EdTech and open our website. Choose Register, and apply for your free trial.', cap: 'Search Skool EdTech · Register · Free trial', min: 7500, render: (c) => <Reach {...c} /> },
    { say: 'Below this video, you will find a short guide for every role: how to register, then the administrator, principal, teacher, accountant, student and parent. Watch yours, and begin. Skool EdTech. Your school, made simple.', cap: 'Role guides below', min: 9000, render: (c) => <End {...c} /> },
  ],
};
