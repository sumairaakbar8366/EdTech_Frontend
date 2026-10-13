import { ChevronLeft, ChevronRight, CreditCard, Plus, Printer, Undo2 } from 'lucide-react';
import { useState } from 'react';
import { Badge, Button, Card, CompactNumber, EmptyState, Field, IconButton, Input, Spinner } from '@/components/ui';
import { allPages } from '@/components/shared/ExportMenu';
import { SheetActions } from '@/components/shared/SheetActions';
import { feeService } from '@/features/fees/services/feeService';
import { PAYMENT_EXPORT, PAYMENT_IMPORT } from '@/features/fees/utils/feeSheet';
import { ReceiptModal } from '@/features/fees/components/payments/ReceiptModal';
import { RecordPaymentModal } from '@/features/fees/components/payments/RecordPaymentModal';
import { VoidPaymentModal } from '@/features/fees/components/payments/VoidPaymentModal';
import { METHOD_LABEL } from '@/features/fees/constants';
import { usePayments } from '@/features/fees/hooks/useFees';
import type { Payment } from '@/features/fees/types/fee.types';
import { studentName } from '@/features/fees/utils/fee.utils';
import { formatDate } from '@/lib/format';

const PAGE_SIZE = 25;

/** Payments received, with receipts; recording and voiding (page 8: payment → receipt). */
export function PaymentsTab({ canEdit }: { canEdit: boolean }) {
  const [page, setPage] = useState(1);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [recording, setRecording] = useState(false);
  const [receiptId, setReceiptId] = useState<string | null>(null);
  const [voiding, setVoiding] = useState<Payment | null>(null);

  const list = usePayments({ page, pageSize: PAGE_SIZE, from, to });
  const totalPages = list.data ? Math.max(1, Math.ceil(list.data.total / PAGE_SIZE)) : 1;

  return (
    <Card padded={false} title="Payments" icon={CreditCard} tone="emerald" actions={<div className="flex flex-wrap items-center gap-2"><SheetActions compact fileName="Payments" columns={PAYMENT_EXPORT} rows={() => allPages((p, size) => feeService.payments({ page: p, pageSize: size, from, to }))} importSpec={canEdit ? PAYMENT_IMPORT : undefined} />{canEdit && <Button icon={Plus} onClick={() => setRecording(true)}>Record payment</Button>}</div>}>
      <div className="flex flex-wrap items-end gap-3 border-b border-slate-200 p-4 dark:border-white/5">
        <div className="w-44"><Field label="From"><Input type="date" value={from} onChange={(e) => { setFrom(e.target.value); setPage(1); }} /></Field></div>
        <div className="w-44"><Field label="To"><Input type="date" value={to} min={from} onChange={(e) => { setTo(e.target.value); setPage(1); }} /></Field></div>
      </div>
      {list.isLoading && <div className="px-5"><Spinner /></div>}
      {list.data?.items.length === 0 && <EmptyState icon={CreditCard} title="No payments in this range" tone="emerald" />}
      {!!list.data?.items.length && (
        <div className="overflow-x-auto">
          <table className="w-full text-base">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/60 text-left text-sm uppercase tracking-wider text-slate-500 dark:border-white/5 dark:bg-white/[0.02] dark:text-slate-400">
                <th className="px-5 py-3 font-semibold">Receipt</th>
                <th className="px-5 py-3 font-semibold">Date</th>
                <th className="px-5 py-3 font-semibold">Student</th>
                <th className="px-5 py-3 font-semibold">Method</th>
                <th className="px-5 py-3 font-semibold">Applied to</th>
                <th className="px-5 py-3 text-right font-semibold">Amount</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/70 dark:divide-white/5">
              {list.data.items.map((p) => (
                <tr key={p.id} className={p.status === 'voided' ? 'opacity-60' : ''}>
                  <td className="px-5 py-3 font-semibold tabular-nums">
                    {p.receipt?.receiptNo ?? '—'}
                    {p.status === 'voided' && <div><Badge tone="rose">voided</Badge></div>}
                  </td>
                  <td className="px-5 py-3 text-slate-600 dark:text-slate-300">{formatDate(p.paidAt)}</td>
                  <td className="px-5 py-3">
                    <div className="font-semibold text-slate-800 dark:text-slate-100">{studentName(p.student)}</div>
                    <div className="text-sm text-slate-500">{p.student.admissionNo}</div>
                  </td>
                  <td className="px-5 py-3 text-slate-600 dark:text-slate-300">{METHOD_LABEL[p.method]}{p.reference && <div className="text-sm text-slate-500">{p.reference}</div>}</td>
                  <td className="px-5 py-3 text-sm text-slate-600 dark:text-slate-300">{p.allocations.map((a) => a.invoice.invoiceNo).join(', ')}</td>
                  <td className={`px-5 py-3 text-right font-semibold tabular-nums ${p.status === 'voided' ? 'line-through' : ''}`}><CompactNumber value={p.amount} /></td>
                  <td className="px-3 py-3">
                    <div className="flex justify-end gap-1">
                      <IconButton icon={Printer} label="View receipt" onClick={() => setReceiptId(p.id)} />
                      {canEdit && p.status === 'completed' && <IconButton icon={Undo2} label="Void payment" tone="danger" onClick={() => setVoiding(p)} />}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {!!list.data && list.data.total > PAGE_SIZE && (
        <div className="flex items-center justify-between border-t border-slate-200 px-5 py-3 text-base text-slate-600 dark:border-white/5 dark:text-slate-300">
          <span>{(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, list.data.total)} of <CompactNumber value={list.data.total} /></span>
          <div className="flex items-center gap-1">
            <IconButton icon={ChevronLeft} label="Previous page" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} />
            <span className="px-2">Page {page} of {totalPages}</span>
            <IconButton icon={ChevronRight} label="Next page" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} />
          </div>
        </div>
      )}

      {canEdit && <RecordPaymentModal open={recording} onClose={() => setRecording(false)} onRecorded={setReceiptId} />}
      {canEdit && <VoidPaymentModal payment={voiding} onClose={() => setVoiding(null)} />}
      <ReceiptModal paymentId={receiptId} onClose={() => setReceiptId(null)} />
    </Card>
  );
}
