import { CheckInCard } from '@/features/attendance/components/my/CheckInCard';
import { useMyAttendance } from '@/features/attendance/hooks/useAttendance';

/** The staff GPS check-in / check-out card for today. */
export function MyCheckInWidget() {
  const data = useMyAttendance(new Date().toISOString().slice(0, 7));
  return <CheckInCard data={data.data} />;
}
