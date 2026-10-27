import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import type { Plugin } from 'vite';
import { isValidSchoolSlug } from '../../packages/shared/src/tenancy';

/**
 * Search engines and link previews (WhatsApp, Facebook, LinkedIn) read the HTML before any script
 * runs, so the production server writes each page's title, description, preview card and
 * structured data into index.html: the home page from the owner's site settings, a school's
 * site (/<slug>) from that school's website. Sign-in pages, the console and dashboards get noindex.
 */

interface Social { whatsapp: string | null; facebookUrl: string | null; instagramUrl: string | null; youtubeUrl: string | null; linkedinUrl: string | null; tiktokUrl: string | null; xUrl: string | null }
interface SiteSettings extends Social { contactEmail: string | null; phone: string | null; address: string | null }
interface SchoolSite {
  school: { name: string; slug: string; logoUrl: string | null };
  published: boolean;
  tagline: string;
  about: string;
  heroMediaId: string | null;
  contact: Social & { phone: string | null; email: string | null; address: string | null };
}
interface Meta { title: string; description: string; url: string; image?: string; index: boolean; type?: string; jsonLd?: object[] }

const SITE_PATHS = new Set(['login', 'access', 'signup', 'pay', 'sso', 'console']);
const CACHE_MS = 5 * 60_000;
const HOME_TITLE = 'Skool EdTech: School Management Software in Pakistan | Free Trial';
const HOME_DESCRIPTION =
  'Skool EdTech runs your whole school online: admissions, attendance, fees, exams and results, timetable, payroll, and parent, student and teacher portals. Start a free trial today.';

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const clip = (s: string, n: number) => (s.length > n ? `${s.slice(0, n - 1).replace(/\s+\S*$/, '')}…` : s);
const profiles = (s: Partial<Social>) => [s.facebookUrl, s.instagramUrl, s.youtubeUrl, s.linkedinUrl, s.tiktokUrl, s.xUrl].filter((u): u is string => !!u);

