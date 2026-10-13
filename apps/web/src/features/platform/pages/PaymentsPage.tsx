import { useQuery } from '@tanstack/react-query';
import { ArrowRight, CheckCircle2, Landmark, Save, Wallet, XCircle } from 'lucide-react';
import { Link } from 'react-router';
import { useEffect, useState } from 'react';
import { Alert, Badge, Button, Card, CompactNumber, DataTable, Field, Input, Modal, PageHeader, Spinner, StatCard, TextArea, type Column } from '@/components/ui';
import { formatMoney, methodText, type SubscriptionPayment } from '@/features/billing/billing';
import { useTiers } from '@/features/platform/hooks/usePlatform';
import { useAction } from '@/lib/hooks/useAction';
import { errorMessage } from '@/lib/errors';
import { onSubmit } from '@/lib/forms';
import { api } from '@/services/api/http';

type Status = '' | 'pending' | 'confirmed' | 'rejected' | 'failed';
interface BankSettings { bankName: string | null; accountTitle: string | null; accountNumber: string | null; iban: string | null; instructions: string | null; bankTransferEnabled: boolean; domainPriceYearly?: string | number | null }
export const PAYMENTS_KEY = ['platform', 'payments'] as const;
const when = (iso: string | null) => (iso ? new Date(iso).toLocaleString(undefined, { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' }) : '—');
const day = (iso: string | null) => (iso ? new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) : '—');

function BankSettingsCard() {
  const data = useQuery({ queryKey: ['platform', 'billing-settings'], queryFn: () => api<BankSettings>('/platform/billing-settings') });
  const [f, setF] = useState<BankSettings>({ bankName: '', accountTitle: '', accountNumber: '', iban: '', instructions: '', bankTransferEnabled: false });
  useEffect(() => { if (data.data) setF({ bankName: data.data.bankName ?? '', accountTitle: data.data.accountTitle ?? '', accountNumber: data.data.accountNumber ?? '', iban: data.data.iban ?? '', instructions: data.data.instructions ?? '', bankTransferEnabled: data.data.bankTransferEnabled }); }, [data.data]);
  const save = useAction((body: BankSettings) => api('/platform/billing-settings', { method: 'PUT', body }), { success: 'Bank details saved', invalidate: [['platform', 'billing-settings']] });
  const set = (k: Exclude<keyof BankSettings, 'bankTransferEnabled'>) => (e: { target: { value: string } }) => setF({ ...f, [k]: e.target.value });
  return (
    <Card title="Manual bank transfer (optional)" icon={Landmark}>
      <form onSubmit={onSubmit(() => save.mutate({ ...(Object.fromEntries(Object.entries(f).filter(([k]) => k !== 'bankTransferEnabled').map(([k, v]) => [k, String(v ?? '').trim() || null])) as Omit<BankSettings, 'bankTransferEnabled'>), bankTransferEnabled: f.bankTransferEnabled }))} className="grid gap-4 sm:grid-cols-2">
        <label className="flex items-start gap-2 text-base sm:col-span-2">
          <input type="checkbox" className="mt-1 h-4 w-4 accent-orange-500" checked={f.bankTransferEnabled} onChange={(e) => setF({ ...f, bankTransferEnabled: e.target.checked })} />
          <span>Also let schools pay by bank transfer into this account<span className="block text-sm text-slate-500">Online payments (cards, bank account, JazzCash, Easypaisa) are always available and activate plans automatically; bank transfers wait for you to confirm them here.</span></span>
        </label>
        <Field label="Bank"><Input required={f.bankTransferEnabled} maxLength={80} value={f.bankName ?? ''} onChange={set('bankName')} /></Field>
        <Field label="Account title"><Input required={f.bankTransferEnabled} maxLength={120} value={f.accountTitle ?? ''} onChange={set('accountTitle')} /></Field>
        <Field label="Account number"><Input required={f.bankTransferEnabled} maxLength={40} value={f.accountNumber ?? ''} onChange={set('accountNumber')} /></Field>
        <Field label="IBAN"><Input maxLength={34} value={f.iban ?? ''} onChange={set('iban')} /></Field>
        <div className="sm:col-span-2"><Field label="Instructions (optional)" hint="e.g. Use your school name as the payment reference"><TextArea rows={2} maxLength={1000} value={f.instructions ?? ''} onChange={set('instructions')} /></Field></div>
        <div className="flex justify-end sm:col-span-2"><Button type="submit" icon={Save} loading={save.isPending}>Save</Button></div>
      </form>
    </Card>
  );
}

/** The own-domain add-on: schools pay this yearly to use their own domain (otherwise our free address). */
function DomainPriceCard() {
  const data = useQuery({ queryKey: ['platform', 'billing-settings'], queryFn: () => api<BankSettings>('/platform/billing-settings') });
  const [price, setPrice] = useState('');
  useEffect(() => { if (data.data) setPrice(data.data.domainPriceYearly != null ? String(Number(data.data.domainPriceYearly)) : ''); }, [data.data]);
  const save = useAction((v: string) => api('/platform/billing-settings', { method: 'PUT', body: { domainPriceYearly: v.trim() === '' ? null : Number(v) } }), { success: 'Domain price saved', invalidate: [['platform', 'billing-settings']] });
  return (
    <Card title="Own-domain add-on" icon={Landmark}>
      <form onSubmit={onSubmit(() => save.mutate(price))} className="space-y-3">
        <p className="text-sm text-slate-600 dark:text-slate-300">Schools use their free address on our domain. A school that wants its own domain (e.g. www.theirschool.edu.pk) buys this add-on online for a year; empty = not offered.</p>
        <Field label="Price per year (PKR)"><Input type="number" min={0} step={500} value={price} onChange={(e) => setPrice(e.target.value)} /></Field>
        <div className="flex justify-end"><Button type="submit" icon={Save} loading={save.isPending}>Save</Button></div>
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
  const [status, setStatus] = useState<Status>('');
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
    { header: 'For', cell: (p) => (p.purpose === 'domain' ? <span>Own domain<div className="text-sm text-slate-500">1 year</div></span> : <span>{p.tier?.name}<div className="text-sm text-slate-500">{p.billingCycle === 'annual' ? 'Yearly' : 'Monthly'}</div></span>) },
    { header: 'Amount', align: 'right', cell: (p) => <span className="font-semibold">{formatMoney(p.amount, p.currency)}</span> },
    { header: 'Method', cell: (p) => <div className="text-sm"><div className="font-semibold">{methodText(p)}</div>{p.method === 'bank_transfer' ? <><div>{p.payerName} · {p.payerBank}</div><div className="font-mono text-slate-500">{p.payerAccount}</div></> : <div className="text-slate-500">{p.payerName}</div>}</div> },
    { header: 'Reference / date', cell: (p) => <div className="text-sm"><div className="font-mono">{p.reference ?? '—'}</div><div className="text-slate-500">{p.paidAt ? `paid ${when(p.paidAt)}` : p.paidOn ? `paid ${day(p.paidOn)}` : ''}</div>{p.note && <div className="text-slate-500">“{p.note}”</div>}</div> },
    {
      header: 'Status',
      cell: (p) =>
        p.status === 'pending' ? (
          <div className="flex gap-2">
            <Button icon={CheckCircle2} onClick={() => { setNote(''); act.reset(); setReview({ p, action: 'confirm' }); }}>Confirm</Button>
            <Button variant="secondary" icon={XCircle} onClick={() => { setNote(''); act.reset(); setReview({ p, action: 'reject' }); }}>Reject</Button>
          </div>
        ) : (
          <div><Badge tone={p.status === 'confirmed' ? 'emerald' : p.status === 'initiated' ? 'slate' : 'rose'}>{p.status === 'confirmed' && p.method !== 'bank_transfer' ? 'paid online' : p.status === 'initiated' ? 'checkout open' : p.status}</Badge>{p.failureReason && <div className="mt-1 text-xs text-slate-500">{p.failureReason}</div>}<div className="mt-1 text-xs text-slate-500">{when(p.reviewedAt)}{p.periodEnd ? ` · until ${day(p.periodEnd)}` : ''}</div>{p.reviewNote && <div className="text-xs text-slate-500">{p.reviewNote}</div>}</div>
        ),
    },
  ];
  return (
    <div className="space-y-6">
      <PageHeader title="Payments" sub="Online payments activate plans automatically; bank transfers wait for your confirmation" icon={Wallet} />
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Waiting for you" value={summary.data?.pending ?? '–'} icon={Wallet} tone="amber" />
        <StatCard label="Confirmed this month" value={summary.data?.confirmedThisMonth.count ?? '–'} icon={CheckCircle2} tone="emerald" />
        <StatCard label="Received this month" value={summary.data ? <CompactNumber value={summary.data.confirmedThisMonth.amount} prefix="PKR " /> : '–'} icon={Landmark} tone="primary" />
      </div>
      <Card padded={false} title="Payments" icon={Wallet} actions={
        <div className="flex gap-1">
          {(['pending', 'confirmed', 'failed', 'rejected', ''] as Status[]).map((s) => <button key={s || 'all'} onClick={() => setStatus(s)} className={`rounded-full px-3 py-1 text-sm font-semibold ring-1 ${status === s ? 'bg-slate-800 text-white ring-slate-800 dark:bg-white dark:text-slate-900' : 'text-slate-600 ring-slate-300 dark:text-slate-300 dark:ring-white/15'}`}>{s ? s[0]!.toUpperCase() + s.slice(1) : 'All'}</button>)}
        </div>
      }>
        {list.isLoading && <div className="p-6"><Spinner /></div>}
        {list.data?.length === 0 && <p className="p-6 text-sm text-slate-500">No payments here.</p>}
        {!!list.data?.length && <DataTable columns={cols} rows={list.data} rowKey={(p) => p.id} />}
      </Card>
      <div className="grid gap-6 xl:grid-cols-2"><PricesCard /><DomainPriceCard /></div>
      <BankSettingsCard />

      <Modal open={!!review} title={review?.action === 'confirm' ? 'Confirm payment' : 'Reject payment'} onClose={() => setReview(null)}
        footer={<><Button variant="secondary" onClick={() => setReview(null)}>Cancel</Button><Button variant={review?.action === 'reject' ? 'danger' : 'primary'} loading={act.isPending} onClick={() => review && act.mutate({ id: review.p.id, action: review.action, note })}>{review?.action === 'confirm' ? 'Confirm & activate' : 'Reject'}</Button></>}>
        {review && (
          <div className="space-y-3">
            {act.error && <Alert>{errorMessage(act.error)}</Alert>}
            <p className="text-sm text-slate-600 dark:text-slate-300">
              {review.action === 'confirm'
                ? <>Check that <strong>{formatMoney(review.p.amount, review.p.currency)}</strong> from {review.p.payerName} ({review.p.payerBank} · {review.p.payerAccount}, ref {review.p.reference}) reached your account. Confirming activates the <strong>{review.p.tier?.name ?? "own domain"}</strong> plan for {review.p.school?.name} for {review.p.billingCycle === 'annual' ? 'one year' : 'one month'}.</>
                : <>The school sees your reason and can send corrected details.</>}
            </p>
            <Field label={review.action === 'reject' ? 'Reason (required)' : 'Note (optional)'}><TextArea rows={2} required={review.action === 'reject'} value={note} onChange={(e) => setNote(e.target.value)} /></Field>
          </div>
        )}
      </Modal>
    </div>
  );
}
