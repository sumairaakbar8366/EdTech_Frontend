import { GraduationCap, KeyRound, Mail, ShieldCheck, Sparkles } from 'lucide-react';
import { useEffect, useRef, useState, type FormEvent, type InputHTMLAttributes } from 'react';
import type { CSSProperties } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { Backdrop } from '@/components/effects/Backdrop';
import { SlideShow } from '@/components/motion/SlideShow';
import { SplitText } from '@/components/motion/SplitText';
import { Hero3D } from '@/components/effects/Hero3D';
import { ThemeToggle } from '@/components/shared/ThemeToggle';
import { Alert, Button, Field, Modal, useFieldProps } from '@/components/ui';
import { ApiError } from '@/services/api/http';
import { marketingOrigin, photo } from '@/config/site';
import { useAuth } from '@/features/auth/AuthProvider';
import { userAreas } from '@/app/router/SchoolRoutes';
import { type Me, type Tenant } from '@/types/session';

function IconInput({ icon: Icon, ...props }: InputHTMLAttributes<HTMLInputElement> & { icon: typeof Mail }) {
  const fieldProps = useFieldProps();
  return (
    <div className="relative">
      <Icon size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
      <input
        {...fieldProps}
        className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-3.5 text-base text-slate-900 shadow-[inset_0_1px_2px_rgb(15_23_42/0.06)] outline-none transition focus:border-primary-400 focus:ring-4 focus:ring-primary-500/15 dark:border-white/10 dark:bg-slate-950/50 dark:text-white"
        {...props}
      />
    </div>
  );
}

/** Rotating headline on the sign-in panel. */
const PITCH = [
  { key: 'one-place', title: 'Run your whole school', accent: 'in one place.', text: 'Admissions, academics, attendance, fees, payroll and learning, for every campus and every role.' },
  { key: 'roles', title: 'A dashboard for', accent: 'every role.', text: 'Administrators, accounts, teachers, staff, students and parents each see their own day.' },
  { key: 'secure', title: 'Every school,', accent: 'fully isolated.', text: 'Your school has its own secure address, and its data never mixes with anyone else’s.' },
];

const LOGIN_PHOTOS = [
  ['happy-students', 'Students'],
  ['teacher-whiteboard', 'Teachers'],
  ['campus-autumn', 'Campuses'],
] as const;

const FEATURES = [
  { icon: ShieldCheck, text: 'Isolated & secure per school' },
  { icon: Sparkles, text: 'Role-based dashboards' },
];

/** Where a user lands after signing in: their highest role's area, or the platform dashboard. */
function homePath(me: Me): string {
  return me.scope === 'platform' ? '/dashboard' : `/${userAreas(me)[0] ?? ''}`;
}

