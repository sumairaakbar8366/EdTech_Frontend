import { ClipboardCheck } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Card, EmptyState, Field, Input, Select } from '@/components/ui';
import { useClasses } from '@/features/academics/hooks/useAcademics';
import { MarkCountBadges } from '@/features/attendance/components/MarkCountBadges';
import { useSectionDay } from '@/features/attendance/hooks/useAttendance';
import { clockTime } from '@/features/attendance/utils/attendance.utils';

/** A section's classes on a day with their attendance counts. */
export function StudentsDayTab() {
  const classes = useClasses();
  const [sectionId, setSectionId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  useEffect(() => {
    if (!sectionId && classes.data?.[0]?.sections[0]) setSectionId(classes.data[0].sections[0].id);
  }, [classes.data, sectionId]);
  const data = useSectionDay(sectionId, date);
  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-3">
        <div className="w-72">
          <Field label="Section">
            <Select value={sectionId} onChange={(e) => setSectionId(e.target.value)}>
              {classes.data?.map((c) => <optgroup key={c.id} label={c.name}>{c.sections.map((s) => <option key={s.id} value={s.id}>{c.name} – {s.name} ({s.campus.code})</option>)}</optgroup>)}
            </Select>
          </Field>
        </div>
        <div className="w-48"><Field label="Date"><Input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></Field></div>
      </div>
      {data.data?.sessions.length === 0 && <Card><EmptyState icon={ClipboardCheck} title="No classes were held" tone="teal" /></Card>}
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {data.data?.sessions.map((s) => (
          <Card key={s.id}>
            <div className="text-lg font-bold uppercase tracking-wide">{s.subject}</div>
            <div className="text-base text-slate-500">{s.teacher} · {clockTime(s.startedAt)} · {s.status}</div>
            <div className="mt-3 flex flex-wrap gap-1.5"><MarkCountBadges counts={s.counts} /></div>
          </Card>
        ))}
      </div>
    </div>
  );
}
