import { isValidSchoolSlug } from '@schoolerp/shared';

export const BASE_DOMAIN = (import.meta.env.VITE_BASE_DOMAIN ?? 'localhost').toLowerCase();
export const CONTACT_EMAIL = import.meta.env.VITE_CONTACT_EMAIL ?? 'sales@schoolerp.local';

/**
 * Everything runs on the main domain, by path: the public site at /, the single sign-in at /login,
 * the owner console at /console/…, and each school at /<slug>/… (website, its sign-in, dashboards).
 * A school's own (paid) domain serves that school at its root.
 */
export function isMainDomain(hostname = window.location.hostname): boolean {
  const h = hostname.toLowerCase();
  return h === BASE_DOMAIN || h === `www.${BASE_DOMAIN}`;
}

/** First path segments that belong to the public site, never a school. */
const SITE_PATHS = new Set(['', 'login', 'access', 'signup', 'pay', 'sso']);

export type AppLocation =
  | { app: 'site' }
  | { app: 'console'; basename: '/console'; apiBase: '/api/console' }
  | { app: 'school'; slug: string; basename: string; apiBase: string }
  /** A school's own verified domain: the school at the root, its tenant found by the host. */
  | { app: 'own-domain'; basename: ''; apiBase: '/api' };

/** Which app this address belongs to. */
export function appLocation(): AppLocation {
  if (!isMainDomain()) return { app: 'own-domain', basename: '', apiBase: '/api' };
  const first = window.location.pathname.split('/')[1]?.toLowerCase() ?? '';
  if (SITE_PATHS.has(first)) return { app: 'site' };
  if (first === 'console') return { app: 'console', basename: '/console', apiBase: '/api/console' };
  if (isValidSchoolSlug(first)) return { app: 'school', slug: first, basename: `/${first}`, apiBase: `/api/s/${first}` };
  return { app: 'site' };
}

function mainOrigin(): string {
  const { protocol, port } = window.location;
  return isMainDomain() ? window.location.origin : `${protocol}//${BASE_DOMAIN}${port ? `:${port}` : ''}`;
}

/** This app's home: the school's public site (/<slug>), the console, or a school's own domain. */
export function appRootUrl(): string {
  const where = appLocation();
  return `${window.location.origin}${where.app === 'site' ? '' : where.basename}/`;
}

/** https://ed-tech.example.com/demo */
export const schoolOrigin = (slug: string) => `${mainOrigin()}/${slug}`;
/** The owner console. */
export const platformOrigin = () => `${mainOrigin()}/console`;
/** The public site (and its /login). */
export const marketingOrigin = () => mainOrigin();

/** Validates a school address typed by a visitor ("greenfield", "/greenfield" or a full link). */
export function normalizeSchoolSlug(input: string): string | null {
  const value = input.trim().toLowerCase().replace(/^https?:\/\/[^/]+/, '').replace(/^\/+/, '');
  const slug = value.split(/[/.?#]/)[0] ?? '';
  return isValidSchoolSlug(slug) ? slug : null;
}

/** Responsive photo from public/images/marketing (1600 and 800 px WebP). */
export function photo(name: string) {
  return {
    src: `/images/marketing/${name}-1600.webp`,
    srcSet: `/images/marketing/${name}-800.webp 800w, /images/marketing/${name}-1600.webp 1600w`,
  };
}
