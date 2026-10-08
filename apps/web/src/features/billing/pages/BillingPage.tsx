import { Check, Copy, CreditCard, Landmark, Lock, Send, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { Alert, Badge, Button, Card, DataTable, Field, Input, Modal, PageHeader, Spinner, TextArea, type Column } from '@/components/ui';
import { billingService, formatMoney, priceOf, useBillingAction, useBillingOverview, type Plan, type SubscriptionPayment } from '@/features/billing/billing';
import { errorMessage } from '@/lib/errors';
import { onSubmit } from '@/lib/forms';

const PHASE: Record<string, [string, 'emerald' | 'amber' | 'rose' | 'primary']> = { trial: ['Free trial', 'primary'], active: ['Active', 'emerald'], grace: ['Grace period', 'amber'], expired: ['Read-only', 'rose'] };
const date = (iso: string | null) => (iso ? new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) : '—');

function CopyValue({ value }: { value: string }) {
  const [done, setDone] = useState(false);
  return (
    <button type="button" onClick={() => void navigator.clipboard.writeText(value).then(() => { setDone(true); setTimeout(() => setDone(false), 1500); })} className="ml-2 inline-flex items-center text-slate-400 hover:text-slate-700" title="Copy">
      {done ? <Check size={14} /> : <Copy size={14} />}
    </button>
  );
}

function PayModal({ plan, cycle, bank, onClose }: { plan: Plan | null; cycle: 'monthly' | 'annual'; bank: NonNullable<ReturnType<typeof useBillingOverview>['data']>['bank']; onClose: () => void }) {
  const today = new Date().toISOString().slice(0, 10);
  const [f, setF] = useState({ payerName: '', payerBank: '', payerAccount: '', reference: '', paidOn: today, note: '' });
  const submit = useBillingAction(billingService.submit, 'Payment details sent. We will confirm shortly.', onClose);
  if (!plan) return null;
  const price = priceOf(plan, cycle);
  const set = (k: keyof typeof f) => (e: { target: { value: string } }) => setF({ ...f, [k]: e.target.value });
  const hasBank = !!bank?.accountNumber;
  return (
    <Modal open size="lg" title={`${plan.name} plan · ${cycle === 'annual' ? 'yearly' : 'monthly'}`} onClose={onClose}
      footer={<><Button variant="secondary" onClick={onClose}>Cancel</Button><Button type="submit" form="pay-form" icon={Send} loading={submit.isPending} disabled={!hasBank || !price}>I have paid · send details</Button></>}>
      <div className="space-y-5">
        <div className="rounded-xl bg-slate-50 p-4 dark:bg-white/3">
          <p className="text-sm font-bold uppercase tracking-wider text-slate-500">Step 1 · Transfer</p>
          <p className="mt-1 text-2xl font-extrabold text-slate-900 dark:text-white">{formatMoney(price, plan.currency)} <span className="text-base font-medium text-slate-500">/ {cycle === 'annual' ? 'year' : 'month'}</span></p>
          {hasBank ? (
            <dl className="mt-3 grid gap-1 text-sm sm:grid-cols-2">
              <div><dt className="text-slate-500">Bank</dt><dd className="font-semibold">{bank!.bankName}</dd></div>
              <div><dt className="text-slate-500">Account title</dt><dd className="font-semibold">{bank!.accountTitle}</dd></div>
              <div><dt className="text-slate-500">Account number</dt><dd className="font-mono font-semibold">{bank!.accountNumber}<CopyValue value={bank!.accountNumber!} /></dd></div>
              {bank!.iban && <div><dt className="text-slate-500">IBAN</dt><dd className="font-mono font-semibold">{bank!.iban}<CopyValue value={bank!.iban} /></dd></div>}
              {bank!.instructions && <div className="sm:col-span-2"><dt className="text-slate-500">Instructions</dt><dd>{bank!.instructions}</dd></div>}
            </dl>
          ) : <Alert tone="info">Payment details are being set up. Please contact Anet Cyber Solutions to subscribe.</Alert>}
          {!price && <Alert tone="info">The price for this plan is shared on request; please contact us.</Alert>}
        </div>
        <form id="pay-form" onSubmit={onSubmit(() => submit.mutate({ tierCode: plan.code, billingCycle: cycle, amount: Number(price), payerName: f.payerName, payerBank: f.payerBank, payerAccount: f.payerAccount, reference: f.reference, paidOn: f.paidOn, note: f.note.trim() || null }))} className="grid gap-4 sm:grid-cols-2">
          <p className="text-sm font-bold uppercase tracking-wider text-slate-500 sm:col-span-2">Step 2 · Tell us about the payment</p>
          {submit.error && <div className="sm:col-span-2"><Alert>{errorMessage(submit.error)}</Alert></div>}
          <Field label="Paid from (account title)"><Input required maxLength={120} value={f.payerName} onChange={set('payerName')} /></Field>
          <Field label="Your bank"><Input required maxLength={80} value={f.payerBank} onChange={set('payerBank')} placeholder="e.g. HBL" /></Field>
          <Field label="Your account number"><Input required maxLength={40} value={f.payerAccount} onChange={set('payerAccount')} /></Field>
          <Field label="Transaction / reference no."><Input required maxLength={100} value={f.reference} onChange={set('reference')} /></Field>
          <Field label="Paid on"><Input type="date" required max={today} value={f.paidOn} onChange={set('paidOn')} /></Field>
          <div className="sm:col-span-2"><Field label="Note (optional)"><TextArea rows={2} maxLength={500} value={f.note} onChange={set('note')} /></Field></div>
        </form>
      </div>
    </Modal>
  );
}

