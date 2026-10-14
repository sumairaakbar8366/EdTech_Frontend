import { Atom, BookOpen, Brain, Calculator, Cpu, FlaskConical, Globe, GraduationCap, Lightbulb, Microscope, Sigma, type LucideIcon } from 'lucide-react';
import { useMemo } from 'react';

// Faded background artwork for the school website: a learning network (nodes, links and circuit
// traces) woven with school motifs. Original vector art, drawn in the theme's --site-art colour, so
// it is licence-free, sharp at any size and always matches the school's palette.

const W = 1200;
const H = 640;

/** Small deterministic generator, so the artwork is identical on every render and visit. */
function random(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 2 ** 32;
  };
}

interface Motif { Icon: LucideIcon; x: number; y: number; size: number; rotate?: number }

const VARIANTS = {
  // Hero: the network fills the right side, behind the stats; motifs sit along its edges.
  hero: {
    seed: 7,
    nodes: 46,
    area: { x0: 560, x1: 1190, y0: 30, y1: 610 },
    link: 150,
    traces: 7,
    motifs: [
      { Icon: Brain, x: 860, y: 110, size: 120 },
      { Icon: GraduationCap, x: 1040, y: 380, size: 104, rotate: -8 },
      { Icon: BookOpen, x: 650, y: 430, size: 92 },
      { Icon: Atom, x: 1080, y: 60, size: 70 },
      { Icon: Cpu, x: 720, y: 220, size: 58 },
      { Icon: Lightbulb, x: 940, y: 520, size: 54 },
    ] as Motif[],
  },
  // Sections: a lighter scatter in one corner, so reading areas stay clean.
  corner: {
    seed: 23,
    nodes: 24,
    area: { x0: 780, x1: 1190, y0: 20, y1: 380 },
    link: 130,
    traces: 4,
    motifs: [
      { Icon: Microscope, x: 1060, y: 60, size: 78 },
      { Icon: Sigma, x: 860, y: 250, size: 56 },
      { Icon: Globe, x: 1110, y: 270, size: 60 },
      { Icon: FlaskConical, x: 930, y: 70, size: 50, rotate: 10 },
    ] as Motif[],
  },
  // A mirrored corner for alternate sections.
  cornerLeft: {
    seed: 41,
    nodes: 24,
    area: { x0: 10, x1: 420, y0: 260, y1: 620 },
    link: 130,
    traces: 4,
    motifs: [
      { Icon: Calculator, x: 60, y: 470, size: 64 },
      { Icon: BookOpen, x: 250, y: 300, size: 72 },
      { Icon: Cpu, x: 330, y: 520, size: 54 },
      { Icon: GraduationCap, x: 120, y: 290, size: 60, rotate: -10 },
    ] as Motif[],
  },
} as const;

export type ArtworkVariant = keyof typeof VARIANTS;

function useNetwork(variant: ArtworkVariant) {
  return useMemo(() => {
    const v = VARIANTS[variant];
    const rnd = random(v.seed);
    const { x0, x1, y0, y1 } = v.area;
    const nodes = Array.from({ length: v.nodes }, () => ({ x: x0 + rnd() * (x1 - x0), y: y0 + rnd() * (y1 - y0), r: 1.8 + rnd() * 2.6 }));
    const links: [number, number][] = [];
    nodes.forEach((a, i) => {
      nodes.forEach((b, j) => {
        if (j > i && Math.hypot(a.x - b.x, a.y - b.y) < v.link) links.push([i, j]);
      });
    });
    // Circuit traces: right-angled runs from a node, ending in a pad.
    const traces = Array.from({ length: v.traces }, (_, k) => {
      const start = nodes[(k * 7) % nodes.length]!;
      const dx = (rnd() > 0.5 ? 1 : -1) * (40 + rnd() * 90);
      const dy = (rnd() > 0.5 ? 1 : -1) * (30 + rnd() * 70);
      const end = { x: start.x + dx + dy * 0.4, y: start.y + dy };
      return { d: `M${start.x},${start.y} h${dx} l${dy * 0.4},${dy}`, end };
    });
    return { nodes, links, traces, motifs: v.motifs };
  }, [variant]);
}

/** Absolutely positioned; place inside a `relative overflow-hidden` section. */
export function SiteArtwork({ variant, opacity = 0.14, className = '' }: { variant: ArtworkVariant; opacity?: number; className?: string }) {
  const { nodes, links, traces, motifs } = useNetwork(variant);
  return (
    <svg
      aria-hidden
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMidYMid slice"
      className={`pointer-events-none absolute inset-0 h-full w-full text-(--site-art) ${className}`}
      style={{ opacity }}
    >
      <g stroke="currentColor" fill="none" strokeLinecap="round">
        {links.map(([i, j]) => (
          <line key={`${i}-${j}`} x1={nodes[i]!.x} y1={nodes[i]!.y} x2={nodes[j]!.x} y2={nodes[j]!.y} strokeWidth={0.8} strokeOpacity={0.55} />
        ))}
        {traces.map((t, i) => (
          <g key={i}>
            <path d={t.d} strokeWidth={1.2} strokeLinejoin="round" />
            <circle cx={t.end.x} cy={t.end.y} r={4} strokeWidth={1.2} />
          </g>
        ))}
      </g>
      <g fill="currentColor">
        {nodes.map((n, i) => <circle key={i} cx={n.x} cy={n.y} r={n.r} fillOpacity={0.8} />)}
      </g>
      {motifs.map(({ Icon, x, y, size, rotate = 0 }, i) => (
        <g key={i} transform={`rotate(${rotate} ${x + size / 2} ${y + size / 2})`}>
          <Icon x={x} y={y} size={size} strokeWidth={1.1} color="currentColor" />
        </g>
      ))}
    </svg>
  );
}
