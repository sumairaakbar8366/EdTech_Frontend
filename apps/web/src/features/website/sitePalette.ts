// School website palette: a steel-grey base that takes on the school's colours without letting
// them flood the page. Any colour an admin picks is tamed (saturation and lightness clamped) and
// then nudged until text on it, or in it, meets WCAG AA contrast.

type Rgb = [number, number, number];
type Hsl = [number, number, number];

/** Greyish blue: the website accent when a school has not chosen its own colours. */
export const DEFAULT_SITE_ACCENT = '#4a6382';

const STEEL_DEEP = '#1c2531';
const SMOKE = '#f1f3f6';
const LINE = '#d6dce3';

function parseHex(hex: string | null | undefined): Rgb | null {
  const m = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(hex?.trim() ?? '');
  if (!m) return null;
  const h = m[1]!.length === 3 ? m[1]!.replace(/./g, (c) => c + c) : m[1]!;
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)) as Rgb;
}

const toHex = (rgb: Rgb) => `#${rgb.map((v) => Math.round(Math.min(255, Math.max(0, v))).toString(16).padStart(2, '0')).join('')}`;

function rgbToHsl([r, g, b]: Rgb): Hsl {
  const [rn, gn, bn] = [r / 255, g / 255, b / 255];
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  const h = max === rn ? (gn - bn) / d + (gn < bn ? 6 : 0) : max === gn ? (bn - rn) / d + 2 : (rn - gn) / d + 4;
  return [h * 60, s, l];
}

function hslToRgb([h, s, l]: Hsl): Rgb {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  const [r, g, b] = h < 60 ? [c, x, 0] : h < 120 ? [x, c, 0] : h < 180 ? [0, c, x] : h < 240 ? [0, x, c] : h < 300 ? [x, 0, c] : [c, 0, x];
  return [(r + m) * 255, (g + m) * 255, (b + m) * 255];
}

function luminance(rgb: Rgb): number {
  const [r, g, b] = rgb.map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  }) as Rgb;
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrast(a: string, b: string): number {
  const [la, lb] = [luminance(parseHex(a)!), luminance(parseHex(b)!)];
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

/** `amount` of `b` mixed into `a` (0 = a, 1 = b), in sRGB. */
function mix(a: string, b: string, amount: number): string {
  const [x, y] = [parseHex(a)!, parseHex(b)!];
  return toHex(x.map((v, i) => v + (y[i]! - v) * amount) as Rgb);
}

/** Calm a colour down so it reads as institutional, not neon: cap saturation, keep it mid-dark. */
function tame(hex: string): string {
  const [h, s, l] = rgbToHsl(parseHex(hex)!);
  if (s < 0.08) return toHex(hslToRgb([h, s, Math.min(Math.max(l, 0.3), 0.5)]));
  return toHex(hslToRgb([h, Math.min(s, 0.5), Math.min(Math.max(l, 0.26), 0.47)]));
}

/** Darken (or lighten) in small steps until the colour reaches `target` contrast with `against`. */
function untilContrast(hex: string, against: string, target: number, direction: 'darker' | 'lighter'): string {
  let [h, s, l] = rgbToHsl(parseHex(hex)!);
  let out = hex;
  for (let i = 0; i < 50 && contrast(out, against) < target; i++) {
    l = direction === 'darker' ? Math.max(0, l - 0.02) : Math.min(1, l + 0.02);
    if (direction === 'lighter') s = Math.max(0, s - 0.01);
    out = toHex(hslToRgb([h, s, l]));
  }
  return out;
}

export interface SitePalette {
  /** Buttons, links and icons on light surfaces (white text on it passes AA). */
  accent: string;
  /** A pale wash of the accent for chips, active tabs and soft panels. */
  accentSoft: string;
  /** Thin rules and small details: the school's second colour when it has one. */
  detail: string;
  /** The dark hero / footer band of the Classic style: deep steel carrying a little of the school's hue. */
  band: string;
  bandDeep: string;
  /** Accent used on the dark band (passes AA against it). */
  bandAccent: string;
  /** Light hero and top-bar background: white with a soft wash of the school's hue. */
  wash: string;
  /** Page background: smoky grey, barely tinted. */
  page: string;
  /** Borders and dividers. */
  line: string;
  /** Background artwork strokes. */
  art: string;
}

export function sitePalette(primary: string | null | undefined, secondary?: string | null): SitePalette {
  const brand = tame(parseHex(primary) ? primary! : DEFAULT_SITE_ACCENT);
  const second = parseHex(secondary) ? tame(secondary!) : brand;
  const accent = untilContrast(brand, '#ffffff', 4.6, 'darker');
  const band = mix(STEEL_DEEP, brand, 0.12);
  return {
    accent,
    accentSoft: mix('#ffffff', accent, 0.1),
    detail: untilContrast(second, '#ffffff', 3, 'darker'),
    band,
    bandDeep: mix('#121820', brand, 0.08),
    bandAccent: untilContrast(mix(brand, '#ffffff', 0.35), band, 4.6, 'lighter'),
    wash: mix('#f6f8fa', brand, 0.07),
    page: mix(SMOKE, brand, 0.035),
    line: mix(LINE, brand, 0.08),
    art: mix('#5c6b7d', brand, 0.25),
  };
}

/** The palette as CSS custom properties for the site's root element. */
export function paletteVars(p: SitePalette): Record<string, string> {
  return {
    '--site-accent': p.accent,
    '--site-accent-soft': p.accentSoft,
    '--site-detail': p.detail,
    '--site-band': p.band,
    '--site-band-deep': p.bandDeep,
    '--site-band-accent': p.bandAccent,
    '--site-wash': p.wash,
    '--site-page': p.page,
    '--site-line': p.line,
    '--site-art': p.art,
  };
}
