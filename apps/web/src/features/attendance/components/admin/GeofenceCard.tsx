import { LocateFixed, MapPin, Save } from 'lucide-react';
import { useState } from 'react';
import { Badge, Button, Card, Field, Input } from '@/components/ui';
import { useToast } from '@/components/ui/Toast/Toast';
import { useAttendanceAction } from '@/features/attendance/hooks/useAttendance';
import { attendanceService } from '@/features/attendance/services/attendanceService';
import type { CampusGeofence } from '@/features/attendance/types/attendance.types';
import { currentPosition } from '@/features/attendance/utils/attendance.utils';
import { onSubmit } from '@/lib/forms';

/** Centre and radius of one campus's check-in area; "Use my location" fills the centre. */
export function GeofenceCard({ campus }: { campus: CampusGeofence }) {
  const g = campus.geofences[0];
  const [f, setF] = useState({ lat: g?.centerLatitude ?? '', lng: g?.centerLongitude ?? '', radius: String(g?.radiusMeters ?? 150) });
  const [locating, setLocating] = useState(false);
  const toast = useToast();
  const save = useAttendanceAction(() => attendanceService.setGeofence(campus.id, { centerLatitude: Number(f.lat), centerLongitude: Number(f.lng), radiusMeters: Number(f.radius) }), 'Geofence saved');
  async function useHere() {
    setLocating(true);
    const p = await currentPosition();
    setLocating(false);
    if (!p) return toast.error('Location unavailable. Allow location access and try again.');
    setF({ ...f, lat: p.coords.latitude.toFixed(6), lng: p.coords.longitude.toFixed(6) });
  }
  return (
    <Card title={campus.name} icon={MapPin} tone={g ? 'teal' : 'slate'} actions={g ? <Badge tone="emerald">Active</Badge> : <Badge tone="amber">Not set</Badge>}>
      <form onSubmit={onSubmit(() => save.mutate(undefined))} className="grid gap-3 sm:grid-cols-3">
        <Field label="Latitude"><Input type="number" step="any" min={-90} max={90} required value={f.lat} onChange={(e) => setF({ ...f, lat: e.target.value })} /></Field>
        <Field label="Longitude"><Input type="number" step="any" min={-180} max={180} required value={f.lng} onChange={(e) => setF({ ...f, lng: e.target.value })} /></Field>
        <Field label="Radius (m)"><Input type="number" min={10} max={10000} required value={f.radius} onChange={(e) => setF({ ...f, radius: e.target.value })} /></Field>
        <div className="flex gap-2 sm:col-span-3">
          <Button type="button" variant="secondary" icon={LocateFixed} loading={locating} onClick={useHere}>Use my location</Button>
          {f.lat && f.lng && <a className="self-center text-sm font-semibold text-primary-600 hover:underline" href={`https://www.openstreetmap.org/?mlat=${f.lat}&mlon=${f.lng}#map=17/${f.lat}/${f.lng}`} target="_blank" rel="noreferrer">View on map ↗</a>}
          <Button type="submit" icon={Save} className="ml-auto" loading={save.isPending}>Save</Button>
        </div>
      </form>
    </Card>
  );
}
