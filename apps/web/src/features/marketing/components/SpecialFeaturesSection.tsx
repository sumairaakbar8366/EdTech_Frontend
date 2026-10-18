import { BellRing, Check, FileSpreadsheet, FileText, Globe, KeyRound, Landmark, MapPin, Palette, type LucideIcon } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useEffect, useState, type ReactNode } from 'react';
import { SectionHeading } from '@/features/marketing/components/Reveal';

interface Special {
  key: string;
  icon: LucideIcon;
  title: string;
  text: string;
  points: string[];
  visual: () => ReactNode;
}

const Frame = ({ children, label }: { children: ReactNode; label: string }) => (
  <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg dark:border-white/10 dark:bg-[#171e29]">
    <div className="flex items-center gap-1.5 border-b border-slate-200 bg-slate-50 px-3 py-2 dark:border-white/10 dark:bg-white/5">
      <span className="h-2.5 w-2.5 rounded-full bg-rose-400" /><span className="h-2.5 w-2.5 rounded-full bg-amber-400" /><span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
      <span className="ml-3 truncate rounded bg-white px-2 py-0.5 font-mono text-[11px] text-slate-500 dark:bg-white/10 dark:text-slate-300">{label}</span>
    </div>
    <div className="p-5">{children}</div>
  </div>
);

const SPECIALS: Special[] = [
  {
    key: 'website', icon: Globe, title: 'A website for every school, built automatically',
    text: 'The moment a school joins, it gets a public website made from its own data: classes, campuses, teachers, open jobs. The admin adds texts and photos; parents apply online.',
    points: ['Online admission form → straight into Admissions', 'Careers page with online job applications', 'Photo gallery: campus, students, functions', 'Free subdomain; own domain as a yearly add-on'],
    visual: () => (
      <Frame label="ed-tech.anetcybersolution.com/greenfield">
        <div className="rounded-lg bg-[#2f3e52] p-4 text-white"><div className="text-xs uppercase tracking-widest text-orange-300">Welcome to</div><div className="text-xl font-extrabold">Greenfield School</div><div className="mt-2 inline-block rounded bg-orange-500 px-2.5 py-1 text-xs font-bold">Apply for admission</div></div>
        <div className="mt-3 grid grid-cols-3 gap-2">{[0, 1, 2].map((i) => <motion.div key={i} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 + i * 0.15 }} className="aspect-[4/3] rounded-md bg-linear-to-br from-slate-200 to-slate-300 dark:from-white/10 dark:to-white/5" />)}</div>
      </Frame>
    ),
  },
  {
    key: 'theme', icon: Palette, title: 'Your colours, your logo',
    text: 'Each school brands the portal and its website with its own theme colour and logo, so parents and staff feel at home.',
    points: ['Pick any colour; buttons and accents follow', 'Logo on sign-in, website and documents', 'Light and dark mode for every user'],
    visual: () => {
      const colours = ['#ea580c', '#1e3a8a', '#047857', '#9f1239'];
      return (
        <Frame label="Settings · Branding">
          <div className="flex gap-3">{colours.map((c, i) => <motion.span key={c} animate={{ scale: [1, 1.15, 1] }} transition={{ delay: i * 0.6, duration: 0.6, repeat: Infinity, repeatDelay: 1.8 }} className="h-10 w-10 rounded-full ring-2 ring-white shadow" style={{ background: c }} />)}</div>
          <motion.div animate={{ backgroundColor: colours }} transition={{ duration: 6, repeat: Infinity }} className="mt-4 rounded-lg px-4 py-2.5 text-center text-sm font-bold text-white">Save changes</motion.div>
        </Frame>
      );
    },
  },
  {
    key: 'gps', icon: MapPin, title: 'GPS staff attendance',
    text: 'Teachers and staff check in from their phone. The school’s campus area is drawn once; check-ins outside it are flagged for the office to review.',
    points: ['One-tap check-in and check-out', 'Location checked against the campus geofence', 'Flagged check-ins go to a review queue', 'Monthly attendance feeds payroll'],
    visual: () => (
      <Frame label="Staff check-in">
        <div className="relative mx-auto flex h-36 items-center justify-center overflow-hidden rounded-lg bg-[#e8eef5] dark:bg-white/5">
          <motion.span animate={{ scale: [0.6, 1.6], opacity: [0.5, 0] }} transition={{ duration: 1.8, repeat: Infinity }} className="absolute h-24 w-24 rounded-full bg-emerald-400" />
          <span className="absolute h-28 w-28 rounded-full border-2 border-dashed border-emerald-500/60" />
          <MapPin className="relative text-orange-600" size={30} />
        </div>
        <div className="mt-3 flex items-center justify-between text-sm"><span className="font-semibold">Checked in 07:46</span><span className="rounded bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-700">Inside campus</span></div>
      </Frame>
    ),
  },
  {
    key: 'requests', icon: FileText, title: 'Online document requests',
    text: 'Parents and students request marksheets, character or leaving certificates from their dashboard. The office processes each one step by step, and families get notified at every step.',
    points: ['Request → in process → ready → handed over', 'Digital copies downloadable from the portal', 'Every step recorded with time and note'],
    visual: () => (
      <Frame label="Document requests">
        {['Submitted', 'In process', 'Ready for collection'].map((s, i) => (
          <motion.div key={s} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 + i * 0.35 }} className="flex items-center gap-3 border-l-2 border-orange-400 py-2 pl-3">
            <span className={`h-2.5 w-2.5 rounded-full ${i === 2 ? 'bg-orange-500' : 'bg-slate-300'}`} /><span className="text-sm font-semibold">{s}</span><span className="ml-auto text-xs text-slate-400">Oct {7 + i}</span>
          </motion.div>
        ))}
      </Frame>
    ),
  },
  {
    key: 'access', icon: KeyRound, title: 'Secure access, handed out in a click',
    text: 'The admin gives any teacher, staff member, parent or student a login on their own email. They get their User ID and a temporary password by email, and set their own password at first sign-in.',
    points: ['Roles, status and filters in one place', 'Reset passwords and disable logins instantly', 'No passwords stored where anyone can read them'],
    visual: () => (
      <Frame label="Users & Access">
        <div className="rounded-lg bg-slate-50 p-3 font-mono text-sm dark:bg-white/5"><div className="text-slate-500">Temporary password</div><motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="text-lg font-bold tracking-wider">Kp7m-Qx4t-Rv9w</motion.div></div>
        <div className="mt-3 flex gap-2 text-xs">{['Teacher', 'Parent', 'Accounts'].map((r) => <span key={r} className="rounded bg-slate-100 px-2 py-1 font-semibold text-slate-600 dark:bg-white/10 dark:text-slate-300">{r}</span>)}</div>
      </Frame>
    ),
  },
  {
    key: 'excel', icon: FileSpreadsheet, title: 'Bring your data in from Excel',
    text: 'Moving from registers or spreadsheets? Import students with parents, staff, classes, fee payments and more. Every row is checked before anything is saved.',
    points: ['Excel and CSV templates for each list', 'Siblings linked automatically by parent phone', 'Export any list to Excel in one click'],
    visual: () => (
      <Frame label="Import students.xlsx">
        {[['Ayesha Khan', 'Ready'], ['Ali Raza', 'Ready'], ['Bad row', 'Date of birth missing']].map(([n, s], i) => (
          <motion.div key={n} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 + i * 0.25 }} className="flex justify-between border-b border-slate-100 py-1.5 text-sm last:border-0 dark:border-white/5"><span>{n}</span><span className={i === 2 ? 'text-rose-600' : 'text-emerald-600'}>{i === 2 ? s : <><Check size={14} className="inline" /> {s}</>}</span></motion.div>
        ))}
      </Frame>
    ),
  },
  {
    key: 'payroll', icon: Landmark, title: 'Payroll straight to staff bank accounts',
    text: 'Staff submit their bank account from their dashboard; finance verifies it. Every salary payment records the account it went to, and changes need a request with a reason.',
    points: ['Approval workflow for account changes', 'Payslips show where salary was paid', 'Export bank transfer lists'],
    visual: () => (
      <Frame label="Salary · October">
        <div className="flex items-center justify-between"><div><div className="text-xs text-slate-500">Net pay</div><div className="text-2xl font-extrabold">PKR 72,800</div></div><span className="rounded bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-700">Paid</span></div>
        <div className="mt-3 rounded bg-slate-50 px-3 py-2 text-sm dark:bg-white/5">Meezan Bank · Faisal Qureshi · ****6702</div>
      </Frame>
    ),
  },
  {
    key: 'live', icon: BellRing, title: 'Everyone stays in the loop, live',
    text: 'Approvals, results, fee receipts and requests pop up for the right person within seconds, and screens refresh on their own.',
    points: ['Leave approved → teacher sees it instantly', 'Payment recorded → parent notified', 'Direct messages between school and parents'],
    visual: () => (
      <Frame label="Notifications">
        {['Leave approved · Casual leave', 'Fee received · PKR 5,200', 'Mid-term results published'].map((t, i) => (
          <motion.div key={t} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.5 }} className="mb-2 flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-sm dark:border-white/10"><BellRing size={14} className="text-orange-500" /> {t}</motion.div>
        ))}
      </Frame>
    ),
  },
];

