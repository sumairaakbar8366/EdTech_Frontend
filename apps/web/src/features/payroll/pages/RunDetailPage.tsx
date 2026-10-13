import { ArrowLeft, Ban, Check, FileText, RefreshCw, Send, SlidersHorizontal, Undo2, Wallet } from 'lucide-react';
import { useState } from 'react';
import { useParams } from 'react-router';
import { AreaLink } from '@/app/router/area';
import { Alert, Badge, Button, Card, IconButton, Spinner, StatCard } from '@/components/ui';
import type { PaymentMethod } from '@/features/fees/types/fee.types';
import { money } from '@/features/fees/utils/fee.utils';
import { PayslipModal } from '@/features/payroll/components/payslips/PayslipModal';
import { AdjustItemModal } from '@/features/payroll/components/run-detail/AdjustItemModal';
import { PayRunModal } from '@/features/payroll/components/run-detail/PayRunModal';
import { RunNoteModal } from '@/features/payroll/components/run-detail/RunNoteModal';
import { RUN_ACTION_SUCCESS, RUN_LABEL, RUN_STEPS, RUN_TONE } from '@/features/payroll/constants';
import { usePayrollAction, usePayrollRun } from '@/features/payroll/hooks/usePayroll';
import { payrollService } from '@/features/payroll/services/payrollService';
import type { PayItem, RunAction } from '@/features/payroll/types/payroll.types';
import { employeeName } from '@/features/payroll/utils/payroll.utils';
import { formatDate } from '@/lib/format';

type ActVars = { action: RunAction; body?: { note?: string; method?: PaymentMethod; reference?: string | null } };

