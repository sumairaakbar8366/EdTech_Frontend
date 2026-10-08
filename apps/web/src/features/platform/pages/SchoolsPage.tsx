import { Ban, Building2, CircleCheck, ExternalLink, Hourglass, KeyRound, Plus, RotateCcw, School } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { Badge, Button, Card, ConfirmDialog, EmptyState, IconTile, PageHeader, Spinner, StatCard } from '@/components/ui';
import { EMPTY_SCHOOL_FORM, OnboardSchoolModal, type SchoolForm } from '@/features/platform/components/OnboardSchoolModal';
import { ResetAdminModal } from '@/features/platform/components/ResetAdminModal';
import { SCHOOLS_KEY, useSchools, useTiers } from '@/features/platform/hooks/usePlatform';
import { platformService } from '@/features/platform/services/platformService';
import type { SchoolApplication, SchoolSummary } from '@/features/platform/types/platform.types';
import { schoolUrl } from '@/features/platform/utils/platform.utils';
import { useAction } from '@/lib/hooks/useAction';
import { formatDate } from '@/lib/format';

/** Platform "Tenant Management": list schools and onboard new ones (with a 1-month trial). */
export function SchoolsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const schools = useSchools();
  const tiers = useTiers({ status: 'active' });
  const [form, setForm] = useState<SchoolForm | null>(null);
  const [suspending, setSuspending] = useState<SchoolSummary | null>(null);
  const [resetting, setResetting] = useState<SchoolSummary | null>(null);

  // "Onboard" on an approved application lands here with the application in router state.
  useEffect(() => {
    const application = (location.state as { application?: SchoolApplication } | null)?.application;
    if (!application) return;
    setForm({
      ...EMPTY_SCHOOL_FORM,
      name: application.schoolName,
      tierCode: application.requestedTierCode ?? '',
      adminFirstName: application.contactFirstName,
      adminLastName: application.contactLastName,
      adminEmail: application.contactEmail,
      primaryColor: application.preferredBrandColor ?? '',
      applicationId: application.id,
    });
    navigate(location.pathname, { replace: true, state: null });
  }, [location.pathname, location.state, navigate]);

  const setStatus = useAction(({ id, status }: { id: string; status: SchoolSummary['status'] }) => platformService.setSchoolStatus(id, status).then(() => status), {
    success: (status) => (status === 'active' ? 'School reactivated' : 'School suspended'),
    invalidate: [SCHOOLS_KEY],
    onDone: () => setSuspending(null),
  });

  const list = schools.data ?? [];
  const trialing = list.filter((s) => s.subscriptions[0]?.status === 'trialing').length;
  const tierCounts = new Map<string, number>();
  for (const school of list) {
    const tierCode = school.subscriptions[0]?.tier.code;
    if (tierCode) tierCounts.set(tierCode, (tierCounts.get(tierCode) ?? 0) + 1);
  }

  return (
    <div>
      <PageHeader
        title="Schools"
        sub="Tenant management"
        icon={School}
        tone="primary"
        actions={<Button icon={Plus} onClick={() => setForm(EMPTY_SCHOOL_FORM)}>Onboard school</Button>}
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard label="Schools" value={schools.isLoading ? '–' : list.length} icon={Building2} tone="primary" />
        <StatCard label="Active" value={schools.isLoading ? '–' : list.filter((s) => s.status === 'active').length} icon={CircleCheck} tone="emerald" />
        <StatCard label="On free trial" value={schools.isLoading ? '–' : trialing} icon={Hourglass} tone="amber" />
      </div>

      <Card title="Schools by subscription" icon={Building2} tone="magenta" className="mb-6">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {tiers.data?.map((tier) => (
            <div key={tier.code} className="rounded-lg bg-slate-500/5 px-4 py-3 dark:bg-white/[0.03]">
              <div className="text-sm font-semibold text-slate-500 dark:text-slate-400">{tier.name}</div>
              <div className="mt-1 font-display text-2xl font-bold tabular-nums text-slate-900 dark:text-white">
                {schools.isLoading ? '–' : tierCounts.get(tier.code) ?? 0}
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card title="All schools" icon={School} tone="primary" padded={false}>
        {schools.isLoading && <div className="px-5"><Spinner /></div>}
        {schools.data?.length === 0 && <EmptyState icon={School} title="No schools yet">Onboard your first school to get started.</EmptyState>}
        <ul className="divide-y divide-slate-200/70 dark:divide-white/5">
          {list.map((s) => {
            const sub = s.subscriptions[0];
            return (
              <li key={s.id} className="flex flex-wrap items-center gap-4 px-5 py-4 transition-colors hover:bg-slate-500/5">
                <IconTile icon={School} tone={s.status === 'active' ? 'primary' : 'slate'} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-slate-800 dark:text-slate-100">{s.name}</span>
                    <Badge tone={s.status === 'active' ? 'emerald' : 'rose'}>{s.status}</Badge>
                    {sub && <Badge tone="magenta">{sub.tier.name}</Badge>}
                    {sub?.status === 'trialing' && sub.trialEndsAt && <Badge tone="amber">Trial until {formatDate(sub.trialEndsAt)}</Badge>}
                  </div>
                  <a
                    href={schoolUrl(s.slug)}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-0.5 inline-flex items-center gap-1 font-mono text-xs text-primary-600 hover:underline dark:text-primary-300"
                  >
                    {s.slug} <ExternalLink size={11} />
                  </a>
                </div>
                <Button variant="ghost" icon={KeyRound} onClick={() => setResetting(s)}>Admin password</Button>
                {s.status === 'active' ? (
                  <Button variant="secondary" icon={Ban} onClick={() => setSuspending(s)}>Suspend</Button>
                ) : (
                  <Button variant="secondary" icon={RotateCcw} loading={setStatus.isPending} onClick={() => setStatus.mutate({ id: s.id, status: 'active' })}>
                    Reactivate
                  </Button>
                )}
              </li>
            );
          })}
        </ul>
      </Card>

      <ResetAdminModal school={resetting} onClose={() => setResetting(null)} />
      <OnboardSchoolModal form={form} setForm={setForm} tiers={tiers.data ?? []} onClose={() => setForm(null)} />

      <ConfirmDialog
        open={!!suspending}
        title="Suspend school?"
        message={`All users of ${suspending?.name} will be locked out until it is reactivated. No data is deleted.`}
        confirmLabel="Suspend"
        loading={setStatus.isPending}
        onConfirm={() => suspending && setStatus.mutate({ id: suspending.id, status: 'suspended' })}
        onClose={() => setSuspending(null)}
      />
    </div>
  );
}
