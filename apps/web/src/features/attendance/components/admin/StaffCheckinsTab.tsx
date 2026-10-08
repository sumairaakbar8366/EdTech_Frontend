import { CalendarClock, LocateFixed, Navigation, ShieldAlert, UserCheck } from 'lucide-react';
import { useState } from 'react';
import { Button, Card, EmptyState, Field, Input, Spinner, StatCard } from '@/components/ui';
import { StaffCheckinTable } from '@/features/attendance/components/admin/StaffCheckinTable';
import { useAttendanceAction, useStaffCheckins } from '@/features/attendance/hooks/useAttendance';
import { attendanceService } from '@/features/attendance/services/attendanceService';

/** A day's staff check-ins (with totals), or the queue of check-ins awaiting review. */
export function StaffCheckinsTab({ canReview }: { canReview: boolean }) {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [queue, setQueue] = useState(false);
  const data = useStaffCheckins(date, queue);
  const review = useAttendanceAction((v: { id: string; decision: 'approved' | 'rejected'; note: string | null }) => attendanceService.review(v.id, v.decision, v.note), 'Review saved');
  const t = data.data?.totals;
  return (
    <div>
      <div className="mb-4 flex flex-wrap items-end gap-3">
        <div className="w-48"><Field label="Date"><Input type="date" disabled={queue} value={date} onChange={(e) => setDate(e.target.value)} /></Field></div>
        <Button variant={queue ? 'primary' : 'secondary'} icon={ShieldAlert} onClick={() => setQueue(!queue)}>{queue ? 'Showing review queue' : 'Review queue'}</Button>
      </div>
      {!queue && (
        <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-5">
          <StatCard label="Checked in" value={t ? `${t.checkedIn}/${t.activeStaff}` : '–'} icon={UserCheck} tone="primary" />
          <StatCard label="Inside campus" value={t?.valid ?? '–'} icon={LocateFixed} tone="emerald" />
          <StatCard label="Outside campus" value={t?.flagged ?? '–'} icon={ShieldAlert} tone="rose" />
          <StatCard label="No GPS" value={t?.unknown ?? '–'} icon={Navigation} tone="slate" />
          <StatCard label="Need review" value={t?.pendingReview ?? '–'} icon={CalendarClock} tone="amber" />
        </div>
      )}
      <Card padded={false}>
        {data.isLoading && <div className="px-5"><Spinner /></div>}
        {data.data?.records.length === 0 && <EmptyState icon={UserCheck} title={queue ? 'Nothing to review' : 'No check-ins on this day'} tone="teal" />}
        {!!data.data?.records.length && <StaffCheckinTable records={data.data.records} showDate={queue} canReview={canReview} onReview={(id, decision, note) => review.mutate({ id, decision, note })} />}
      </Card>
    </div>
  );
}
