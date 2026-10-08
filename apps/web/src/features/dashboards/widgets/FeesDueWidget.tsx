import { Wallet } from 'lucide-react';
import { Card, EmptyState, Spinner } from '@/components/ui';
import { ViewAll } from '@/features/dashboards/components/ViewAll';
import { useMyFeeStudents, useStatement } from '@/features/fees/hooks/useFees';
import { money, studentName } from '@/features/fees/utils/fee.utils';

function BalanceRow({ studentId, name }: { studentId: string; name?: string }) {
  const statement = useStatement(studentId);
  const t = statement.data?.totals;
  const due = t ? Number(t.balance) : 0;
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl bg-slate-500/5 px-3 py-2.5">
      <div>
        {name && <div className="font-semibold text-slate-800 dark:text-slate-100">{name}</div>}
        <div className="text-sm text-slate-500">{t ? (t.overdue ? `${t.overdue} overdue invoice(s)` : 'Nothing overdue') : 'Loading…'}</div>
      </div>
      <div className="text-right">
        <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Balance due</div>
        <div className={`font-display text-2xl font-bold tabular-nums ${due > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>{t ? money(t.balance) : '–'}</div>
      </div>
    </div>
  );
}

/** Fee balance for the student, or for each of a parent's children. */
export function FeesDueWidget({ to, className = '' }: { to: string; className?: string }) {
  const students = useMyFeeStudents();
  const list = students.data ?? [];
  return (
    <Card title="Fees" icon={Wallet} tone="amber" className={className} actions={<ViewAll to={to} />}>
      {students.isLoading && <Spinner />}
      {students.isSuccess && list.length === 0 && <EmptyState icon={Wallet} title="No fee record linked" tone="amber" />}
      <div className="space-y-2">
        {list.map((s) => <BalanceRow key={s.id} studentId={s.id} name={list.length > 1 ? studentName(s) : undefined} />)}
      </div>
    </Card>
  );
}
