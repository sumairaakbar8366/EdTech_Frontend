import { Landmark, Pencil, Plus, X } from 'lucide-react';
import { useState } from 'react';
import { Alert, Badge, Button, Card, Modal, Spinner } from '@/components/ui';
import { bankService, EMPTY_BANK, useBankAction, useMyBank, type BankAccount, type BankForm } from '@/features/payroll/bankAccounts';
import { BankAccountForm } from '@/features/payroll/components/bank/BankAccountForm';
import { errorMessage } from '@/lib/errors';
import { onSubmit } from '@/lib/forms';

function AccountLines({ a }: { a: BankAccount }) {
  return (
    <dl className="grid gap-x-6 gap-y-1 text-sm sm:grid-cols-2">
      <div><dt className="text-xs uppercase tracking-wider text-slate-500">Bank</dt><dd className="font-semibold">{a.bankName}{a.branch ? ` · ${a.branch}` : ''}</dd></div>
      <div><dt className="text-xs uppercase tracking-wider text-slate-500">Account title</dt><dd className="font-semibold">{a.accountTitle}</dd></div>
      <div><dt className="text-xs uppercase tracking-wider text-slate-500">Account number</dt><dd className="font-mono">{a.accountNumber}</dd></div>
      {a.iban && <div><dt className="text-xs uppercase tracking-wider text-slate-500">IBAN</dt><dd className="font-mono">{a.iban}</dd></div>}
    </dl>
  );
}

/** Staff member's salary account: submit, see the approval state, request a change with a reason. */
export function MyBankAccountCard() {
  const data = useMyBank();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<BankForm>(EMPTY_BANK);
  const submit = useBankAction(bankService.submit, 'Sent to Accounts for approval', () => setEditing(false));
  const cancel = useBankAction(bankService.cancel, 'Request cancelled');
  const current = data.data?.current;
  const pending = data.data?.pending;
  const lastRejected = data.data?.history.find((h) => h.status === 'rejected');

  return (
    <Card
      title="Salary bank account"
      icon={Landmark}
      actions={!pending && <Button variant="secondary" icon={current ? Pencil : Plus} onClick={() => { setForm(EMPTY_BANK); submit.reset(); setEditing(true); }}>{current ? 'Request change' : 'Add account'}</Button>}
    >
      {data.isLoading && <Spinner />}
      {data.data && !current && !pending && <p className="text-slate-600 dark:text-slate-300">Add the bank account your salary should be paid into. Accounts checks it before the next payroll.</p>}
      {current && (
        <div className="space-y-2">
          <Badge tone="emerald">Approved · salary is paid here</Badge>
          <AccountLines a={current} />
        </div>
      )}
      {pending && (
        <div className={`space-y-2 ${current ? 'mt-5 border-t border-(--surface-border) pt-5' : ''}`}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Badge tone="amber">{current ? 'Change requested · waiting for Accounts' : 'Waiting for Accounts'}</Badge>
            <Button variant="ghost" icon={X} loading={cancel.isPending} onClick={() => cancel.mutate(undefined)}>Cancel request</Button>
          </div>
          <AccountLines a={pending} />
          {pending.requestNote && <p className="text-sm text-slate-500">Your note: {pending.requestNote}</p>}
        </div>
      )}
      {lastRejected && !pending && (
        <div className="mt-4"><Alert>Your last request ({lastRejected.bankName} · {lastRejected.accountNumber}) was rejected: {lastRejected.reviewNote}</Alert></div>
      )}

      <Modal
        open={editing}
        size="lg"
        title={current ? 'Request a bank account change' : 'Add salary bank account'}
        onClose={() => setEditing(false)}
        footer={<><Button variant="secondary" onClick={() => setEditing(false)}>Cancel</Button><Button type="submit" form="bank-form" loading={submit.isPending}>Send to Accounts</Button></>}
      >
        <form id="bank-form" onSubmit={onSubmit(() => submit.mutate(form))} className="space-y-4">
          {submit.error && <Alert>{errorMessage(submit.error)}</Alert>}
          <BankAccountForm value={form} onChange={setForm} askReason={!!current} />
        </form>
      </Modal>
    </Card>
  );
}
