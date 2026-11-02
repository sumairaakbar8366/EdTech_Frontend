import { POWERED_BY, PRODUCT_NAME } from '@/config/brand';

/** The full logo (mark, name and tagline). */
export const BRAND_LOGO_SRC = '/brand/skool-edtech-logo.png';
/** The mark alone (S, T and cap), for small spaces where the name is written next to it. */
export const BRAND_MARK_SRC = '/brand/skool-edtech-mark.png';

type Tone = 'light' | 'dark' | 'auto';
type Size = 'sm' | 'md' | 'lg';

const TILE: Record<Size, string> = { sm: 'h-9 w-9 rounded-lg', md: 'h-10 w-10 rounded-lg', lg: 'h-12 w-12 rounded-xl' };
const NAME: Record<Size, string> = { sm: 'text-lg', md: 'text-xl', lg: 'text-2xl' };

/** The Skool EdTech mark, on its own white background as a raised rounded tile. */
export function BrandMark({ size = 'md', className = '' }: { tone?: Tone; size?: Size; className?: string }) {
  return <img src={BRAND_MARK_SRC} alt="" draggable={false} className={`brand-logo-3d shrink-0 bg-white object-contain ${TILE[size]} ${className}`} />;
}

/** "Skool EdTech" in the logo's two colours: steel blue and dark navy. */
export function BrandName({ tone = 'auto', className = '' }: { tone?: Tone; className?: string }) {
  const skool = tone === 'dark' ? 'text-[#8fb4e0]' : tone === 'auto' ? 'text-[#4a6a92] dark:text-[#8fb4e0]' : 'text-[#4a6a92]';
  const edtech = tone === 'dark' ? 'text-white' : tone === 'auto' ? 'text-[#1c2a3f] dark:text-white' : 'text-[#1c2a3f]';
  return (
    <span className={`whitespace-nowrap font-display font-extrabold leading-none tracking-tight ${className}`} aria-label={PRODUCT_NAME}>
      <span aria-hidden className={skool}>Skool</span>{' '}
      <span aria-hidden className={edtech}>EdTech</span>
    </span>
  );
}

/** Mark + product name, with the parent company kept small underneath. */
export function BrandLockup({ tone = 'auto', size = 'md', poweredBy = true, className = '' }: { tone?: Tone; size?: Size; poweredBy?: boolean; className?: string }) {
  const sub = tone === 'dark' ? 'text-slate-400' : tone === 'auto' ? 'text-slate-500 dark:text-slate-400' : 'text-slate-500';
  return (
    <span className={`flex min-w-0 items-center gap-2.5 ${className}`}>
      <BrandMark tone={tone} size={size} />
      <span className="min-w-0">
        <BrandName tone={tone} className={`block ${NAME[size]}`} />
        {poweredBy && <span className={`mt-1 block truncate text-[10px] font-medium leading-none ${sub}`}>{POWERED_BY}</span>}
      </span>
    </span>
  );
}
