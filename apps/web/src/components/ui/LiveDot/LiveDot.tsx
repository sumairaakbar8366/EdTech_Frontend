/** Pulsing green dot for something happening right now (a class in progress, the current period). */
export function LiveDot({ label = 'Live now' }: { label?: string }) {
  return (
    <span className="relative inline-flex h-2.5 w-2.5 shrink-0" role="img" aria-label={label} title={label}>
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75 motion-reduce:animate-none" />
      <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
    </span>
  );
}