export function seoPlugin(opts: { origin: string; api: string }): Plugin {
  const cache = new Map<string, { at: number; value: unknown }>();
  const getJson = async <T,>(path: string): Promise<T | null> => {
    const hit = cache.get(path);
    if (hit && Date.now() - hit.at < CACHE_MS) return hit.value as T | null;
    let value: T | null = null;
    try {
      const res = await fetch(`${opts.api}${path}`, { headers: { Accept: 'application/json' }, signal: AbortSignal.timeout(3000) });
      value = res.ok ? ((await res.json()) as T) : null;
    } catch {
      value = null;
    }
    cache.set(path, { at: Date.now(), value });
    return value;
  };

  const homeMeta = async (): Promise<Meta> => {
    const s = await getJson<SiteSettings>('/api/public/site-settings');
    const org = {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'ANet Cyber Solutions',
      url: `${opts.origin}/`,
      ...(s?.contactEmail && { email: s.contactEmail }),
      ...(s?.phone && { telephone: s.phone }),
      ...(s && profiles(s).length && { sameAs: profiles(s) }),
    };
    const app = {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: 'Skool EdTech',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web',
      url: `${opts.origin}/`,
      description: HOME_DESCRIPTION,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'PKR', description: 'Free trial with every feature' },
      publisher: { '@type': 'Organization', name: 'ANet Cyber Solutions' },
    };
    return { title: HOME_TITLE, description: HOME_DESCRIPTION, url: `${opts.origin}/`, index: true, jsonLd: [app, org] };
  };

  const schoolMeta = async (slug: string): Promise<Meta | null> => {
    const s = await getJson<SchoolSite>(`/api/s/${slug}/public/site`);
    if (!s) return null;
    const url = `${opts.origin}/${slug}`;
    const asset = (u: string) => (u.startsWith('/api/') ? `${opts.origin}/api/s/${slug}${u.slice(4)}` : u);
    const image = s.heroMediaId ? `${opts.origin}/api/s/${slug}/public/media/${s.heroMediaId}` : s.school.logoUrl ? asset(s.school.logoUrl) : undefined;
    const c = s.contact;
    const school = {
      '@context': 'https://schema.org',
      '@type': 'School',
      name: s.school.name,
      url,
      description: clip(s.about, 300),
      ...(s.school.logoUrl && { logo: asset(s.school.logoUrl) }),
      ...(image && { image }),
      ...(c.phone && { telephone: c.phone }),
      ...(c.email && { email: c.email }),
      ...(c.address && { address: c.address }),
      ...(profiles(c).length && { sameAs: profiles(c) }),
    };
    return { title: `${s.school.name} | ${s.tagline}`, description: clip(s.about, 160), url, image, index: s.published, jsonLd: [school] };
  };

  const metaFor = async (path: string): Promise<Meta> => {
    const segs = path.split('/').filter(Boolean);
    const first = segs[0]?.toLowerCase() ?? '';
    const hidden = (title = 'Skool EdTech'): Meta => ({ title, description: HOME_DESCRIPTION, url: `${opts.origin}${path}`, index: false });
    if (!segs.length) return homeMeta();
    if (first === 'guide' || first === 'tour') {
      return first === 'guide'
        ? { title: 'User guide: how to use Skool EdTech step by step', description: 'Set up your school on Skool EdTech: sign up with Google, add classes, terms, rooms and staff, design your admission form, publish fees, import from Excel and run admissions to enrollment.', url: `${opts.origin}/guide`, index: true }
        : { title: 'How Skool EdTech works: video walkthrough', description: 'Watch every step of running a school on Skool EdTech, from Google sign-up to admissions, fees, attendance and the parent portal.', url: `${opts.origin}/tour`, index: true };
    }
    if (SITE_PATHS.has(first)) return hidden(first === 'console' ? 'Skool EdTech Platform Console' : 'Sign in | Skool EdTech');
    if (isValidSchoolSlug(first)) {
      const school = await schoolMeta(first);
      if (!school) return hidden();
      // Only the school's site itself is listed; its sign-in and dashboards are not.
      return segs.length === 1 ? school : { ...school, url: `${opts.origin}${path}`, index: false, jsonLd: undefined };
    }
    return hidden();
  };

  const render = (template: string, m: Meta) => {
    const image = m.image ?? `${opts.origin}/og-image.jpg`;
    const tags = [
      `<meta name="description" content="${esc(m.description)}" />`,
      `<meta name="robots" content="${m.index ? 'index, follow, max-image-preview:large' : 'noindex, nofollow'}" />`,
      ...(m.index ? [`<link rel="canonical" href="${esc(m.url)}" />`] : []),
      `<meta property="og:type" content="website" />`,
      `<meta property="og:site_name" content="Skool EdTech" />`,
      `<meta property="og:title" content="${esc(m.title)}" />`,
      `<meta property="og:description" content="${esc(m.description)}" />`,
      `<meta property="og:url" content="${esc(m.url)}" />`,
      `<meta property="og:image" content="${esc(image)}" />`,
      `<meta property="og:locale" content="en_PK" />`,
      `<meta name="twitter:card" content="summary_large_image" />`,
      `<meta name="twitter:title" content="${esc(m.title)}" />`,
      `<meta name="twitter:description" content="${esc(m.description)}" />`,
      `<meta name="twitter:image" content="${esc(image)}" />`,
      ...(m.jsonLd ?? []).map((j) => `<script type="application/ld+json">${JSON.stringify(j).replace(/</g, '\\u003c')}</script>`),
    ].join('\n    ');
    return template
      .replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(m.title)}</title>`)
      .replace(/<meta name="description"[^>]*>/, '')
      .replace('</head>', `    ${tags}\n  </head>`);
  };

  return {
    name: 'schoolerp-seo',
    configurePreviewServer(server) {
      const indexFile = resolve(server.config.root, server.config.build.outDir, 'index.html');
      let template: string | null = null;
      server.middlewares.use((req, res, next) => {
        if ((req.method !== 'GET' && req.method !== 'HEAD') || !req.url) return next();
        const path = decodeURIComponent(new URL(req.url, 'http://local').pathname);
        // Files (assets, robots.txt, sitemap.xml) and the API are served as they are.
        if (path.startsWith('/api/') || /\.[a-z0-9]+$/i.test(path)) return next();
        void (async () => {
          template ??= await readFile(indexFile, 'utf8');
          const html = render(template, await metaFor(path));
          res.statusCode = 200;
          res.setHeader('Content-Type', 'text/html; charset=utf-8');
          res.setHeader('Cache-Control', 'no-cache');
          res.end(req.method === 'HEAD' ? undefined : html);
        })().catch(next);
      });
    },
  };
}
