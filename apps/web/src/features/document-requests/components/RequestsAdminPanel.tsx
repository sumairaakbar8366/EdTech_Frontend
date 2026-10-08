import { CheckCircle2, FileSearch, Inbox, PackageCheck, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Alert, Badge, Button, Card, DataTable, EmptyState, Field, FilterBar, FilterSlot, Modal, Pagination, SearchInput, Select, Spinner, TextArea, type Column } from '@/components/ui';
import { RequestTimeline } from '@/features/document-requests/components/RequestTimeline';
import { NEXT_STEPS, requestService, STATUS_LABEL, STATUS_TONE, TYPE_LABEL, useRequestAction, useRequestList, useRequestSummary, type DocumentRequest, type RequestStatus, type RequestType } from '@/features/document-requests/requests';
import { useDocuments } from '@/features/documents/hooks/useDocuments';
import { errorMessage } from '@/lib/errors';
import { useDebouncedValue } from '@/lib/hooks/useDebouncedValue';

const STEP_LABEL: Partial<Record<RequestStatus, string>> = { in_review: 'Start processing', ready: 'Mark ready', completed: 'Mark handed over', rejected: 'Decline' };
const STEP_ICON = { in_review: FileSearch, ready: PackageCheck, completed: CheckCircle2, rejected: XCircle } as const;
const NOTE_HINT: Partial<Record<RequestStatus, string>> = {
  in_review: 'Optional, e.g. “Checking fee clearance with Accounts.”',
  ready: 'Tell them how to collect it, e.g. “Front office, 9 am–1 pm, bring parent CNIC.”',
  completed: 'Optional, e.g. “Collected by the father.”',
  rejected: 'Required: the reason, shown to the requester.',
};
const when = (iso: string) => new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });

