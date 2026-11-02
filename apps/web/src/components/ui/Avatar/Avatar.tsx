import { usePhoto } from '@/features/photos/photos';

const SIZE = { xs: 'h-7 w-7 text-[10px]', sm: 'h-9 w-9 text-xs', md: 'h-12 w-12 text-sm', lg: 'h-20 w-20 text-xl', xl: 'h-28 w-28 text-3xl' } as const;

const initials = (name: string) => name.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]!.toUpperCase()).join('');

/** Round profile picture, or the person's initials until one is added. */
export function Avatar({ photoKey, name, size = 'sm', ring = false }: { photoKey?: string | null; name: string; size?: keyof typeof SIZE; ring?: boolean }) {
  const photo = usePhoto(photoKey);
  const box = `${SIZE[size]} shrink-0 rounded-full ${ring ? 'ring-4 ring-primary-100 dark:ring-primary-500/20' : ''}`;
  if (photo.data) return <img src={photo.data} alt={name} className={`${box} object-cover`} draggable={false} />;
  return (
    <span aria-label={name} role="img" className={`${box} inline-flex items-center justify-center bg-primary-500/15 font-bold text-primary-700 dark:text-primary-200`}>
      {initials(name)}
    </span>
  );
}
