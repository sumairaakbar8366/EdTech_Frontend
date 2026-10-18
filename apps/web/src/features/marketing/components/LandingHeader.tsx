import { LogIn, UserPlus } from 'lucide-react';
import { motion, useScroll, useSpring } from 'motion/react';
import { Link } from 'react-router';
import { ThemeToggle } from '@/components/shared/ThemeToggle';
import { NAV_LINKS } from '@/features/marketing/content/landing.content';
import { BrandLockup } from '@/components/brand/BrandLogo';
import { PRODUCT_NAME } from '@/config/brand';

/** Sticky glass header with a scroll-progress line along its bottom edge. */
export function LandingHeader() {
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 24 });
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-xl dark:border-white/5 dark:bg-[#0b1220]/95">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-2.5 sm:gap-8 sm:px-8">
        <motion.a href="#top" whileHover={{ scale: 1.02 }} className="shrink-0" aria-label={`${PRODUCT_NAME} home`}>
          <BrandLockup size="sm" />
        </motion.a>
        <nav className="hidden flex-1 items-center gap-6 md:flex" aria-label="Site">
          {NAV_LINKS.map((s) => (
            <a key={s.id} href={`#${s.id}`} className="group relative text-sm font-medium text-slate-600 hover:text-primary-600 dark:text-slate-300 dark:hover:text-white">
              {s.label}
              <span className="absolute -bottom-1 left-0 h-0.5 w-0 bg-brand transition-all duration-300 group-hover:w-full" />
            </a>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle compact />
          <Link to="/login" aria-label="Sign in" title="Sign in" className="focus-ring inline-flex items-center gap-1.5 rounded-lg px-2 py-2 text-sm font-bold uppercase text-slate-700 hover:bg-slate-500/10 sm:gap-2 sm:px-3 dark:text-slate-200">
            <LogIn size={16} /> <span className="hidden min-[420px]:inline">Sign in</span>
          </Link>
          <Link to="/access?mode=signup" aria-label="Sign up" title="Sign up" className="focus-ring inline-flex items-center gap-1.5 rounded-lg bg-brand px-2 py-2 text-sm font-bold uppercase text-white shadow-glow hover:brightness-110 sm:gap-2 sm:px-3">
            <UserPlus size={16} /> <span className="hidden min-[420px]:inline">Sign up</span>
          </Link>
        </div>
      </div>
      <motion.div aria-hidden style={{ scaleX: progress }} className="absolute inset-x-0 bottom-0 h-0.5 origin-left bg-linear-to-r from-primary-700 to-magenta-500" />
    </header>
  );
}
