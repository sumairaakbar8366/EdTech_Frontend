/**
 * A school's own colours, turned into the whole look of the app.
 *
 * The primary colour sets the "structure" (sidebar, banner, page tint, cards, text tints) and the accent
 * colour sets the actions (buttons, highlights). Both themes are derived from the same hue, so the app stays
 * one family of colours (tinted greys, never a rainbow):
 *   - light theme: pale tints of the primary hue; a dark primary shows as its light tint, a deep shade of it
 *     is used for the sidebar and banner so white text stays readable;
 *   - dark theme: a dark primary IS the dark surface (its own lightness); a light primary gives a dark shade
 *     of the same hue.
 * Nothing is set when the school has no custom colours: index.css holds the standard theme.
 */

const STYLE_ID = 'school-brand-theme';

interface Hsl { h: number; s: number; l: number }

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

export function parseHex(hex: string | null | undefined): Hsl | null {
  const m = /^#?([0-9a-f]{6})$/i.exec((hex ?? '').trim());
  if (!m) return null;
  const n = parseInt(m[1]!, 16);
  const r = ((n >> 16) & 255) / 255, g = ((n >> 8) & 255) / 255, b = (n & 255) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  const d = max - min;
  if (d === 0) return { h: 0, s: 0, l };
  const s = d / (1 - Math.abs(2 * l - 1));
  const h = max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return { h: Math.round(((h * 60) + 360) % 360), s, l };
}

const css = (h: number, s: number, l: number, a?: number) => `hsl(${Math.round(h)} ${(clamp(s, 0, 1) * 100).toFixed(1)}% ${(clamp(l, 0, 1) * 100).toFixed(1)}%${a === undefined ? '' : ` / ${a}`})`;

const STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const;
const ramp = (name: string, h: number, s: number, lights: readonly number[]) => STEPS.map((k, i) => `--color-${name}-${k}: ${css(h, s, lights[i]!)};`).join('');

// Lightness of each step, like the standard palettes.
const COLOUR_L = [0.95, 0.9, 0.82, 0.72, 0.62, 0.52, 0.44, 0.36, 0.28, 0.21, 0.13];
const GREY_L = [0.975, 0.955, 0.91, 0.83, 0.66, 0.48, 0.36, 0.28, 0.19, 0.13, 0.08];

interface Tokens { [k: string]: string }

function lightTokens(p: Hsl, accent: string, action: string, actionHover: string): Tokens {
  const sn = clamp(p.s * 0.45, 0.1, 0.3);
  const pale = p.l > 0.75; // a light primary tints the page a little more
  const ss = clamp(p.s, 0.2, 0.55);
  const sideL = p.l < 0.38 ? clamp(p.l, 0.14, 0.3) : 0.2;
  return {
    '--page-bg': css(p.h, pale ? Math.min(p.s, 0.55) * 0.7 : sn * 0.9, pale ? 0.93 : 0.965),
    '--surface-bg': css(p.h, sn * 0.5, 0.99),
    '--surface-raised': css(p.h, sn * 0.4, 1),
    '--surface-border': css(p.h, sn, 0.885),
    '--ink': css(p.h, clamp(p.s, 0.2, 0.45), 0.24),
    '--ink-soft': css(p.h, sn, 0.95),
    '--surface-grad-top': css(p.h, sn * 0.3, 1),
    '--surface-grad-bottom': css(p.h, sn * 0.3, 1),
    '--card-top': css(p.h, sn * 0.3, 1),
    '--card-bottom': css(p.h, sn * 0.8, 0.975),
    '--card-border': css(p.h, sn * 1.3, 0.86),
    '--accent-rim': accent,
    '--hero-bg': css(p.h, ss, sideL + 0.04),
    '--panel-border': css(p.h, sn, 0.9),
    '--panel-from': css(p.h, sn * 0.3, 1),
    '--panel-to': css(p.h, sn * 0.8, 0.97),
    '--panel-ink': css(p.h, clamp(p.s, 0.2, 0.45), 0.2),
    '--welcome-from': css(p.h, sn * 0.3, 1),
    '--welcome-mid': css(p.h, sn * 0.8, 0.975),
    '--welcome-to': css(p.h, sn * 1.3, 0.94),
    '--welcome-blob': css(p.h, clamp(p.s, 0.25, 0.6) * 0.8, 0.91),
    '--app-sidebar-bg': css(p.h, ss, sideL + 0.03),
    '--app-sidebar-bg-deep': css(p.h, ss, sideL - 0.05),
    '--brand-action': action,
    '--brand-action-hover': actionHover,
    '--brand-primary': css(p.h, ss, 0.44),
    '--smoke': 'transparent',
  };
}

