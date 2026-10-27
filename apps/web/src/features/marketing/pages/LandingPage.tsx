import { MotionConfig } from 'motion/react';
import { useState } from 'react';
import { CONTACT_EMAIL, platformOrigin } from '@/config/site';
import { Mail, MapPin, Phone } from 'lucide-react';
import { Modal } from '@/components/ui';
import { CtaSection } from '@/features/marketing/components/CtaSection';
import { FeatureSlideshow } from '@/features/marketing/components/FeatureSlideshow';
import { FindSchoolModal } from '@/features/marketing/components/FindSchoolModal';
import { HeroSection } from '@/features/marketing/components/HeroSection';
import { HowItWorksSection } from '@/features/marketing/components/HowItWorksSection';
import { LandingHeader } from '@/features/marketing/components/LandingHeader';
import { MetricsSection } from '@/features/marketing/components/MetricsSection';
import { ModulesSection } from '@/features/marketing/components/ModulesSection';
import { PlansSection } from '@/features/marketing/components/PlansSection';
import { QuickSignup } from '@/features/marketing/components/QuickSignup';
import { RolesSection } from '@/features/marketing/components/RolesSection';
import { SectionNav } from '@/features/marketing/components/SectionNav';
import { SpecialFeaturesSection } from '@/features/marketing/components/SpecialFeaturesSection';
import { SocialLinks } from '@/features/website/components/SocialLinks';
import { usePublicSiteSettings } from '@/features/website/siteService';
import { PRODUCT_NAME } from '@/config/brand';
import { BrandLockup } from '@/components/brand/BrandLogo';

const demoHref = (email: string) => `mailto:${email}?subject=${encodeURIComponent(`${PRODUCT_NAME} demo request`)}`;

/**
 * Marketing site: a slide-style sequence of full sections (hero → features → dashboards → modules →
 * numbers → plans → call to action) with pointer parallax and scroll-driven reveals.
 * All motion respects the visitor's reduced-motion setting.
 */
export function LandingPage() {
  const [findOpen, setFindOpen] = useState(false);
  const openFind = () => setFindOpen(true);
  const [trialOpen, setTrialOpen] = useState(false);
  const openTrial = () => setTrialOpen(true);
  // Contact details and social accounts come from the owner's console (Public site).
  const site = usePublicSiteSettings().data;
  const DEMO_HREF = demoHref(site?.contactEmail ?? CONTACT_EMAIL);
  return (
    <MotionConfig reducedMotion="user">
      <div className="landing min-h-dvh bg-[var(--page-bg)] text-[#14213d] dark:text-[#e5e9f2]">
        <LandingHeader />
        <SectionNav />
        <main>
          <HeroSection demoHref={DEMO_HREF} onStartTrial={openTrial} />
          <HowItWorksSection />
          <FeatureSlideshow />
          <RolesSection />
          <ModulesSection />
          <SpecialFeaturesSection />
          <MetricsSection />
          <PlansSection demoHref={DEMO_HREF} onStartTrial={openTrial} />
          <CtaSection demoHref={DEMO_HREF} onFindSchool={openFind} onStartTrial={openTrial} />
        </main>
        <footer className="border-t border-slate-200 bg-white dark:border-white/5 dark:bg-[#0b1426]">
          {site && Object.values(site).some(Boolean) && (
            <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 border-b border-slate-200 px-4 py-5 text-sm text-slate-600 sm:px-8 dark:border-white/5 dark:text-slate-300">
              <div className="flex flex-wrap gap-x-6 gap-y-2">
                {site.contactEmail && <a href={`mailto:${site.contactEmail}`} className="inline-flex items-center gap-1.5 hover:text-primary-600"><Mail size={15} /> {site.contactEmail}</a>}
                {site.phone && <a href={`tel:${site.phone.replace(/\s/g, '')}`} className="inline-flex items-center gap-1.5 hover:text-primary-600"><Phone size={15} /> {site.phone}</a>}
                {site.address && <span className="inline-flex items-center gap-1.5"><MapPin size={15} /> {site.address}</span>}
              </div>
              <SocialLinks links={site} linkClassName="text-slate-700 ring-slate-200 hover:text-primary-600 dark:text-slate-200 dark:ring-white/10" />
            </div>
          )}
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-6 text-sm text-slate-500 sm:px-8 dark:text-slate-400">
            <BrandLockup size="sm" />
            <span className="flex gap-5"><a href="/guide" className="hover:text-primary-600">User guide</a><a href="#tour" className="hover:text-primary-600">How it works</a></span>
            <span>© {new Date().getFullYear()} {PRODUCT_NAME}. All rights reserved.</span>
            <a href={platformOrigin()} className="hover:text-primary-600">Platform console</a>
          </div>
        </footer>
        <FindSchoolModal open={findOpen} onClose={() => setFindOpen(false)} />
        <Modal open={trialOpen} title="Start your free trial" onClose={() => setTrialOpen(false)}>
          <QuickSignup />
        </Modal>
      </div>
    </MotionConfig>
  );
}
