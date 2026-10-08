import { CalendarClock, Plane } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button, Card, Field, Input, PageHeader, Select, StatCard, StatusBadge, TextArea } from '@/components/ui';
import { LEAVE_TONE, daysLabel, leaveService, useLeaveAction, useMyLeave, type LeaveBalance, type LeaveRequest } from '@/features/leave/leave';
import { formatDate } from '@/lib/format';
import { onSubmit } from '@/lib/forms';

function LeaveRequestForm({ balances }: { balances: LeaveBalance[] }) {
  const [f, setF] = useState({ leaveTypeId: '', startDate: '', endDate: '', reason: '' });
  useEffect(() => {
    if (!f.leaveTypeId && balances[0]) setF((s) => ({ ...s, leaveTypeId: balances[0]!.leaveTypeId }));
  }, [balances, f.leaveTypeId]);
  const apply = useLeaveAction(() => leaveService.apply(f), 'Leave requested', () => setF({ ...f, startDate: '', endDate: '', reason: '' }));
  return (
    <Card title="Request leave" icon={Plane} tone="sky">
      <form onSubmit={onSubmit(() => apply.mutate(undefined))} className="space-y-3">
        <Field label="Type"><Select value={f.leaveTypeId} onChange={(e) => setF({ ...f, leaveTypeId: e.target.value })}>{balances.map((b) => <option key={b.leaveTypeId} value={b.leaveTypeId}>{b.name}{b.isPaid ? '' : ' (unpaid)'}</option>)}</Select></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="From"><Input type="date" required value={f.startDate} onChange={(e) => setF({ ...f, startDate: e.target.value })} /></Field>
          <Field label="To"><Input type="date" required min={f.startDate} value={f.endDate} onChange={(e) => setF({ ...f, endDate: e.target.value })} /></Field>
        </div>
        <Field label="Reason"><TextArea required maxLength={1000} value={f.reason} onChange={(e) => setF({ ...f, reason: e.target.value })} /></Field>
        <Button type="submit" className="w-full" loading={apply.isPending}>Submit request</Button>
        <p className="text-sm text-slate-500">Weekly off-days are not counted.</p>
      </form>
    </Card>
  );
}

function MyLeaveRequests({ requests }: { requests: LeaveRequest[] | undefined }) {
  const cancel = useLeaveAction((id: string) => leaveService.cancel(id), 'Request cancelled');
  return (
    <Card title="My requests" icon={CalendarClock} tone="slate" className="lg:col-span-2">
      {requests?.length === 0 && <p className="text-base text-slate-400">No leave requests yet.</p>}
      <ul className="divide-y divide-slate-200/70 dark:divide-white/5">
        {requests?.map((l) => (
          <li key={l.id} className="flex flex-wrap items-center gap-3 py-3">
            <div className="min-w-0 flex-1">
              <div className="font-semibold">{l.leaveType.name} · {formatDate(l.startDate)} – {formatDate(l.endDate)} <span className="text-slate-500">({daysLabel(l.days)})</span></div>
              <div className="text-sm text-slate-500">{l.reason}{l.decisionNote ? ` · Note: ${l.decisionNote}` : ''}</div>
            </div>
            <StatusBadge status={l.status} tones={LEAVE_TONE} />
            {l.status === 'pending' && <Button variant="ghost" className="px-2 py-1 text-sm" onClick={() => cancel.mutate(l.id)}>Cancel</Button>}
          </li>
        ))}
      </ul>
    </Card>
  );
}

/** Staff leave: balances per type, a request form and the request history. */
export function LeavePage() {
  const data = useMyLeave();
  return (
    <div>
      <PageHeader title="Leave" sub={data.data ? `Balances for ${data.data.year}` : undefined} icon={Plane} tone="sky" />
      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {data.data?.balances.map((b) => (
          <StatCard key={b.leaveTypeId} label={b.name} value={b.remaining ?? '∞'} icon={Plane} tone={b.isPaid ? 'sky' : 'slate'} hint={b.quota === null ? `${b.used} used` : `of ${b.quota} · ${b.used} used${b.pending ? ` · ${b.pending} pending` : ''}`} />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <LeaveRequestForm balances={data.data?.balances ?? []} />
        <MyLeaveRequests requests={data.data?.requests} />
      </div>
    </div>
  );
}
