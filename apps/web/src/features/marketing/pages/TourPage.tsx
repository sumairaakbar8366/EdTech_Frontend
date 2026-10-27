import { ArrowLeft, BookOpen, Download } from 'lucide-react';
import { useEffect } from 'react';
import { Link, useSearchParams } from 'react-router';
import { useForcedLightTheme } from '@/app/providers/ThemeProvider';
import { BrandLockup } from '@/components/brand/BrandLogo';
import { PRODUCT_NAME } from '@/config/brand';
import { TourPlayer } from '@/features/marketing/guide/TourPlayer';
import { VimeoVideo } from '@/features/marketing/guide/VimeoVideo';
import { GUIDE_PDF } from '@/features/marketing/pages/GuidePage';

/** The video on its own page (streamed from Vimeo); `?record=1` shows the animated walkthrough, for recording a new video. */
export function TourPage() {
  useForcedLightTheme();
  const [params] = useSearchParams();
  const record = params.get('record') === '1';
  useEffect(() => { document.title = `How it works | ${PRODUCT_NAME}`; }, []);

  if (record) return <div className="m-0 bg-black"><TourPlayer record at={params.get('at') ? Number(params.get('at')) : undefined} /></div>;

  return (
    <div className="min-h-dvh bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:px-8">
          <Link to="/" aria-label={`${PRODUCT_NAME} home`}><BrandLockup size="sm" /></Link>
          <Link to="/" className="ml-auto inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-primary-700"><ArrowLeft size={15} /> Home</Link>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-8">
        <h1 className="font-display text-3xl font-semibold text-slate-900">How {PRODUCT_NAME} works</h1>
        <p className="mt-2 max-w-3xl text-slate-600">Every step of running your school, from signing up with Google to admissions, fees and the parent portal.</p>
        <div className="mt-6 max-w-5xl"><VimeoVideo /></div>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link to="/guide" className="inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2.5 text-sm font-bold uppercase text-white"><BookOpen size={16} /> Read the user guide</Link>
          <a href={GUIDE_PDF} download className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-bold uppercase text-slate-700 ring-1 ring-slate-300"><Download size={16} /> Guide (PDF)</a>
        </div>
      </main>
    </div>
  );
}
