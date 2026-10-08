/**
 * Page background. The app variant is a plain page colour; the hero variant (landing/login)
 * adds a faint navy grid floor.
 */
export function Backdrop({ variant = 'hero' }: { variant?: 'app' | 'hero' }) {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-(--page-bg)">
      {variant === 'hero' && <div className="grid-floor hero-floor absolute inset-0" />}
    </div>
  );
}
