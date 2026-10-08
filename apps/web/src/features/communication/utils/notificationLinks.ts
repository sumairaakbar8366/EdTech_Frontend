import type { AreaSlug } from '@/config/roleAreas';

/**
 * Notification links are written once by the API in generic form ("/payslips"); a few pages
 * live under a different path in some role areas. Unknown links pass through unchanged.
 */
const ALIASES: Partial<Record<AreaSlug, Record<string, string>>> = {
  teacher: { '/payslips': '/salary-payslips' },
  admin: { '/payslips': '/payroll' },
};

export function resolveNotificationLink(area: AreaSlug, link: string): string {
  const [path, query] = link.split('?');
  const mapped = ALIASES[area]?.[path!] ?? path!;
  return query ? `${mapped}?${query}` : mapped;
}

export const timeAgo = (iso: string) => {
  const s = Math.round((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s / 60)} min ago`;
  if (s < 86400) return `${Math.floor(s / 3600)} h ago`;
  if (s < 7 * 86400) return `${Math.floor(s / 86400)} d ago`;
  return new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
};
