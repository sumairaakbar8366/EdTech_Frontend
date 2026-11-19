import { useSyncExternalStore } from 'react';

/** True on phone-width screens (under 640px, Tailwind's `sm`). Follows rotation and window resizing. */
export function useNarrow(maxWidth = 639): boolean {
  const query = `(max-width: ${maxWidth}px)`;
  return useSyncExternalStore(
    (notify) => { const m = window.matchMedia(query); m.addEventListener('change', notify); return () => m.removeEventListener('change', notify); },
    () => window.matchMedia(query).matches,
    () => false,
  );
}
