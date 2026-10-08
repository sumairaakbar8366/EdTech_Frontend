import { Printer } from 'lucide-react';
import { Alert, Button, Modal, Spinner } from '@/components/ui';
import { METHOD_LABEL } from '@/features/fees/constants';
import { useReceipt } from '@/features/fees/hooks/useFees';
import { money, studentName } from '@/features/fees/utils/fee.utils';
import { formatDate } from '@/lib/format';

/** Payment receipt (page 8: payment → receipt). Prints on its own via the .print-area rule. */
export function ReceiptModal({ paymentId, onClose }: { paymentId: string | null; onClose: () => void }) {
  const receipt = useReceipt(paymentId);
  const r = receipt.data;
  const p = r?.payment;
  const section = p?.student.enrollments[0]?.section;

  return (
    <Modal
      open={!!paymentId}
      title="Fee receipt"
      onClose={onClose}
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Close</Button>
          <Button icon={Printer} disabled={!r} onClick={() => window.print()}>Print</Button>
        </>
      }
    >
      {receipt.isLoading && <Spinner />}
      {receipt.error && <Alert>Could not load this receipt.</Alert>}
      {r && p && (
        <div className="print-area space-y-5 text-slate-800 dark:text-slate-100">
          <div className="flex items-start justify-between gap-4 border-b border-dashed border-slate-300 pb-4 dark:border-white/15">
            <div>
              <div className="font-display text-2xl font-bold uppercase tracking-wide">{r.school}</div>
              <div className="text-sm text-slate-500">Official fee receipt</div>
            </div>
            <div className="text-right">
              <div className="font-display text-xl font-bold tabular-nums">{p.receipt.receiptNo}</div>
              <div className="text-sm text-slate-500">{formatDate(p.paidAt)}</div>
              {p.status === 'voided' && <div className="mt-1 text-sm font-bold uppercase text-rose-600">Voided</div>}
            </div>
          </div>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-base">
            <dt className="text-slate-500">Student</dt><dd className="font-semibold">{studentName(p.student)}</dd>
            <dt className="text-slate-500">Admission no.</dt><dd className="tabular-nums">{p.student.admissionNo}</dd>
            {section && (<><dt className="text-slate-500">Class</dt><dd>{section.schoolClass.name} · {section.name}</dd></>)}
            <dt className="text-slate-500">Method</dt><dd>{METHOD_LABEL[p.method]}{p.reference ? ` · ${p.reference}` : ''}</dd>
          </dl>
          <table className="w-full text-base">
            <thead>
              <tr className="border-b border-slate-200 text-left text-sm uppercase tracking-wider text-slate-500 dark:border-white/10">
                <th className="py-2 font-semibold">Invoice</th>
                <th className="py-2 font-semibold">Period</th>
                <th className="py-2 text-right font-semibold">Applied</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/70 dark:divide-white/5">
              {p.allocations.map((a) => (
                <tr key={a.invoice.invoiceNo}>
                  <td className="py-2 tabular-nums">{a.invoice.invoiceNo}</td>
                  <td className="py-2">{a.invoice.periodLabel}</td>
                  <td className="py-2 text-right tabular-nums">{money(a.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex items-center justify-between rounded-xl bg-primary-500/10 px-4 py-3">
            <span className="font-bold uppercase tracking-wider">Amount received</span>
            <span className="font-display text-2xl font-bold tabular-nums">{money(p.amount, r.currency)}</span>
          </div>
          <p className="text-center text-xs text-slate-400">Computer-generated receipt. No signature required.</p>
        </div>
      )}
    </Modal>
  );
}