/** One payroll run: review each employee, then move it through the page-9 approval chain. */
export function RunDetailPage({ canEdit, canApprove }: { canEdit: boolean; canApprove: boolean }) {
  const { id } = useParams();
  const [adjusting, setAdjusting] = useState<PayItem | null>(null);
  const [slipId, setSlipId] = useState<string | null>(null);
  const [noteFor, setNoteFor] = useState<'return' | 'cancel' | null>(null);
  const [paying, setPaying] = useState(false);
  const run = usePayrollRun(id);
  const act = usePayrollAction(({ action, body }: ActVars) => payrollService.runAction(id!, action, body).then(() => action), {
    success: (action) => RUN_ACTION_SUCCESS[action],
    onDone: () => {
      setNoteFor(null);
      setPaying(false);
    },
  });

  if (run.isLoading) return <Spinner />;
  if (!run.data) return <Alert>Payroll run not found.</Alert>;
  const r = run.data;
  const stepIndex = RUN_STEPS.findIndex((s) => s.status === r.status);

  return (
    <div className="space-y-5">
      <AreaLink to="/payroll" className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-primary-600"><ArrowLeft size={15} /> Payroll</AreaLink>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl font-bold uppercase tracking-wide text-slate-900 dark:text-white">{r.period.name}</h1>
          <p className="text-slate-500">{formatDate(r.period.startDate)} – {formatDate(r.period.endDate)} · {r.workingDays} working days · {r.applyAttendance ? 'absences deducted' : 'attendance not applied'}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {canEdit && r.status === 'draft' && (
            <>
              <Button variant="secondary" icon={RefreshCw} loading={act.isPending && act.variables?.action === 'recalculate'} onClick={() => act.mutate({ action: 'recalculate' })}>Recalculate</Button>
              <Button icon={Send} onClick={() => act.mutate({ action: 'submit' })}>Send for approval</Button>
            </>
          )}
          {canApprove && r.status === 'reviewed' && (
            <>
              <Button variant="secondary" icon={Undo2} onClick={() => setNoteFor('return')}>Return</Button>
              <Button icon={Check} onClick={() => act.mutate({ action: 'approve' })}>Approve</Button>
            </>
          )}
          {canEdit && r.status === 'approved' && <Button icon={Wallet} onClick={() => setPaying(true)}>Mark paid</Button>}
          {canEdit && (r.status === 'draft' || r.status === 'reviewed') && <Button variant="danger" icon={Ban} onClick={() => setNoteFor('cancel')}>Cancel run</Button>}
        </div>
      </div>

      {r.status === 'cancelled' ? (
        <Alert>This run was cancelled.</Alert>
      ) : (
        <ol className="surface grid grid-cols-2 gap-2 rounded-xl p-3 sm:grid-cols-4">
          {RUN_STEPS.map((s, i) => {
            const done = i <= stepIndex;
            return (
              <li key={s.status} className={`flex items-center gap-2 rounded-lg px-3 py-2 ${i === stepIndex ? 'bg-primary-500/10' : ''}`}>
                <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold ${done ? 'bg-brand text-white' : 'bg-slate-500/15 text-slate-500'}`}>{done ? <Check size={14} /> : i + 1}</span>
                <span className={`text-sm font-semibold ${done ? 'text-slate-800 dark:text-slate-100' : 'text-slate-500'}`}>{s.label}</span>
              </li>
            );
          })}
        </ol>
      )}
      {r.notes && <Alert tone="info"><span className="whitespace-pre-wrap">{r.notes}</span></Alert>}

      <div className="stagger grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard label="Employees" value={r.items.length} icon={FileText} tone="sky" />
        <StatCard label="Gross" value={Number(r.totalGross)} icon={Wallet} tone="primary" />
        <StatCard label="Deductions" value={Number(r.totalDeductions)} icon={SlidersHorizontal} tone="rose" />
        <StatCard label="Net payable" value={Number(r.totalNet)} icon={Check} tone="emerald" hint={RUN_LABEL[r.status]} />
      </div>

      <Card padded={false} title="Employees" icon={FileText} tone={RUN_TONE[r.status]}>
        <div className="overflow-x-auto">
          <table className="w-full text-base">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/60 text-left text-sm uppercase tracking-wider text-slate-500 dark:border-white/5 dark:bg-white/[0.02] dark:text-slate-400">
                <th className="px-5 py-3 font-semibold">Employee</th>
                <th className="px-5 py-3 font-semibold">Days</th>
                <th className="px-5 py-3 text-right font-semibold">Gross</th>
                <th className="px-5 py-3 text-right font-semibold">Deductions</th>
                <th className="px-5 py-3 text-right font-semibold">Net</th>
                <th className="px-3 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/70 dark:divide-white/5">
              {r.items.map((i) => (
                <tr key={i.id}>
                  <td className="px-5 py-3">
                    <div className="font-semibold text-slate-800 dark:text-slate-100">{employeeName(i.employee)}</div>
                    <div className="text-sm text-slate-500">{i.employee.designation}{i.note && ` · ${i.note}`}</div>
                  </td>
                  <td className="px-5 py-3 text-sm text-slate-600 dark:text-slate-300">
                    <span className="font-semibold tabular-nums">{i.payableDays}/{i.workingDays}</span>
                    <div className="flex flex-wrap gap-1">
                      {i.absentDays > 0 && <Badge tone="rose">{i.absentDays} absent</Badge>}
                      {i.unpaidLeaveDays > 0 && <Badge tone="orange">{i.unpaidLeaveDays} unpaid</Badge>}
                      {i.paidLeaveDays > 0 && <Badge tone="teal">{i.paidLeaveDays} leave</Badge>}
                    </div>
                  </td>
                  <td className="px-5 py-3 text-right tabular-nums">
                    {money(i.gross)}
                    {Number(i.bonus) > 0 && <div className="text-sm text-emerald-600">+{money(i.bonus)} bonus</div>}
                  </td>
                  <td className="px-5 py-3 text-right tabular-nums text-rose-600 dark:text-rose-400" title={i.deductions.map((d) => `${d.label}: ${d.amount}`).join('\n')}>
                    {Number(i.totalDeductions) ? `−${money(i.totalDeductions)}` : '—'}
                  </td>
                  <td className="px-5 py-3 text-right font-display text-lg font-bold tabular-nums">{money(i.net)}</td>
                  <td className="px-3 py-3">
                    <div className="flex justify-end gap-1">
                      {canEdit && r.status === 'draft' && <IconButton icon={SlidersHorizontal} label="Adjust" onClick={() => setAdjusting(i)} />}
                      <IconButton icon={FileText} label="View payslip" onClick={() => setSlipId(i.id)} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <AdjustItemModal item={adjusting} onClose={() => setAdjusting(null)} />
      <PayslipModal itemId={slipId} onClose={() => setSlipId(null)} />
      <RunNoteModal
        mode={noteFor}
        loading={act.isPending}
        onClose={() => setNoteFor(null)}
        onSubmit={(note) => act.mutate({ action: noteFor!, body: { note } })}
      />
      <PayRunModal open={paying} total={r.totalNet} loading={act.isPending} onClose={() => setPaying(false)} onSubmit={(body) => act.mutate({ action: 'pay', body })} />
    </div>
  );
}
