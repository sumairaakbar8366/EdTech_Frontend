import { bytesToBase64 } from '@/utils/base64';

/**
 * The website's own pages (its HTML, script and styles) kept on the phone, so the app opens with no internet. While
 * online the app shows the live website; with no connection it shows this saved copy, and the website's own offline
 * layer shows the school's data it saved (and keeps changes to send later).
 */
export interface ShellMeta { builtAt: number; bytes: number; site: string }
export interface ShellDeps {
  fetchText(url: string): Promise<string>;
  fetchBytes(url: string): Promise<Uint8Array>;
  save(html: string, meta: ShellMeta): Promise<void>;
  now(): number;
}

const abs = (site: string, href: string) => (/^https?:\/\//i.test(href) ? href : `${site}${href.startsWith('/') ? '' : '/'}${href}`);
const SCRIPT = /<script\b[^>]*\bsrc="([^"]+)"[^>]*>\s*<\/script>/gi;
const STYLE = /<link\b[^>]*\brel="stylesheet"[^>]*\bhref="([^"]+)"[^>]*>/gi;
const PRELOAD = /<link\b[^>]*\brel="modulepreload"[^>]*>\s*/gi;
const BRAND_IMG = /\/brand\/[\w-]+\.png/g;
const MIME = 'image/png';

/** `</script>` inside inlined code would end the tag early. */
const safeScript = (code: string) => code.replace(/<\/script/gi, '<\\/script');
const safeStyle = (css: string) => css.replace(/<\/style/gi, '<\\/style');

/** The scripts and styles an index.html loads. */
export function assetsOf(indexHtml: string): { scripts: string[]; styles: string[] } {
  return { scripts: [...indexHtml.matchAll(SCRIPT)].map((m) => m[1]!), styles: [...indexHtml.matchAll(STYLE)].map((m) => m[1]!) };
}

/** One self-contained page: the same index.html with its script and styles written inside it. */
export function buildShell(indexHtml: string, code: Record<string, string>, images: Record<string, string>): string {
  const swapImages = (text: string) => text.replace(BRAND_IMG, (p) => images[p] ?? p);
  return indexHtml
    .replace(PRELOAD, '')
    .replace(SCRIPT, (_m, src: string) => (code[src] !== undefined ? `<script type="module">\n${safeScript(swapImages(code[src]!))}\n</script>` : ''))
    .replace(STYLE, (_m, href: string) => (code[href] !== undefined ? `<style>\n${safeStyle(swapImages(code[href]!))}\n</style>` : ''));
}

/** Downloads the website's page and its files and saves the one-file copy. Returns false (and keeps the old copy) on any problem. */
export async function refreshShell(site: string, deps: ShellDeps): Promise<{ ok: boolean; bytes: number }> {
  try {
    const index = await deps.fetchText(`${site}/`);
    const { scripts, styles } = assetsOf(index);
    if (scripts.length === 0) return { ok: false, bytes: 0 }; // not the website (a captive portal, an error page)
    const code: Record<string, string> = {};
    await Promise.all([...scripts, ...styles].map(async (href) => { code[href] = await deps.fetchText(abs(site, href)); }));
    const wanted = new Set<string>();
    for (const text of Object.values(code)) for (const m of text.matchAll(BRAND_IMG)) wanted.add(m[0]);
    const images: Record<string, string> = {};
    await Promise.all([...wanted].map(async (p) => { try { images[p] = `data:${MIME};base64,${bytesToBase64(await deps.fetchBytes(abs(site, p)))}`; } catch { /* the image stays a link */ } }));
    const html = buildShell(index, code, images);
    await deps.save(html, { builtAt: deps.now(), bytes: html.length, site });
    return { ok: true, bytes: html.length };
  } catch {
    return { ok: false, bytes: 0 };
  }
}

export const SHELL_MAX_AGE_MS = 12 * 3600_000;
export const shellIsStale = (meta: ShellMeta | null, site: string, now: number) => !meta || meta.site !== site || now - meta.builtAt > SHELL_MAX_AGE_MS;
