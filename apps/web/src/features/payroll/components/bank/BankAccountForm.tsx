import { Field, Input, TextArea } from '@/components/ui';
import { BANKS, type BankForm } from '@/features/payroll/bankAccounts';

/** Bank, title, account number, IBAN, branch (+ reason when it is a change request). */
export function BankAccountForm({ value, onChange, askReason }: { value: BankForm; onChange: (f: BankForm) => void; askReason?: boolean }) {
  const set = (k: keyof BankForm) => (e: { target: { value: string } }) => onChange({ ...value, [k]: e.target.value });
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Field label="Bank">
        <Input required list="bank-names" maxLength={80} value={value.bankName} onChange={set('bankName')} placeholder="e.g. Meezan Bank" />
      </Field>
      <datalist id="bank-names">{BANKS.map((b) => <option key={b} value={b} />)}</datalist>
      <Field label="Account title" hint="Exactly as on the bank account">
        <Input required maxLength={120} value={value.accountTitle} onChange={set('accountTitle')} />
      </Field>
      <Field label="Account number">
        <Input required inputMode="numeric" pattern="[A-Za-z0-9 \-]{6,40}" maxLength={40} value={value.accountNumber} onChange={set('accountNumber')} />
      </Field>
      <Field label="IBAN (optional)" hint="PK followed by 22 characters">
        <Input maxLength={34} value={value.iban} onChange={set('iban')} placeholder="PK36SCBL0000001123456702" />
      </Field>
      <div className="sm:col-span-2">
        <Field label="Branch (optional)"><Input maxLength={120} value={value.branch} onChange={set('branch')} placeholder="e.g. Model Town, Lahore" /></Field>
      </div>
      {askReason && (
        <div className="sm:col-span-2">
          <Field label="Reason for the change" hint="Accounts sees this message with your request">
            <TextArea required rows={2} maxLength={500} value={value.requestNote} onChange={set('requestNote')} placeholder="e.g. My old account was closed; please pay salary to the new one." />
          </Field>
        </div>
      )}
    </div>
  );
}
