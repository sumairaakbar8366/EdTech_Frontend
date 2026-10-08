import { useQueryClient } from '@tanstack/react-query';
import { CalendarCheck, LogIn, LogOut } from 'lucide-react';
import { useState } from 'react';
import { Alert, Badge, Button, Card, StatusBadge } from '@/components/ui';
import { useToast } from '@/components/ui/Toast/Toast';
import { GEO_LABEL, GEO_TONE, REVIEW_TONE } from '@/features/attendance/constants';
import { ATTENDANCE_KEY, useAttendanceAction } from '@/features/attendance/hooks/useAttendance';
import { attendanceService } from '@/features/attendance/services/attendanceService';
import type { MyAttendance } from '@/features/attendance/types/attendance.types';
import { clockTime, currentPosition, deviceId } from '@/features/attendance/utils/attendance.utils';
import { errorMessage } from '@/lib/errors';
import { formatDate } from '@/lib/format';

/** Today's check-in with GPS (page 7: geofenced staff attendance) and check-out. */
export function CheckInCard({ data }: { data: MyAttendance | undefined }) {
  const [locating, setLocating] = useState(false);
  const toast = useToast();
  const qc = useQueryClient();
  const checkOut = useAttendanceAction(() => attendanceService.checkOut(), 'Checked out');
  const today = data?.today;

  async function checkIn() {
    setLocating(true);
    const pos = await currentPosition();
    try {
      const r = await attendanceService.checkIn(pos ? { latitude: pos.coords.latitude, longitude: pos.coords.longitude, accuracyMeters: Math.round(pos.coords.accuracy), deviceId: deviceId() } : { deviceId: deviceId() });
      if (r.geofenceStatus === 'valid') toast.success('Checked in — you are on campus');
      else toast.error(r.geofenceStatus === 'flagged' ? 'Checked in, but you appear to be outside the campus. An administrator will review it.' : 'Checked in without location. An administrator will review it.');
      void qc.invalidateQueries({ queryKey: [...ATTENDANCE_KEY, 'me'] });
    } catch (e) {
      toast.error(errorMessage(e, 'Check-in failed'));
    } finally {
      setLocating(false);
    }
  }

  return (
    <Card title={data ? formatDate(data.date + 'T00:00:00Z') : 'Today'} icon={CalendarCheck} tone="teal">
      {data && !data.geofenceConfigured && <div className="mb-3"><Alert tone="info">Your campus has no geofence yet; check-ins will be reviewed by an administrator.</Alert></div>}
      {!today ? (
        <Button icon={LogIn} className="w-full py-4 text-xl" loading={locating} onClick={checkIn}>{locating ? 'Getting location…' : 'Check in'}</Button>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between"><span className="text-slate-500">Checked in</span><strong className="tabular-nums">{clockTime(today.checkInAt)}</strong></div>
          <div className="flex items-center justify-between"><span className="text-slate-500">Checked out</span><strong className="tabular-nums">{clockTime(today.checkOutAt)}</strong></div>
          <div className="flex items-center justify-between"><span className="text-slate-500">Location</span><StatusBadge status={today.geofenceStatus} tones={GEO_TONE} labels={GEO_LABEL} /></div>
          {today.reviewStatus && <div className="flex items-center justify-between"><span className="text-slate-500">Review</span><Badge tone={REVIEW_TONE[today.reviewStatus]}>{today.reviewStatus}</Badge></div>}
          {!today.checkOutAt && <Button variant="secondary" icon={LogOut} className="w-full" loading={checkOut.isPending} onClick={() => checkOut.mutate(undefined)}>Check out</Button>}
        </div>
      )}
    </Card>
  );
}
