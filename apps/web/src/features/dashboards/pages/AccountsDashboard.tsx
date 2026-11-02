import { CalendarClock, CircleDollarSign, Receipt, TrendingUp } from 'lucide-react';
import { StatCard } from '@/components/ui';
import { useCan } from '@/features/auth/usePermissions';
import { DashboardHero } from '@/features/dashboards/components/DashboardHero';
import { useAccountsHeroSlides } from '@/features/dashboards/hooks/useHeroSlides';
import { QuickAccess } from '@/features/dashboards/components/QuickAccess';
import { PayrollStatusWidget } from '@/features/dashboards/widgets/PayrollStatusWidget';
import { RecentPaymentsWidget } from '@/features/dashboards/widgets/RecentPaymentsWidget';
import { InvoiceStatusBar } from '@/features/fees/components/InvoiceStatusBar';
import { useFeesSummary } from '@/features/fees/hooks/useFees';

/** Accounts: collections, dues and payroll (board page 4: Accounts dashboard). */
export function AccountsDashboard() {
  const can = useCan();
  const slides = useAccountsHeroSlides();
  const s = useFeesSummary().data;
  const invoices = s ? Object.values(s.byStatus).reduce((a, b) => a + (b ?? 0), 0) : undefined;
  return (
    <div className="dash space-y-6">
      <DashboardHero slides={slides} />
      {can('fees.view') && (
        <>
          <div className="stagger grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-4">
            <StatCard label="Collected this month" value={s ? Number(s.collectedThisMonth) : '–'} icon={TrendingUp} tone="emerald" hint={s?.currency} />
            <StatCard label="Outstanding" value={s ? Number(s.outstanding) : '–'} icon={CircleDollarSign} tone="amber" hint={s?.currency} />
            <StatCard label="Overdue invoices" value={s?.overdueInvoices ?? '–'} icon={CalendarClock} tone="rose" />
            <StatCard label="Invoices issued" value={invoices ?? '–'} icon={Receipt} tone="primary" />
          </div>
          {s && <InvoiceStatusBar counts={s.byStatus} />}
        </>
      )}
      <div className="grid gap-6 lg:grid-cols-3">
        {can('fees.view') && <RecentPaymentsWidget to="/payments" className="lg:col-span-2" />}
        {can('payroll.view') && <PayrollStatusWidget to="/payroll" />}
      </div>
      <QuickAccess />
    </div>
  );
}
