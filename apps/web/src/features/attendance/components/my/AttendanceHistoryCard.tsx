import { CalendarCheck } from 'lucide-react';
import { Badge, Card, StatusBadge } from '@/components/ui';
import { GEO_LABEL, GEO_TONE, REVIEW_TONE } from '@/features/attendance/constants';
import type { StaffRecord } from '@/features/attendance/types/attendance.types';
import { clockTime } from '@/features/attendance/utils/attendance.utils';
import { formatDate } from '@/lib/format';

/** A month of the signed-in employee's check-ins, with a month picker. */
export function AttendanceHistoryCard({ records, month, onMonth }: { records: StaffRecord[] | undefined; month: string; onMonth: (m: string) => void }) {
  return (
    <Card title="History" icon={CalendarCheck} tone="slate" actions={<input aria-label="Month" type="month" value={month} onChange={(e) => onMonth(e.target.value)} className="rounded-lg border border-slate-300 px-2 py-1 text-sm dark:border-white/10 dark:bg-[#0e1626]" />}>
      {records?.length === 0 && <p className="text-base text-slate-400">No attendance this month.</p>}
      <ul className="divide-y divide-slate-200/70 dark:divide-white/5">
        {records?.map((r) => (
          <li key={r.id} className="flex flex-wrap items-center gap-3 py-2">
            <span className="w-28 font-semibold">{formatDate(r.date)}</span>
            <span className="tabular-nums text-slate-600 dark:text-slate-300">{clockTime(r.checkInAt)} – {clockTime(r.checkOutAt)}</span>
            <StatusBadge status={r.geofenceStatus} tones={GEO_TONE} labels={GEO_LABEL} />
            {r.reviewStatus && <Badge tone={REVIEW_TONE[r.reviewStatus]}>{r.reviewStatus}</Badge>}
          </li>
        ))}
      </ul>
    </Card>
  );
}
