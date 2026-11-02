import { BookOpen, Clock, Download } from 'lucide-react';
import { Link } from 'react-router';
import { Reveal, SectionHeading } from '@/features/marketing/components/Reveal';
import { mmss, VideoPlayer } from '@/features/marketing/components/VideoPlayer';
import { MASTER_VIDEO } from '@/features/marketing/video/videos.config';
import { GUIDE_PDF } from '@/features/marketing/pages/GuidePage';

/** Landing page: the main film about the whole product, with the written guide beside it. */
export function HowItWorksSection() {
  return (
    <section id="tour" className="relative scroll-mt-16 bg-slate-50 py-16 sm:py-20 dark:bg-white/[0.02]">
      <div className="mx-auto max-w-7xl px-4 sm:px-8">
        <SectionHeading kicker="How it works" title="From paper work to a school that runs itself" text="Five minutes: the problem every school knows, and everything Skool EdTech does about it, from admissions and fees to scholarships and security. Then watch the short guide for your own role below." />
        <Reveal className="mx-auto mt-10 max-w-5xl"><VideoPlayer video={MASTER_VIDEO} /></Reveal>
        <div className="mt-5 flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
          <span className="inline-flex items-center gap-1.5 text-sm text-slate-500"><Clock size={15} /> {mmss(MASTER_VIDEO.seconds)} · with voice-over</span>
        </div>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link to="/guide" className="inline-flex items-center gap-2 rounded-lg bg-brand px-5 py-2.5 text-sm font-bold uppercase text-white shadow-glow hover:brightness-110"><BookOpen size={16} /> Read the user guide</Link>
          <a href={GUIDE_PDF} download className="inline-flex items-center gap-2 rounded-lg bg-white px-5 py-2.5 text-sm font-bold uppercase text-slate-700 ring-1 ring-slate-300 hover:bg-slate-50 dark:bg-white/5 dark:text-slate-200 dark:ring-white/15"><Download size={16} /> Download as PDF</a>
        </div>
      </div>
    </section>
  );
}
