import { useQuery } from '@tanstack/react-query';
import { Check, CheckCircle2, Copy, CreditCard, Landmark, Lock, Send, ShieldCheck, Sparkles, XCircle } from 'lucide-react';
import { useState } from 'react';
import { useSearchParams } from 'react-router';
import { Alert, Badge, Button, Card, DataTable, Field, Input, Modal, PageHeader, Spinner, TextArea, type Column } from '@/components/ui';
import { billingService, formatMoney, methodText, priceOf, useBillingAction, useBillingOverview, type BillingOverview, type Plan, type SubscriptionPayment } from '@/features/billing/billing';
import { DomainAddon } from '@/features/billing/components/DomainAddon';
import { errorMessage } from '@/lib/errors';
import { onSubmit } from '@/lib/forms';

const PHASE: Record<string, [string, 'emerald' | 'amber' | 'rose' | 'primary']> = { trial: ['Free trial', 'primary'], active: ['Active', 'emerald'], grace: ['Grace period', 'amber'], expired: ['Locked', 'rose'] };
const STATUS: Record<SubscriptionPayment['status'], [string, 'emerald' | 'amber' | 'rose' | 'slate']> = {
  initiated: ['Checkout not finished', 'slate'],
  pending: ['Waiting for confirmation', 'amber'],
  confirmed: ['Paid', 'emerald'],
  rejected: ['Rejected', 'rose'],
  failed: ['Not completed', 'rose'],
};
const date = (iso: string | null) => (iso ? new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) : '—');
const ONLINE_BADGES = ['Visa', 'Mastercard', 'UnionPay', 'Debit & credit cards', 'Bank account', 'JazzCash', 'Easypaisa'];

function CopyValue({ value }: { value: string }) {
  const [done, setDone] = useState(false);
  return (
    <button type="button" onClick={() => void navigator.clipboard.writeText(value).then(() => { setDone(true); setTimeout(() => setDone(false), 1500); })} className="ml-2 inline-flex items-center text-slate-400 hover:text-slate-700" title="Copy">
      {done ? <Check size={14} /> : <Copy size={14} />}
    </button>
  );
}

