import { animate, useInView, useReducedMotion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';

/** A whole number that counts up from 0 the first time it is on screen (and again when it changes). */
export function CountUp({ to, duration = 0.6 }: { to: number; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-5% 0px' });
  const reduce = useReducedMotion();
  const [value, setValue] = useState(reduce ? to : 0);
  const from = useRef(0);
  useEffect(() => {
    if (reduce) {
      setValue(to);
      return;
    }
    if (!inView) return;
    const controls = animate(from.current, to, { duration, ease: [0.2, 0.8, 0.2, 1], onUpdate: (v) => setValue(Math.round(v)) });
    from.current = to;
    return () => controls.stop();
  }, [inView, reduce, to, duration]);
  return <span ref={ref} className="tabular-nums">{value.toLocaleString()}</span>;
}