function darkTokens(p: Hsl, accent: string, action: string, actionHover: string): Tokens {
  // A dark primary is the dark theme's own base; a lighter one gives a dark shade of the same hue.
  const b = p.l <= 0.3 ? clamp(p.l, 0.12, 0.24) : 0.15;
  const sd = clamp(p.s * 0.55, 0.12, 0.32);
  return {
    '--page-bg': css(p.h, sd * 0.9, b - 0.05),
    '--surface-bg': css(p.h, sd, b + 0.02),
    '--surface-raised': css(p.h, sd, b + 0.07),
    '--surface-border': css(p.h, sd * 0.9, b + 0.13),
    '--ink': css(p.h, 0.25, 0.84),
    '--ink-soft': css(p.h, sd, b + 0.04),
    '--surface-grad-top': css(p.h, sd, b + 0.075),
    '--surface-grad-bottom': css(p.h, sd, b + 0.02),
    '--card-top': css(p.h, sd, b + 0.075),
    '--card-bottom': css(p.h, sd, b + 0.02),
    '--card-border': css(p.h, sd * 0.9, b + 0.15),
    '--accent-rim': accent,
    '--hero-bg': css(p.h, sd, b + 0.06),
    '--panel-border': css(p.h, sd * 0.9, b + 0.13),
    '--panel-from': css(p.h, sd, b + 0.06),
    '--panel-to': css(p.h, sd, b + 0.02),
    '--panel-ink': css(p.h, 0.2, 0.9),
    '--welcome-from': css(p.h, sd, b + 0.05),
    '--welcome-mid': css(p.h, sd, b + 0.02),
    '--welcome-to': css(p.h, sd, b + 0.09),
    '--welcome-blob': css(p.h, sd, b + 0.12),
    '--app-sidebar-bg': css(p.h, sd, b + 0.04),
    '--app-sidebar-bg-deep': css(p.h, sd, b - 0.04),
    '--brand-action': action,
    '--brand-action-hover': actionHover,
    '--brand-primary': css(p.h, sd, b + 0.2),
    '--smoke': css(p.h, clamp(p.s, 0.3, 0.6), 0.5, 0.15),
  };
}

const decl = (t: Tokens) => Object.entries(t).map(([k, v]) => `${k}:${v};`).join('');

/** The CSS for a school's colours, or null when they are not usable. */
export function brandThemeCss(primaryHex: string | null | undefined, accentHex?: string | null): string | null {
  const p = parseHex(primaryHex);
  if (!p) return null;
  const a = parseHex(accentHex) ?? { h: p.h, s: clamp(p.s, 0.55, 0.9), l: 0.45 };
  // Buttons carry white text: the accent is deepened until it is readable, never lightened.
  const aS = clamp(a.s, 0.45, 0.95);
  const aL = Math.min(a.l, 0.44);
  const action = css(a.h, aS, aL);
  const hover = css(a.h, aS, Math.max(0.2, aL - 0.06));
  const accentRim = css(a.h, aS, 0.7);
  const ss = clamp(p.s, 0.25, 0.65);
  const st = clamp(p.s * 0.35, 0.08, 0.2);
  const shared =
    ramp('primary', p.h, ss, COLOUR_L) + ramp('indigo', p.h, ss, COLOUR_L) +
    ramp('magenta', a.h, clamp(a.s, 0.55, 0.95), COLOUR_L) + ramp('violet', a.h, clamp(a.s, 0.55, 0.95), COLOUR_L) +
    ramp('slate', p.h, st, GREY_L);
  return `:root{${shared}${decl(lightTokens(p, accentRim, action, hover))}}` +
    `:root[data-theme='dark']{${decl(darkTokens(p, css(a.h, aS, 0.38), action, hover))}}`;
}

/** Applies (or clears, with null) a school's colours to the whole page. */
export function applyBrandTheme(primaryHex: string | null | undefined, accentHex?: string | null): void {
  const text = brandThemeCss(primaryHex, accentHex);
  let el = document.getElementById(STYLE_ID);
  if (!text) { el?.remove(); return; }
  if (!el) { el = document.createElement('style'); el.id = STYLE_ID; document.head.appendChild(el); }
  if (el.textContent !== text) el.textContent = text;
}
