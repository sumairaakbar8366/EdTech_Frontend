import type { Clip } from '@/features/marketing/guide/tour.beats';
import { GUIDES } from '@/features/marketing/video/guides';
import { MASTER } from '@/features/marketing/video/master.scenes';
import type { SceneVideoDef } from '@/features/marketing/video/SceneVideo';

export type VideoDef = { kind: 'scenes'; scenes: SceneVideoDef } | { kind: 'clips'; clips: Clip[] };

/** Every video the recorder can play at /watch/<id>. */
export const VIDEO_DEFS: Record<string, VideoDef> = {
  master: { kind: 'scenes', scenes: MASTER },
  ...Object.fromEntries(GUIDES.map((g) => [g.id, { kind: 'clips' as const, clips: g.clips }])),
};
