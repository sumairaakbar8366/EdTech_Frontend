import { Component, lazy, Suspense, useMemo, type ReactNode } from 'react';

// three.js is only downloaded on screens that show the hero.
const HeroScene = lazy(() => import('@/components/effects/three/HeroScene'));

function canUse3D(): boolean {
  if (typeof window === 'undefined') return false;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
  try {
    const canvas = document.createElement('canvas');
    return !!(canvas.getContext('webgl2') || canvas.getContext('webgl'));
  } catch {
    return false;
  }
}

/** Static stand-in: a glossy orb with a ring, drawn in CSS. */
function StaticHero() {
  return (
    <div aria-hidden className="relative flex h-full w-full items-center justify-center">
      <div className="relative h-40 w-40">
        <div className="absolute inset-0 rounded-full bg-brand" />
        <div className="absolute inset-3 rounded-full bg-linear-to-b from-white/50 to-transparent" />
        <div className="absolute -inset-8 rounded-full border-2 border-primary-300/60 [transform:rotateX(70deg)]" />
        <div className="absolute -right-6 top-2 h-8 w-8 rounded-full bg-linear-to-br from-primary-300 to-primary-600 shadow-lg" />
      </div>
    </div>
  );
}

class SceneBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? <StaticHero /> : this.props.children;
  }
}

/** `ring={false}` hides the orbit ring, for places where the scene overlaps other content. */
export function Hero3D({ variant = 'login', ring = true }: { variant?: 'login' | 'banner'; ring?: boolean }) {
  const enabled = useMemo(canUse3D, []);
  if (!enabled) return <StaticHero />;
  return (
    <SceneBoundary>
      <Suspense fallback={<StaticHero />}>
        <HeroScene variant={variant} ring={ring} />
      </Suspense>
    </SceneBoundary>
  );
}
