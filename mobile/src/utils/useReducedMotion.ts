import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

/** True when the phone asks for less motion (accessibility setting). Animations then show their final state. */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    let on = true;
    AccessibilityInfo.isReduceMotionEnabled().then((v) => on && setReduced(v)).catch(() => undefined);
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduced);
    return () => { on = false; sub.remove(); };
  }, []);
  return reduced;
}
