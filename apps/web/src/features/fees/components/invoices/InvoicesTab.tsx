import { ChevronLeft, ChevronRight, FilePlus2, Receipt, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Alert, Badge, Button, Card, EmptyState, IconButton, Select, Spinner } from '@/components/ui';
import { allPages } from '@/components/shared/ExportMenu';
import { SheetActions } from '@/components/shared/SheetActions';
import { feeService } from '@/features/fees/services/feeService';
import { INVOICE_EXPORT } from '@/features/fees/utils/feeSheet';
import { GenerateInvoicesModal } from '@/features/fees/components/invoices/GenerateInvoicesModal';
import { InvoiceDetailModal } from '@/features/fees/components/invoices/InvoiceDetailModal';
import { INVOICE_TONE } from '@/features/fees/constants';
import { useInvoices } from '@/features/fees/hooks/useFees';
import type { InvoiceStatus } from '@/features/fees/types/fee.types';
import { balanceOf, money, studentName } from '@/features/fees/utils/fee.utils';
import { formatDate } from '@/lib/format';

const PAGE_SIZE = 25;
const STATUSES: InvoiceStatus[] = ['pending', 'partial', 'overdue', 'paid', 'waived', 'cancelled'];

/** Student invoices: generate per class, filter, inspect, waive or cancel (page 8). */
export function InvoicesTab({ canEdit, initialStatus = '' }: { canEdit: boolean; initialStatus?: '' | InvoiceStatus }) {
  const [search, setSearch] = useState('');
  const [q, setQ] = useState('');
  const [status, setStatus] = useState<'' | InvoiceStatus>(initialStatus);
  const [page, setPage] = useState(1);
  const [openId, setOpenId] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  useEffect(() => setStatus(initialStatus), [initialStatus]);
  useEffect(() => {
    const t = setTimeout(() => { setQ(search.trim()); setPage(1); }, 300);
    return () => clearTimeout(t);
  }, [search]);

  const list = useInvoices({ page, pageSize: PAGE_SIZE, q, status });
  const totalPages = list.data ? Math.max(1, Math.ceil(list.data.total / PAGE_SIZE)) : 1;

  return (
    <Card padded={false} title="Invoices" icon={Receipt} tone="amber" actions={<div className="flex flex-wrap items-center gap-2"><SheetActions compact fileName="Invoices" columns={INVOICE_EXPORT} rows={() => allPages((p, size) => feeService.invoices({ page: p, pageSize: size, q, status }))} />{canEdit && <Button icon={FilePlus2} onClick={() => setGenerating(true)}>Generate</Button>}</div>}>
      <div className="flex flex-wrap items-center gap-3 border-b border-slate-200 p-4 dark:border-white/5">
        <div className="relative min-w-[16rem] flex-1">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search invoice no., period, student…"
            aria-label="Search invoices"
            className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-3 text-base outline-none focus:border-primary-400 focus:ring-4 focus:ring-primary-500/15 dark:border-white/10 dark:bg-[#0e1626] dark:text-white"
          />
        </div>
        <div className="w-44">
          <Select aria-label="Status" value={status} onChange={(e) => { setStatus(e.target.value as '' | InvoiceStatus); setPage(1); }}>
            <option value="">All statuses</option>
            {STATUSES.map((s) => <option key={s} value={s}>{s[0]!.toUpperCase() + s.slice(1)}</option>)}
          </Select>
        </div>
      </div>

      {list.isLoading && <div className="px-5"><Spinner /></div>}
      {list.error && <div className="p-5"><Alert>Could not load invoices.</Alert></div>}
      {list.data?.items.length === 0 && (
        <EmptyState icon={Receipt} title={q || status ? 'No invoices match these filters' : 'No invoices yet'} tone="amber">
          {canEdit && !q && !status && 'Create a fee structure, assign it to a class, then generate invoices.'}
        </EmptyState>
      )}
      {!!list.data?.items.length && (
        <div className="overflow-x-auto">
          <table className="w-full text-base">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/60 text-left text-sm uppercase tracking-wider text-slate-500 dark:border-white/5 dark:bg-white/[0.02] dark:text-slate-400">
                <th className="px-5 py-3 font-semibold">Invoice</th>
                <th className="px-5 py-3 font-semibold">Student</th>
                <th className="px-5 py-3 font-semibold">Period</th>
                <th className="px-5 py-3 font-semibold">Due</th>
                <th className="px-5 py-3 text-right font-semibold">Total</th>
                <th className="px-5 py-3 text-right font-semibold">Balance</th>
                <th className="px-5 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/70 dark:divide-white/5">
              {list.data.items.map((i) => (
                <tr
                  key={i.id}
                  tabIndex={0}
                  onClick={() => setOpenId(i.id)}
                  onKeyDown={(e) => e.key === 'Enter' && setOpenId(i.id)}
                  className="cursor-pointer transition-colors hover:bg-primary-500/5 focus:bg-primary-500/5 focus:outline-none"
                >
                  <td className="px-5 py-3 font-semibold tabular-nums text-slate-800 dark:text-slate-100">{i.invoiceNo}</td>
                  <td className="px-5 py-3">
                    <div className="font-semibold text-slate-800 dark:text-slate-100">{studentName(i.student)}</div>
                    <div className="text-sm text-slate-500">{i.student.admissionNo}</div>
                  </td>
                  <td className="px-5 py-3 text-slate-600 dark:text-slate-300">{i.periodLabel}</td>
                  <td className="px-5 py-3 text-slate-600 dark:text-slate-300">{formatDate(i.dueDate)}</td>
                  <td className="px-5 py-3 text-right tabular-nums">{money(i.total)}</td>
                  <td className="px-5 py-3 text-right font-semibold tabular-nums">{money(['waived', 'cancelled'].includes(i.status) ? 0 : balanceOf(i))}</td>
                  <td className="px-5 py-3"><Badge tone={INVOICE_TONE[i.status]}>{i.status}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {!!list.data && list.data.total > PAGE_SIZE && (
        <div className="flex items-center justify-between border-t border-slate-200 px-5 py-3 text-base text-slate-600 dark:border-white/5 dark:text-slate-300">
          <span>{(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, list.data.total)} of {list.data.total}</span>
          <div className="flex items-center gap-1">
            <IconButton icon={ChevronLeft} label="Previous page" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} />
            <span className="px-2">Page {page} of {totalPages}</span>
            <IconButton icon={ChevronRight} label="Next page" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} />
          </div>
        </div>
      )}

      <InvoiceDetailModal id={openId} canEdit={canEdit} onClose={() => setOpenId(null)} />
      {canEdit && <GenerateInvoicesModal open={generating} onClose={() => setGenerating(false)} />}
    </Card>
  );
}
