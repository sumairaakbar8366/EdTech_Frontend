import { FileText } from 'lucide-react';
import { useState } from 'react';
import { Card, DataTable, EmptyState, FilterBar, SearchInput, Spinner, type Column } from '@/components/ui';
import { ExportMenu } from '@/components/shared/ExportMenu';
import { money } from '@/features/fees/utils/fee.utils';
import { usePayslipRegister, type PayslipRow } from '@/features/payroll/bankAccounts';
import { useDebouncedValue } from '@/lib/hooks/useDebouncedValue';

const when = (iso: string) => new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });

/** Every payslip issued: who, which month, net pay, how and to which account it was paid. */
export function PayslipRegisterTab({ onOpen }: { onOpen?: (row: PayslipRow) => void }) {
  const [search, setSearch] = useState('');
  const q = useDebouncedValue(search.trim());
  const list = usePayslipRegister({ q });
  const columns: Column<PayslipRow>[] = [
    { header: 'Payslip', cell: (r) => <div><div className="font-semibold">{r.payslip?.payslipNo ?? '—'}</div><div className="text-sm text-slate-500">{r.run.period.name}</div></div> },
    { header: 'Staff', cell: (r) => <div><div>{r.employee.firstName} {r.employee.lastName}</div><div className="text-sm text-slate-500">{r.employee.employeeNo} · {r.employee.designation}</div></div> },
    { header: 'Gross', align: 'right', cell: (r) => money(r.gross) },
    { header: 'Deductions', align: 'right', cell: (r) => money(r.totalDeductions) },
    { header: 'Net paid', align: 'right', cell: (r) => <span className="font-semibold">{money(r.net)}</span> },
    { header: 'Paid', cell: (r) => r.payment ? <div className="text-sm"><div>{when(r.payment.paidAt)} · {r.payment.method.replace('_', ' ')}</div>{r.payment.payeeAccount && <div className="text-slate-500">{r.payment.payeeAccount}</div>}</div> : '—' },
  ];
  return (
    <Card title="Payslips issued" icon={FileText} padded={false} actions={<ExportMenu fileName="Payslips" rows={async () => list.data ?? []} columns={[
      { header: 'Payslip no.', value: (r: PayslipRow) => r.payslip?.payslipNo ?? '' },
      { header: 'Period', value: (r: PayslipRow) => r.run.period.name },
      { header: 'Employee no.', value: (r: PayslipRow) => r.employee.employeeNo },
      { header: 'Name', value: (r: PayslipRow) => `${r.employee.firstName} ${r.employee.lastName}` },
      { header: 'Gross', value: (r: PayslipRow) => Number(r.gross) },
      { header: 'Deductions', value: (r: PayslipRow) => Number(r.totalDeductions) },
      { header: 'Net', value: (r: PayslipRow) => Number(r.net) },
      { header: 'Paid on', value: (r: PayslipRow) => (r.payment ? new Date(r.payment.paidAt) : '') },
      { header: 'Method', value: (r: PayslipRow) => r.payment?.method ?? '' },
      { header: 'Paid to', value: (r: PayslipRow) => r.payment?.payeeAccount ?? '' },
    ]} />}>
      <FilterBar><SearchInput value={search} onChange={setSearch} placeholder="Search staff name or employee no.…" label="Search payslips" /></FilterBar>
      {list.isLoading && <div className="p-6"><Spinner /></div>}
      {list.data?.length === 0 && <EmptyState icon={FileText} title="No payslips yet">Payslips appear once a payroll run is paid.</EmptyState>}
      {!!list.data?.length && <DataTable columns={columns} rows={list.data} rowKey={(r) => r.id} onRowClick={onOpen} />}
    </Card>
  );
}