/** "What makes us different": auto-advancing showcase of the special modules with live previews. */
export function SpecialFeaturesSection() {
  const reduce = useReducedMotion();
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (reduce || paused) return;
    const t = setInterval(() => setI((x) => (x + 1) % SPECIALS.length), 6000);
    return () => clearInterval(t);
  }, [reduce, paused]);
  const s = SPECIALS[i]!;
  return (
    <section id="special" className="relative border-y border-slate-200 bg-white py-16 sm:py-20 dark:border-white/5 dark:bg-[#0f141c]">
      <div className="mx-auto max-w-7xl px-4 sm:px-8">
        <SectionHeading kicker="What makes us different" title="Built for how Pakistani schools really work" text="Beyond the usual modules: the things that save the office hours every week and make parents trust you." />
        <div className="mt-10 grid gap-8 lg:grid-cols-[0.9fr_1.1fr]" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
          <ul className="space-y-1.5">
            {SPECIALS.map((f, idx) => {
              const active = idx === i;
              const Icon = f.icon;
              return (
                <li key={f.key}>
                  <button onClick={() => setI(idx)} className={`relative flex w-full items-center gap-3 overflow-hidden rounded-xl px-4 py-3 text-left transition-colors ${active ? 'bg-[#2f3e52] text-white' : 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-white/5'}`}>
                    <Icon size={18} className={active ? 'text-orange-300' : 'text-slate-400'} />
                    <span className="font-semibold">{f.title}</span>
                    {active && !reduce && !paused && <motion.span key={`bar-${i}`} initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ duration: 6, ease: 'linear' }} className="absolute bottom-0 left-0 h-0.5 bg-orange-400" />}
                  </button>
                </li>
              );
            })}
          </ul>
          <AnimatePresence mode="wait">
            <motion.div key={s.key} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.35 }} className="grid gap-6 rounded-2xl bg-slate-50 p-6 sm:p-8 dark:bg-white/3 md:grid-cols-2">
              <div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{s.title}</h3>
                <p className="mt-3 leading-7 text-slate-600 dark:text-slate-300">{s.text}</p>
                <ul className="mt-4 space-y-2">{s.points.map((p) => <li key={p} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-200"><Check size={16} className="mt-0.5 shrink-0 text-orange-500" /> {p}</li>)}</ul>
              </div>
              <div className="self-center">{s.visual()}</div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
