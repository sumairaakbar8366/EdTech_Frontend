import { useQuery, useQueryClient } from '@tanstack/react-query';
import { CalendarCheck, Fingerprint, LifeBuoy, LogIn, LogOut, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { Alert, Badge, Button, Card, StatusBadge, TextArea } from '@/components/ui';
import { useToast } from '@/components/ui/Toast/Toast';
import { GEO_LABEL, GEO_TONE, REVIEW_TONE } from '@/features/attendance/constants';
import { ATTENDANCE_KEY } from '@/features/attendance/hooks/useAttendance';
import { attendanceService } from '@/features/attendance/services/attendanceService';
import type { MyAttendance } from '@/features/attendance/types/attendance.types';
import { clockTime, currentPosition, deviceId } from '@/features/attendance/utils/attendance.utils';
import { biometricMessage, phoneCanVerify, proveItIsYou, registerThisPhone, reportTrouble } from '@/features/attendance/utils/biometric';
import { errorMessage } from '@/lib/errors';
import { formatDate } from '@/lib/format';

/** Today's check-in with GPS (page 7: geofenced staff attendance) and check-out. */
export function CheckInCard({ data }: { data: MyAttendance | undefined }) {
  const [locating, setLocating] = useState(false);
  const [busy, setBusy] = useState(false);
  const [asking, setAsking] = useState(false);
  const [help, setHelp] = useState('');
  const toast = useToast();
  const qc = useQueryClient();
  const bio = useQuery({ queryKey: [...ATTENDANCE_KEY, 'biometric'], queryFn: attendanceService.biometricStatus });
  const capable = useQuery({ queryKey: ['phone-can-verify'], queryFn: phoneCanVerify, staleTime: Infinity });
  const refresh = () => void qc.invalidateQueries({ queryKey: ATTENDANCE_KEY });
  const today = data?.today;
  const required = bio.data?.required ?? false;
  const phone = bio.data?.devices[0] ?? null;
  const cooling = bio.data?.coolingUntil && new Date(bio.data.coolingUntil) > new Date() ? bio.data.coolingUntil : null;
  const failures = bio.data?.failures ?? 0;
  const openIssue = bio.data?.issues.find((i) => i.status === 'open') ?? null;
  const ready = (!required || phone?.status === 'active') && !cooling;

  async function enrol() {
    setBusy(true);
    try {
      await registerThisPhone(/Android|iPhone|iPad|Mobile/i.test(navigator.userAgent) ? 'My phone' : 'My computer');
      toast.success('Phone registered. The office will approve it, then you can check in.');
      refresh();
    } catch (e) {
      await reportTrouble(e, 'register');
      toast.error(biometricMessage(e) ?? errorMessage(e, 'Could not register this phone'));
      refresh();
    } finally { setBusy(false); }
  }

  async function checkOutNow() {
    setBusy(true);
    try {
      await attendanceService.checkOut(required ? await proveItIsYou() : undefined);
      toast.success('Checked out');
      refresh();
    } catch (e) {
      await reportTrouble(e, 'check_out');
      toast.error(biometricMessage(e) ?? errorMessage(e, 'Check-out failed'));
      refresh();
    } finally { setBusy(false); }
  }

  async function checkIn() {
    setLocating(true);
    try {
      // First it is you (fingerprint or face on your own phone), then where you are.
      const biometric = required ? await proveItIsYou() : undefined;
      const pos = await currentPosition();
      const r = await attendanceService.checkIn({ ...(pos ? { latitude: pos.coords.latitude, longitude: pos.coords.longitude, accuracyMeters: Math.round(pos.coords.accuracy) } : {}), deviceId: deviceId(), ...(biometric && { biometric }) });
      if (r.geofenceStatus === 'valid') toast.success('Checked in — you are on campus');
      else toast.error(r.geofenceStatus === 'flagged' ? 'Checked in, but you appear to be outside the campus. An administrator will review it.' : 'Checked in without location. An administrator will review it.');
      void qc.invalidateQueries({ queryKey: [...ATTENDANCE_KEY, 'me'] });
    } catch (e) {
      await reportTrouble(e, 'check_in');
      toast.error(biometricMessage(e) ?? errorMessage(e, 'Check-in failed'));
      refresh();
    } finally {
      setLocating(false);
    }
  }

  async function sendHelp() {
    setBusy(true);
    try {
      await attendanceService.askForHelp(help.trim());
      toast.success('The office has your request. They will mark your attendance or help you.');
      setAsking(false); setHelp(''); refresh();
    } catch (e) {
      toast.error(errorMessage(e, 'Could not send your request'));
    } finally { setBusy(false); }
  }

  return (
    <Card title={data ? formatDate(data.date + 'T00:00:00Z') : 'Today'} icon={CalendarCheck} tone="teal">
      {data && !data.geofenceConfigured && <div className="mb-3"><Alert tone="info">Your campus has no geofence yet; check-ins will be reviewed by an administrator.</Alert></div>}
      {required && !today && !phone && (
        <div className="space-y-3">
          <Alert tone="info">To stop anyone else marking attendance for you, your own phone’s fingerprint or face lock is used. Set it up once on this phone.</Alert>
          {capable.data === false && <Alert>This phone or browser has no fingerprint, face or screen lock available. Set a screen lock on your phone and use Chrome or Safari.</Alert>}
          <Button icon={Fingerprint} className="w-full py-4 text-lg" loading={busy} disabled={capable.data === false} onClick={enrol}>Set up fingerprint / face</Button>
        </div>
      )}
      {required && !today && phone?.status === 'pending' && <Alert tone="info">Your phone is registered and waiting for the office to approve it. You can check in once it is approved.</Alert>}
      {required && !today && cooling && <div className="mb-3"><Alert>Too many tries. You can try again at <strong>{clockTime(cooling)}</strong>. The office has been told, and can mark your attendance if needed.</Alert></div>}
      {required && !today && !cooling && failures >= 3 && <div className="mb-3"><Alert tone="info">The fingerprint did not match {failures} times. The office can see this and will help. You can keep trying.</Alert></div>}
      {!today && ready ? (
        <Button icon={required ? Fingerprint : LogIn} className="w-full py-4 text-xl" loading={locating} onClick={checkIn}>{locating ? 'Checking…' : required ? 'Check in with fingerprint / face' : 'Check in'}</Button>
      ) : today ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between"><span className="text-slate-500">Checked in</span><strong className="tabular-nums">{clockTime(today.checkInAt)}</strong></div>
          <div className="flex items-center justify-between"><span className="text-slate-500">Checked out</span><strong className="tabular-nums">{clockTime(today.checkOutAt)}</strong></div>
          <div className="flex items-center justify-between"><span className="text-slate-500">Location</span><StatusBadge status={today.geofenceStatus} tones={GEO_TONE} labels={GEO_LABEL} /></div>
          {today.reviewStatus && <div className="flex items-center justify-between"><span className="text-slate-500">Review</span><Badge tone={REVIEW_TONE[today.reviewStatus]}>{today.reviewStatus}</Badge></div>}
          {today.biometricVerified && <div className="flex items-center justify-between"><span className="text-slate-500">Identity</span><Badge tone="emerald"><ShieldCheck size={12} /> verified on your phone</Badge></div>}
          {!today.checkOutAt && <Button variant="secondary" icon={required ? Fingerprint : LogOut} className="w-full" loading={busy} onClick={checkOutNow}>{required ? 'Check out with fingerprint / face' : 'Check out'}</Button>}
        </div>
      ) : null}
      {required && phone?.status === 'active' && (!today || !today.checkOutAt) && (
        <div className="mt-4 border-t border-slate-200 pt-3 dark:border-white/10">
          {openIssue ? (
            <Alert tone="info">The office has your request ({new Date(openIssue.createdAt).toLocaleDateString()}). They will mark your attendance or help you.</Alert>
          ) : asking ? (
            <div className="space-y-2">
              <TextArea rows={3} maxLength={500} value={help} onChange={(e) => setHelp(e.target.value)} placeholder="What happened? e.g. my fingerprint is not recognised, my phone broke, or the app shows an error." />
              <div className="flex gap-2"><Button loading={busy} disabled={help.trim().length < 5} onClick={sendHelp}>Send to the office</Button><Button variant="ghost" onClick={() => setAsking(false)}>Cancel</Button></div>
            </div>
          ) : (
            <button type="button" onClick={() => setAsking(true)} className="focus-ring inline-flex items-center gap-2 rounded-lg px-1 py-1 text-sm font-semibold text-slate-600 hover:text-primary-700 dark:text-slate-300"><LifeBuoy size={15} /> Cannot check in? Ask the office</button>
          )}
        </div>
      )}
    </Card>
  );
}
