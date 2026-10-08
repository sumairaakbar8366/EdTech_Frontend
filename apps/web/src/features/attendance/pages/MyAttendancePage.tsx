import { CalendarClock, ShieldAlert, UserCheck } from 'lucide-react';
import { useState } from 'react';
import { PageHeader, StatCard } from '@/components/ui';
import { AttendanceHistoryCard } from '@/features/attendance/components/my/AttendanceHistoryCard';
import { CheckInCard } from '@/features/attendance/components/my/CheckInCard';
import { useMyAttendance } from '@/features/attendance/hooks/useAttendance';

/** Staff: GPS check-in / check-out and the month's attendance history. */
export function MyAttendancePage() {
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const data = useMyAttendance(month);
  const summary = data.data?.summary;
  return (
    <div>
      <PageHeader title="My Attendance" sub="Check in and out with your location" icon={UserCheck} tone="teal" />
      <div className="grid gap-6 lg:grid-cols-3">
        <CheckInCard data={data.data} />
        <div className="space-y-4 lg:col-span-2">
          <div className="grid grid-cols-3 gap-3">
            <StatCard label="Present" value={summary?.present ?? '–'} icon={UserCheck} tone="emerald" />
            <StatCard label="In review" value={summary?.pendingReview ?? '–'} icon={CalendarClock} tone="amber" />
            <StatCard label="Rejected" value={summary?.rejected ?? '–'} icon={ShieldAlert} tone="rose" />
          </div>
          <AttendanceHistoryCard records={data.data?.records} month={month} onMonth={setMonth} />
        </div>
      </div>
    </div>
  );
}
