import { Ban, CalendarClock, ExternalLink, KeyRound, LogIn, Plus, RotateCcw, School } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { Alert, Badge, Button, Card, CompactNumber, ConfirmDialog, DataTable, FilterBar, FilterSlot, IconButton, PageHeader, Pagination, SearchInput, Select, Spinner, type Column } from '@/components/ui';
import { EMPTY_SCHOOL_FORM, OnboardSchoolModal, type SchoolForm } from '@/features/platform/components/OnboardSchoolModal';
import { ResetAdminModal } from '@/features/platform/components/ResetAdminModal';
import { ManagePlanModal, PHASE_LABEL, PHASE_TONE, openAsAdmin, type PlanTarget } from '@/features/platform/components/SchoolActions';
import { CONSOLE_KEY, useConsoleSchools } from '@/features/platform/hooks/useConsole';
import { SCHOOLS_KEY, useTiers } from '@/features/platform/hooks/usePlatform';
import { platformService } from '@/features/platform/services/platformService';
import type { ConsoleSchool, Phase } from '@/features/platform/types/console.types';
import type { SchoolApplication, SchoolSummary } from '@/features/platform/types/platform.types';
import { schoolUrl } from '@/features/platform/utils/platform.utils';
import { errorMessage } from '@/lib/errors';
import { formatDate } from '@/lib/format';
import { useAction } from '@/lib/hooks/useAction';

const SOURCE: Record<ConsoleSchool['source'], string> = { self_signup: 'Self sign-up', application: 'Application', console: 'Onboarded by you' };
const TABS: { id: '' | Phase; label: string }[] = [
  { id: '', label: 'All' },
  { id: 'trial', label: 'Free trial' },
  { id: 'active', label: 'Paid' },
  { id: 'grace', label: 'Grace' },
  { id: 'expired', label: 'Locked' },
];
const ago = (iso: string | null) => {
  if (!iso) return 'Never';
  const d = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
  return d <= 0 ? 'Today' : d === 1 ? 'Yesterday' : `${d} days ago`;
};
const planTarget = (s: ConsoleSchool): PlanTarget => ({ id: s.id, name: s.name, phase: s.subscription.phase, tier: s.subscription.tier, billingCycle: s.subscription.billingCycle, endsAt: s.subscription.endsAt });

