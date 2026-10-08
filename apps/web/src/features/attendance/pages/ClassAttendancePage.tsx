import { ClipboardCheck } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Card, EmptyState, Field, PageHeader, Select, Spinner } from '@/components/ui';
import { RosterCard } from '@/features/attendance/components/class/RosterCard';
import { useHeldToday, useRoster } from '@/features/attendance/hooks/useAttendance';

/** Teacher: pick one of today's started classes and mark its students. */
export function ClassAttendancePage() {
  const today = useHeldToday();
  const held = today.data?.slots.filter((s) => s.session) ?? [];
  const [sessionId, setSessionId] = useState('');
  // Default to the live class, else the first one held today.
  useEffect(() => {
    if (!sessionId && held.length) setSessionId((held.find((s) => s.session!.status === 'live') ?? held[0]!).session!.id);
  }, [held, sessionId]);
  const roster = useRoster(sessionId);

  return (
    <div>
      <PageHeader title="Class Attendance" sub="Mark students for today's classes" icon={ClipboardCheck} tone="teal" />
      {today.isLoading && <Spinner />}
      {today.data && held.length === 0 && <Card><EmptyState icon={ClipboardCheck} title="No class started yet today" tone="teal">Start a class from Today's Classes, then mark attendance here.</EmptyState></Card>}
      {held.length > 0 && (
        <div className="mb-4 w-96 max-w-full">
          <Field label="Class">
            <Select value={sessionId} onChange={(e) => setSessionId(e.target.value)}>
              {held.map((s) => <option key={s.session!.id} value={s.session!.id}>{s.startTime} · {s.subject.name} · {s.section.schoolClass.name} – {s.section.name} ({s.session!.status})</option>)}
            </Select>
          </Field>
        </div>
      )}
      {roster.data && <RosterCard roster={roster.data} />}
    </div>
  );
}
