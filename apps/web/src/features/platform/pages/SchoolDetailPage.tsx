import { ArrowLeft, Building2, CalendarClock, CreditCard, ExternalLink, GraduationCap, History, LogIn, Mail, Phone, School, ShieldCheck, UserRound, Users, Wallet } from 'lucide-react';
import { useState } from 'react';
import { Link, useParams } from 'react-router';
import { Alert, Badge, Button, Card, CompactNumber, DataTable, PageHeader, Spinner, StatCard, type Column } from '@/components/ui';
import { methodText, type PaymentMethod } from '@/features/billing/billing';
import { ManagePlanModal, PHASE_LABEL, PHASE_TONE, openAsAdmin, type PlanTarget } from '@/features/platform/components/SchoolActions';
import { SchoolLogins } from '@/features/platform/components/SchoolLogins';
import { SchoolPeople } from '@/features/platform/components/SchoolPeople';
import { useConsoleSchool } from '@/features/platform/hooks/useConsole';
import type { SchoolDetail } from '@/features/platform/types/console.types';
import { schoolUrl } from '@/features/platform/utils/platform.utils';
import { errorMessage } from '@/lib/errors';
import { compactNumber, formatDate } from '@/lib/format';

const SOURCE: Record<string, string> = { self_signup: 'Self sign-up (free trial)', application: 'Application reviewed by you', console: 'Onboarded by you' };
const ROLE: Record<string, string> = { school_admin: 'Admin', accounts: 'Accounts', teacher: 'Teacher', non_teaching_staff: 'Staff', parent: 'Parent', student: 'Student' };
const when = (iso: string | null) => (iso ? new Date(iso).toLocaleString(undefined, { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' }) : 'Never');

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4 py-1.5 text-sm">
      <dt className="text-slate-500">{label}</dt>
      <dd className="text-right font-medium text-slate-800 dark:text-slate-100">{children}</dd>
    </div>
  );
}

/** Everything the owner needs about one school: plan, people, admins, payments and recent sign-ins. */
export function SchoolDetailPage() {
  const { id = '' } = useParams();
  const school = useConsoleSchool(id);
  const [planFor, setPlanFor] = useState<PlanTarget | null>(null);
  const [opening, setOpening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const s = school.data;
  if (school.isLoading) return <Spinner />;
  if (!s) return <Alert>{errorMessage(school.error, 'School not found.')}</Alert>;
  const sub = s.subscription;
  const open = async () => {
    setError(null);
    setOpening(true);
    try {
      await openAsAdmin(s.id);
    } catch (e) {
      setError(errorMessage(e, 'Could not open the school.'));
    } finally {
      setOpening(false);
    }
  };

  const payCols: Column<SchoolDetail['payments'][number]>[] = [
    { header: 'Date', cell: (p) => <span className="text-sm">{formatDate(p.paidAt ?? p.createdAt)}</span> },
    { header: 'Plan', cell: (p) => <span className="text-sm">{p.tier ? `${p.tier.name} · ${p.billingCycle === 'annual' ? 'yearly' : 'monthly'}` : p.purpose === 'domain' ? 'Own domain add-on (1 year)' : '—'}</span> },
    { header: 'Method', cell: (p) => <span className="text-sm">{methodText({ method: p.method as PaymentMethod, cardBrand: p.cardBrand, cardLast4: p.cardLast4 })}</span> },
    { header: 'Amount', align: 'right', cell: (p) => <span className="font-semibold tabular-nums"><CompactNumber value={p.amount} prefix="PKR " /></span> },
    { header: 'Status', cell: (p) => <div><Badge tone={p.status === 'confirmed' ? 'emerald' : p.status === 'pending' || p.status === 'initiated' ? 'amber' : 'rose'}>{p.status === 'confirmed' ? 'Paid' : p.status}</Badge>{p.periodEnd && p.status === 'confirmed' && <div className="text-xs text-slate-500">until {formatDate(p.periodEnd)}</div>}</div> },
  ];

  return (
    <div className="space-y-6">
      <Link to="/schools" className="inline-flex items-center gap-1.5 text-sm font-semibold uppercase tracking-wide text-primary-600 hover:underline dark:text-primary-300"><ArrowLeft size={15} /> All schools</Link>
      <PageHeader
        title={s.name}
        sub={<span className="inline-flex flex-wrap items-center gap-2"><a href={schoolUrl(s.slug)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-mono hover:underline">{s.slug} <ExternalLink size={12} /></a> · {SOURCE[s.source]} · joined {formatDate(s.createdAt)}{s.status !== 'active' && <Badge tone="rose">{s.status}</Badge>}</span>}
        icon={School}
        actions={<div className="flex gap-2"><Button variant="secondary" icon={CalendarClock} onClick={() => setPlanFor({ id: s.id, name: s.name, phase: sub.phase, tier: sub.tier, billingCycle: sub.billingCycle, endsAt: sub.endsAt })}>Plan & dates</Button><Button icon={LogIn} loading={opening} onClick={() => void open()}>Open as admin</Button></div>}
      />
      {error && <Alert>{error}</Alert>}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Students" value={s.counts.students} icon={UserRound} tone="primary" hint={`${compactNumber(s.counts.classes)} classes · ${compactNumber(s.counts.campuses)} campus${s.counts.campuses === 1 ? '' : 'es'}`} />
        <StatCard label="Teachers" value={s.counts.teachers} icon={GraduationCap} tone="teal" hint={`${compactNumber(s.counts.staff)} non-teaching staff`} />
        <StatCard label="Parents" value={s.counts.parents} icon={Users} tone="amber" />
        <StatCard label="Logins" value={s.counts.logins} icon={ShieldCheck} tone="emerald" hint={`${compactNumber(s.counts.activeLast7)} active this week`} />
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <Card title="Plan" icon={CreditCard}>
          <div className="mb-2 flex items-center gap-2"><Badge tone={PHASE_TONE[sub.phase]}>{PHASE_LABEL[sub.phase]}</Badge><span className="font-semibold">{sub.tier?.name}</span>{sub.billingCycle && <span className="text-sm text-slate-500">· {sub.billingCycle === 'annual' ? 'yearly' : 'monthly'}</span>}</div>
          <dl className="divide-y divide-slate-200 dark:divide-white/10">
            <Row label={sub.phase === 'trial' ? 'Trial ends' : 'Paid until'}>{sub.endsAt ? formatDate(sub.endsAt) : '—'}</Row>
            {sub.daysLeft !== null && sub.phase !== 'expired' && <Row label="Days left">{sub.daysLeft}</Row>}
            {sub.phase === 'grace' && sub.graceEndsAt && <Row label="Locks on">{formatDate(sub.graceEndsAt)}</Row>}
            <Row label="Features">{sub.features.length}</Row>
            <Row label="Own domain">{s.domains.find((d) => d.isPrimary && d.verifiedAt)?.hostname ?? 'Uses our address'}</Row>
          </dl>
        </Card>
        <Card title="Contact" icon={Building2}>
          {s.application ? (
            <dl className="divide-y divide-slate-200 dark:divide-white/10">
              <Row label="Name">{s.application.contactFirstName} {s.application.contactLastName}</Row>
              <Row label="Role">{s.application.designation}</Row>
              <Row label="Email"><a href={`mailto:${s.application.contactEmail}`} className="inline-flex items-center gap-1 hover:underline"><Mail size={13} /> {s.application.contactEmail}</a></Row>
              {s.application.contactPhone && <Row label="Phone"><a href={`tel:${s.application.contactPhone}`} className="inline-flex items-center gap-1 hover:underline"><Phone size={13} /> {s.application.contactPhone}</a></Row>}
              {s.application.schoolCity && <Row label="City">{s.application.schoolCity}</Row>}
            </dl>
          ) : <p className="text-sm text-slate-500">Onboarded from the console; see the admins below.</p>}
        </Card>
        <Card title="Money" icon={Wallet}>
          <dl className="divide-y divide-slate-200 dark:divide-white/10">
            <Row label="Paid to us"><CompactNumber value={s.payments.filter((p) => p.status === 'confirmed').reduce((t, p) => t + Number(p.amount), 0)} prefix="PKR " /></Row>
            <Row label="Their fees outstanding"><CompactNumber value={s.fees.outstanding} prefix={`${s.settings?.currency ?? 'PKR'} `} /></Row>
            <Row label="Open fee invoices">{s.fees.openInvoices}</Row>
          </dl>
        </Card>
      </div>

      <Card title="School admins" icon={ShieldCheck} padded={false}>
        <ul className="divide-y divide-slate-200 dark:divide-white/10">
          {s.admins.map((a) => (
            <li key={a.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 text-sm">
              <div><div className="font-semibold">{a.firstName} {a.lastName} <span className="font-mono text-xs text-slate-500">{a.loginId}</span></div><div className="text-slate-500">{a.email ?? 'No email'}{a.phone ? ` · ${a.phone}` : ''}</div></div>
              <div className="text-right text-slate-500">{a.status !== 'active' && <Badge tone="rose">{a.status}</Badge>} Last sign-in: {when(a.lastLoginAt)}</div>
            </li>
          ))}
        </ul>
      </Card>

      <div>
        <h2 className="mb-1 text-lg font-bold text-slate-900 dark:text-white">User IDs</h2>
        <p className="mb-3 text-sm text-slate-500">Every login at this school and who it is assigned to.</p>
        <SchoolLogins schoolId={s.id} />
      </div>

      <div>
        <h2 className="mb-3 text-lg font-bold text-slate-900 dark:text-white">People</h2>
        <SchoolPeople schoolId={s.id} counts={{ teacher: s.counts.teachers, staff: s.counts.staff, student: s.counts.students, parent: s.counts.parents }} />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card title="Payments to us" icon={CreditCard} padded={false}>
          {s.payments.length === 0 ? <p className="p-5 text-sm text-slate-500">No payments yet.</p> : <DataTable columns={payCols} rows={s.payments} rowKey={(p) => p.id} />}
        </Card>
        <Card title="Recent sign-ins" icon={History} padded={false}>
          {s.logins.length === 0 ? <p className="p-5 text-sm text-slate-500">Nobody has signed in yet.</p> : (
            <ul className="divide-y divide-slate-200 dark:divide-white/10">
              {s.logins.map((l) => (
                <li key={l.id} className="flex items-center justify-between gap-3 px-5 py-2.5 text-sm">
                  <div><span className="font-medium">{l.name ?? l.identifier}</span> <span className="text-slate-500">{l.roles?.split(',').map((r) => ROLE[r] ?? r).join(', ')}</span></div>
                  <div className="text-right"><Badge tone={l.success ? 'emerald' : 'rose'}>{l.success ? (l.method === 'support' ? 'Support' : 'Signed in') : 'Failed'}</Badge> <span className="text-slate-500">{when(l.createdAt)}</span></div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
      <ManagePlanModal school={planFor} onClose={() => setPlanFor(null)} />
    </div>
  );
}
