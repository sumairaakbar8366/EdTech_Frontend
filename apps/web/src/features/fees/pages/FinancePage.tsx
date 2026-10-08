import { CalendarClock, CircleDollarSign, CreditCard, Layers, Percent, Receipt, Tags, TrendingUp, Wallet } from 'lucide-react';
import { useState } from 'react';
import { PageHeader, StatCard, Tabs } from '@/components/ui';
import { InvoiceStatusBar } from '@/features/fees/components/InvoiceStatusBar';
import { CategoriesTab } from '@/features/fees/components/categories/CategoriesTab';
import { ConcessionsTab } from '@/features/fees/components/concessions/ConcessionsTab';
import { InvoicesTab } from '@/features/fees/components/invoices/InvoicesTab';
import { PaymentsTab } from '@/features/fees/components/payments/PaymentsTab';
import { StructuresTab } from '@/features/fees/components/structures/StructuresTab';
import { useFeesSummary } from '@/features/fees/hooks/useFees';
import type { InvoiceStatus } from '@/features/fees/types/fee.types';
import { money } from '@/features/fees/utils/fee.utils';

export type FinanceTab = 'invoices' | 'payments' | 'structures' | 'concessions' | 'categories';

const TABS = [
  { id: 'invoices' as const, label: 'Invoices', icon: Receipt },
  { id: 'payments' as const, label: 'Payments', icon: CreditCard },
  { id: 'structures' as const, label: 'Fee structures', icon: Layers },
  { id: 'concessions' as const, label: 'Concessions', icon: Percent },
  { id: 'categories' as const, label: 'Categories', icon: Tags },
];

/**
 * Fees & finance workspace (page 8) for admins and accounts. The accounts menu's separate
 * entries (Pending Fees, Overdue Fees, Discounts…) open it on the matching tab and filter.
 */
export function FinancePage({
  canEdit,
  initialTab = 'invoices',
  invoiceStatus = '',
  concessionFocus = 'all',
  title = 'Fees & Finance',
  sub = 'Fee structures, invoices, payments, receipts and concessions',
}: {
  title?: string;
  sub?: string;
  canEdit: boolean;
  initialTab?: FinanceTab;
  invoiceStatus?: '' | InvoiceStatus;
  concessionFocus?: 'all' | 'discounts' | 'scholarships';
}) {
  const [tab, setTab] = useState<FinanceTab>(initialTab);
  const summary = useFeesSummary();
  const s = summary.data;
  const counts = s?.byStatus ?? {};
  const totalInvoices = Object.values(counts).reduce((a, b) => a + (b ?? 0), 0);

  return (
    <div>
      <PageHeader title={title} sub={sub} icon={Wallet} tone="amber" />

      <div className="stagger mb-4 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard label="Outstanding" value={s ? money(s.outstanding) : '–'} icon={CircleDollarSign} tone="amber" hint={s?.currency} />
        <StatCard label="Collected this month" value={s ? money(s.collectedThisMonth) : '–'} icon={TrendingUp} tone="emerald" hint={s?.currency} />
        <StatCard label="Overdue invoices" value={s?.overdueInvoices ?? '–'} icon={CalendarClock} tone="rose" />
        <StatCard label="Invoices issued" value={s ? totalInvoices : '–'} icon={Receipt} tone="primary" />
      </div>

      <InvoiceStatusBar counts={counts} className="mb-6" />

      <Tabs tabs={TABS} value={tab} onChange={setTab} />
      {tab === 'invoices' && <InvoicesTab canEdit={canEdit} initialStatus={invoiceStatus} />}
      {tab === 'payments' && <PaymentsTab canEdit={canEdit} />}
      {tab === 'structures' && <StructuresTab canEdit={canEdit} />}
      {tab === 'concessions' && <ConcessionsTab canEdit={canEdit} focus={concessionFocus} />}
      {tab === 'categories' && <CategoriesTab canEdit={canEdit} />}
    </div>
  );
}
