import { Check, X } from 'lucide-react';
import { useState } from 'react';
import { Badge, Button, DataTable, StatusBadge, type Column } from '@/components/ui';
import { GEO_LABEL, GEO_TONE, REVIEW_TONE } from '@/features/attendance/constants';
import type { StaffRecord } from '@/features/attendance/types/attendance.types';
import { clockTime, distanceLabel } from '@/features/attendance/utils/attendance.utils';
import { formatDate } from '@/lib/format';

interface Props {
  records: StaffRecord[];
  showDate: boolean;
  canReview: boolean;
  onReview: (id: string, decision: 'approved' | 'rejected', note: string | null) => void;
}

/** Check-ins with location status; flagged/unknown ones can be accepted or rejected. */
export function StaffCheckinTable({ records, showDate, canReview, onReview }: Props) {
  const [notes, setNotes] = useState<Record<string, string>>({});
  const columns: Column<StaffRecord>[] = [
    { header: 'Staff', cell: (r) => <><div className="font-semibold">{r.employee?.firstName} {r.employee?.lastName}</div><div className="text-sm text-slate-500">{r.employee?.designation} · {r.employee?.campus.code}</div></> },
    ...(showDate ? [{ header: 'Date', cell: (r: StaffRecord) => formatDate(r.date) }] : []),
    { header: 'In', cell: (r) => clockTime(r.checkInAt), className: 'tabular-nums' },
    { header: 'Out', cell: (r) => clockTime(r.checkOutAt), className: 'tabular-nums' },
    {
      header: 'Location',
      cell: (r) => (
        <>
          <StatusBadge status={r.geofenceStatus} tones={GEO_TONE} labels={GEO_LABEL} />
          {r.distanceMeters !== null && <span className="ml-2 text-sm text-slate-500">{distanceLabel(r.distanceMeters)}</span>}
        </>
      ),
    },
    {
      header: 'Review',
      cell: (r) =>
        r.reviewStatus === 'pending' && canReview ? (
          <div className="flex flex-wrap items-center gap-2">
            <input aria-label="Review note" placeholder="Note" value={notes[r.id] ?? ''} onChange={(e) => setNotes({ ...notes, [r.id]: e.target.value })} className="w-36 rounded-lg border border-slate-300 px-2 py-1 text-sm dark:border-white/10 dark:bg-[#0e1626]" />
            <Button className="px-2.5 py-1 text-sm" icon={Check} onClick={() => onReview(r.id, 'approved', notes[r.id] || null)}>Accept</Button>
            <Button variant="danger" className="px-2.5 py-1 text-sm" icon={X} onClick={() => onReview(r.id, 'rejected', notes[r.id] || null)}>Reject</Button>
          </div>
        ) : r.reviewStatus ? (
          <Badge tone={REVIEW_TONE[r.reviewStatus]}>{r.reviewStatus}</Badge>
        ) : (
          <span className="text-sm text-slate-400">Not needed</span>
        ),
    },
  ];
  return <DataTable columns={columns} rows={records} rowKey={(r) => r.id} searchText={(r) => [r.employee?.firstName, r.employee?.lastName, r.employee?.designation, r.employee?.campus.code]} searchPlaceholder="Search staff, designation or campus…" />;
}
