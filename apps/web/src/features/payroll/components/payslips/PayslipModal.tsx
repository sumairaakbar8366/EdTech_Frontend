import { Printer } from 'lucide-react';
import { Alert, Button, Modal, Spinner } from '@/components/ui';
import { money } from '@/features/fees/utils/fee.utils';
import { usePayslip } from '@/features/payroll/hooks/usePayroll';
import { employeeName } from '@/features/payroll/utils/payroll.utils';
import { formatDate } from '@/lib/format';

/** Printable payslip (page 9: Payslip Generated). */
export function PayslipModal({ itemId, onClose }: { itemId: string | null; onClose: () => void }) {
  const slip = usePayslip(itemId);
  const s = slip.data;
  const i = s?.item;

  return (
    <Modal
      open={!!itemId}
      title="Payslip"
      onClose={onClose}
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Close</Button>
          <Button icon={Printer} disabled={!s} onClick={() => window.print()}>Print</Button>
        </>
      }
    >
      {slip.isLoading && <Spinner />}
      {slip.error && <Alert>Could not load this payslip.</Alert>}
      {s && i && (
        <div className="print-area space-y-5 text-slate-800 dark:text-slate-100">
          <div className="flex items-start justify-between gap-4 border-b border-dashed border-slate-300 pb-4 dark:border-white/15">
            <div>
              <div className="font-display text-2xl font-bold uppercase tracking-wide">{s.school}</div>
              <div className="text-sm text-slate-500">Payslip · {i.run.period.name}</div>
            </div>
            <div className="text-right">
              <div className="font-display text-xl font-bold tabular-nums">{i.payslip?.payslipNo ?? 'Draft'}</div>
              <div className="text-sm text-slate-500">{formatDate(i.run.period.startDate)} – {formatDate(i.run.period.endDate)}</div>
            </div>
          </div>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-base sm:grid-cols-4">
            <dt className="text-slate-500">Employee</dt><dd className="font-semibold">{employeeName(i.employee)}</dd>
            <dt className="text-slate-500">Emp. no.</dt><dd className="tabular-nums">{i.employee.employeeNo}</dd>
            <dt className="text-slate-500">Designation</dt><dd>{i.employee.designation}</dd>
            <dt className="text-slate-500">Working days</dt><dd className="tabular-nums">{i.payableDays} / {i.workingDays}</dd>
          </dl>
          <div className="grid gap-4 sm:grid-cols-2">
            <section>
              <h3 className="mb-1 text-sm font-bold uppercase tracking-wider text-emerald-600">Earnings</h3>
              <ul className="divide-y divide-slate-200/70 dark:divide-white/5">
                {i.earnings.map((e) => (
                  <li key={e.name} className="flex justify-between py-1.5"><span>{e.name}</span><span className="tabular-nums">{money(e.amount)}</span></li>
                ))}
                {Number(i.bonus) > 0 && <li className="flex justify-between py-1.5"><span>Bonus</span><span className="tabular-nums">{money(i.bonus)}</span></li>}
                <li className="flex justify-between py-1.5 font-bold"><span>Gross</span><span className="tabular-nums">{money(i.gross)}</span></li>
              </ul>
            </section>
            <section>
              <h3 className="mb-1 text-sm font-bold uppercase tracking-wider text-rose-600">Deductions</h3>
              <ul className="divide-y divide-slate-200/70 dark:divide-white/5">
                {i.deductions.length === 0 && <li className="py-1.5 text-slate-500">None</li>}
                {i.deductions.map((d) => (
                  <li key={d.id} className="flex justify-between gap-3 py-1.5"><span>{d.label}</span><span className="tabular-nums">{money(d.amount)}</span></li>
                ))}
                <li className="flex justify-between py-1.5 font-bold"><span>Total</span><span className="tabular-nums">{money(i.totalDeductions)}</span></li>
              </ul>
            </section>
          </div>
          <div className="flex items-center justify-between rounded-xl bg-primary-500/10 px-4 py-3">
            <span className="font-bold uppercase tracking-wider">Net pay</span>
            <span className="font-display text-2xl font-bold tabular-nums">{money(i.net, s.currency)}</span>
          </div>
          <div className="text-sm text-slate-500">
            Present {i.presentDays} · Paid leave {i.paidLeaveDays} · Unpaid leave {i.unpaidLeaveDays} · Absent {i.absentDays}
            {i.payment && ` · Paid ${formatDate(i.payment.paidAt)}${i.payment.payeeAccount ? ` to ${i.payment.payeeAccount}` : ""}`}
          </div>
          <p className="text-center text-xs text-slate-400">Computer-generated payslip. No signature required.</p>
        </div>
      )}
    </Modal>
  );
}
