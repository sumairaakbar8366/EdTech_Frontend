import { isValidSchoolSlug } from '@schoolerp/shared';

export const BASE_DOMAIN = (import.meta.env.VITE_BASE_DOMAIN ?? 'localhost').toLowerCase();
export const PLATFORM_HOST = (import.meta.env.VITE_PLATFORM_HOST ?? `admin.${BASE_DOMAIN}`).toLowerCase();
export const CONTACT_EMAIL = import.meta.env.VITE_CONTACT_EMAIL ?? 'sales@schoolerp.local';

/** True on the public marketing site (the bare base domain or www.). */
export function isMarketingHost(hostname = window.location.hostname): boolean {
  const h = hostname.toLowerCase();
  return h === BASE_DOMAIN || h === `www.${BASE_DOMAIN}`;
}

function originFor(host: string): string {
  const { protocol, port } = window.location;
  return `${protocol}//${host}${port ? `:${port}` : ''}`;
}

export const schoolOrigin = (slug: string) => originFor(`${slug}.${BASE_DOMAIN}`);
export const platformOrigin = () => originFor(PLATFORM_HOST);
export const marketingOrigin = () => originFor(BASE_DOMAIN);

/** Validates a school address typed by a visitor ("greenfield" or "greenfield.example.com"). */
export function normalizeSchoolSlug(input: string): string | null {
  const slug = input.trim().toLowerCase().split('.')[0] ?? '';
  return isValidSchoolSlug(slug) ? slug : null;
}

/** Responsive photo from public/images/marketing (1600 and 800 px WebP). */
export function photo(name: string) {
  return {
    src: `/images/marketing/${name}-1600.webp`,
    srcSet: `/images/marketing/${name}-800.webp 800w, /images/marketing/${name}-1600.webp 1600w`,
  };
}
