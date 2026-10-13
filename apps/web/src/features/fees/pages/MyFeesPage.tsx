import { CircleDollarSign, CreditCard, Printer, Receipt, TrendingUp, Wallet } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Alert, Badge, Card, CompactNumber, EmptyState, IconButton, PageHeader, Spinner, StatCard } from '@/components/ui';
import { ReceiptModal } from '@/features/fees/components/payments/ReceiptModal';
import { INVOICE_TONE, METHOD_LABEL } from '@/features/fees/constants';
import { useMyFeeStudents, useStatement } from '@/features/fees/hooks/useFees';
import { balanceOf, concessionValue, studentName } from '@/features/fees/utils/fee.utils';
import { formatDate } from '@/lib/format';

/** A student's own fees, or a parent's view of each child's fees and receipts (page 8). */
export function MyFeesPage({ focus = 'fees' }: { focus?: 'fees' | 'receipts' }) {
  const students = useMyFeeStudents();
  const [studentId, setStudentId] = useState<string | null>(null);
  const [receiptId, setReceiptId] = useState<string | null>(null);
  useEffect(() => {
    if (!studentId && students.data?.[0]) setStudentId(students.data[0].id);
  }, [students.data, studentId]);
  const statement = useStatement(studentId);
  const st = statement.data;

  return (
    <div>
      <PageHeader title={focus === 'receipts' ? 'Receipts' : 'Fees'} sub="Invoices, payments and receipts" icon={focus === 'receipts' ? Receipt : Wallet} tone="amber" />
      {students.isLoading && <Spinner />}
      {students.data?.length === 0 && <Card><EmptyState icon={Wallet} title="No student record is linked to your account" tone="amber">Please contact the school office.</EmptyState></Card>}
      {students.data && students.data.length > 1 && (
        <div role="tablist" className="mb-4 flex flex-wrap gap-2">
          {students.data.map((s) => (
            <button
              key={s.id}
              role="tab"
              aria-selected={s.id === studentId}
              onClick={() => setStudentId(s.id)}
              className={`focus-ring rounded-full px-4 py-1.5 text-base font-semibold transition ${s.id === studentId ? 'bg-brand text-white' : 'surface text-slate-700 dark:text-slate-200'}`}
            >
              {studentName(s)}
            </button>
          ))}
        </div>
      )}
      {statement.error && <Alert>Could not load fees.</Alert>}
      {st && (
        <div className="space-y-4">
          <div className="stagger grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            <StatCard label="Balance due" value={Number(st.totals.balance)} icon={CircleDollarSign} tone={Number(st.totals.balance) > 0 ? 'rose' : 'emerald'} />
            <StatCard label="Total billed" value={Number(st.totals.billed)} icon={Receipt} tone="amber" />
            <StatCard label="Total paid" value={Number(st.totals.paid)} icon={TrendingUp} tone="emerald" />
            <StatCard label="Overdue" value={st.totals.overdue} icon={CreditCard} tone="orange" hint="invoices" />
          </div>
          {st.awards.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {st.awards.map((a) => <Badge key={a.id} tone="magenta">{a.discount.name} · {concessionValue(a.discount)}</Badge>)}
            </div>
          )}
          <div className={`grid gap-4 ${focus === 'receipts' ? '' : 'xl:grid-cols-[1.4fr_1fr]'}`}>
            {focus === 'fees' && (
              <Card title="Invoices" icon={Receipt} tone="amber" padded={false}>
                {st.invoices.length === 0 && <EmptyState icon={Receipt} title="No invoices yet" tone="amber" />}
                <ul className="divide-y divide-slate-200/70 dark:divide-white/5">
                  {st.invoices.map((i) => (
                    <li key={i.id} className="flex flex-wrap items-center gap-3 px-5 py-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 font-semibold text-slate-800 dark:text-slate-100">
                          {i.periodLabel} <Badge tone={INVOICE_TONE[i.status]}>{i.status}</Badge>
                        </div>
                        <div className="text-sm text-slate-500">{i.invoiceNo} · due {formatDate(i.dueDate)} · {i.items.map((it) => it.description).join(', ')}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-display text-lg font-bold tabular-nums"><CompactNumber value={i.total} /></div>
                        {['pending', 'partial', 'overdue'].includes(i.status) && <div className="text-sm text-rose-600 dark:text-rose-400">Due <CompactNumber value={balanceOf(i)} /></div>}
                      </div>
                    </li>
                  ))}
                </ul>
              </Card>
            )}
            <Card title="Payments & receipts" icon={CreditCard} tone="emerald" padded={false}>
              {st.payments.length === 0 && <EmptyState icon={CreditCard} title="No payments yet" tone="emerald" />}
              <ul className="divide-y divide-slate-200/70 dark:divide-white/5">
                {st.payments.map((p) => (
                  <li key={p.id} className={`flex items-center gap-3 px-5 py-3 ${p.status === 'voided' ? 'opacity-60' : ''}`}>
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold tabular-nums text-slate-800 dark:text-slate-100">{p.receipt?.receiptNo} {p.status === 'voided' && <Badge tone="rose">voided</Badge>}</div>
                      <div className="text-sm text-slate-500">{formatDate(p.paidAt)} · {METHOD_LABEL[p.method]}</div>
                    </div>
                    <span className="font-semibold tabular-nums"><CompactNumber value={p.amount} /></span>
                    <IconButton icon={Printer} label="View receipt" onClick={() => setReceiptId(p.id)} />
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </div>
      )}
      <ReceiptModal paymentId={receiptId} onClose={() => setReceiptId(null)} />
    </div>
  );
}
