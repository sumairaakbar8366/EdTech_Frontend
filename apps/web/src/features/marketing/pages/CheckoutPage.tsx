import { useQuery } from '@tanstack/react-query';
import { Building, CheckCircle2, CreditCard, Lock, ShieldCheck, Smartphone, XCircle } from 'lucide-react';
import { useState } from 'react';
import { useParams } from 'react-router';
import { Alert, Button, Field, Input, Select, Spinner } from '@/components/ui';
import { gatewayService, type GatewayMethod } from '@/features/marketing/services/marketingService';
import { errorMessage } from '@/lib/errors';
import { onSubmit } from '@/lib/forms';
import { PRODUCT_NAME } from '@/config/brand';

const METHODS: { id: GatewayMethod; label: string; icon: typeof CreditCard; hint: string }[] = [
  { id: 'card', label: 'Debit / credit card', icon: CreditCard, hint: 'Visa, Mastercard, UnionPay' },
  { id: 'bank_account', label: 'Bank account', icon: Building, hint: 'HBL, MCB, UBL, Meezan, Allied …' },
  { id: 'jazzcash', label: 'JazzCash', icon: Smartphone, hint: 'Mobile wallet' },
  { id: 'easypaisa', label: 'Easypaisa', icon: Smartphone, hint: 'Mobile wallet' },
];
const BANKS = ['HBL', 'MCB Bank', 'United Bank (UBL)', 'Meezan Bank', 'Allied Bank', 'Bank Alfalah', 'Bank Al Habib', 'Faysal Bank', 'Standard Chartered', 'National Bank of Pakistan'];
/** Test card that is always declined. */
const DECLINE_CARD = '4000000000000002';

const digits = (s: string) => s.replace(/\D/g, '');
function brandOf(num: string): 'Visa' | 'Mastercard' | 'UnionPay' | null {
  if (/^4/.test(num)) return 'Visa';
  if (/^(5[1-5]|2[2-7])/.test(num)) return 'Mastercard';
  if (/^62/.test(num)) return 'UnionPay';
  return null;
}
/** Luhn checksum: catches typos before anything is sent. */
function luhn(num: string): boolean {
  let sum = 0;
  for (let i = 0; i < num.length; i++) {
    let d = Number(num[num.length - 1 - i]);
    if (i % 2 === 1) { d *= 2; if (d > 9) d -= 9; }
    sum += d;
  }
  return num.length >= 13 && sum % 10 === 0;
}

/**
 * The payment gateway's checkout page. With the built-in test gateway it runs here on the public site:
 * card and account numbers are checked in the browser and never sent anywhere (only the brand and the
 * last four digits), and nothing is charged. A real gateway shows its own page instead.
 */
