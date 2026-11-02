import { useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router';
import { useForcedLightTheme } from '@/app/providers/ThemeProvider';
import { SceneVideo } from '@/features/marketing/video/SceneVideo';
import { VIDEO_DEFS } from '@/features/marketing/video/registry';
import { TourPlayer } from '@/features/marketing/guide/TourPlayer';

/** A video on its own, filling the window: `?record=1` plays it once for the recorder (which makes the MP4s). */
export function WatchPage() {
  useForcedLightTheme();
  const { id = '' } = useParams();
  const [params] = useSearchParams();
  const record = params.get('record') === '1';
  const at = params.get('at') ? Number(params.get('at')) : undefined;
  const def = VIDEO_DEFS[id];
  useEffect(() => { document.body.style.margin = '0'; }, []);
  if (!def) return <p className="p-8">Unknown video.</p>;
  return (
    <div className="m-0 bg-black">
      {def.kind === 'scenes'
        ? <SceneVideo def={def.scenes} record={record} at={at} />
        : <TourPlayer record={record} at={at} clips={def.clips} showChapters={false} />}
    </div>
  );
}
