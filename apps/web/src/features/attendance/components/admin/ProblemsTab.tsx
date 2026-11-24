import { useQuery } from '@tanstack/react-query';
import { Check, Fingerprint, LifeBuoy, Plus, RotateCcw, Send, TriangleAlert, UserCheck, X } from 'lucide-react';
import { useState } from 'react';
import { Alert, Badge, Button, Card, EmptyState, Field, Input, Modal, SearchSelect, Select, Spinner, TextArea } from '@/components/ui';
import { useToast } from '@/components/ui/Toast/Toast';
import { ATTENDANCE_KEY } from '@/features/attendance/hooks/useAttendance';
import { attendanceService } from '@/features/attendance/services/attendanceService';
import type { AttendanceIssue, IssueKind } from '@/features/attendance/types/attendance.types';
import { errorMessage } from '@/lib/errors';
import { formatDate } from '@/lib/format';
import { api } from '@/services/api/http';
import { useQueryClient } from '@tanstack/react-query';

const KIND: Record<IssueKind, { label: string; tone: 'amber' | 'rose' | 'primary' | 'slate' }> = {
  fingerprint_failed: { label: 'Fingerprint not matching', tone: 'amber' },
  cooling: { label: 'Cooling period', tone: 'rose' },
  system_error: { label: 'System or phone error', tone: 'rose' },
  help: { label: 'Asked for help', tone: 'primary' },
};
const today = () => new Date().toISOString().slice(0, 10);

/** Mark one teacher present by hand: the reason and who did it stay on the record. */
function MarkModal({ issue, onClose }: { issue?: AttendanceIssue; onClose: () => void }) {
  const qc = useQueryClient();
  const toast = useToast();
  const staff = useQuery({ queryKey: ['attendance', 'staff-options'], queryFn: () => api<{ items: { id: string; firstName: string; lastName: string; employeeNo: string; designation: string }[] }>('/staff?status=active&pageSize=100'), enabled: !issue });
  const [employeeId, setEmployeeId] = useState(issue?.employee.id ?? '');
  const [date, setDate] = useState(today());
  const [checkIn, setCheckIn] = useState('08:00');
  const [checkOut, setCheckOut] = useState('');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  async function save() {
    setBusy(true); setError(null);
    try {
      if (issue) await attendanceService.resolveIssue(issue.id, { action: 'manual', note: note.trim() || undefined, date, checkIn, ...(checkOut && { checkOut }) });
      else await attendanceService.markByHand({ employeeId, date, checkIn, reason: note.trim(), ...(checkOut && { checkOut }) });
      toast.success('Attendance marked');
      void qc.invalidateQueries({ queryKey: ATTENDANCE_KEY });
      onClose();
    } catch (e) { setError(errorMessage(e)); } finally { setBusy(false); }
  }
  const options = (staff.data?.items ?? []).map((s) => ({ value: s.id, label: `${s.firstName} ${s.lastName}`, detail: `${s.employeeNo} · ${s.designation}` }));
  return (
    <Modal open title={issue ? `Mark ${issue.employee.firstName} ${issue.employee.lastName} present` : 'Mark a teacher present'} onClose={onClose} footer={<><Button variant="secondary" onClick={onClose}>Cancel</Button><Button icon={Check} loading={busy} disabled={!employeeId || !checkIn || (!issue && note.trim().length < 3)} onClick={save}>Mark present</Button></>}>
      <div className="space-y-4">
        {error && <Alert>{error}</Alert>}
        {!issue && <Field label="Teacher or staff member" required><SearchSelect options={options} value={employeeId} onChange={setEmployeeId} placeholder="Type a name…" /></Field>}
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Date"><Input type="date" max={today()} value={date} onChange={(e) => setDate(e.target.value)} /></Field>
          <Field label="Check-in" required><Input type="time" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} /></Field>
          <Field label="Check-out" hint="Leave empty if still at school"><Input type="time" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} /></Field>
        </div>
        <Field label={issue ? 'Note (optional)' : 'Reason'} required={!issue} hint="Kept on the record, with your name."><TextArea rows={2} maxLength={300} value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. fingerprint reader problem, I saw them arrive at 8:05" /></Field>
      </div>
    </Modal>
  );
}

/** Tell Skool EdTech about a system problem: it reaches the owner's console and email. */
function ReportModal({ issue, onClose }: { issue: AttendanceIssue; onClose: () => void }) {
  const qc = useQueryClient();
  const toast = useToast();
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  async function send() {
    setBusy(true);
    try { await attendanceService.reportIssue(issue.id, note.trim() || undefined); toast.success('Reported to Skool EdTech. We will look into it.'); void qc.invalidateQueries({ queryKey: ATTENDANCE_KEY }); onClose(); }
    catch (e) { toast.error(errorMessage(e)); } finally { setBusy(false); }
  }
  return (
    <Modal open title="Report to Skool EdTech" onClose={onClose} footer={<><Button variant="secondary" onClick={onClose}>Cancel</Button><Button icon={Send} loading={busy} onClick={send}>Send report</Button></>}>
      <div className="space-y-3">
        <p className="text-sm text-slate-600 dark:text-slate-300">Our team is told about this problem ({issue.employee.firstName} {issue.employee.lastName}: {KIND[issue.kind].label.toLowerCase()}). Mark the teacher present meanwhile, so nobody loses a day.</p>
        <Field label="Anything we should know? (optional)"><TextArea rows={3} maxLength={500} value={note} onChange={(e) => setNote(e.target.value)} /></Field>
      </div>
    </Modal>
  );
}

