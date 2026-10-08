import { Banknote, CalendarRange, CheckCircle2, FileText, Landmark, Users, Wallet } from 'lucide-react';
import { useSearchParams } from 'react-router';
import { BankAccountsTab } from '@/features/payroll/components/bank/BankAccountsTab';
import { PayslipRegisterTab } from '@/features/payroll/components/PayslipRegisterTab';
import { useState } from 'react';
import { PageHeader, StatCard, Tabs } from '@/components/ui';
import { money } from '@/features/fees/utils/fee.utils';
import { RunsTab } from '@/features/payroll/components/runs/RunsTab';
import { SalaryStructuresTab } from '@/features/payroll/components/structures/SalaryStructuresTab';
import { usePayrollSummary } from '@/features/payroll/hooks/usePayroll';

type Tab = 'runs' | 'structures' | 'payslips' | 'bank';

const TITLES: Record<Tab, [string, string]> = {
  runs: ['Salary processing', 'Monthly payroll runs: calculate, review, approve and pay'],
  structures: ['Staff payroll', 'Each staff member’s basic salary, allowances and deductions'],
  payslips: ['Payslips', 'Every payslip issued, with how and where it was paid'],
  bank: ['Bank accounts', 'Staff salary accounts and change requests'],
};

/** Payroll workspace (page 9). Accounts prepare runs and salaries; the admin approves. */
export function PayrollPage({ canEdit, initialTab = 'runs' }: { canEdit: boolean; initialTab?: Tab }) {
  const [params] = useSearchParams();
  const [tab, setTab] = useState<Tab>(params.get('tab') === 'bank' ? 'bank' : initialTab);
  const summary = usePayrollSummary();
  const s = summary.data;
  return (
    <div>
      <PageHeader title={TITLES[tab][0]} sub={TITLES[tab][1]} icon={Banknote} tone="orange" />
      <div className="stagger mb-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard label="Current staff" value={s?.staff ?? '–'} icon={Users} tone="sky" />
        <StatCard label="With salary set" value={s ? `${s.withStructure}/${s.staff}` : '–'} icon={Wallet} tone="primary" />
        <StatCard label="Runs in progress" value={s?.pendingRuns ?? '–'} icon={CalendarRange} tone="amber" />
        <StatCard label="Last paid" value={s?.lastPaid ? money(s.lastPaid.totalNet) : '–'} icon={CheckCircle2} tone="emerald" hint={s?.lastPaid?.period.name} />
      </div>
      <Tabs
        tabs={[
          { id: 'runs' as const, label: 'Payroll runs', icon: CalendarRange },
          { id: 'structures' as const, label: 'Salary structures', icon: Wallet },
          { id: 'payslips' as const, label: 'Payslips', icon: FileText },
          { id: 'bank' as const, label: 'Bank accounts', icon: Landmark },
        ]}
        value={tab}
        onChange={setTab}
      />
      {tab === 'runs' && <RunsTab canEdit={canEdit} />}
      {tab === 'structures' && <SalaryStructuresTab canEdit={canEdit} />}
      {tab === 'payslips' && <PayslipRegisterTab />}
      {tab === 'bank' && <BankAccountsTab canEdit={canEdit} />}
    </div>
  );
}