export function LoginPage({ tenant }: { tenant: Tenant }) {
  const { me, login, logout } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [remember, setRemember] = useState(false);
  const [forgot, setForgot] = useState(false);

  // The sign-in page always starts fresh (the school address and /login both open it): an earlier
  // session in this browser is signed out, so whoever signs in next lands on their own dashboard.
  const cleared = useRef(false);
  const justSignedIn = useRef(false);
  useEffect(() => {
    if (me && !cleared.current && !justSignedIn.current) {
      cleared.current = true;
      void logout();
    }
  }, [me, logout]);

  const isPlatform = tenant.kind === 'platform';
  const heading = isPlatform ? 'Platform Console' : tenant.school.name;
  const logo = tenant.kind === 'school' ? tenant.school.branding?.logoUrl : null;
  const brandColor = tenant.kind === 'school' ? tenant.school.branding?.primaryColor : null;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      justSignedIn.current = true;
      const signedIn = await login(email, password, remember);
      navigate(homePath(signedIn), { replace: true });
    } catch (err) {
      justSignedIn.current = false;
      setError(
        err instanceof ApiError && err.status === 429
          ? 'Too many attempts. Please wait a minute and try again.'
          : err instanceof ApiError && err.status < 500
            ? err.message
            : 'Something went wrong. Please try again.',
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="relative grid min-h-dvh lg:grid-cols-2" style={brandColor ? { '--brand-primary': brandColor } as CSSProperties : undefined}>
      <Backdrop />

      {/* 3D hero */}
      <div className="relative hidden flex-col justify-start overflow-hidden p-10 lg:flex">
        <div className="flex items-center gap-3">
          <span className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-brand text-white shadow-glow">
            <span className="absolute inset-x-0 top-0 h-1/2 rounded-2xl bg-linear-to-b from-white/40 to-transparent" />
            <GraduationCap size={22} className="relative" />
          </span>
          <span><span className="block font-display text-xl font-bold uppercase tracking-wide text-slate-900 dark:text-white">Anet Cyber Solutions</span><span className="block text-xs font-semibold uppercase text-magenta-600 dark:text-magenta-300">SchoolERP</span></span>
        </div>
        <div className="relative z-10 my-auto mx-auto max-w-md lg:translate-x-6 xl:translate-x-12">
          <SlideShow
            tone="dark"
            label="Why SchoolERP"
            slides={PITCH.map((p) => ({
              key: p.key,
              content: (
                <div className="perspective-[700px]">
                  <h2 className="font-display text-5xl font-bold uppercase leading-none tracking-wide text-slate-900 dark:text-white">
                    <SplitText text={p.title} /> <span className="text-brand"><SplitText text={p.accent} delay={0.25} /></span>
                  </h2>
                  <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mt-3 min-h-[3.5rem] text-lg text-slate-600 dark:text-slate-300">
                    {p.text}
                  </motion.p>
                </div>
              ),
            }))}
          />
          <div className="mt-5 grid grid-cols-3 gap-3">
            {LOGIN_PHOTOS.map(([name, caption]) => (
              <figure key={name} className="overflow-hidden rounded-lg bg-white shadow-depth-2 dark:bg-white/5">
                <img {...photo(name)} sizes="200px" alt="" loading="lazy" className="aspect-[4/3] w-full object-cover" />
                <figcaption className="px-2 py-1 text-center text-sm font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">{caption}</figcaption>
              </figure>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-2 text-sm font-semibold text-slate-600 dark:text-slate-300">
            {FEATURES.map(({ icon: Icon, text }) => (
              <span key={text} className="surface inline-flex items-center gap-1.5 rounded-full px-3 py-1.5">
                <Icon size={14} className="text-primary-500" /> {text}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="relative flex items-center justify-center p-4 sm:p-8 lg:-translate-x-6 xl:-translate-x-12">
        <div className="absolute right-4 top-4">
          <ThemeToggle />
        </div>
        <div className="w-full max-w-md">
          <motion.form initial={{ opacity: 0, y: 30, rotateX: -12 }} animate={{ opacity: 1, y: 0, rotateX: 0 }} transition={{ duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }} style={{ transformPerspective: 1000 }} onSubmit={onSubmit} className="login-form-panel surface relative isolate overflow-hidden space-y-5 rounded-2xl p-8 shadow-depth-3">
            <div aria-hidden className="pointer-events-none absolute -inset-[24%] z-0 opacity-[0.12] dark:opacity-[0.16]">
              <Hero3D variant="login" />
            </div>
            <div className="relative z-10 space-y-5">
            <div className="text-center">
              {logo ? (
                <img src={logo} alt="" className="mx-auto mb-4 h-14 w-14 rounded-2xl object-contain" />
              ) : null}
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-magenta-600 dark:text-magenta-300">{isPlatform ? 'Anet Cyber Solutions' : 'Welcome back'}</p>
              <h1 className="mt-1 text-3xl font-bold uppercase tracking-wide text-slate-900 dark:text-white">{heading}</h1>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Sign in to continue</p>
            </div>
            {error && <Alert>{error}</Alert>}
            <Field label="Email">
              <IconInput icon={Mail} type="email" autoComplete="username" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@school.edu" />
            </Field>
            <Field label="Password">
              <IconInput
                icon={KeyRound}
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
              />
            </Field>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="h-4 w-4 accent-primary-600" />
                Keep me signed in on this device
              </label>
              <button type="button" onClick={() => setForgot(true)} className="text-sm font-semibold text-orange-700 hover:underline dark:text-orange-300">Forgot password?</button>
            </div>
            <Modal open={forgot} title="Forgot your password?" onClose={() => setForgot(false)} footer={<Button onClick={() => setForgot(false)}>OK</Button>}>
              {isPlatform ? (
                <p className="text-sm text-slate-600 dark:text-slate-300">On the server, run <code className="rounded bg-slate-100 px-1.5 py-0.5 dark:bg-white/10">npm run reset-platform-password -w @schoolerp/api -- your@email</code>. It prints a new password for the platform console.</p>
              ) : (
                <ul className="list-disc space-y-2 pl-5 text-sm text-slate-600 dark:text-slate-300">
                  <li><strong>Parents, students and staff:</strong> ask the school office. The school admin can issue a new temporary password in a minute (Users &amp; Access → Reset password).</li>
                  <li><strong>School admins:</strong> contact Anet Cyber Solutions support. After verifying you, we issue a temporary password for your account.</li>
                  <li>You will choose your own password right after signing in with the temporary one.</li>
                </ul>
              )}
            </Modal>
            <Button type="submit" className="w-full py-3" loading={submitting}>
              {submitting ? 'Signing in…' : 'Sign in'}
            </Button>
            {!isPlatform && (
              <p className="text-center text-sm text-slate-500 dark:text-slate-400">
                No account? Your school office creates staff, student and parent logins.{' '}
                <a href={`${marketingOrigin()}/access?mode=signup`} className="font-semibold text-primary-600 hover:underline dark:text-primary-300">New school? Sign up</a>
              </p>
            )}
            </div>
          </motion.form>
        </div>
      </div>
    </div>
  );
}