/** Fingerprint trouble and system errors for the office: mark attendance by hand, reset a phone, or report. */
export function ProblemsTab({ canEdit }: { canEdit: boolean }) {
  const qc = useQueryClient();
  const toast = useToast();
  const [status, setStatus] = useState<'open' | 'resolved'>('open');
  const [marking, setMarking] = useState<AttendanceIssue | 'new' | null>(null);
  const [reporting, setReporting] = useState<AttendanceIssue | null>(null);
  const issues = useQuery({ queryKey: [...ATTENDANCE_KEY, 'issues', status], queryFn: () => attendanceService.issues(status) });
  async function act(id: string, action: 'reset_phone' | 'dismiss') {
    try { await attendanceService.resolveIssue(id, { action }); toast.success(action === 'reset_phone' ? 'Phone reset. The teacher can set up again.' : 'Closed'); void qc.invalidateQueries({ queryKey: ATTENDANCE_KEY }); }
    catch (e) { toast.error(errorMessage(e)); }
  }
  const rows = issues.data ?? [];
  return (
    <Card title="Attendance problems" icon={TriangleAlert} tone="amber" padded={false} actions={<div className="flex items-center gap-2"><Select aria-label="Show" className="w-40" value={status} onChange={(e) => setStatus(e.target.value as 'open' | 'resolved')}><option value="open">Needs attention</option><option value="resolved">Handled</option></Select>{canEdit && <Button icon={Plus} onClick={() => setMarking('new')}>Mark someone present</Button>}</div>}>
      {issues.isLoading && <div className="p-5"><Spinner /></div>}
      {issues.data && rows.length === 0 && <EmptyState icon={Fingerprint} title={status === 'open' ? 'No problems right now' : 'Nothing handled yet'} tone="amber">{status === 'open' ? 'When a teacher’s fingerprint will not match three times, or the system shows an error, it appears here. You can mark their attendance by hand so nobody loses a day.' : 'Problems you handle are kept here for the record.'}</EmptyState>}
      <ul className="divide-y divide-slate-200/70 dark:divide-white/5">
        {rows.map((i) => (
          <li key={i.id} className="space-y-2 px-5 py-4">
            <div className="flex flex-wrap items-center gap-2"><span className="font-bold text-slate-900 dark:text-white">{i.employee.firstName} {i.employee.lastName}</span><span className="text-sm text-slate-500">{i.employee.employeeNo} · {i.employee.designation}</span><Badge tone={KIND[i.kind].tone}>{KIND[i.kind].label}</Badge>{i.reportedAt && <Badge tone="emerald">reported to Skool EdTech</Badge>}</div>
            {i.message && <p className="text-sm text-slate-700 dark:text-slate-200">{i.message}</p>}
            <p className="text-xs text-slate-500">{formatDate(i.createdAt)}{i.attempts ? ` · ${i.attempts} failed tries` : ''}{i.recentTries.length ? ` · last: ${i.recentTries.map((t) => `${t.outcome}${t.reason ? ` (${t.reason})` : ''}`).slice(0, 3).join(', ')}` : ''}</p>
            {i.status === 'resolved' && <p className="text-xs text-emerald-700 dark:text-emerald-300">{i.resolution === 'manual' ? 'Marked present by the office' : i.resolution === 'reset_phone' ? 'Phone reset' : 'Closed'}{i.resolutionNote ? `: ${i.resolutionNote}` : ''}</p>}
            {canEdit && i.status === 'open' && (
              <div className="flex flex-wrap gap-2 pt-1">
                <Button icon={UserCheck} onClick={() => setMarking(i)}>Mark present</Button>
                <Button variant="secondary" icon={RotateCcw} onClick={() => void act(i.id, 'reset_phone')}>Reset phone</Button>
                <Button variant="secondary" icon={LifeBuoy} onClick={() => setReporting(i)}>Report to Skool EdTech</Button>
                <Button variant="ghost" icon={X} onClick={() => void act(i.id, 'dismiss')}>Close</Button>
              </div>
            )}
          </li>
        ))}
      </ul>
      {marking && <MarkModal issue={marking === 'new' ? undefined : marking} onClose={() => setMarking(null)} />}
      {reporting && <ReportModal issue={reporting} onClose={() => setReporting(null)} />}
    </Card>
  );
}