/** Platform "Tenant Management": every school in one paged table, split by trial / paid / grace / locked. */
export function SchoolsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [phase, setPhase] = useState<'' | Phase>('');
  const [source, setSource] = useState('');
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const schools = useConsoleSchools({ phase, source, q: q.trim() || undefined, page });
  const tiers = useTiers({ status: 'active' });
  const [form, setForm] = useState<SchoolForm | null>(null);
  const [suspending, setSuspending] = useState<ConsoleSchool | null>(null);
  const [resetting, setResetting] = useState<SchoolSummary | null>(null);
  const [planFor, setPlanFor] = useState<PlanTarget | null>(null);
  const [opening, setOpening] = useState<string | null>(null);
  const [openError, setOpenError] = useState<string | null>(null);

  // "Onboard" on an approved application lands here with the application in router state.
  useEffect(() => {
    const application = (location.state as { application?: SchoolApplication } | null)?.application;
    if (!application) return;
    setForm({ ...EMPTY_SCHOOL_FORM, name: application.schoolName, tierCode: application.requestedTierCode ?? '', adminFirstName: application.contactFirstName, adminLastName: application.contactLastName, adminEmail: application.contactEmail, primaryColor: application.preferredBrandColor ?? '', applicationId: application.id });
    navigate(location.pathname, { replace: true, state: null });
  }, [location.pathname, location.state, navigate]);

  const setStatus = useAction(({ id, status }: { id: string; status: SchoolSummary['status'] }) => platformService.setSchoolStatus(id, status).then(() => status), {
    success: (status) => (status === 'active' ? 'School reactivated' : 'School suspended'),
    invalidate: [SCHOOLS_KEY, CONSOLE_KEY],
    onDone: () => setSuspending(null),
  });
  const open = async (id: string) => {
    setOpenError(null);
    setOpening(id);
    try {
      await openAsAdmin(id);
    } catch (e) {
      setOpenError(errorMessage(e, 'Could not open the school.'));
    } finally {
      setOpening(null);
    }
  };
  const d = schools.data;

  const cols: Column<ConsoleSchool>[] = [
    {
      header: 'School',
      cell: (s) => (
        <div className="min-w-[12rem]">
          <Link to={`/schools/${s.id}`} onClick={(e) => e.stopPropagation()} className="font-semibold text-primary-700 hover:underline dark:text-primary-300">{s.name}</Link>
          {s.status !== 'active' && <span className="ml-1.5"><Badge tone="rose">{s.status}</Badge></span>}
          <div className="text-xs text-slate-500">
            <a href={schoolUrl(s.slug)} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="inline-flex items-center gap-0.5 font-mono hover:underline">{s.slug} <ExternalLink size={10} /></a> · {SOURCE[s.source]}
          </div>
        </div>
      ),
    },
    { header: 'Contact', cell: (s) => (s.contact ? <div className="text-sm"><div>{s.contact.name}</div><div className="text-slate-500">{s.contact.phone ?? s.contact.email}</div></div> : <span className="text-sm text-slate-400">—</span>) },
    {
      header: 'Plan',
      cell: (s) => (
        <div className="whitespace-nowrap text-sm">
          <Badge tone={PHASE_TONE[s.subscription.phase]}>{PHASE_LABEL[s.subscription.phase]}</Badge> <span className="font-medium">{s.subscription.tier?.name}</span>
          <div className="text-xs text-slate-500">{s.subscription.endsAt ? `${s.subscription.phase === 'expired' ? 'ended' : 'ends'} ${formatDate(s.subscription.endsAt)}` : ''}{s.subscription.daysLeft !== null && s.subscription.daysLeft >= 0 && s.subscription.phase !== 'expired' ? ` · ${s.subscription.daysLeft}d left` : ''}</div>
        </div>
      ),
    },
    { header: 'Students', align: 'right', cell: (s) => <span className="tabular-nums"><CompactNumber value={s.counts.students} /></span> },
    { header: 'Teachers', align: 'right', cell: (s) => <span className="tabular-nums"><CompactNumber value={s.counts.teachers} /></span> },
    { header: 'Parents', align: 'right', cell: (s) => <span className="tabular-nums"><CompactNumber value={s.counts.parents} /></span> },
    { header: 'Last sign-in', cell: (s) => <div className="whitespace-nowrap text-sm"><div>{ago(s.counts.lastLoginAt)}</div><div className="text-xs text-slate-500">{s.counts.activeLast7} active this week</div></div> },
    { header: 'Paid', align: 'right', cell: (s) => <span className="whitespace-nowrap font-semibold tabular-nums"><CompactNumber value={s.revenue.total} prefix="PKR " /></span> },
    {
      header: '',
      align: 'right',
      cell: (s) => (
        <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          <IconButton icon={LogIn} label="Open as admin" disabled={opening === s.id} onClick={() => void open(s.id)} />
          <IconButton icon={CalendarClock} label="Plan & dates" onClick={() => setPlanFor(planTarget(s))} />
          <IconButton icon={KeyRound} label="Admin password" onClick={() => setResetting({ id: s.id, name: s.name, slug: s.slug } as SchoolSummary)} />
          {s.status === 'active' ? <IconButton icon={Ban} tone="danger" label="Suspend" onClick={() => setSuspending(s)} /> : <IconButton icon={RotateCcw} label="Reactivate" onClick={() => setStatus.mutate({ id: s.id, status: 'active' })} />}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Schools" sub="Every school: plan, people, activity and payments. Click a name for the full picture." icon={School} tone="primary" actions={<Button icon={Plus} onClick={() => setForm(EMPTY_SCHOOL_FORM)}>Onboard school</Button>} />
      {openError && <Alert>{openError}</Alert>}
      <Card padded={false}>
        <div className="flex flex-wrap gap-1.5 border-b border-slate-200 px-4 pt-4 pb-3 dark:border-white/5">
          {TABS.map((t) => (
            <button key={t.id || 'all'} onClick={() => { setPhase(t.id); setPage(1); }} className={`rounded-full px-3.5 py-1.5 text-sm font-semibold ring-1 ${phase === t.id ? 'bg-slate-800 text-white ring-slate-800 dark:bg-white dark:text-slate-900' : 'text-slate-600 ring-slate-300 dark:text-slate-300 dark:ring-white/15'}`}>
              {t.label} <span className="tabular-nums opacity-70">{d ? <CompactNumber value={d.counts[t.id || 'all']} /> : ''}</span>
            </button>
          ))}
        </div>
        <FilterBar>
          <SearchInput label="Search schools" placeholder="School, web address or contact email" value={q} onChange={(v) => { setQ(v); setPage(1); }} />
          <FilterSlot width="w-48">
            <Select aria-label="How it joined" value={source} onChange={(e) => { setSource(e.target.value); setPage(1); }}>
              <option value="">Every source</option>
              <option value="self_signup">Self sign-up</option>
              <option value="application">Application</option>
              <option value="console">Onboarded by you</option>
            </Select>
          </FilterSlot>
        </FilterBar>
        {schools.isLoading && <div className="p-6"><Spinner /></div>}
        {d && d.items.length === 0 && <p className="p-6 text-sm text-slate-500">No schools match.</p>}
        {!!d?.items.length && <DataTable columns={cols} rows={d.items} rowKey={(s) => s.id} onRowClick={(s) => navigate(`/schools/${s.id}`)} />}
        {d && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 px-5 py-3 text-xs text-slate-500 dark:border-white/5">
            <span><CompactNumber value={d.total} /> school{d.total === 1 ? '' : 's'} · “Open as admin” gives you full admin rights in the school (recorded as “Platform support”).</span>
            <Pagination page={d.page} pageSize={d.pageSize} total={d.total} onChange={setPage} />
          </div>
        )}
      </Card>

      <ManagePlanModal school={planFor} onClose={() => setPlanFor(null)} />
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
