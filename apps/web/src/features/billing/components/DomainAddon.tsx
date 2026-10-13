import { Globe, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { Alert, Badge, Button } from '@/components/ui';
import { billingService, formatMoney, useBillingOverview } from '@/features/billing/billing';
import { errorMessage } from '@/lib/errors';
import { formatDate } from '@/lib/format';

/** Opens the online checkout for one year of the own-domain add-on. */
export function useBuyDomain() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const buy = async () => {
    setError(null);
    setBusy(true);
    try {
      const r = await billingService.checkoutDomain();
      window.location.assign(r.redirectUrl);
    } catch (e) {
      setError(errorMessage(e, 'Could not open the checkout.'));
      setBusy(false);
    }
  };
  return { buy, busy, error };
}

/**
 * The own-domain add-on: schools use our address for free; their own domain (e.g. www.yourschool.edu.pk)
 * is a yearly add-on paid online. Shows the price, what is included, and the state once bought.
 */
export function DomainAddon({ compact = false }: { compact?: boolean }) {
  const overview = useBillingOverview();
  const { buy, busy, error } = useBuyDomain();
  const a = overview.data?.addons.domain;
  if (!a) return null;
  return (
    <div className={`rounded-xl border border-slate-200 dark:border-white/10 ${compact ? 'p-4' : 'p-5'}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-sky-500/10 text-sky-700 dark:text-sky-300"><Globe size={20} /></span>
          <div>
            <div className="font-bold text-slate-900 dark:text-white">Your own domain</div>
            <p className="text-sm text-slate-600 dark:text-slate-300">Run your website and portal at your school’s own address, e.g. <span className="font-mono">www.yourschool.edu.pk</span>, instead of our free address.</p>
            {!compact && <p className="mt-1 inline-flex items-center gap-1 text-xs text-slate-500"><ShieldCheck size={13} /> Includes the secure (https) certificate and setup help. You keep your free address too.</p>}
          </div>
        </div>
        <div className="text-right">
          {a.active ? (
            <><Badge tone="emerald">Active</Badge><div className="mt-1 text-xs text-slate-500">until {formatDate(a.paidUntil!)}</div><Button variant="secondary" className="mt-2" loading={busy} onClick={() => void buy()}>Renew a year</Button></>
          ) : a.includedInPlan ? (
            <Badge tone="emerald">Included in your plan</Badge>
          ) : a.priceYearly ? (
            <><div className="text-xl font-extrabold text-slate-900 dark:text-white">{formatMoney(a.priceYearly, 'PKR')}<span className="text-sm font-medium text-slate-500"> / year</span></div><Button className="mt-2" loading={busy} onClick={() => void buy()}>Buy & pay online</Button></>
          ) : (
            <span className="text-sm text-slate-500">Ask us about own domains</span>
          )}
        </div>
      </div>
      {error && <div className="mt-3"><Alert>{error}</Alert></div>}
    </div>
  );
}
