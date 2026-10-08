import { useQuery } from '@tanstack/react-query';
import { ArrowRight, CheckCircle2, Landmark, Save, Wallet, XCircle } from 'lucide-react';
import { Link } from 'react-router';
import { useEffect, useState } from 'react';
import { Alert, Badge, Button, Card, DataTable, Field, Input, Modal, PageHeader, Spinner, StatCard, TextArea, type Column } from '@/components/ui';
import { formatMoney, type SubscriptionPayment } from '@/features/billing/billing';
import { useTiers } from '@/features/platform/hooks/usePlatform';
import { useAction } from '@/lib/hooks/useAction';
import { errorMessage } from '@/lib/errors';
import { onSubmit } from '@/lib/forms';
import { api } from '@/services/api/http';

type Status = '' | 'pending' | 'confirmed' | 'rejected';
interface BankSettings { bankName: string | null; accountTitle: string | null; accountNumber: string | null; iban: string | null; instructions: string | null }
export const PAYMENTS_KEY = ['platform', 'payments'] as const;
const when = (iso: string | null) => (iso ? new Date(iso).toLocaleString(undefined, { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' }) : '—');
const day = (iso: string | null) => (iso ? new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) : '—');

function BankSettingsCard() {
  const data = useQuery({ queryKey: ['platform', 'billing-settings'], queryFn: () => api<BankSettings>('/platform/billing-settings') });
  const [f, setF] = useState<BankSettings>({ bankName: '', accountTitle: '', accountNumber: '', iban: '', instructions: '' });
  useEffect(() => { if (data.data) setF({ bankName: data.data.bankName ?? '', accountTitle: data.data.accountTitle ?? '', accountNumber: data.data.accountNumber ?? '', iban: data.data.iban ?? '', instructions: data.data.instructions ?? '' }); }, [data.data]);
  const save = useAction((body: BankSettings) => api('/platform/billing-settings', { method: 'PUT', body }), { success: 'Bank details saved', invalidate: [['platform', 'billing-settings']] });
  const set = (k: keyof BankSettings) => (e: { target: { value: string } }) => setF({ ...f, [k]: e.target.value });
  return (
    <Card title="Your bank account (shown to schools)" icon={Landmark}>
      <form onSubmit={onSubmit(() => save.mutate(Object.fromEntries(Object.entries(f).map(([k, v]) => [k, (v ?? '').trim() || null])) as BankSettings))} className="grid gap-4 sm:grid-cols-2">
        <Field label="Bank"><Input required maxLength={80} value={f.bankName ?? ''} onChange={set('bankName')} /></Field>
        <Field label="Account title"><Input required maxLength={120} value={f.accountTitle ?? ''} onChange={set('accountTitle')} /></Field>
        <Field label="Account number"><Input required maxLength={40} value={f.accountNumber ?? ''} onChange={set('accountNumber')} /></Field>
        <Field label="IBAN"><Input maxLength={34} value={f.iban ?? ''} onChange={set('iban')} /></Field>
        <div className="sm:col-span-2"><Field label="Instructions (optional)" hint="e.g. Use your school name as the payment reference"><TextArea rows={2} maxLength={1000} value={f.instructions ?? ''} onChange={set('instructions')} /></Field></div>
        <div className="flex justify-end sm:col-span-2"><Button type="submit" icon={Save} loading={save.isPending}>Save</Button></div>
      </form>
    </Card>
  );
}

/** Prices live with the plans; this points the owner there. */
function PricesCard() {
  const tiers = useTiers({ status: 'active' });
  return (
    <Card title="Plan prices" icon={Wallet}>
      <ul className="divide-y divide-slate-200 dark:divide-white/10">
        {tiers.data?.map((t) => (
          <li key={t.id} className="flex items-center justify-between gap-3 py-2 text-base">
            <span className="font-semibold">{t.name}</span>
            <span className="text-slate-600 dark:text-slate-300">{t.priceMonthly ? `${formatMoney(t.priceMonthly, t.currency)} / month` : 'On request'}</span>
          </li>
        ))}
      </ul>
      <Link to="/tiers" className="mt-3 inline-flex items-center gap-1 font-semibold text-primary-700 hover:underline dark:text-primary-300">Change prices, limits and features in Subscription Plans <ArrowRight size={15} /></Link>
    </Card>
  );
}

/** Platform owner: subscription payments sent by schools, confirmation, bank details and prices. */
export function PaymentsPage() {
  const [status, setStatus] = useState<Status>('pending');
  const list = useQuery({ queryKey: [...PAYMENTS_KEY, status], queryFn: () => api<SubscriptionPayment[]>(`/platform/payments${status ? `?status=${status}` : ''}`), refetchInterval: 20_000 });
  const summary = useQuery({ queryKey: [...PAYMENTS_KEY, 'summary'], queryFn: () => api<{ pending: number; confirmedThisMonth: { count: number; amount: string | number } }>('/platform/payments/summary'), refetchInterval: 20_000 });
  const [review, setReview] = useState<{ p: SubscriptionPayment; action: 'confirm' | 'reject' } | null>(null);
  const [note, setNote] = useState('');
  const act = useAction(({ id, action, note }: { id: string; action: 'confirm' | 'reject'; note: string }) => api(`/platform/payments/${id}/${action}`, { method: 'POST', body: { note: note.trim() || null } }), {
    success: (r) => ((r as SubscriptionPayment).status === 'confirmed' ? 'Payment confirmed · plan activated' : 'Payment rejected'),
    invalidate: [PAYMENTS_KEY],
    onDone: () => setReview(null),
    toastErrors: false,
  });
  const cols: Column<SubscriptionPayment>[] = [
    { header: 'Received', cell: (p) => <span className="text-sm">{when(p.createdAt)}<div className="text-slate-500">by {p.submittedByName ?? '—'}</div></span> },
    { header: 'School', cell: (p) => <div><div className="font-semibold">{p.school?.name}</div><div className="text-sm text-slate-500">{p.school?.slug}</div></div> },
    { header: 'Plan', cell: (p) => <span>{p.tier.name}<div className="text-sm text-slate-500">{p.billingCycle === 'annual' ? 'Yearly' : 'Monthly'}</div></span> },
    { header: 'Amount', align: 'right', cell: (p) => <span className="font-semibold">{formatMoney(p.amount, p.currency)}</span> },
    { header: 'Paid from', cell: (p) => <div className="text-sm"><div>{p.payerName} · {p.payerBank}</div><div className="font-mono text-slate-500">{p.payerAccount}</div></div> },
    { header: 'Reference / date', cell: (p) => <div className="text-sm"><div className="font-mono">{p.reference}</div><div className="text-slate-500">paid {day(p.paidOn)}</div>{p.note && <div className="text-slate-500">“{p.note}”</div>}</div> },
    {
      header: 'Status',
      cell: (p) =>
        p.status === 'pending' ? (
          <div className="flex gap-2">
            <Button icon={CheckCircle2} onClick={() => { setNote(''); act.reset(); setReview({ p, action: 'confirm' }); }}>Confirm</Button>
            <Button variant="secondary" icon={XCircle} onClick={() => { setNote(''); act.reset(); setReview({ p, action: 'reject' }); }}>Reject</Button>
          </div>
        ) : (
          <div><Badge tone={p.status === 'confirmed' ? 'emerald' : 'rose'}>{p.status}</Badge><div className="mt-1 text-xs text-slate-500">{when(p.reviewedAt)}{p.periodEnd ? ` · until ${day(p.periodEnd)}` : ''}</div>{p.reviewNote && <div className="text-xs text-slate-500">{p.reviewNote}</div>}</div>
        ),
    },
  ];
  return (
    <div className="space-y-6">
      <PageHeader title="Payments" sub="Subscription payments sent by schools: check your bank, then confirm to activate the plan" icon={Wallet} />
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Waiting for you" value={summary.data?.pending ?? '–'} icon={Wallet} tone="amber" />
        <StatCard label="Confirmed this month" value={summary.data?.confirmedThisMonth.count ?? '–'} icon={CheckCircle2} tone="emerald" />
        <StatCard label="Received this month" value={summary.data ? formatMoney(summary.data.confirmedThisMonth.amount, 'PKR') : '–'} icon={Landmark} tone="primary" />
      </div>
      <Card padded={false} title="Payments" icon={Wallet} actions={
        <div className="flex gap-1">
          {(['pending', 'confirmed', 'rejected', ''] as Status[]).map((s) => <button key={s || 'all'} onClick={() => setStatus(s)} className={`rounded-full px-3 py-1 text-sm font-semibold ring-1 ${status === s ? 'bg-slate-800 text-white ring-slate-800 dark:bg-white dark:text-slate-900' : 'text-slate-600 ring-slate-300 dark:text-slate-300 dark:ring-white/15'}`}>{s ? s[0]!.toUpperCase() + s.slice(1) : 'All'}</button>)}
        </div>
      }>
        {list.isLoading && <div className="p-6"><Spinner /></div>}
        {list.data?.length === 0 && <p className="p-6 text-sm text-slate-500">No payments here.</p>}
        {!!list.data?.length && <DataTable columns={cols} rows={list.data} rowKey={(p) => p.id} />}
      </Card>
      <div className="grid gap-6 xl:grid-cols-2"><BankSettingsCard /><PricesCard /></div>

      <Modal open={!!review} title={review?.action === 'confirm' ? 'Confirm payment' : 'Reject payment'} onClose={() => setReview(null)}
        footer={<><Button variant="secondary" onClick={() => setReview(null)}>Cancel</Button><Button variant={review?.action === 'reject' ? 'danger' : 'primary'} loading={act.isPending} onClick={() => review && act.mutate({ id: review.p.id, action: review.action, note })}>{review?.action === 'confirm' ? 'Confirm & activate' : 'Reject'}</Button></>}>
        {review && (
          <div className="space-y-3">
            {act.error && <Alert>{errorMessage(act.error)}</Alert>}
            <p className="text-sm text-slate-600 dark:text-slate-300">
              {review.action === 'confirm'
                ? <>Check that <strong>{formatMoney(review.p.amount, review.p.currency)}</strong> from {review.p.payerName} ({review.p.payerBank} · {review.p.payerAccount}, ref {review.p.reference}) reached your account. Confirming activates the <strong>{review.p.tier.name}</strong> plan for {review.p.school?.name} for {review.p.billingCycle === 'annual' ? 'one year' : 'one month'}.</>
                : <>The school sees your reason and can send corrected details.</>}
            </p>
            <Field label={review.action === 'reject' ? 'Reason (required)' : 'Note (optional)'}><TextArea rows={2} required={review.action === 'reject'} value={note} onChange={(e) => setNote(e.target.value)} /></Field>
          </div>
        )}
      </Modal>
    </div>
  );
}
