import { Badge } from '@/components/ui';
import { MARKS, MARK_TONE } from '@/features/attendance/constants';
import type { Mark } from '@/features/attendance/types/attendance.types';

/** "present: 12 · late: 1 · …" badges in mark order. */
export function MarkCountBadges({ counts }: { counts: Partial<Record<Mark | string, number>> }) {
  return (
    <>
      {MARKS.map((m) => <Badge key={m} tone={MARK_TONE[m]}>{m}: {counts[m] ?? 0}</Badge>)}
    </>
  );
}
