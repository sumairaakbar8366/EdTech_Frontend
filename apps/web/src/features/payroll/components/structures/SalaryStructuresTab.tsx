import { Pencil, Users, Wallet } from 'lucide-react';
import { useState } from 'react';
import { Badge, Card, EmptyState, IconButton, Spinner } from '@/components/ui';
import { money } from '@/features/fees/utils/fee.utils';
import { SalaryStructureModal } from '@/features/payroll/components/structures/SalaryStructureModal';
import { useSalaryStructures } from '@/features/payroll/hooks/usePayroll';
import type { StaffSalary } from '@/features/payroll/types/payroll.types';
import { employeeName, monthlyGross } from '@/features/payroll/utils/payroll.utils';
import { formatDate } from '@/lib/format';

/** Every current employee with their active salary structure. */
export function SalaryStructuresTab({ canEdit }: { canEdit: boolean }) {
  const [editing, setEditing] = useState<StaffSalary | null>(null);
  const staff = useSalaryStructures();
  return (
    <Card padded={false} title="Salary structures" icon={Wallet} tone="primary">
      {staff.isLoading && <div className="px-5"><Spinner /></div>}
      {staff.data?.length === 0 && <EmptyState icon={Users} title="No current staff" tone="sky" />}
      {!!staff.data?.length && (
        <div className="overflow-x-auto">
          <table className="w-full text-base">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/60 text-left text-sm uppercase tracking-wider text-slate-500 dark:border-white/5 dark:bg-white/[0.02] dark:text-slate-400">
                <th className="px-5 py-3 font-semibold">Employee</th>
                <th className="px-5 py-3 font-semibold">Designation</th>
                <th className="px-5 py-3 text-right font-semibold">Basic</th>
                <th className="px-5 py-3 text-right font-semibold">Monthly gross</th>
                <th className="px-5 py-3 font-semibold">Effective</th>
                <th className="px-3 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/70 dark:divide-white/5">
              {staff.data.map((s) => (
                <tr key={s.id}>
                  <td className="px-5 py-3">
                    <div className="font-semibold text-slate-800 dark:text-slate-100">{employeeName(s)}</div>
                    <div className="text-sm text-slate-500">{s.employeeNo}</div>
                  </td>
                  <td className="px-5 py-3 text-slate-600 dark:text-slate-300">{s.designation}</td>
                  <td className="px-5 py-3 text-right tabular-nums">{s.structure ? money(s.structure.basicSalary) : <Badge tone="amber">not set</Badge>}</td>
                  <td className="px-5 py-3 text-right font-semibold tabular-nums">{monthlyGross(s) !== null ? money(monthlyGross(s)!) : '—'}</td>
                  <td className="px-5 py-3 text-sm text-slate-500">{s.structure ? formatDate(s.structure.effectiveFrom) : '—'}</td>
                  <td className="px-3 py-3">{canEdit && <IconButton icon={Pencil} label="Edit salary" onClick={() => setEditing(s)} />}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {canEdit && <SalaryStructureModal staff={editing} onClose={() => setEditing(null)} />}
    </Card>
  );
}
