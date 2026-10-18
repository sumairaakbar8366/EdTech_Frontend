import { LogIn, UserPlus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { motion } from 'motion/react';
import { Backdrop } from '@/components/effects/Backdrop';
import { StorySlides, type Story } from '@/components/motion/StorySlides';
import { ThemeToggle } from '@/components/shared/ThemeToggle';
import { Alert } from '@/components/ui';
import { QuickSignup } from '@/features/marketing/components/QuickSignup';
import { BrandLockup } from '@/components/brand/BrandLogo';
import { PRODUCT_NAME } from '@/config/brand';

type Mode = 'login' | 'signup';

const STORIES: Story[] = [
  { photo: 'classroom-teacher', alt: 'Teacher leading a classroom lesson', kicker: 'One secure account for every school', title: 'School access, made simple.', text: 'Sign in through your school’s secure address, or start your school’s free trial in two minutes.' },
  { photo: 'students-laptop', alt: 'Students reviewing work on a laptop', kicker: 'For every role', title: 'Six dashboards, one system.', text: 'Administrators, accounts, teachers, staff, students and parents each start from their own day.' },
  { photo: 'campus-autumn', alt: 'School campus in autumn', kicker: 'Start free', title: 'A full month, every feature.', text: 'Sign up, confirm your email and start right away: every feature is included during the trial.' },
];

export function AccessPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const mode: Mode = searchParams.get('mode') === 'signup' ? 'signup' : 'login';
  const [error, setError] = useState<string | null>(null);
  // /access?mode=login (old links): the single sign-in page.
  useEffect(() => {
    if (mode === 'login') navigate('/login', { replace: true });
  }, [mode, navigate]);

  function chooseMode(next: Mode) {
    setError(null);
    // Signing in happens on the single /login page.
    if (next === 'login') return navigate('/login');
    setSearchParams({ mode: next });
  }

  return (
    <main className="relative grid min-h-dvh lg:grid-cols-[1.1fr_1fr]">
      <Backdrop />
      <section className="relative hidden min-h-dvh overflow-hidden p-10 lg:flex lg:flex-col lg:justify-between">
        <Link to="/" className="relative flex items-center gap-3 text-white">
          <BrandLockup tone="dark" size="lg" />
        </Link>
        <StorySlides stories={STORIES} />
        <div className="relative text-sm text-white/70">Admissions, academics, attendance and more, in one place.</div>
      </section>

      <section className="relative flex min-h-dvh items-center justify-center p-4 sm:p-8">
        <div className="absolute right-4 top-4"><ThemeToggle /></div>
        <div className="w-full max-w-xl">
          <div className="mb-5 flex items-center justify-between lg:hidden">
            <Link to="/" aria-label={`${PRODUCT_NAME} home`}>
              <BrandLockup />
            </Link>
          </div>
          <motion.div key={mode} initial={{ opacity: 0, x: 40, rotateY: -8 }} animate={{ opacity: 1, x: 0, rotateY: 0 }} transition={{ duration: 0.45, ease: [0.2, 0.8, 0.2, 1] }} style={{ transformPerspective: 1200 }} className="surface rounded-xl p-5 shadow-depth-3 sm:p-8">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase text-magenta-600 dark:text-magenta-300">{PRODUCT_NAME}</p>
                <h2 className="mt-1 font-display text-3xl font-bold uppercase text-slate-900 dark:text-white">
                  {mode === 'login' ? 'Sign in' : 'Start free trial'}
                </h2>
              </div>
              <Link to="/" className="text-sm font-semibold text-slate-500 hover:text-primary-700 dark:text-slate-400">Home</Link>
            </div>

            <div role="tablist" aria-label="Account access" className="mt-6 grid grid-cols-2 rounded-lg bg-slate-100 p-1 dark:bg-white/5">
              <button role="tab" aria-selected={mode === 'login'} onClick={() => chooseMode('login')} className={`flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-bold uppercase ${mode === 'login' ? 'bg-white text-slate-900 shadow dark:bg-white/10 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}>
                <LogIn size={15} /> Sign in
              </button>
              <button role="tab" aria-selected={mode === 'signup'} onClick={() => chooseMode('signup')} className={`flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-bold uppercase ${mode === 'signup' ? 'bg-white text-slate-900 shadow dark:bg-white/10 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}>
                <UserPlus size={15} /> Free trial
              </button>
            </div>

            {error && <div className="mt-5"><Alert>{error}</Alert></div>}
            <div className="mt-5"><QuickSignup /></div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}