import { Ban, HandCoins } from 'lucide-react';
import { useState } from 'react';
import { Badge, Button, Field, Modal, Spinner, TextArea } from '@/components/ui';
import { ReceiptModal } from '@/features/fees/components/payments/ReceiptModal';
import { INVOICE_TONE, METHOD_LABEL } from '@/features/fees/constants';
import { useFeesAction, useInvoice } from '@/features/fees/hooks/useFees';
import { feeService } from '@/features/fees/services/feeService';
import { balanceOf, money, studentName } from '@/features/fees/utils/fee.utils';
import { formatDate } from '@/lib/format';

/** One invoice: items, totals and payments, with waive / cancel for open invoices. */
export function InvoiceDetailModal({ id, canEdit, onClose }: { id: string | null; canEdit: boolean; onClose: () => void }) {
  const [action, setAction] = useState<'waive' | 'cancel' | null>(null);
  const [note, setNote] = useState('');
  const [receiptId, setReceiptId] = useState<string | null>(null);
  const invoice = useInvoice(id);
  const act = useFeesAction(() => feeService.closeInvoice(id!, action!, note), {
    success: action === 'waive' ? 'Invoice waived' : 'Invoice cancelled',
    onDone: () => {
      setAction(null);
      setNote('');
    },
  });
  const inv = invoice.data;
  const open = inv && ['pending', 'partial', 'overdue'].includes(inv.status);

  return (
    <>
      <Modal
        open={!!id && !receiptId}
        title={inv ? `Invoice ${inv.invoiceNo}` : 'Invoice'}
        onClose={() => { setAction(null); onClose(); }}
        size="lg"
        footer={
          canEdit && open ? (
            action ? (
              <>
                <Button variant="secondary" onClick={() => setAction(null)}>Back</Button>
                <Button variant="danger" loading={act.isPending} disabled={!note.trim()} onClick={() => act.mutate(undefined)}>
                  Confirm {action}
                </Button>
              </>
            ) : (
              <>
                <Button variant="secondary" icon={HandCoins} onClick={() => setAction('waive')}>Waive</Button>
                {Number(inv.amountPaid) === 0 && <Button variant="danger" icon={Ban} onClick={() => setAction('cancel')}>Cancel invoice</Button>}
              </>
            )
          ) : undefined
        }
      >
        {invoice.isLoading && <Spinner />}
        {inv && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone={INVOICE_TONE[inv.status]}>{inv.status}</Badge>
              <span className="text-slate-600 dark:text-slate-300">{studentName(inv.student)} · {inv.student.admissionNo}</span>
              <span className="text-slate-500">· {inv.academicYear.name} · {inv.periodLabel}</span>
            </div>
            <div className="text-sm text-slate-500">Issued {formatDate(inv.issueDate)} · due {formatDate(inv.dueDate)}</div>
            <table className="w-full text-base">
              <thead>
                <tr className="border-b border-slate-200 text-left text-sm uppercase tracking-wider text-slate-500 dark:border-white/10">
                  <th className="py-2 font-semibold">Item</th>
                  <th className="py-2 text-right font-semibold">Amount</th>
                  <th className="py-2 text-right font-semibold">Discount</th>
                  <th className="py-2 text-right font-semibold">Net</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/70 dark:divide-white/5">
                {inv.items.map((it) => (
                  <tr key={it.id}>
                    <td className="py-2">{it.description}</td>
                    <td className="py-2 text-right tabular-nums">{money(it.amount)}</td>
                    <td className="py-2 text-right tabular-nums text-emerald-600">{Number(it.discount) ? `−${money(it.discount)}` : '—'}</td>
                    <td className="py-2 text-right tabular-nums">{money(it.net)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="grid grid-cols-3 gap-3 text-center">
              {[['Total', inv.total], ['Paid', inv.amountPaid], ['Balance', String(balanceOf(inv))]].map(([label, v]) => (
                <div key={label} className="rounded-xl bg-slate-500/5 px-3 py-2">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-500">{label}</div>
                  <div className="font-display text-xl font-bold tabular-nums">{money(v!)}</div>
                </div>
              ))}
            </div>
            {inv.allocations.length > 0 && (
              <div>
                <h3 className="mb-2 text-sm font-bold uppercase tracking-wider text-slate-500">Payments</h3>
                <ul className="space-y-1.5">
                  {inv.allocations.map((a) => (
                    <li key={a.id} className="flex items-center justify-between rounded-lg bg-slate-500/5 px-3 py-2 text-sm">
                      <span>
                        {formatDate(a.payment.paidAt)} · {METHOD_LABEL[a.payment.method]}
                        {a.payment.status === 'voided' && <Badge tone="rose">voided</Badge>}
                      </span>
                      <span className="flex items-center gap-2">
                        <span className="font-semibold tabular-nums">{money(a.amount)}</span>
                        {a.payment.receipt && (
                          <button className="text-primary-600 hover:underline dark:text-primary-300" onClick={() => setReceiptId(a.payment.id)}>
                            {a.payment.receipt.receiptNo}
                          </button>
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {inv.notes && <p className="whitespace-pre-wrap text-sm text-slate-500">{inv.notes}</p>}
            {action && (
              <Field label={action === 'waive' ? 'Reason for waiving' : 'Reason for cancelling'}>
                <TextArea value={note} onChange={(e) => setNote(e.target.value)} maxLength={500} />
              </Field>
            )}
          </div>
        )}
      </Modal>
      <ReceiptModal paymentId={receiptId} onClose={() => setReceiptId(null)} />
    </>
  );
}
