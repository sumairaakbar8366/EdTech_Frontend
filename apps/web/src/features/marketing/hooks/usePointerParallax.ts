import { useMotionValue, useReducedMotion, useSpring, type MotionValue } from 'motion/react';
import { useEffect } from 'react';

/**
 * Pointer position over the window as springy motion values in [-1, 1] (0 = centre).
 * Layers multiply these by their depth to drift in parallax. Stays at 0 with reduced motion.
 */
export function usePointerParallax(): { x: MotionValue<number>; y: MotionValue<number> } {
  const reduce = useReducedMotion();
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const x = useSpring(rawX, { stiffness: 60, damping: 18, mass: 0.6 });
  const y = useSpring(rawY, { stiffness: 60, damping: 18, mass: 0.6 });
  useEffect(() => {
    if (reduce) return;
    const move = (e: PointerEvent) => {
      rawX.set((e.clientX / window.innerWidth) * 2 - 1);
      rawY.set((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener('pointermove', move, { passive: true });
    return () => window.removeEventListener('pointermove', move);
  }, [reduce, rawX, rawY]);
  return { x, y };
}
