import { Check, Inbox, ShieldCheck, X } from 'lucide-react';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Alert, Badge, Button, Card, EmptyState, Field, Input, Modal, Select, Spinner, TextArea } from '@/components/ui';
import { accessService, REQUESTS_KEY, useAccessRequests, type AccessRequest } from '@/features/access/access';
import { useAction } from '@/lib/hooks/useAction';
import { errorMessage } from '@/lib/errors';
import { timeAgo } from '@/features/communication/utils/notificationLinks';

/**
 * People who asked this school for a login (their email is already proven). Approving creates the
 * account, links it to a person the school already has (or makes a new parent / staff record) and
 * emails the User ID and password. Nothing is sent before that.
 */
export function AccessRequestsPanel({ onApproved }: { onApproved?: () => void }) {
  const [status, setStatus] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const list = useAccessRequests(status);
  const [open, setOpen] = useState<AccessRequest | null>(null);

  return (
    <Card title="Access requests" icon={Inbox} tone="teal" padded={false} actions={
      <div className="flex gap-1">{(['pending', 'approved', 'rejected'] as const).map((s) => <button key={s} onClick={() => setStatus(s)} className={`focus-ring rounded-lg px-3 py-1.5 text-sm font-bold uppercase tracking-wide ${status === s ? 'bg-brand text-white' : 'text-slate-600 hover:bg-slate-500/10 dark:text-slate-300'}`}>{s}{list.data?.counts[s] ? ` (${list.data.counts[s]})` : ''}</button>)}</div>
    }>
      {list.isLoading && <div className="p-5"><Spinner /></div>}
      {list.data?.items.length === 0 && <EmptyState icon={Inbox} title={status === 'pending' ? 'No requests waiting' : `No ${status} requests`} tone="teal">People ask for access from your school’s sign-in page (“Request access”). They appear here.</EmptyState>}
      <ul className="divide-y divide-slate-200/70 dark:divide-white/5">
        {list.data?.items.map((r) => (
          <li key={r.id} className="flex flex-wrap items-center gap-3 px-5 py-4">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2"><span className="font-bold text-slate-900 dark:text-white">{r.firstName} {r.lastName}</span><Badge tone="primary">{r.roleLabel}</Badge><Badge tone="emerald">{r.emailMethod === 'google' ? 'Google verified' : 'Email verified'}</Badge></div>
              <div className="mt-0.5 text-sm text-slate-500">{r.email}{r.phone ? ` · ${r.phone}` : ''} · {timeAgo(r.createdAt)}</div>
              {r.note && <div className="mt-1 text-sm text-slate-700 dark:text-slate-200">{r.note}</div>}
              {r.decisionNote && <div className="mt-1 text-sm italic text-slate-500">“{r.decisionNote}”</div>}
            </div>
            {r.status === 'pending' && <Button icon={ShieldCheck} onClick={() => setOpen(r)}>Review</Button>}
          </li>
        ))}
      </ul>
      {open && <DecideModal request={open} onClose={() => setOpen(null)} onApproved={() => { setOpen(null); onApproved?.(); }} />}
    </Card>
  );
}

function DecideModal({ request: r, onClose, onApproved }: { request: AccessRequest; onClose: () => void; onApproved: () => void }) {
  const matches = useQuery({ queryKey: ['access-matches', r.id], queryFn: () => accessService.matches(r.id) });
  const [personId, setPersonId] = useState('');
  const [designation, setDesignation] = useState('');
  const [note, setNote] = useState('');
  const [rejecting, setRejecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const type = matches.data?.type;
  const approve = useAction(() => accessService.approve(r.id, { ...(personId && { personType: type, personId }), ...(designation.trim() && { designation: designation.trim() }) }), { success: () => `Approved. The User ID and password were emailed to ${r.email}.`, invalidate: [REQUESTS_KEY, ['users']], onDone: onApproved, toastErrors: false });
  const reject = useAction(() => accessService.reject(r.id, note.trim() || undefined), { success: 'Request declined', invalidate: [REQUESTS_KEY], onDone: onClose });
  const needsRecord = type === 'student' && !personId;
  return (
    <Modal open title={`${r.firstName} ${r.lastName} · ${r.roleLabel}`} size="lg" onClose={onClose} footer={rejecting ? (
      <><Button variant="secondary" onClick={() => setRejecting(false)}>Back</Button><Button variant="danger" icon={X} loading={reject.isPending} onClick={() => reject.mutate(undefined)}>Decline request</Button></>
    ) : (
      <><Button variant="danger" icon={X} onClick={() => setRejecting(true)}>Decline</Button><Button icon={Check} loading={approve.isPending} disabled={needsRecord} onClick={() => { setError(null); approve.mutate(undefined, { onError: (e) => setError(errorMessage(e)) }); }}>Approve &amp; email login</Button></>
    )}>
      <div className="space-y-4">
        {error && <Alert>{error}</Alert>}
        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          <div><dt className="font-bold uppercase tracking-wider text-slate-500">Email ({r.emailMethod === 'google' ? 'verified with Google' : 'verified by code'})</dt><dd>{r.email}</dd></div>
          <div><dt className="font-bold uppercase tracking-wider text-slate-500">Phone</dt><dd>{r.phone ?? '—'}</dd></div>
          <div className="sm:col-span-2"><dt className="font-bold uppercase tracking-wider text-slate-500">Who they say they are</dt><dd>{r.note}</dd></div>
          {r.answers && Object.entries(r.answers).map(([k, v]) => <div key={k}><dt className="font-bold uppercase tracking-wider text-slate-500">{k}</dt><dd>{Array.isArray(v) ? v.join(', ') : String(v)}</dd></div>)}
        </dl>
        {rejecting ? (
          <Field label="Reason (optional)"><TextArea value={note} maxLength={500} onChange={(e) => setNote(e.target.value)} /></Field>
        ) : (
          <>
            {matches.isLoading && <Spinner />}
            {matches.data && (
              <Field label={type === 'student' ? 'Link to the student’s record' : type === 'guardian' ? 'Link to an existing parent record (or leave empty to create one)' : 'Link to an existing staff record (or leave empty to create one)'} required={type === 'student'}>
                <Select value={personId} onChange={(e) => setPersonId(e.target.value)}>
                  <option value="">{type === 'student' ? 'Choose the student…' : 'Create a new record from this request'}</option>
                  {matches.data.items.map((m) => <option key={m.id} value={m.id}>{m.name} · {m.detail}{m.emailMatches ? ' · same email' : ''}</option>)}
                </Select>
              </Field>
            )}
            {type === 'staff' && !personId && <Field label="Job title for the new staff record"><Input value={designation} maxLength={100} onChange={(e) => setDesignation(e.target.value)} placeholder={r.requestedRole === 'teacher' ? 'Teacher' : 'Staff member'} /></Field>}
            <Alert tone="info">Approving creates the login and emails the User ID and a temporary password to <strong>{r.email}</strong>. They must set their own password at first sign-in.</Alert>
          </>
        )}
      </div>
    </Modal>
  );
}
