import { POWERED_BY, PRODUCT_NAME } from '@/config/brand';

export const BRAND_LOGO_SRC = '/brand/edtech-logo.png';

type Tone = 'light' | 'dark' | 'auto';
type Size = 'sm' | 'md' | 'lg';

const TILE: Record<Size, string> = { sm: 'h-9 w-9 rounded-lg', md: 'h-10 w-10 rounded-lg', lg: 'h-12 w-12 rounded-xl' };
const NAME: Record<Size, string> = { sm: 'text-lg', md: 'text-xl', lg: 'text-2xl' };

/** The EdTech logo file, on its own white background as a raised rounded tile. */
export function BrandMark({ size = 'md', className = '' }: { tone?: Tone; size?: Size; className?: string }) {
  return <img src={BRAND_LOGO_SRC} alt="" draggable={false} className={`brand-logo-3d shrink-0 bg-white object-contain ${TILE[size]} ${className}`} />;
}

/** "EdTech" in the logo's two colours. */
export function BrandName({ tone = 'auto', className = '' }: { tone?: Tone; className?: string }) {
  const tech = tone === 'dark' ? 'text-white' : tone === 'auto' ? 'text-[#18293b] dark:text-white' : 'text-[#18293b]';
  const ed = tone === 'dark' ? 'text-[#6ea8ff]' : tone === 'auto' ? 'text-[#044792] dark:text-[#6ea8ff]' : 'text-[#044792]';
  return (
    <span className={`font-display font-extrabold leading-none tracking-tight ${className}`} aria-label={PRODUCT_NAME}>
      <span aria-hidden className={ed}>Ed</span>
      <span aria-hidden className={tech}>Tech</span>
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