/** Online first (card / bank account / wallets, PKR); manual bank transfer only when the platform allows it. */
function PayModal({ plan, cycle, bank, onClose }: { plan: Plan | null; cycle: 'monthly' | 'annual'; bank: BillingOverview['bank']; onClose: () => void }) {
  const [tab, setTab] = useState<'online' | 'bank'>('online');
  const [error, setError] = useState<string | null>(null);
  const [redirecting, setRedirecting] = useState(false);
  const today = new Date().toISOString().slice(0, 10);
  const [f, setF] = useState({ payerName: '', payerBank: '', payerAccount: '', reference: '', paidOn: today, note: '' });
  const submit = useBillingAction(billingService.submit, 'Payment details sent. We will confirm shortly.', onClose);
  if (!plan) return null;
  const price = priceOf(plan, cycle);
  const set = (k: keyof typeof f) => (e: { target: { value: string } }) => setF({ ...f, [k]: e.target.value });

  const payOnline = async () => {
    setError(null);
    setRedirecting(true);
    try {
      const r = await billingService.checkout({ tierCode: plan.code, billingCycle: cycle });
      window.location.assign(r.redirectUrl);
    } catch (e) {
      setError(errorMessage(e, 'Could not open the checkout.'));
      setRedirecting(false);
    }
  };

  return (
    <Modal
      open
      size="lg"
      title={`${plan.name} plan · ${cycle === 'annual' ? 'yearly' : 'monthly'}`}
      onClose={onClose}
      footer={
        tab === 'online'
          ? <><Button variant="secondary" onClick={onClose}>Cancel</Button><Button icon={ShieldCheck} loading={redirecting} disabled={!price} onClick={() => void payOnline()}>Pay {formatMoney(price, 'PKR')} securely</Button></>
          : <><Button variant="secondary" onClick={onClose}>Cancel</Button><Button type="submit" form="pay-form" icon={Send} loading={submit.isPending} disabled={!bank?.accountNumber || !price}>I have paid · send details</Button></>
      }
    >
      <div className="space-y-5">
        <div className="rounded-xl bg-slate-50 p-4 dark:bg-white/3">
          <p className="text-sm font-bold uppercase tracking-wider text-slate-500">Amount</p>
          <p className="mt-1 text-2xl font-extrabold text-slate-900 dark:text-white">{formatMoney(price, 'PKR')} <span className="text-base font-medium text-slate-500">/ {cycle === 'annual' ? 'year' : 'month'}</span></p>
          {!price && <Alert tone="info">The price for this plan is shared on request; please contact us.</Alert>}
        </div>
        {bank && (
          <div role="tablist" className="inline-flex rounded-lg bg-slate-100 p-1 dark:bg-white/5">
            {(['online', 'bank'] as const).map((t) => (
              <button key={t} role="tab" aria-selected={tab === t} onClick={() => setTab(t)} className={`rounded-md px-4 py-1.5 text-sm font-bold ${tab === t ? 'bg-white text-slate-900 shadow-depth-1 dark:bg-white/15 dark:text-white' : 'text-slate-500'}`}>{t === 'online' ? 'Pay online' : 'Bank transfer'}</button>
            ))}
          </div>
        )}
        {error && <Alert>{error}</Alert>}
        {tab === 'online' ? (
          <div className="space-y-3">
            <p className="text-base text-slate-700 dark:text-slate-200">You will continue to our payment partner’s secure page. Choose any of:</p>
            <div className="flex flex-wrap gap-2">{ONLINE_BADGES.map((b) => <span key={b} className="rounded-md border border-slate-200 px-2.5 py-1 text-sm font-semibold text-slate-700 dark:border-white/10 dark:text-slate-200">{b}</span>)}</div>
            <p className="inline-flex items-center gap-1.5 text-sm text-slate-500"><ShieldCheck size={15} /> Card and account details are entered only on the payment page; we never see or store them. The plan is active the moment the payment succeeds.</p>
          </div>
        ) : (
          <form id="pay-form" onSubmit={onSubmit(() => submit.mutate({ tierCode: plan.code, billingCycle: cycle, amount: Number(price), payerName: f.payerName, payerBank: f.payerBank, payerAccount: f.payerAccount, reference: f.reference, paidOn: f.paidOn, note: f.note.trim() || null }))} className="grid gap-4 sm:grid-cols-2">
            <dl className="grid gap-1 rounded-lg border border-slate-200 p-3 text-sm sm:col-span-2 sm:grid-cols-2 dark:border-white/10">
              <div><dt className="text-slate-500">Bank</dt><dd className="font-semibold">{bank?.bankName}</dd></div>
              <div><dt className="text-slate-500">Account title</dt><dd className="font-semibold">{bank?.accountTitle}</dd></div>
              <div><dt className="text-slate-500">Account number</dt><dd className="font-mono font-semibold">{bank?.accountNumber}{bank?.accountNumber && <CopyValue value={bank.accountNumber} />}</dd></div>
              {bank?.iban && <div><dt className="text-slate-500">IBAN</dt><dd className="font-mono font-semibold">{bank.iban}<CopyValue value={bank.iban} /></dd></div>}
              {bank?.instructions && <div className="sm:col-span-2"><dt className="text-slate-500">Instructions</dt><dd>{bank.instructions}</dd></div>}
            </dl>
            {submit.error && <div className="sm:col-span-2"><Alert>{errorMessage(submit.error)}</Alert></div>}
            <Field label="Paid from (account title)"><Input required maxLength={120} value={f.payerName} onChange={set('payerName')} /></Field>
            <Field label="Your bank"><Input required maxLength={80} value={f.payerBank} onChange={set('payerBank')} placeholder="e.g. HBL" /></Field>
            <Field label="Your account number"><Input required maxLength={40} value={f.payerAccount} onChange={set('payerAccount')} /></Field>
            <Field label="Transaction / reference no."><Input required maxLength={100} value={f.reference} onChange={set('reference')} /></Field>
            <Field label="Paid on"><Input type="date" required max={today} value={f.paidOn} onChange={set('paidOn')} /></Field>
            <div className="sm:col-span-2"><Field label="Note (optional)"><TextArea rows={2} maxLength={500} value={f.note} onChange={set('note')} /></Field></div>
          </form>
        )}
      </div>
    </Modal>
  );
}

