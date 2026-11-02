import { AnimatePresence, motion, MotionConfig } from 'motion/react';
import { useEffect } from 'react';
import { BRAND_LOGO_SRC } from '@/components/brand/BrandLogo';

/** How long a successful sign-in keeps the loader on screen, so it is seen rather than flashed. */
export const SIGN_IN_LOADER_MS = 3000;

/** Waits out the rest of SIGN_IN_LOADER_MS counted from `startedAt` (a performance.now() value). */
export const holdLoader = (startedAt: number) =>
  new Promise<void>((done) => setTimeout(done, Math.max(0, SIGN_IN_LOADER_MS - (performance.now() - startedAt))));

/**
 * Runs `reset` when the browser restores this page from its back/forward cache (pressing Back after
 * signing in): the page comes back exactly as it was left, loader included, so the loader is cleared.
 */
export function useResetOnRestore(reset: () => void) {
  useEffect(() => {
    const onShow = (e: PageTransitionEvent) => {
      if (e.persisted) reset();
    };
    window.addEventListener('pageshow', onShow);
    return () => window.removeEventListener('pageshow', onShow);
  }, [reset]);
}

/** Full-screen loader with the Skool EdTech logo bouncing, e.g. while signing in. */
export function BrandLoader({ show, label }: { show: boolean; label: string }) {
  return (
    <MotionConfig reducedMotion="user">
      <AnimatePresence>
        {show && (
          <motion.div
            role="status"
            aria-live="polite"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-6 bg-slate-100/85 backdrop-blur-md dark:bg-[#0e0f12]/85"
          >
            <div className="flex flex-col items-center">
              <motion.img
                src={BRAND_LOGO_SRC}
                alt=""
                draggable={false}
                className="brand-logo-3d h-36 w-36 rounded-3xl bg-white object-contain p-3 sm:h-44 sm:w-44 sm:p-3.5"
                animate={{ y: [0, -44, 0], scaleY: [0.94, 1.03, 0.94], scaleX: [1.04, 0.98, 1.04] }}
                transition={{ duration: 0.9, repeat: Infinity, ease: ['easeOut', 'easeIn'], times: [0, 0.5, 1] }}
              />
              {/* Shadow on the "floor": shrinks as the logo rises. */}
              <motion.span
                aria-hidden
                className="mt-4 h-3 w-28 rounded-full sm:w-32 bg-slate-900/25 blur-[3px] dark:bg-black/60"
                animate={{ scaleX: [1, 0.55, 1], opacity: [0.9, 0.4, 0.9] }}
                transition={{ duration: 0.9, repeat: Infinity, ease: ['easeOut', 'easeIn'], times: [0, 0.5, 1] }}
              />
            </div>
            <p className="font-display text-lg font-semibold text-slate-700 dark:text-slate-200">
              {label}
              <motion.span aria-hidden animate={{ opacity: [0.2, 1, 0.2] }} transition={{ duration: 1.2, repeat: Infinity }}>…</motion.span>
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </MotionConfig>
  );
}
