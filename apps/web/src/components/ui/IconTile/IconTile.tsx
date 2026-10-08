import type { LucideIcon } from 'lucide-react';
import { TILE, type Tone } from '@/components/ui/tones';

/** A soft greyish-blue square holding an icon. */
export function IconTile({ icon: Icon, tone = 'primary', size = 'md' }: { icon: LucideIcon; tone?: Tone; size?: 'sm' | 'md' | 'lg' }) {
  const box = { sm: 'h-8 w-8 rounded-lg', md: 'h-10 w-10 rounded-lg', lg: 'h-11 w-11 rounded-xl' }[size];
  const glyph = { sm: 15, md: 17, lg: 19 }[size];
  return (
    <span aria-hidden className={`icon-tile inline-flex shrink-0 items-center justify-center ${box} ${TILE[tone]}`}>
      <Icon size={glyph} strokeWidth={1.75} />
    </span>
  );
}