/** Back from the gateway (?payment=<id>): waits for the gateway's confirmation and says how it went. */
function ReturnBanner() {
  const [params, setParams] = useSearchParams();
  const id = params.get('payment');
  const cancelled = params.get('cancelled') === '1';
  const p = useQuery({
    queryKey: ['billing', 'online-payment', id],
    queryFn: () => billingService.onlinePayment(id!),
    enabled: !!id,
    refetchInterval: (q) => (q.state.data && q.state.data.status !== 'initiated' ? false : 2000),
  });
  if (!id) return null;
  const close = () => setParams({}, { replace: true });
  const s = p.data?.status;
  if (s === 'confirmed') return <Alert tone="success"><span className="inline-flex items-start gap-2"><CheckCircle2 size={18} className="shrink-0" /> Payment received ({methodText(p.data!)}). {p.data!.purpose === 'domain' ? 'Your own domain is active' : `Your ${p.data!.tier?.name ?? ''} plan is active`} until {date(p.data!.periodEnd)}. A receipt was emailed to you. <button className="ml-2 font-semibold underline" onClick={close}>Dismiss</button></span></Alert>;
  if (s === 'failed') return <Alert><span className="inline-flex items-start gap-2"><XCircle size={18} className="shrink-0" /> The payment did not go through{p.data?.failureReason ? `: ${p.data.failureReason}` : ''}. Nothing was charged; you can try again. <button className="ml-2 font-semibold underline" onClick={close}>Dismiss</button></span></Alert>;
  if (cancelled) return <Alert tone="info">Checkout cancelled. Nothing was charged. <button className="ml-2 font-semibold underline" onClick={close}>Dismiss</button></Alert>;
  return <Alert tone="info"><span className="inline-flex items-center gap-2"><Spinner /> Waiting for the payment confirmation…</span></Alert>;
}

