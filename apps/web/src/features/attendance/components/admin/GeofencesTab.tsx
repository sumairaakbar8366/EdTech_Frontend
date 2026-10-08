import { Alert } from '@/components/ui';
import { GeofenceCard } from '@/features/attendance/components/admin/GeofenceCard';
import { useGeofences } from '@/features/attendance/hooks/useAttendance';

export function GeofencesTab() {
  const data = useGeofences();
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="lg:col-span-2"><Alert tone="info">Staff check-ins are compared with their campus geofence. Inside the radius = valid; outside = flagged for review; no GPS = unknown.</Alert></div>
      {data.data?.map((c) => <GeofenceCard key={c.id} campus={c} />)}
    </div>
  );
}
