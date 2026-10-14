import { schoolOrigin } from '@/config/site';
/** The school's address on the main domain: https://ed-tech.example.com/<slug>. */
export function schoolUrl(slug: string): string {
  return schoolOrigin(slug);
}

export const tierLimit = (n: number | null) => (n === null ? 'Unlimited' : n.toLocaleString());
