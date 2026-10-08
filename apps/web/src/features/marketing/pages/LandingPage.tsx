import { MotionConfig } from 'motion/react';
import { useState } from 'react';
import { CONTACT_EMAIL, platformOrigin } from '@/config/site';
import { CtaSection } from '@/features/marketing/components/CtaSection';
import { FeatureSlideshow } from '@/features/marketing/components/FeatureSlideshow';
import { FindSchoolModal } from '@/features/marketing/components/FindSchoolModal';
import { HeroSection } from '@/features/marketing/components/HeroSection';
import { LandingHeader } from '@/features/marketing/components/LandingHeader';
import { MetricsSection } from '@/features/marketing/components/MetricsSection';
import { ModulesSection } from '@/features/marketing/components/ModulesSection';
import { PlansSection } from '@/features/marketing/components/PlansSection';
import { RolesSection } from '@/features/marketing/components/RolesSection';
import { SectionNav } from '@/features/marketing/components/SectionNav';
import { SpecialFeaturesSection } from '@/features/marketing/components/SpecialFeaturesSection';

const DEMO_HREF = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent('SchoolERP demo request')}`;

/**
 * Marketing site: a slide-style sequence of full sections (hero → features → dashboards → modules →
 * numbers → plans → call to action) with pointer parallax and scroll-driven reveals.
 * All motion respects the visitor's reduced-motion setting.
 */
export function LandingPage() {
  const [findOpen, setFindOpen] = useState(false);
  const openFind = () => setFindOpen(true);
  return (
    <MotionConfig reducedMotion="user">
      <div className="landing min-h-dvh bg-[var(--page-bg)] text-[#14213d] dark:text-[#e5e9f2]">
        <LandingHeader />
        <SectionNav />
        <main>
          <HeroSection demoHref={DEMO_HREF} />
          <FeatureSlideshow />
          <RolesSection />
          <ModulesSection />
          <SpecialFeaturesSection />
          <MetricsSection />
          <PlansSection demoHref={DEMO_HREF} />
          <CtaSection demoHref={DEMO_HREF} onFindSchool={openFind} />
        </main>
        <footer className="border-t border-slate-200 bg-white dark:border-white/5 dark:bg-[#0b1426]">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-6 text-sm text-slate-500 sm:px-8 dark:text-slate-400">
            <span className="font-display text-sm font-semibold text-slate-700 dark:text-slate-200">Anet Cyber Solutions</span>
            <span>© {new Date().getFullYear()} SchoolERP by Anet Cyber Solutions.</span>
            <a href={platformOrigin()} className="hover:text-primary-600">Platform console</a>
          </div>
        </footer>
        <FindSchoolModal open={findOpen} onClose={() => setFindOpen(false)} />
      </div>
    </MotionConfig>
  );
}
