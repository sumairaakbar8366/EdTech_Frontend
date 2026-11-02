import { PRODUCT_NAME } from '@/config/brand';

/** The "How it works" video, hosted on Vimeo (streamed from Vimeo, not from our server). */
export const VIMEO_ID = '1239442458';
export const VIMEO_URL = `https://vimeo.com/${VIMEO_ID}`;

/** A responsive 16:9 Vimeo player; the iframe loads only when it scrolls near the screen. */
export function VimeoVideo({ className = '' }: { className?: string }) {
  return (
    <div className={`relative overflow-hidden rounded-2xl bg-slate-900 shadow-[0_30px_60px_-30px_rgb(15_23_42/0.55),0_18px_36px_-18px_rgb(15_23_42/0.35)] ring-1 ring-slate-900/10 ${className}`} style={{ aspectRatio: '16 / 9' }}>
      <iframe
        src={`https://player.vimeo.com/video/${VIMEO_ID}?title=0&byline=0&portrait=0&dnt=1`}
        title={`How ${PRODUCT_NAME} works`}
        loading="lazy"
        allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media"
        referrerPolicy="strict-origin-when-cross-origin"
        allowFullScreen
        className="absolute inset-0 h-full w-full border-0"
      />
    </div>
  );
}
