import { CheckCircle2, Landmark, Pencil, XCircle } from 'lucide-react';
import { useState } from 'react';
import { Alert, Badge, Button, Card, DataTable, EmptyState, Field, IconButton, Modal, Spinner, TextArea, type Column } from '@/components/ui';
import { ExportMenu } from '@/components/shared/ExportMenu';
import { bankService, EMPTY_BANK, useBankAction, useBankList, type BankAccount, type BankForm } from '@/features/payroll/bankAccounts';
import { BankAccountForm } from '@/features/payroll/components/bank/BankAccountForm';
import { useStaffList } from '@/features/staff/hooks/useStaff';
import { errorMessage } from '@/lib/errors';
import { onSubmit } from '@/lib/forms';

const when = (iso: string) => new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });

/** Accounts: approve staff bank account requests and keep each person's salary account. */
export function BankAccountsTab({ canEdit }: { canEdit: boolean }) {
  const pending = useBankList('pending');
  const approved = useBankList('approved');
  const staff = useStaffList({ page: 1, pageSize: 100, status: 'active' });
  const [reviewing, setReviewing] = useState<{ row: BankAccount; decision: 'approved' | 'rejected' } | null>(null);
  const [note, setNote] = useState('');
  const [setting, setSetting] = useState<{ employeeId: string; name: string } | null>(null);
  const [form, setForm] = useState<BankForm>(EMPTY_BANK);
  const review = useBankAction(bankService.review, 'Request reviewed', () => setReviewing(null));
  const save = useBankAction(bankService.setFor, 'Bank account saved', () => setSetting(null));

  const withAccount = new Set(approved.data?.map((a) => a.employeeId));
  const missing = (staff.data?.items ?? []).filter((e) => !withAccount.has(e.id));
  const acctCols: Column<BankAccount>[] = [
    { header: 'Staff', cell: (a) => <div><div className="font-semibold">{a.employee?.firstName} {a.employee?.lastName}</div><div className="text-sm text-slate-500">{a.employee?.employeeNo} · {a.employee?.designation}</div></div> },
    { header: 'Bank', cell: (a) => <div><div>{a.bankName}</div><div className="text-sm text-slate-500">{a.accountTitle}</div></div> },
    { header: 'Account / IBAN', cell: (a) => <div className="font-mono text-sm">{a.accountNumber}{a.iban && <div className="text-slate-500">{a.iban}</div>}</div> },
    { header: 'Since', cell: (a) => <span className="text-sm text-slate-500">{a.reviewedAt ? when(a.reviewedAt) : '—'}</span> },
    ...(canEdit ? [{ header: '', align: 'right' as const, cell: (a: BankAccount) => <IconButton icon={Pencil} label="Change account" onClick={() => { setForm({ ...EMPTY_BANK, bankName: a.bankName, accountTitle: a.accountTitle, accountNumber: a.accountNumber, iban: a.iban ?? '', branch: a.branch ?? '' }); setSetting({ employeeId: a.employeeId, name: `${a.employee?.firstName} ${a.employee?.lastName}` }); }} /> }] : []),
  ];

  return (
    <div className="space-y-6">
      <Card title="Requests waiting" icon={Landmark} actions={pending.data?.length ? <Badge tone="amber">{pending.data.length} to review</Badge> : undefined} padded={false}>
        {pending.isLoading && <div className="p-6"><Spinner /></div>}
        {pending.data?.length === 0 && <EmptyState icon={CheckCircle2} title="No requests">New accounts and change requests from staff appear here.</EmptyState>}
        <ul className="divide-y divide-(--surface-border)">
          {pending.data?.map((r) => {
            const old = approved.data?.find((a) => a.employeeId === r.employeeId);
            return (
              <li key={r.id} className="flex flex-wrap items-start gap-4 px-6 py-4">
                <div className="min-w-0 flex-1">
                  <div className="font-semibold">{r.employee?.firstName} {r.employee?.lastName} <span className="text-sm font-normal text-slate-500">· {r.employee?.designation} · {when(r.createdAt)}</span></div>
                  <div className="mt-1 text-sm"><Badge tone={old ? 'amber' : 'primary'}>{old ? 'Change' : 'New account'}</Badge> <span className="ml-1 font-semibold">{r.bankName}</span> · {r.accountTitle} · <span className="font-mono">{r.accountNumber}</span>{r.iban && <> · <span className="font-mono">{r.iban}</span></>}</div>
                  {old && <div className="text-sm text-slate-500">Currently: {old.bankName} · <span className="font-mono">{old.accountNumber}</span></div>}
                  {r.requestNote && <div className="mt-1 rounded-md border-l-4 border-orange-400 bg-orange-50 px-3 py-1.5 text-sm dark:bg-orange-500/10">“{r.requestNote}”</div>}
                </div>
                {canEdit && (
                  <div className="flex gap-2">
                    <Button variant="secondary" icon={XCircle} onClick={() => { setNote(''); setReviewing({ row: r, decision: 'rejected' }); }}>Reject</Button>
                    <Button icon={CheckCircle2} onClick={() => { setNote(''); setReviewing({ row: r, decision: 'approved' }); }}>Approve</Button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </Card>

      <Card
        title="Salary accounts"
        icon={Landmark}
        padded={false}
        actions={<ExportMenu fileName="Staff bank accounts" columns={[
          { header: 'Employee no.', value: (a: BankAccount) => a.employee?.employeeNo ?? '' },
          { header: 'Name', value: (a: BankAccount) => `${a.employee?.firstName ?? ''} ${a.employee?.lastName ?? ''}` },
          { header: 'Bank', value: (a: BankAccount) => a.bankName },
          { header: 'Account title', value: (a: BankAccount) => a.accountTitle },
          { header: 'Account number', value: (a: BankAccount) => a.accountNumber },
          { header: 'IBAN', value: (a: BankAccount) => a.iban ?? '' },
        ]} rows={async () => approved.data ?? []} />}
      >
        {approved.isLoading && <div className="p-6"><Spinner /></div>}
        {!!approved.data?.length && <DataTable columns={acctCols} rows={approved.data} rowKey={(a) => a.id} />}
        {missing.length > 0 && (
          <div className="border-t border-(--surface-border) px-6 py-4">
            <p className="mb-2 text-sm font-semibold text-slate-600 dark:text-slate-300">No approved account yet ({missing.length}) · salaries for them cannot be paid by bank transfer</p>
            <div className="flex flex-wrap gap-2">
              {missing.map((e) => canEdit
                ? <button key={e.id} onClick={() => { setForm(EMPTY_BANK); setSetting({ employeeId: e.id, name: `${e.firstName} ${e.lastName}` }); }} className="rounded-full px-3 py-1 text-sm ring-1 ring-slate-300 hover:bg-slate-100 dark:ring-white/15 dark:hover:bg-white/5">{e.firstName} {e.lastName} +</button>
                : <span key={e.id} className="rounded-full px-3 py-1 text-sm ring-1 ring-slate-300 dark:ring-white/15">{e.firstName} {e.lastName}</span>)}
            </div>
          </div>
        )}
      </Card>

      <Modal open={!!reviewing} title={reviewing?.decision === 'approved' ? 'Approve bank account' : 'Reject request'} onClose={() => setReviewing(null)}
        footer={<><Button variant="secondary" onClick={() => setReviewing(null)}>Cancel</Button><Button variant={reviewing?.decision === 'rejected' ? 'danger' : 'primary'} loading={review.isPending} onClick={() => reviewing && review.mutate({ id: reviewing.row.id, decision: reviewing.decision, note })}>{reviewing?.decision === 'approved' ? 'Approve' : 'Reject'}</Button></>}>
        <div className="space-y-3">
          {review.error && <Alert>{errorMessage(review.error)}</Alert>}
          {reviewing?.decision === 'approved' && <p className="text-sm text-slate-600 dark:text-slate-300">From the next payroll, {reviewing.row.employee?.firstName}'s salary goes to {reviewing.row.bankName} · {reviewing.row.accountNumber}. Check the title matches the staff member.</p>}
          <Field label={reviewing?.decision === 'rejected' ? 'Reason (sent to the staff member)' : 'Note (optional)'}>
            <TextArea rows={2} required={reviewing?.decision === 'rejected'} value={note} onChange={(e) => setNote(e.target.value)} />
          </Field>
        </div>
      </Modal>

      <Modal open={!!setting} size="lg" title={`Salary account · ${setting?.name ?? ''}`} onClose={() => setSetting(null)}
        footer={<><Button variant="secondary" onClick={() => setSetting(null)}>Cancel</Button><Button type="submit" form="set-bank" loading={save.isPending}>Save</Button></>}>
        <form id="set-bank" onSubmit={onSubmit(() => setting && save.mutate({ employeeId: setting.employeeId, form }))} className="space-y-4">
          {save.error && <Alert>{errorMessage(save.error)}</Alert>}
          <BankAccountForm value={form} onChange={setForm} />
        </form>
      </Modal>
    </div>
  );
}