export function CheckoutPage() {
  const { token = '' } = useParams();
  const session = useQuery({ queryKey: ['checkout', token], queryFn: () => gatewayService.session(token), retry: false });
  const [method, setMethod] = useState<GatewayMethod>('card');
  const [card, setCard] = useState({ number: '', name: '', expiry: '', cvc: '', type: 'debit' });
  const [account, setAccount] = useState({ bank: BANKS[0]!, title: '', number: '' });
  const [wallet, setWallet] = useState({ mobile: '', pin: '' });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<'paid' | 'failed' | null>(null);

  if (session.isLoading) return <Shell><Spinner /></Shell>;
  if (session.error || !session.data) return <Shell><Alert>{errorMessage(session.error, 'This checkout link is not valid.')}</Alert></Shell>;
  const s = session.data;
  const amount = `PKR ${Number(s.amount).toLocaleString('en-PK', { minimumFractionDigits: 2 })}`;
  const closed = s.status !== 'initiated' || s.expired;

  const cardNum = digits(card.number);
  const brand = brandOf(cardNum);

  const pay = async () => {
    setError(null);
    let body: Parameters<typeof gatewayService.pay>[1];
    if (method === 'card') {
      if (!brand) return setError('We accept Visa, Mastercard and UnionPay cards.');
      if (!luhn(cardNum)) return setError('The card number is not valid. Please check it.');
      const [mm, yy] = card.expiry.split('/').map((x) => Number(x));
      const now = new Date();
      if (!mm || mm > 12 || !yy || new Date(2000 + yy, mm) <= now) return setError('The expiry date is not valid.');
      if (!/^\d{3,4}$/.test(card.cvc)) return setError('Enter the 3-digit security code from the back of the card.');
      body = { method, outcome: cardNum === DECLINE_CARD ? 'decline' : 'success', cardBrand: brand, last4: cardNum.slice(-4), payerName: card.name.trim() };
    } else if (method === 'bank_account') {
      const n = digits(account.number);
      if (n.length < 10) return setError('Enter your account number or IBAN.');
      body = { method, outcome: 'success', last4: n.slice(-4), payerName: `${account.title.trim()} · ${account.bank}` };
    } else {
      const m = digits(wallet.mobile);
      if (!/^(03\d{9}|923\d{9})$/.test(m)) return setError('Enter your mobile wallet number, e.g. 0300 1234567.');
      if (!/^\d{4,5}$/.test(wallet.pin)) return setError('Enter your wallet PIN to approve the payment.');
      body = { method, outcome: wallet.pin === '0000' ? 'decline' : 'success', last4: m.slice(-4) };
    }
    setBusy(true);
    try {
      const r = await gatewayService.pay(token, body);
      setResult(r.status);
      setTimeout(() => window.location.assign(r.returnUrl), 1800);
    } catch (e) {
      setError(errorMessage(e, 'The payment could not be processed.'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Shell sandbox={s.provider === 'sandbox'}>
      <div className="mb-5 rounded-xl bg-slate-50 p-4 dark:bg-white/5">
        <div className="text-sm text-slate-500">{s.school}</div>
        <div className="mt-0.5 font-semibold text-slate-900 dark:text-white">{s.plan} plan · {s.billingCycle === 'annual' ? '1 year' : '1 month'}</div>
        <div className="mt-2 text-3xl font-extrabold text-slate-900 dark:text-white">{amount}</div>
      </div>
      {result ? (
        <div className="space-y-3 text-center">
          {result === 'paid' ? <CheckCircle2 size={48} className="mx-auto text-emerald-600" /> : <XCircle size={48} className="mx-auto text-rose-600" />}
          <p className="text-lg font-bold">{result === 'paid' ? 'Payment successful' : 'Payment declined'}</p>
          <p className="text-sm text-slate-500">Taking you back to your school…</p>
        </div>
      ) : closed ? (
        <div className="space-y-4">
          <Alert tone="info">{s.status === 'confirmed' ? 'This checkout has already been paid.' : 'This checkout has expired or was closed. Start again from Plans & billing.'}</Alert>
          <Button className="w-full" onClick={() => window.location.assign(s.returnUrl)}>Back to the school</Button>
        </div>
      ) : (
        <form onSubmit={onSubmit(() => void pay())} className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            {METHODS.map((m) => (
              <button key={m.id} type="button" onClick={() => { setMethod(m.id); setError(null); }} className={`flex items-start gap-2 rounded-lg border p-3 text-left transition-colors ${method === m.id ? 'border-orange-500 bg-orange-500/5' : 'border-slate-200 hover:border-slate-300 dark:border-white/10'}`}>
                <m.icon size={18} className="mt-0.5 shrink-0 text-slate-600 dark:text-slate-300" />
                <span><span className="block text-sm font-bold text-slate-800 dark:text-slate-100">{m.label}</span><span className="block text-xs text-slate-500">{m.hint}</span></span>
              </button>
            ))}
          </div>
          {error && <Alert>{error}</Alert>}
          {method === 'card' && (
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <Field label={`Card number${brand ? ` · ${brand}` : ''}`}>
                  <Input required inputMode="numeric" autoComplete="cc-number" maxLength={23} value={card.number} onChange={(e) => setCard({ ...card, number: digits(e.target.value).replace(/(\d{4})(?=\d)/g, '$1 ') })} placeholder="4242 4242 4242 4242" className="font-mono tracking-wider" />
                </Field>
              </div>
              <div className="col-span-2"><Field label="Name on card"><Input required autoComplete="cc-name" maxLength={80} value={card.name} onChange={(e) => setCard({ ...card, name: e.target.value })} /></Field></div>
              <Field label="Expiry (MM/YY)"><Input required inputMode="numeric" autoComplete="cc-exp" maxLength={5} value={card.expiry} onChange={(e) => setCard({ ...card, expiry: digits(e.target.value).slice(0, 4).replace(/^(\d{2})(\d)/, '$1/$2') })} placeholder="08/29" /></Field>
              <Field label="Security code"><Input required inputMode="numeric" autoComplete="cc-csc" maxLength={4} type="password" value={card.cvc} onChange={(e) => setCard({ ...card, cvc: digits(e.target.value) })} /></Field>
              <div className="col-span-2 flex gap-4 text-sm">
                {['debit', 'credit'].map((t) => <label key={t} className="flex items-center gap-1.5"><input type="radio" name="cardtype" checked={card.type === t} onChange={() => setCard({ ...card, type: t })} className="accent-orange-500" /> {t === 'debit' ? 'Debit card' : 'Credit card'}</label>)}
              </div>
            </div>
          )}
          {method === 'bank_account' && (
            <div className="grid gap-3">
              <Field label="Bank"><Select value={account.bank} onChange={(e) => setAccount({ ...account, bank: e.target.value })}>{BANKS.map((b) => <option key={b}>{b}</option>)}</Select></Field>
              <Field label="Account title"><Input required maxLength={80} value={account.title} onChange={(e) => setAccount({ ...account, title: e.target.value })} /></Field>
              <Field label="Account number or IBAN"><Input required maxLength={34} value={account.number} onChange={(e) => setAccount({ ...account, number: e.target.value.toUpperCase() })} placeholder="PK36SCBL0000001123456702" className="font-mono" /></Field>
            </div>
          )}
          {(method === 'jazzcash' || method === 'easypaisa') && (
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2"><Field label={`${method === 'jazzcash' ? 'JazzCash' : 'Easypaisa'} mobile number`}><Input required inputMode="tel" maxLength={14} value={wallet.mobile} onChange={(e) => setWallet({ ...wallet, mobile: e.target.value })} placeholder="0300 1234567" /></Field></div>
              <Field label="Wallet PIN"><Input required type="password" inputMode="numeric" maxLength={5} value={wallet.pin} onChange={(e) => setWallet({ ...wallet, pin: digits(e.target.value) })} /></Field>
              <p className="self-end pb-2 text-xs text-slate-500">You approve the payment with your wallet PIN.</p>
            </div>
          )}
          <Button type="submit" className="w-full py-3" icon={Lock} loading={busy}>Pay {amount}</Button>
        </form>
      )}
    </Shell>
  );
}

function Shell({ children, sandbox = true }: { children: React.ReactNode; sandbox?: boolean }) {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-slate-100 p-4 dark:bg-slate-950">
      <div className="w-full max-w-md">
        <div className="mb-3 flex items-center justify-between">
          <span className="inline-flex items-center gap-2 font-bold text-slate-800 dark:text-white"><ShieldCheck size={18} className="text-emerald-600" /> {PRODUCT_NAME} Pay</span>
          <span className="text-xs text-slate-500">Secure checkout · PKR</span>
        </div>
        {sandbox && <div className="mb-3 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-900 dark:border-amber-400/30 dark:bg-amber-500/10 dark:text-amber-200">TEST MODE: no money is taken. Decline tests: card 4000 0000 0000 0002, or wallet PIN 0000.</div>}
        <div className="surface rounded-2xl p-6 shadow-depth-3">{children}</div>
      </div>
    </main>
  );
}
