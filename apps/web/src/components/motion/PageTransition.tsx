import { motion, useReducedMotion } from 'motion/react';
import { useLocation, useOutlet } from 'react-router';

/**
 * The routed page with a short fade-in, keyed by pathname (query-string changes do not re-animate).
 * Opacity only: transforms/filters here would trap fixed-position dialogs inside the page.
 */
export function PageTransition() {
  const { pathname } = useLocation();
  const outlet = useOutlet();
  const reduce = useReducedMotion();
  if (reduce) return outlet;
  return (
    <motion.div key={pathname} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2, ease: 'easeOut' }}>
      {outlet}
    </motion.div>
  );
}