function ProcessModal({ request, onClose }: { request: DocumentRequest | null; onClose: () => void }) {
  const [step, setStep] = useState<RequestStatus | null>(null);
  const [note, setNote] = useState('');
  const [documentId, setDocumentId] = useState('');
  const docs = useDocuments('student', request?.studentId ?? '', !!request && request.delivery === 'digital');
  const move = useRequestAction(requestService.move, 'Request updated', onClose);

  useEffect(() => {
    setStep(null);
    setNote('');
    setDocumentId(request?.documentId ?? '');
    move.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [request]);

  if (!request) return null;
  const r = request;
  const section = r.student.enrollments[0]?.section;
  return (
    <Modal open title={`${TYPE_LABEL[r.type]} · ${r.requestNo}`} size="xl" onClose={onClose} footer={<Button variant="secondary" onClick={onClose}>Close</Button>}>
      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <div className="space-y-4">
          <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
            <div><dt className="text-xs font-bold uppercase tracking-wider text-slate-500">Student</dt><dd className="font-semibold">{r.student.firstName} {r.student.lastName}</dd><dd className="text-slate-500">{r.student.admissionNo}{section ? ` · ${section.schoolClass.name} ${section.name}` : ''}</dd></div>
            <div><dt className="text-xs font-bold uppercase tracking-wider text-slate-500">Requested by</dt><dd className="font-semibold">{r.requester ? `${r.requester.firstName} ${r.requester.lastName}` : '—'}</dd><dd className="text-slate-500">{r.requester?.phone ?? r.requester?.email}</dd></div>
            <div><dt className="text-xs font-bold uppercase tracking-wider text-slate-500">Copies / delivery</dt><dd>{r.copies} · {r.delivery === 'digital' ? 'Digital copy' : 'Collect from office'}</dd></div>
            <div><dt className="text-xs font-bold uppercase tracking-wider text-slate-500">Status</dt><dd><Badge tone={STATUS_TONE[r.status]}>{STATUS_LABEL[r.status]}</Badge></dd></div>
            <div className="col-span-2"><dt className="text-xs font-bold uppercase tracking-wider text-slate-500">Purpose</dt><dd>{r.purpose}</dd></div>
            {r.details && <div className="col-span-2"><dt className="text-xs font-bold uppercase tracking-wider text-slate-500">Details</dt><dd className="whitespace-pre-wrap">{r.details}</dd></div>}
          </dl>

          {NEXT_STEPS[r.status].length > 0 && (
            <div className="rounded-lg border border-slate-200 p-4 dark:border-white/10">
              <div className="mb-3 flex flex-wrap gap-2">
                {NEXT_STEPS[r.status].map((s) => {
                  const Icon = STEP_ICON[s as keyof typeof STEP_ICON];
                  return (
                    <Button key={s} variant={step === s ? (s === 'rejected' ? 'danger' : 'primary') : 'secondary'} icon={Icon} onClick={() => setStep(s)}>{STEP_LABEL[s]}</Button>
                  );
                })}
              </div>
              {step && (
                <form onSubmit={(e) => { e.preventDefault(); move.mutate({ id: r.id, status: step, note: note.trim() || null, ...(step === 'ready' && documentId && { documentId }) }); }} className="space-y-3">
                  {move.error && <Alert>{errorMessage(move.error)}</Alert>}
                  <Field label="Note to the requester" hint={NOTE_HINT[step]}>
                    <TextArea rows={3} required={step === 'rejected'} maxLength={1000} value={note} onChange={(e) => setNote(e.target.value)} />
                  </Field>
                  {step === 'ready' && r.delivery === 'digital' && (
                    <Field label="Issued file" hint="Upload it first under the student’s Documents tab, then choose it here.">
                      <Select value={documentId} onChange={(e) => setDocumentId(e.target.value)}>
                        <option value="">No file (they will collect it)</option>
                        {docs.data?.map((d) => <option key={d.id} value={d.id}>{d.title} · {d.fileName}</option>)}
                      </Select>
                    </Field>
                  )}
                  <div className="flex justify-end"><Button type="submit" variant={step === 'rejected' ? 'danger' : 'primary'} loading={move.isPending}>Confirm: {STEP_LABEL[step]}</Button></div>
                </form>
              )}
            </div>
          )}
        </div>
        <div>
          <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-slate-500">History</h3>
          <RequestTimeline request={r} />
        </div>
      </div>
    </Modal>
  );
}

/** Admin: requests from parents and students, processed step by step. */
export function RequestsAdminPanel() {
  const [status, setStatus] = useState<RequestStatus | ''>('');
  const [type, setType] = useState<RequestType | ''>('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState<DocumentRequest | null>(null);
  const q = useDebouncedValue(search.trim());
  const list = useRequestList({ page, pageSize: 20, status, type, q });
  const summary = useRequestSummary().data ?? {};
  // Keep the open dialog in sync after an update.
  const current = open ? list.data?.items.find((i) => i.id === open.id) ?? open : null;

  const columns: Column<DocumentRequest>[] = [
    { header: 'Request', cell: (r) => <div><div className="font-semibold">{TYPE_LABEL[r.type]}</div><div className="text-sm text-slate-500">{r.requestNo} · {r.copies}× · {r.delivery === 'digital' ? 'digital' : 'pickup'}</div></div> },
    { header: 'Student', cell: (r) => <div><div>{r.student.firstName} {r.student.lastName}</div><div className="text-sm text-slate-500">{r.student.enrollments[0] ? `${r.student.enrollments[0].section.schoolClass.name} ${r.student.enrollments[0].section.name}` : r.student.admissionNo}</div></div> },
    { header: 'Requested by', cell: (r) => <span className="text-sm">{r.requester ? `${r.requester.firstName} ${r.requester.lastName}` : '—'}</span> },
    { header: 'Received', cell: (r) => <span className="text-sm text-slate-500">{when(r.createdAt)}</span> },
    { header: 'Status', cell: (r) => <Badge tone={STATUS_TONE[r.status]}>{STATUS_LABEL[r.status]}</Badge> },
  ];
  const chips: (RequestStatus | '')[] = ['', 'submitted', 'in_review', 'ready', 'completed', 'rejected'];
  const waiting = (summary.submitted ?? 0) + (summary.in_review ?? 0);

  return (
    <Card padded={false} title="Requests from parents & students" icon={Inbox} actions={waiting > 0 ? <Badge tone="amber">{waiting} to process</Badge> : undefined}>
      <div className="flex flex-wrap gap-2 border-b border-slate-200 px-4 pt-4 pb-3 dark:border-white/5">
        {chips.map((s) => (
          <button key={s || 'all'} onClick={() => { setStatus(s); setPage(1); }} className={`rounded-full px-3.5 py-1 text-sm font-semibold ring-1 transition-colors ${status === s ? 'bg-slate-800 text-white ring-slate-800 dark:bg-white dark:text-slate-900' : 'text-slate-600 ring-slate-300 hover:bg-slate-100 dark:text-slate-300 dark:ring-white/15 dark:hover:bg-white/5'}`}>
            {s ? STATUS_LABEL[s] : 'All'}{s && summary[s] ? ` · ${summary[s]}` : ''}
          </button>
        ))}
      </div>
      <FilterBar>
        <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search request no., student or admission no.…" label="Search requests" />
        <FilterSlot width="w-56">
          <Select aria-label="Document type" value={type} onChange={(e) => { setType(e.target.value as RequestType | ''); setPage(1); }}>
            <option value="">All documents</option>
            {(Object.keys(TYPE_LABEL) as RequestType[]).map((t) => <option key={t} value={t}>{TYPE_LABEL[t]}</option>)}
          </Select>
        </FilterSlot>
      </FilterBar>
      {list.isLoading && <div className="p-6"><Spinner /></div>}
      {list.data?.items.length === 0 && <EmptyState icon={Inbox} title="No requests">Requests sent by parents and students appear here.</EmptyState>}
      {!!list.data?.items.length && <DataTable columns={columns} rows={list.data.items} rowKey={(r) => r.id} onRowClick={setOpen} />}
      {list.data && <Pagination page={page} pageSize={20} total={list.data.total} onChange={setPage} />}
      <ProcessModal request={current} onClose={() => setOpen(null)} />
    </Card>
  );
}
