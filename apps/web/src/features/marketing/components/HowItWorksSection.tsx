import { BookOpen, Download } from 'lucide-react';
import { Link } from 'react-router';
import { Reveal, SectionHeading } from '@/features/marketing/components/Reveal';
import { VimeoVideo } from '@/features/marketing/guide/VimeoVideo';
import { GUIDE_PDF } from '@/features/marketing/pages/GuidePage';

/** Landing page: the animated walkthrough of the whole product, with the written guide beside it. */
export function HowItWorksSection() {
  return (
    <section id="tour" className="relative scroll-mt-16 bg-slate-50 py-16 sm:py-20 dark:bg-white/[0.02]">
      <div className="mx-auto max-w-7xl px-4 sm:px-8">
        <SectionHeading kicker="How it works" title="See your whole school run, step by step" text="From signing up with Google to classes, staff, online admissions, fees and the parent portal. Watch the walkthrough, or open the user guide whenever you need it." />
        <Reveal className="mx-auto mt-10 max-w-5xl"><VimeoVideo /></Reveal>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link to="/guide" className="inline-flex items-center gap-2 rounded-lg bg-brand px-5 py-2.5 text-sm font-bold uppercase text-white shadow-glow hover:brightness-110"><BookOpen size={16} /> Read the user guide</Link>
          <a href={GUIDE_PDF} download className="inline-flex items-center gap-2 rounded-lg bg-white px-5 py-2.5 text-sm font-bold uppercase text-slate-700 ring-1 ring-slate-300 hover:bg-slate-50 dark:bg-white/5 dark:text-slate-200 dark:ring-white/10"><Download size={16} /> Guide (PDF)</a>
        </div>
      </div>
    </section>
  );
}
