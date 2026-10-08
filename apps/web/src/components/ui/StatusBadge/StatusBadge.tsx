import { Badge } from '@/components/ui/Badge/Badge';
import type { Tone } from '@/components/ui/tones';

/**
 * Badge for an enum status, driven by a per-feature map, e.g.
 * <StatusBadge status={invoice.status} tones={INVOICE_TONE} labels={INVOICE_LABEL} />.
 * Adding a status means adding one entry to the feature's map.
 */
export function StatusBadge<S extends string>({ status, tones, labels }: { status: S; tones: Record<S, Tone>; labels?: Partial<Record<S, string>> }) {
  return <Badge tone={tones[status]}>{labels?.[status] ?? status.replace(/_/g, ' ')}</Badge>;
}
