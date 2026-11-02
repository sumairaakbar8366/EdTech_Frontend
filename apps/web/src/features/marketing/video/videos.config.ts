import { Sparkles, type LucideIcon } from 'lucide-react';
import { GUIDES } from '@/features/marketing/video/guides';

/**
 * The videos on the website. Each is an MP4 in public/videos (made by the recorder, also in
 * videos-export/ for download). To play one from Vimeo instead, upload the MP4 there and put its
 * number in `VIMEO`: the site then embeds Vimeo and keeps the MP4 only as the download.
 */
export interface SiteVideo {
  id: string;
  title: string;
  /** "Main film", "School admin"… */
  role: string;
  blurb: string;
  icon: LucideIcon;
  /** A phone screen: shown as a phone on its card. */
  phone?: boolean;
  seconds: number;
  file: string;
  poster: string;
  vimeoId?: string;
}

/** Vimeo numbers by video id. The site embeds Vimeo; the MP4 files are not kept in the project. */
export const VIMEO: Record<string, string> = {
  master: '1242320685',
  'guide-register': '1242323533',
  'guide-admin': '1242323204',
  'guide-admin2': '1242323607',
  'guide-principal': '1242323606',
  'guide-teacher': '1242323649',
  'guide-accounts': '1242326986',
  'guide-student': '1242323648',
  'guide-parent': '1242323605',
};

/** Lengths in seconds, as recorded. */
const SECONDS: Record<string, number> = { master: 292, 'guide-register': 97, 'guide-admin': 182, 'guide-admin2': 197, 'guide-principal': 94, 'guide-teacher': 142, 'guide-accounts': 90, 'guide-student': 83, 'guide-parent': 70 };

const make = (v: Omit<SiteVideo, 'file' | 'poster' | 'seconds' | 'vimeoId'>): SiteVideo => ({ ...v, seconds: SECONDS[v.id] ?? 120, file: `/videos/${v.id}.mp4`, poster: `/videos/${v.id}.jpg`, vimeoId: VIMEO[v.id] || undefined });

export const MASTER_VIDEO: SiteVideo = make({
  id: 'master', title: 'Skool EdTech: your whole school, made simple', role: 'Main film', icon: Sparkles,
  blurb: 'From paper work to a fully digital, secure school: everything the product does, and how to join.',
});

export const GUIDE_VIDEOS: SiteVideo[] = GUIDES.map((g) => make({ id: g.id, title: g.title, role: g.role, blurb: g.blurb, icon: g.icon, phone: g.phone }));

export const ALL_VIDEOS = [MASTER_VIDEO, ...GUIDE_VIDEOS];
export const videoById = (id: string) => ALL_VIDEOS.find((v) => v.id === id);
