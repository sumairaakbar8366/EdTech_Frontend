import type { SchoolRoleKey } from '@schoolerp/shared';
import { Check, UserPlus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Alert, Button, EmptyState, Field, Input, Modal, SearchInput, Spinner } from '@/components/ui';
import { errorMessage } from '@/lib/errors';
import { onSubmit } from '@/lib/forms';
import { PERSON_LABEL, STAFF_ROLE_OPTIONS, useCandidates, usersService, useUsersAction, type Candidate, type Credentials, type PersonType } from '@/features/users/users';

/** Role checkboxes for a staff login (at least one). */
export function StaffRolePicker({ value, onChange }: { value: SchoolRoleKey[]; onChange: (roles: SchoolRoleKey[]) => void }) {
  return (
    <fieldset>
      <legend className="mb-1 text-sm font-bold uppercase tracking-wider text-slate-600 after:ml-0.5 after:text-rose-600 after:content-['*'] dark:text-slate-300">Roles</legend>
      <div className="grid gap-2 sm:grid-cols-2">
        {STAFF_ROLE_OPTIONS.map((r) => {
          const on = value.includes(r.key);
          return (
            <label key={r.key} className={`flex cursor-pointer items-start gap-2.5 rounded-lg border p-3 transition-colors ${on ? 'border-primary-500 bg-primary-500/5' : 'border-slate-200 hover:border-slate-300 dark:border-white/10'}`}>
              <input type="checkbox" className="mt-1 accent-current" checked={on} onChange={() => onChange(on ? value.filter((k) => k !== r.key) : [...value, r.key])} />
              <span>
                <span className="block font-semibold text-slate-800 dark:text-slate-100">{r.label}</span>
                <span className="block text-xs text-slate-500">{r.hint}</span>
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

/** Give a staff member, parent or student a login; the generated password is passed to `onCreated`. */
export function GrantAccessModal({ open, onClose, onCreated }: { open: boolean; onClose: () => void; onCreated: (c: Credentials) => void }) {
  const [type, setType] = useState<PersonType>('staff');
  const [search, setSearch] = useState('');
  const [picked, setPicked] = useState<Candidate | null>(null);
  const [email, setEmail] = useState('');
  const [roles, setRoles] = useState<SchoolRoleKey[]>([]);
  const candidates = useCandidates(type, search.trim(), open);
  const grant = useUsersAction(usersService.grant, { success: 'Access granted', onDone: (c) => { onCreated(c); onClose(); }, toastErrors: false });

  useEffect(() => {
    if (!open) return;
    setType('staff');
    setSearch('');
    setPicked(null);
    grant.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const pick = (c: Candidate) => {
    setPicked(c);
    setEmail('');
    setRoles(c.suggestedRoles);
  };
  const submit = () =>
    picked &&
    grant.mutate({ personType: type, personId: picked.id, ...(email.trim() && { email: email.trim() }), ...(type === 'staff' && { roles }) });

  return (
    <Modal
      open={open}
      size="lg"
      title="Give access"
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" form="grant-access" icon={UserPlus} loading={grant.isPending} disabled={!picked || (type === 'staff' && roles.length === 0)}>Create login</Button>
        </>
      }
    >
      <form id="grant-access" onSubmit={onSubmit(submit)} className="space-y-4">
        {grant.error && <Alert>{errorMessage(grant.error, 'Could not create the login.')}</Alert>}
        <div role="radiogroup" aria-label="Who" className="inline-flex rounded-lg bg-slate-100 p-1 dark:bg-white/5">
          {(Object.keys(PERSON_LABEL) as PersonType[]).map((t) => (
            <button key={t} type="button" role="radio" aria-checked={type === t} onClick={() => { setType(t); setPicked(null); }} className={`rounded-md px-4 py-1.5 text-sm font-bold uppercase tracking-wide ${type === t ? 'bg-white text-slate-900 shadow-depth-1 dark:bg-white/15 dark:text-white' : 'text-slate-500'}`}>
              {PERSON_LABEL[t]}
            </button>
          ))}
        </div>

        {!picked ? (
          <div className="space-y-2">
            <SearchInput value={search} onChange={setSearch} placeholder={`Search ${PERSON_LABEL[type].toLowerCase()}s without a login…`} label="Search people" />
            <div className="max-h-72 overflow-y-auto rounded-lg border border-slate-200 dark:border-white/10">
              {candidates.isLoading && <div className="p-4"><Spinner /></div>}
              {candidates.data?.length === 0 && <EmptyState icon={Check} title="Everyone has a login">No {PERSON_LABEL[type].toLowerCase()} without a login matches.</EmptyState>}
              <ul className="divide-y divide-slate-200 dark:divide-white/10">
                {candidates.data?.map((c) => (
                  <li key={c.id}>
                    <button type="button" onClick={() => pick(c)} className="flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left hover:bg-primary-500/5">
                      <span className="min-w-0">
                        <span className="block truncate font-semibold text-slate-800 dark:text-slate-100">{c.name}</span>
                        <span className="block truncate text-sm text-slate-500">{c.detail}</span>
                      </span>
                      <span className="shrink-0 text-sm text-slate-400">{c.email ?? 'no email'}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 px-4 py-3 dark:border-white/10">
              <div className="min-w-0">
                <div className="truncate font-semibold">{picked.name}</div>
                <div className="truncate text-sm text-slate-500">{PERSON_LABEL[type]} · {picked.detail}</div>
              </div>
              <Button type="button" variant="ghost" onClick={() => setPicked(null)}>Change</Button>
            </div>
            <Field label="Sign-in email (optional)" hint="Leave empty to generate a school email by role, e.g. ali.raza.teacher@…, .parent or .student. Their personal email stays on their record.">
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Generated automatically" />
            </Field>
            {type === 'staff' ? (
              <StaffRolePicker value={roles} onChange={setRoles} />
            ) : (
              <p className="text-sm text-slate-500">Role: <strong>{type === 'guardian' ? 'Parent' : 'Student'}</strong>. A secure temporary password is generated; they choose their own at first sign-in.</p>
            )}
          </div>
        )}
      </form>
    </Modal>
  );
}
