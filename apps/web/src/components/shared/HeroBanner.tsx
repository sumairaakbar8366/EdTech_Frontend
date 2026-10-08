import { ArrowRight, CalendarDays, ChevronRight } from 'lucide-react';
import type { ReactNode } from 'react';
import { AreaLink } from '@/app/router/area';
import type { HeroSlide } from '@/components/motion/HeroSlides';

const itemTone: Record<string, string> = {
  admissions: 'blue',
  collected: 'emerald',
  fees: 'emerald',
  overdue: 'amber',
  'doc-requests': 'amber',
  payroll: 'violet',
  trials: 'amber',
};

const toneClasses: Record<string, { card: string; icon: string; label: string }> = {
  blue: {
    card: 'bg-blue-50/80 dark:bg-blue-400/[0.08]',
    icon: 'bg-blue-100 text-blue-600 dark:bg-blue-300/15 dark:text-blue-300',
    label: 'text-blue-600 dark:text-blue-300',
  },
  emerald: {
    card: 'bg-emerald-50/80 dark:bg-emerald-400/[0.08]',
    icon: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-300/15 dark:text-emerald-300',
    label: 'text-emerald-600 dark:text-emerald-300',
  },
  amber: {
    card: 'bg-amber-50/80 dark:bg-amber-400/[0.08]',
    icon: 'bg-amber-100 text-amber-600 dark:bg-amber-300/15 dark:text-amber-300',
    label: 'text-amber-600 dark:text-amber-300',
  },
  violet: {
    card: 'bg-violet-50/80 dark:bg-violet-400/[0.08]',
    icon: 'bg-violet-100 text-violet-600 dark:bg-violet-300/15 dark:text-violet-300',
    label: 'text-violet-600 dark:text-violet-300',
  },
};

function slideTone(slide: HeroSlide): string {
  if (itemTone[slide.key]) return itemTone[slide.key]!;
  const kicker = slide.kicker.toLowerCase();
  if (kicker.includes('fee') || kicker.includes('payment')) return 'emerald';
  if (kicker.includes('leave') || kicker.includes('document') || kicker.includes('request')) return 'amber';
  if (kicker.includes('payroll') || kicker.includes('salary')) return 'violet';
  return 'blue';
}

/** Shared two-panel dashboard welcome and live "Today" summary. */
export function HeroBanner({
  slides,
  first,
  label = 'Today',
  image,
}: {
  slides: HeroSlide[];
  first?: ReactNode;
  image?: string;
  label?: string;
}) {
  const [head, ...items] = slides;
  const imageSrc = image?.startsWith('/') ? image : image ? `/images/marketing/${image}-800.webp` : undefined;
  const date = new Date().toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
  const todayPanelHeight = items.length > 4 ? 'lg:min-h-[23rem]' : 'lg:min-h-[20rem]';

  return (
    <section className="school-dashboard-hero grid gap-4 lg:grid-cols-[1.08fr_0.92fr]">
      <div className="school-dashboard-panel school-dashboard-welcome relative flex min-h-[16rem] overflow-hidden rounded-2xl p-5 shadow-depth-2 sm:p-6 lg:min-h-0">
        {imageSrc && <img src={imageSrc} alt="" aria-hidden="true" className="school-dashboard-photo" />}
        <div className="school-dashboard-copy relative z-10 flex w-full flex-col">
          {head && (
            <>
              <p className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                {head.icon && <head.icon size={19} className="shrink-0 text-amber-500" />}
                {head.kicker}
              </p>
              <h1 className="mt-4 max-w-[60%] font-display text-3xl font-extrabold uppercase leading-[0.98] tracking-tight text-slate-900 dark:text-white sm:text-4xl lg:text-5xl">
                {head.title}
              </h1>
              <span className="mt-3 h-[3px] w-14 rounded-full bg-blue-500" />
              {head.text && <div className="mt-3 text-base text-slate-500 dark:text-slate-300">{head.text}</div>}
              {first}
              {head.cta && (
                <AreaLink to={head.cta.to} className="focus-ring mt-4 inline-flex w-fit items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700">
                  {head.cta.label} <ChevronRight size={15} />
                </AreaLink>
              )}
            </>
          )}
          <div className="mt-auto flex items-end pt-8">
            <p className="border-l-2 border-blue-500 pl-3 text-[10px] font-bold uppercase leading-4 tracking-[0.14em] text-slate-500 dark:text-slate-300">
              Better management<br />Brighter future
            </p>
          </div>
        </div>
      </div>

      <div className={`school-dashboard-panel flex min-h-[16rem] min-w-0 flex-col rounded-2xl p-4 shadow-depth-2 sm:p-5 ${todayPanelHeight}`}>
        <div className="mb-3 flex items-center gap-3">
          <CalendarDays size={21} className="shrink-0 text-blue-600 dark:text-blue-300" />
          <h2 className="font-display text-lg font-extrabold uppercase tracking-wide text-slate-900 dark:text-white">{label}</h2>
          <span className="h-px flex-1 bg-slate-200 dark:bg-white/10" />
          <span className="whitespace-nowrap text-sm font-medium text-slate-500 dark:text-slate-300">{date}</span>
        </div>
        {items.length > 0 ? (
          <ul className="flex min-h-0 flex-1 flex-col gap-1.5">
            {items.map((slide) => {
              const Icon = slide.icon;
              const tone = toneClasses[slideTone(slide)]!;
              const content = (
                <>
                  <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${tone.icon}`}>
                  {Icon && <Icon size={21} strokeWidth={2} />}
                  </span>
                  <span className="min-w-0 flex-1 self-center">
                    <span className={`block truncate text-[10px] font-bold uppercase leading-3 tracking-wider ${tone.label}`}>{slide.kicker}</span>
                    <span className="mt-0.5 block truncate text-[13px] font-semibold leading-4 text-slate-800 dark:text-slate-100">{slide.title}</span>
                    {slide.text && <span className="mt-0.5 block truncate text-[11px] leading-[14px] text-slate-500 dark:text-slate-300">{slide.text}</span>}
                  </span>
                  {slide.cta && <ArrowRight size={20} className="shrink-0 self-center text-slate-400" />}
                </>
              );

              return (
                <li key={slide.key} className="min-h-12 flex-1">
                  {slide.cta ? (
                    <AreaLink to={slide.cta.to} title={slide.cta.label} className={`focus-ring flex h-full items-center gap-3 rounded-2xl px-3 transition hover:brightness-[0.98] ${tone.card}`}>
                      {content}
                    </AreaLink>
                  ) : (
                    <div className={`flex h-full items-center gap-3 rounded-2xl px-3 ${tone.card}`}>{content}</div>
                  )}
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="flex flex-1 items-center justify-center rounded-2xl bg-slate-50 text-sm text-slate-500 dark:bg-white/[0.04] dark:text-slate-300">
            Nothing needs your attention right now.
          </div>
        )}
      </div>
    </section>
  );
}
