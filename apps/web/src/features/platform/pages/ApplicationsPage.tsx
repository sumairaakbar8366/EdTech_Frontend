import { Building2, Check, ClipboardList, Mail, Phone, X } from 'lucide-react';
import { useNavigate } from 'react-router';
import { Alert, Badge, Button, Card, EmptyState, PageHeader, Spinner } from '@/components/ui';
import { APPLICATIONS_KEY, useSchoolApplications } from '@/features/platform/hooks/usePlatform';
import { platformService } from '@/features/platform/services/platformService';
import { useAction } from '@/lib/hooks/useAction';
import { formatDate } from '@/lib/format';

/** Self-service school applications: approve or reject, then onboard approved ones from Schools. */
export function ApplicationsPage() {
  const navigate = useNavigate();
  const applications = useSchoolApplications();
  const review = useAction(({ id, status }: { id: string; status: 'approved' | 'rejected' }) => platformService.reviewApplication(id, status).then(() => status), {
    success: (status) => (status === 'approved' ? 'Application approved' : 'Application declined'),
    invalidate: [APPLICATIONS_KEY],
  });
  const list = applications.data ?? [];
  const pending = list.filter((application) => application.status === 'pending').length;

  return (
    <div>
      <PageHeader title="School applications" sub="Review requests before provisioning a school tenant" icon={ClipboardList} tone="teal" />
      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {(['pending', 'approved', 'rejected', 'onboarded'] as const).map((status) => (
          <div key={status} className="surface rounded-lg px-4 py-3">
            <div className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400">{status}</div>
            <div className="mt-1 font-display text-2xl font-bold tabular-nums text-slate-900 dark:text-white">
              {applications.isLoading ? '–' : list.filter((application) => application.status === status).length}
            </div>
          </div>
        ))}
      </div>

      <Card title={`Requests (${pending} pending)`} icon={ClipboardList} tone="teal" padded={false}>
        {applications.isLoading && <div className="px-5"><Spinner /></div>}
        {applications.error && <div className="p-5"><Alert>Could not load school applications.</Alert></div>}
        {applications.data?.length === 0 && (
          <EmptyState icon={ClipboardList} title="No applications yet">New school requests will appear here for review.</EmptyState>
        )}
        <ul className="divide-y divide-slate-200/70 dark:divide-white/5">
          {list.map((application) => (
            <li key={application.id} className="flex flex-wrap items-start gap-4 px-5 py-4">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-bold text-slate-900 dark:text-white">{application.schoolName}</h2>
                  <Badge tone={application.status === 'pending' ? 'amber' : application.status === 'rejected' ? 'rose' : 'emerald'}>
                    {application.status}
                  </Badge>
                  {application.requestedTierCode && <Badge tone="primary">{application.requestedTierCode}</Badge>}
                </div>
                <div className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                  {application.contactFirstName} {application.contactLastName} · {application.designation}
                </div>
                <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                  <a href={`mailto:${application.contactEmail}`} className="inline-flex items-center gap-1 hover:text-primary-700 dark:hover:text-primary-300">
                    <Mail size={13} /> {application.contactEmail}
                  </a>
                  {application.contactPhone && <span className="inline-flex items-center gap-1"><Phone size={13} /> {application.contactPhone}</span>}
                  {application.schoolCity && <span>{application.schoolCity}</span>}
                  {application.schoolWebsite && <a href={application.schoolWebsite} target="_blank" rel="noreferrer" className="hover:text-primary-700 dark:hover:text-primary-300">School website</a>}
                  <span>Received {formatDate(application.createdAt)}</span>
                  {application.preferredBrandColor && <span className="inline-flex items-center gap-1"><span aria-hidden className="h-3 w-3 rounded-sm ring-1 ring-slate-400/40" style={{ backgroundColor: application.preferredBrandColor }} /> School theme</span>}
                </div>
                {application.notes && <p className="mt-2 whitespace-pre-wrap text-sm text-slate-600 dark:text-slate-300">{application.notes}</p>}
              </div>
              {application.status === 'pending' && (
                <div className="flex gap-2">
                  <Button variant="secondary" icon={Check} loading={review.isPending} onClick={() => review.mutate({ id: application.id, status: 'approved' })}>Approve</Button>
                  <Button variant="danger" icon={X} loading={review.isPending} onClick={() => review.mutate({ id: application.id, status: 'rejected' })}>Reject</Button>
                </div>
              )}
              {application.status === 'approved' && (
                <Button variant="secondary" icon={Building2} onClick={() => navigate('/schools', { state: { application } })}>Onboard</Button>
              )}
            </li>
          ))}
        </ul>
      </Card>
      <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">Approved requests can be provisioned from Schools using “Onboard school”; that creates the subscription, tenant and first school administrator.</p>
    </div>
  );
}