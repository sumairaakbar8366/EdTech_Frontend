import { Check, Plane, X } from 'lucide-react';
import { useState } from 'react';
import { Button, Card, EmptyState, Field, IconTile, Select, Spinner, StatusBadge } from '@/components/ui';
import { LEAVE_TONE, daysLabel, leaveService, useLeaveAction, useLeaveRequests, type LeaveRequest, type LeaveStatus } from '@/features/leave/leave';
import { formatDate } from '@/lib/format';

function LeaveRequestCard({ request: l, canDecide, onDecide }: { request: LeaveRequest; canDecide: boolean; onDecide: (decision: 'approved' | 'rejected') => void }) {
  return (
    <Card>
      <div className="flex items-start gap-3">
        <IconTile icon={Plane} tone={l.leaveType.isPaid ? 'sky' : 'slate'} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2"><span className="text-lg font-bold">{l.employee.firstName} {l.employee.lastName}</span><StatusBadge status={l.status} tones={LEAVE_TONE} /></div>
          <div className="text-base text-slate-600 dark:text-slate-300">{l.leaveType.name} · {formatDate(l.startDate)} – {formatDate(l.endDate)} · <strong>{daysLabel(l.days)}</strong></div>
          <p className="mt-1 text-base text-slate-500">{l.reason}</p>
        </div>
      </div>
      {canDecide && l.status === 'pending' && (
        <div className="mt-3 flex justify-end gap-2 border-t border-slate-200 pt-3 dark:border-white/5">
          <Button variant="danger" icon={X} onClick={() => onDecide('rejected')}>Reject</Button>
          <Button icon={Check} onClick={() => onDecide('approved')}>Approve</Button>
        </div>
      )}
    </Card>
  );
}

/** Admin: staff leave requests filtered by status, with approve / reject. */
export function LeaveApprovals({ canDecide }: { canDecide: boolean }) {
  const [status, setStatus] = useState<LeaveStatus | ''>('pending');
  const data = useLeaveRequests(status);
  const decide = useLeaveAction((v: { id: string; decision: 'approved' | 'rejected' }) => leaveService.decide(v.id, v.decision), 'Leave decision saved');
  return (
    <div>
      <div className="mb-4 w-48">
        <Field label="Show">
          <Select value={status} onChange={(e) => setStatus(e.target.value as LeaveStatus | '')}>
            <option value="pending">Pending</option><option value="approved">Approved</option><option value="rejected">Rejected</option><option value="">All</option>
          </Select>
        </Field>
      </div>
      {data.isLoading && <Spinner />}
      {data.data?.length === 0 && <Card><EmptyState icon={Plane} title="No leave requests" tone="sky" /></Card>}
      <div className="grid gap-3 lg:grid-cols-2">
        {data.data?.map((l) => <LeaveRequestCard key={l.id} request={l} canDecide={canDecide} onDecide={(decision) => decide.mutate({ id: l.id, decision })} />)}
      </div>
    </div>
  );
}