/** Admin: current plan, plan comparison, paying online (or by bank transfer when allowed) and the payment history. */
export function BillingPage() {
  const data = useBillingOverview();
  const [cycle, setCycle] = useState<'monthly' | 'annual'>('monthly');
  const [paying, setPaying] = useState<Plan | null>(null);
  if (data.isLoading || !data.data) return <Spinner />;
  const { state, plans, features, bank, payments } = data.data;
  const [phaseLabel, phaseTone] = PHASE[state.phase]!;
  const pending = payments.find((p) => p.status === 'pending');
  const cols: Column<SubscriptionPayment>[] = [
    { header: 'Date', cell: (p) => <span className="text-sm">{date(p.paidAt ?? p.createdAt)}<div className="text-slate-500">{p.submittedByName}</div></span> },
    { header: 'For', cell: (p) => (p.purpose === 'domain' ? 'Own domain · 1 year' : `${p.tier?.name ?? ''} · ${p.billingCycle === 'annual' ? 'yearly' : 'monthly'}`) },
    { header: 'Amount', align: 'right', cell: (p) => formatMoney(p.amount, p.currency) },
    { header: 'Method', cell: (p) => <span className="text-sm">{methodText(p)}{p.reference && <div className="font-mono text-slate-500">{p.reference}</div>}{p.method === 'bank_transfer' && p.payerBank && <div className="text-slate-500">{p.payerName} · {p.payerBank}</div>}</span> },
    { header: 'Status', cell: (p) => { const [label, tone] = STATUS[p.status]; return <div><Badge tone={tone}>{label}</Badge>{(p.failureReason || p.reviewNote) && p.status !== 'confirmed' && <div className="mt-1 text-xs text-slate-500">{p.failureReason ?? p.reviewNote}</div>}{p.periodEnd && <div className="mt-1 text-xs text-slate-500">Covers until {date(p.periodEnd)}</div>}</div>; } },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Plans & billing" sub="Your plan, what it includes, and paying online in PKR" icon={CreditCard} />
      <ReturnBanner />
      <Card>
        <div className="flex flex-wrap items-center gap-6">
          <div><div className="text-xs font-bold uppercase tracking-wider text-slate-500">Current plan</div><div className="text-2xl font-extrabold text-slate-900 dark:text-white">{state.status === 'trialing' ? 'Free trial' : state.tier?.name ?? '—'}</div></div>
          <Badge tone={phaseTone}>{phaseLabel}</Badge>
          <div className="text-sm text-slate-600 dark:text-slate-300">
            {state.phase === 'trial' && <>All features included · trial ends {date(state.endsAt)} ({state.daysLeft} days left)</>}
            {state.phase === 'active' && <>Paid until {date(state.endsAt)} ({state.daysLeft} days left)</>}
            {state.phase === 'grace' && <>Ended {date(state.endsAt)} · full access until {date(state.graceEndsAt)}</>}
            {state.phase === 'expired' && <>Locked since {date(state.graceEndsAt)} · your data is safe · pay to unlock</>}
          </div>
          {pending && <Badge tone="amber">Bank transfer of {formatMoney(pending.amount, pending.currency)} waiting for confirmation</Badge>}
        </div>
      </Card>

      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Choose a plan</h2>
        <div role="radiogroup" className="inline-flex rounded-lg bg-slate-100 p-1 dark:bg-white/5">
          {(['monthly', 'annual'] as const).map((c) => (
            <button key={c} role="radio" aria-checked={cycle === c} onClick={() => setCycle(c)} className={`rounded-md px-4 py-1.5 text-sm font-bold ${cycle === c ? 'bg-white text-slate-900 shadow-depth-1 dark:bg-white/15 dark:text-white' : 'text-slate-500'}`}>{c === 'monthly' ? 'Monthly' : 'Yearly'}</button>
          ))}
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {plans.map((p) => {
          const current = state.status === 'active' && state.tier?.code === p.code;
          const popular = p.code === 'growth';
          return (
            <div key={p.code} className={`relative flex flex-col rounded-2xl border bg-white p-6 dark:bg-(--surface-bg) ${popular ? 'border-orange-400 shadow-lg' : 'border-(--surface-border)'}`}>
              {popular && <span className="absolute -top-3 left-6 rounded-full bg-orange-500 px-3 py-0.5 text-xs font-bold text-white">Most popular</span>}
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">{p.name}</h3>
              <p className="mt-1 text-sm text-slate-500">{p.maxCampuses === null ? 'Unlimited campuses' : `Up to ${p.maxCampuses} campus${p.maxCampuses === 1 ? '' : 'es'}`} · {p.maxStudents === null ? 'unlimited students' : `${p.maxStudents.toLocaleString()} students`}</p>
              <p className="mt-4 text-3xl font-extrabold text-slate-900 dark:text-white">{priceOf(p, cycle) ? formatMoney(priceOf(p, cycle), p.currency) : 'On request'}{priceOf(p, cycle) && <span className="text-sm font-medium text-slate-500"> / {cycle === 'annual' ? 'year' : 'month'}</span>}</p>
              <ul className="mt-5 flex-1 space-y-2 text-sm">
                {features.map((f) => {
                  const inPlan = p.features.includes(f.key);
                  return <li key={f.key} className={`flex items-start gap-2 ${inPlan ? 'text-slate-700 dark:text-slate-200' : 'text-slate-400 line-through decoration-slate-300'}`}>{inPlan ? <Check size={16} className="mt-0.5 shrink-0 text-emerald-600" /> : <Lock size={14} className="mt-0.5 shrink-0" />}{f.label}</li>;
                })}
              </ul>
              <Button className="mt-6 w-full" variant={popular ? 'primary' : 'secondary'} disabled={!!pending || !priceOf(p, cycle)} onClick={() => setPaying(p)}>{current ? 'Renew' : state.status === 'active' ? 'Switch to this plan' : 'Choose & pay'}</Button>
            </div>
          );
        })}
      </div>

      <div className="space-y-3">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Add-ons</h2>
        <DomainAddon />
      </div>

      <Card title="Payment history" icon={Landmark} padded={false}>
        {payments.length === 0 ? <p className="p-6 text-sm text-slate-500"><Sparkles size={14} className="mr-1 inline text-orange-500" />No payments yet.</p> : <DataTable columns={cols} rows={payments} rowKey={(p) => p.id} />}
      </Card>
      <PayModal plan={paying} cycle={cycle} bank={bank} onClose={() => setPaying(null)} />
    </div>
  );
}
