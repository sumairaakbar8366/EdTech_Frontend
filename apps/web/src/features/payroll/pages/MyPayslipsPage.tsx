import { MyBankAccountCard } from '@/features/payroll/components/bank/MyBankAccountCard';
import { Banknote, FileText } from 'lucide-react';
import { useState } from 'react';
import { Card, EmptyState, PageHeader, Spinner, Tilt } from '@/components/ui';
import { money } from '@/features/fees/utils/fee.utils';
import { PayslipModal } from '@/features/payroll/components/payslips/PayslipModal';
import { useMyPayslips } from '@/features/payroll/hooks/usePayroll';
import { formatDate } from '@/lib/format';

/** An employee's own payslips (teacher "Salary / Payslips", non-teaching "Payslips"). */
export function MyPayslipsPage() {
  const [slipId, setSlipId] = useState<string | null>(null);
  const slips = useMyPayslips();
  return (
    <div>
      <PageHeader title="Payslips" sub="Your salary history and the account it is paid into" icon={Banknote} tone="orange" />
      <div className="mb-6"><MyBankAccountCard /></div>
      {slips.isLoading && <Spinner />}
      {slips.data?.length === 0 && <Card><EmptyState icon={FileText} title="No payslips yet" tone="orange">Payslips appear here once a payroll run is paid.</EmptyState></Card>}
      <div className="stagger grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {slips.data?.map((s) => (
          <Tilt key={s.id} max={5} className="rounded-xl">
            <button onClick={() => setSlipId(s.id)} data-tone="orange" className="surface tone-card focus-ring block w-full rounded-xl p-5 text-left">
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-display text-2xl font-bold uppercase tracking-wide text-slate-900 dark:text-white">{s.run.period.name}</div>
                  <div className="text-sm text-slate-500">{s.payslip?.payslipNo} · paid {s.run.paidAt ? formatDate(s.run.paidAt) : '—'}</div>
                </div>
                <FileText className="text-primary-500" />
              </div>
              <div className="mt-4 flex items-end justify-between">
                <span className="text-sm text-slate-500">Gross {money(s.gross)} · deductions {money(s.totalDeductions)}</span>
                <span className="font-display text-2xl font-bold tabular-nums text-emerald-600 dark:text-emerald-400">{money(s.net)}</span>
              </div>
            </button>
          </Tilt>
        ))}
      </div>
      <PayslipModal itemId={slipId} onClose={() => setSlipId(null)} />
    </div>
  );
}