/** Admin: current plan, plan comparison, paying by bank transfer and the payment history. */
export function BillingPage() {
  const data = useBillingOverview();
  const [cycle, setCycle] = useState<'monthly' | 'annual'>('monthly');
  const [paying, setPaying] = useState<Plan | null>(null);
  if (data.isLoading || !data.data) return <Spinner />;
  const { state, plans, features, bank, payments } = data.data;
  const [phaseLabel, phaseTone] = PHASE[state.phase]!;
  const pending = payments.find((p) => p.status === 'pending');
  const cols: Column<SubscriptionPayment>[] = [
    { header: 'Submitted', cell: (p) => <span className="text-sm">{date(p.createdAt)}<div className="text-slate-500">{p.submittedByName}</div></span> },
    { header: 'Plan', cell: (p) => `${p.tier.name} · ${p.billingCycle === 'annual' ? 'yearly' : 'monthly'}` },
    { header: 'Amount', align: 'right', cell: (p) => formatMoney(p.amount, p.currency) },
    { header: 'From', cell: (p) => <span className="text-sm">{p.payerName} · {p.payerBank}<div className="font-mono text-slate-500">{p.payerAccount} · {p.reference}</div></span> },
    { header: 'Status', cell: (p) => <div><Badge tone={p.status === 'confirmed' ? 'emerald' : p.status === 'pending' ? 'amber' : 'rose'}>{p.status === 'pending' ? 'Waiting for confirmation' : p.status === 'confirmed' ? 'Confirmed' : 'Rejected'}</Badge>{p.reviewNote && <div className="mt-1 text-xs text-slate-500">{p.reviewNote}</div>}{p.periodEnd && <div className="mt-1 text-xs text-slate-500">Covers until {date(p.periodEnd)}</div>}</div> },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Plans & billing" sub="Your plan, what it includes, and paying by bank transfer" icon={CreditCard} />
      <Card>
        <div className="flex flex-wrap items-center gap-6">
          <div><div className="text-xs font-bold uppercase tracking-wider text-slate-500">Current plan</div><div className="text-2xl font-extrabold text-slate-900 dark:text-white">{state.status === 'trialing' ? 'Free trial' : state.tier?.name ?? '—'}</div></div>
          <Badge tone={phaseTone}>{phaseLabel}</Badge>
          <div className="text-sm text-slate-600 dark:text-slate-300">
            {state.phase === 'trial' && <>All features included · trial ends {date(state.endsAt)} ({state.daysLeft} days left)</>}
            {state.phase === 'active' && <>Paid until {date(state.endsAt)} ({state.daysLeft} days left)</>}
            {state.phase === 'grace' && <>Ended {date(state.endsAt)} · full access until {date(state.graceEndsAt)}</>}
            {state.phase === 'expired' && <>Read-only since {date(state.graceEndsAt)} · your data is safe</>}
          </div>
          {pending && <Badge tone="amber">Payment of {formatMoney(pending.amount, pending.currency)} waiting for confirmation</Badge>}
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
              <Button className="mt-6 w-full" variant={popular ? 'primary' : 'secondary'} disabled={!!pending} onClick={() => setPaying(p)}>{current ? 'Renew' : state.status === 'active' ? 'Switch to this plan' : 'Choose'}</Button>
            </div>
          );
        })}
      </div>

      <Card title="Payment history" icon={Landmark} padded={false}>
        {payments.length === 0 ? <p className="p-6 text-sm text-slate-500"><Sparkles size={14} className="mr-1 inline text-orange-500" />No payments yet.</p> : <DataTable columns={cols} rows={payments} rowKey={(p) => p.id} />}
      </Card>
      <PayModal plan={paying} cycle={cycle} bank={bank} onClose={() => setPaying(null)} />
    </div>
  );
}
