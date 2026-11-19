import { useQuery } from '@tanstack/react-query';
import { Check, Fingerprint, RotateCcw, Smartphone } from 'lucide-react';
import { Badge, Button, Card, EmptyState, Spinner } from '@/components/ui';
import { useAttendanceAction } from '@/features/attendance/hooks/useAttendance';
import { attendanceService } from '@/features/attendance/services/attendanceService';
import { formatDate } from '@/lib/format';

/**
 * Each teacher enrols their own phone (its fingerprint or face lock) once. The office approves it here, and can
 * reset it when a teacher changes or loses the phone. Until a phone is approved nobody can check in for that teacher.
 */
export function PhonesTab({ canEdit }: { canEdit: boolean }) {
  const phones = useQuery({ queryKey: ['attendance', 'phones'], queryFn: attendanceService.phones });
  const approve = useAttendanceAction((id: string) => attendanceService.approvePhone(id), 'Phone approved');
  const reset = useAttendanceAction((id: string) => attendanceService.resetPhone(id), 'Phone removed. The teacher can register again.');
  const rows = phones.data ?? [];
  const waiting = rows.filter((p) => p.status === 'pending').length;
  return (
    <Card title={`Staff phones${waiting ? ` · ${waiting} waiting` : ''}`} icon={Fingerprint} tone="teal" padded={false}>
      {phones.isLoading && <div className="p-5"><Spinner /></div>}
      {phones.data && rows.length === 0 && <EmptyState icon={Smartphone} title="No phones registered yet" tone="teal">When a teacher sets up fingerprint or face check on their phone, it appears here for you to approve.</EmptyState>}
      <ul className="divide-y divide-slate-200/70 dark:divide-white/5">
        {rows.map((p) => (
          <li key={p.id} className="flex flex-wrap items-center gap-3 px-5 py-4">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2"><span className="font-bold text-slate-900 dark:text-white">{p.employee.firstName} {p.employee.lastName}</span><span className="text-sm text-slate-500">{p.employee.employeeNo} · {p.employee.designation}</span><Badge tone={p.status === 'active' ? 'emerald' : 'amber'}>{p.status === 'active' ? 'approved' : 'waiting for approval'}</Badge></div>
              <div className="text-sm text-slate-500">{p.label ?? 'Phone'} · registered {formatDate(p.createdAt)}{p.lastUsedAt ? ` · last used ${formatDate(p.lastUsedAt)}` : ''}</div>
            </div>
            {canEdit && p.status === 'pending' && <Button icon={Check} loading={approve.isPending} onClick={() => approve.mutate(p.id)}>Approve</Button>}
            {canEdit && <Button variant="secondary" icon={RotateCcw} loading={reset.isPending} onClick={() => reset.mutate(p.id)}>{p.status === 'pending' ? 'Reject' : 'Reset'}</Button>}
          </li>
        ))}
      </ul>
    </Card>
  );
}
