import type { LucideIcon } from 'lucide-react';
import { motion } from 'motion/react';
import type { ReactNode } from 'react';
import { AreaLink } from '@/app/router/area';
import { SlideShow } from '@/components/motion/SlideShow';
import { SplitText } from '@/components/motion/SplitText';

export interface HeroSlide {
  key: string;
  kicker: string;
  title: string;
  text?: ReactNode;
  icon?: LucideIcon;
  /** Optional call to action inside the slide (area-relative path, or an absolute URL). */
  cta?: { label: string; to: string };
}

/** One slide's text on a dark hero: kicker, unfolding title, body and an optional button. */
export function HeroSlideBody({ slide, children }: { slide: HeroSlide; children?: ReactNode }) {
  const Icon = slide.icon;
  return (
    <div className="perspective-[700px]">
      <p className="inline-flex items-center gap-1.5 text-sm font-semibold uppercase tracking-wider text-primary-200">
        {Icon && <Icon size={15} />} {slide.kicker}
      </p>
      <h1 className="mt-1 font-display text-3xl font-bold uppercase sm:text-4xl">
        <SplitText text={slide.title} />
      </h1>
      {slide.text && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mt-2 max-w-xl text-primary-100/90">
          {slide.text}
        </motion.div>
      )}
      {children}
      {slide.cta && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} className="mt-4">
          <AreaLink to={slide.cta.to} className="focus-ring inline-flex items-center gap-2 rounded-lg bg-primary-400 px-4 py-2 text-sm font-bold uppercase tracking-wide text-slate-900 shadow-[0_8px_24px_-8px_rgb(34_211_238/0.8)] transition hover:-translate-y-0.5 hover:bg-primary-300">
            {slide.cta.label}
          </AreaLink>
        </motion.div>
      )}
    </div>
  );
}

/** A dark-hero slideshow of HeroSlides; the first slide can carry extra content (chips etc.). */
export function HeroSlides({ slides, first, label }: { slides: HeroSlide[]; first?: ReactNode; label?: string }) {
  return (
    <SlideShow
      label={label}
      slides={slides.map((s, i) => ({ key: s.key, content: <HeroSlideBody slide={s}>{i === 0 ? first : null}</HeroSlideBody> }))}
    />
  );
}
