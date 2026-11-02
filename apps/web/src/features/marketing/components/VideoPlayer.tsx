import { PRODUCT_NAME } from '@/config/brand';
import type { SiteVideo } from '@/features/marketing/video/videos.config';

/** A 16:9 player for one site video: Vimeo when its number is set, otherwise the MP4 itself. */
export function VideoPlayer({ video, autoPlay = false, className = '' }: { video: SiteVideo; autoPlay?: boolean; className?: string }) {
  return (
    <div className={`relative overflow-hidden rounded-2xl bg-slate-900 shadow-[0_30px_60px_-30px_rgb(15_23_42/0.55),0_18px_36px_-18px_rgb(15_23_42/0.35)] ring-1 ring-slate-900/10 ${className}`} style={{ aspectRatio: '16 / 9' }}>
      {video.vimeoId ? (
        <iframe
          src={`https://player.vimeo.com/video/${video.vimeoId}?title=0&byline=0&portrait=0&dnt=1${autoPlay ? '&autoplay=1' : ''}`}
          title={`${video.title} | ${PRODUCT_NAME}`}
          loading="lazy"
          allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
          className="absolute inset-0 h-full w-full border-0"
        />
      ) : (
        <video key={video.id} className="absolute inset-0 h-full w-full bg-black" controls controlsList="nodownload" disablePictureInPicture playsInline preload="none" poster={video.poster} autoPlay={autoPlay} aria-label={video.title}>
          <source src={video.file} type="video/mp4" />
        </video>
      )}
    </div>
  );
}


export const mmss = (s: number) => `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, '0')}`;
