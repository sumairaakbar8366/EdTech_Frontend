import type { ReactNode } from 'react';
import { BADGE, type Tone } from '@/components/ui/tones';

export function Badge({ children, tone = 'slate' }: { children: ReactNode; tone?: Tone }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-sm font-semibold ring-1 ring-inset ${BADGE[tone]}`}>
      {children}
    </span>
  );
}
