import { ArrowRight, Building2, GraduationCap, LogIn, UserPlus } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router';
import { motion } from 'motion/react';
import { Backdrop } from '@/components/effects/Backdrop';
import { StorySlides, type Story } from '@/components/motion/StorySlides';
import { ThemeToggle } from '@/components/shared/ThemeToggle';
import { Alert, Button, Field, Input } from '@/components/ui';
import { SignupForm } from '@/features/marketing/components/SignupForm';
import { BASE_DOMAIN, normalizeSchoolSlug, platformOrigin, schoolOrigin } from '@/config/site';

type Mode = 'login' | 'signup';

const STORIES: Story[] = [
  { photo: 'classroom-teacher', alt: 'Teacher leading a classroom lesson', kicker: 'One secure account for every school', title: 'School access, made simple.', text: 'Sign in through your school’s secure address, or start your school’s free trial in two minutes.' },
  { photo: 'students-laptop', alt: 'Students reviewing work on a laptop', kicker: 'For every role', title: 'Six dashboards, one system.', text: 'Administrators, accounts, teachers, staff, students and parents each start from their own day.' },
  { photo: 'campus-autumn', alt: 'School campus in autumn', kicker: 'Start free', title: 'A full month, every feature.', text: 'Sign up, confirm your email and start right away: every feature is included during the trial.' },
];

export function AccessPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const mode: Mode = searchParams.get('mode') === 'signup' ? 'signup' : 'login';
  const [school, setSchool] = useState('');
  const [error, setError] = useState<string | null>(null);

  function chooseMode(next: Mode) {
    setError(null);
    setSearchParams({ mode: next });
  }

  function signIn(e: FormEvent) {
    e.preventDefault();
    const slug = normalizeSchoolSlug(school);
    if (!slug) {
      setError('Enter your school address, such as greenfield.');
      return;
    }
    window.location.assign(`${schoolOrigin(slug)}/login`);
  }

  return (
    <main className="relative grid min-h-dvh lg:grid-cols-[1.1fr_1fr]">
      <Backdrop />
      <section className="relative hidden min-h-dvh overflow-hidden p-10 lg:flex lg:flex-col lg:justify-between">
        <Link to="/" className="relative flex items-center gap-3 text-white">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand text-white shadow-glow"><GraduationCap size={23} /></span>
          <span><span className="block font-display text-xl font-bold uppercase">Anet Cyber Solutions</span><span className="block text-xs font-semibold uppercase text-primary-100">SchoolERP</span></span>
        </Link>
        <StorySlides stories={STORIES} />
        <div className="relative text-sm text-white/70">Admissions, academics, attendance and more, in one place.</div>
      </section>

      <section className="relative flex min-h-dvh items-center justify-center p-4 sm:p-8">
        <div className="absolute right-4 top-4"><ThemeToggle /></div>
        <div className="w-full max-w-xl">
          <div className="mb-5 flex items-center justify-between lg:hidden">
            <Link to="/" className="flex items-center gap-2 font-display text-lg font-bold uppercase text-slate-900 dark:text-white">
              <GraduationCap size={22} className="text-primary-600" /> Anet Cyber Solutions
            </Link>
          </div>
          <motion.div key={mode} initial={{ opacity: 0, x: 40, rotateY: -8 }} animate={{ opacity: 1, x: 0, rotateY: 0 }} transition={{ duration: 0.45, ease: [0.2, 0.8, 0.2, 1] }} style={{ transformPerspective: 1200 }} className="surface rounded-xl p-5 shadow-depth-3 sm:p-8">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase text-magenta-600 dark:text-magenta-300">SchoolERP by Anet Cyber Solutions</p>
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
            {mode === 'login' ? (
              <form onSubmit={signIn} className="mt-5 space-y-4">
                <p className="text-sm text-slate-600 dark:text-slate-300">Enter your school subdomain. You’ll continue to its existing secure sign-in page.</p>
                <Field label="School address" hint={`For example: greenfield.${BASE_DOMAIN}`}>
                  <div className="flex overflow-hidden rounded-lg border border-slate-300 bg-white dark:border-white/10 dark:bg-[#0e1626]">
                    <Input required aria-label="School subdomain" value={school} onChange={(e) => setSchool(e.target.value)} placeholder="greenfield" className="min-w-0 flex-1 rounded-none border-0 shadow-none focus:ring-0" />
                    <span className="flex items-center border-l border-slate-200 bg-slate-50 px-3 text-sm text-slate-500 dark:border-white/10 dark:bg-white/5">.{window.location.host}</span>
                  </div>
                </Field>
                <Button type="submit" icon={ArrowRight} className="w-full">Continue to school</Button>
                <a href={`${platformOrigin()}/login`} className="flex items-center justify-center gap-2 py-2 text-sm font-semibold text-primary-700 hover:underline dark:text-primary-300">
                  <Building2 size={15} /> Company administrator sign in
                </a>
              </form>
            ) : (
              <SignupForm />
            )}
          </motion.div>
        </div>
      </section>
    </main>
  );
}