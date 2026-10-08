import { ChevronDown, Download, FileText, Plus, Send, X } from 'lucide-react';
import { useState } from 'react';
import { Badge, Button, Card, ConfirmDialog, EmptyState, PageHeader, Spinner } from '@/components/ui';
import { useSchoolUser } from '@/features/auth/usePermissions';
import { NewRequestModal } from '@/features/document-requests/components/NewRequestModal';
import { RequestTimeline } from '@/features/document-requests/components/RequestTimeline';
import { requestService, STATUS_LABEL, STATUS_TONE, TYPE_LABEL, useMyRequests, useRequestAction, type DocumentRequest } from '@/features/document-requests/requests';
import { documentService } from '@/features/documents/services/documentService';
import { useMyChildren, useStudentDetail } from '@/features/students/hooks/useStudents';

function RequestCard({ r, onCancel }: { r: DocumentRequest; onCancel: (r: DocumentRequest) => void }) {
  const [open, setOpen] = useState(r.status !== 'completed' && r.status !== 'cancelled');
  const section = r.student.enrollments[0]?.section;
  return (
    <div className="surface rounded-xl">
      <div className="flex flex-wrap items-start gap-4 p-5">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600 dark:bg-white/5 dark:text-slate-300"><FileText size={20} /></span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">{TYPE_LABEL[r.type]}</h3>
            <Badge tone={STATUS_TONE[r.status]}>{STATUS_LABEL[r.status]}</Badge>
          </div>
          <p className="text-sm text-slate-500">
            {r.requestNo} · {r.student.firstName} {r.student.lastName}{section ? ` (${section.schoolClass.name} ${section.name})` : ''} · {r.copies} cop{r.copies === 1 ? 'y' : 'ies'} · {r.delivery === 'digital' ? 'Digital copy' : 'Collect from office'}
          </p>
          <p className="mt-1 text-slate-700 dark:text-slate-200">{r.purpose}</p>
        </div>
        <div className="flex gap-2">
          {r.status === 'submitted' && <Button variant="ghost" icon={X} onClick={() => onCancel(r)}>Cancel</Button>}
          {r.documentId && (r.status === 'ready' || r.status === 'completed') && (
            <Button variant="secondary" icon={Download} onClick={() => void documentService.download({ id: r.documentId!, fileName: `${TYPE_LABEL[r.type]} ${r.requestNo}.pdf` })}>Download</Button>
          )}
          <Button variant="ghost" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
            History <ChevronDown size={15} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
          </Button>
        </div>
      </div>
      {r.adminNote && (r.status !== 'submitted') && (
        <div className={`mx-5 mb-4 rounded-lg border-l-4 px-4 py-2.5 text-sm ${r.status === 'rejected' ? 'border-rose-500 bg-rose-50 text-rose-800 dark:bg-rose-500/10 dark:text-rose-200' : 'border-orange-500 bg-orange-50 text-slate-700 dark:bg-orange-500/10 dark:text-slate-200'}`}>
          <span className="font-semibold">School office: </span>{r.adminNote}
        </div>
      )}
      {open && <div className="border-t border-slate-200 px-5 py-4 dark:border-white/10"><RequestTimeline request={r} /></div>}
    </div>
  );
}

/** Parent / student: request marksheets and certificates and follow their progress. */
export function MyRequestsPage() {
  const me = useSchoolUser();
  const isParent = me.roles.some((r) => r.key === 'parent');
  const children = useMyChildren();
  const self = useStudentDetail('own', undefined, !isParent);
  const students = isParent
    ? (children.data ?? []).filter((c) => c.status === 'active').map((c) => ({ id: c.id, name: `${c.firstName} ${c.lastName}` }))
    : self.data ? [{ id: self.data.id, name: `${self.data.firstName} ${self.data.lastName}` }] : [];
  const list = useMyRequests();
  const [creating, setCreating] = useState(false);
  const [cancelling, setCancelling] = useState<DocumentRequest | null>(null);
  const cancel = useRequestAction(requestService.cancel, 'Request cancelled', () => setCancelling(null));
  const active = list.data?.filter((r) => ['submitted', 'in_review', 'ready'].includes(r.status)) ?? [];
  const past = list.data?.filter((r) => !['submitted', 'in_review', 'ready'].includes(r.status)) ?? [];

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader title="Document requests" sub="Ask the school for marksheets, certificates and letters" icon={Send} actions={<Button icon={Plus} disabled={!students.length} onClick={() => setCreating(true)}>New request</Button>} />
      {list.isLoading && <Spinner />}
      {list.data?.length === 0 && (
        <Card>
          <EmptyState icon={FileText} title="No requests yet">Need a marksheet, character certificate or bonafide letter? Send a request and the school office will prepare it.</EmptyState>
        </Card>
      )}
      {active.length > 0 && (
        <section className="mb-8 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">In progress</h2>
          {active.map((r) => <RequestCard key={r.id} r={r} onCancel={setCancelling} />)}
        </section>
      )}
      {past.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">Earlier</h2>
          {past.map((r) => <RequestCard key={r.id} r={r} onCancel={setCancelling} />)}
        </section>
      )}
      <NewRequestModal open={creating} onClose={() => setCreating(false)} students={students} />
      <ConfirmDialog open={!!cancelling} title="Cancel this request?" message={`${cancelling ? TYPE_LABEL[cancelling.type] : ''} (${cancelling?.requestNo}) will be withdrawn.`} confirmLabel="Cancel request" loading={cancel.isPending} onConfirm={() => cancelling && cancel.mutate(cancelling.id)} onClose={() => setCancelling(null)} />
    </div>
  );
}
