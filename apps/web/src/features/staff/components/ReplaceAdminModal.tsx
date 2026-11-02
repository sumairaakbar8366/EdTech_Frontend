import { useQuery } from '@tanstack/react-query';
import { ShieldCheck } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Alert, Button, Field, Input, Modal, SearchSelect, TextArea } from '@/components/ui';
import { useSchoolUser } from '@/features/auth/usePermissions';
import { staffService } from '@/features/staff/services/staffService';
import { useStaffAction } from '@/features/staff/hooks/useStaff';
import { CredentialsModal } from '@/features/users/components/CredentialsModal';
import { handover, type ApiCredentials, type LoginHandover } from '@/features/users/users';
import { api } from '@/services/api/http';
import { errorMessage } from '@/lib/errors';

type Mode = 'self' | 'staff' | 'new';
type Action = 'suspend' | 'resigned' | 'terminated';

const option = (on: boolean) =>
  `flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition ${on ? 'border-primary-400 bg-primary-500/5' : 'border-slate-200 hover:bg-slate-500/5 dark:border-white/10'}`;

/**
 * Replacing a School Admin: a new admin is required first (yourself, an existing staff member or
 * someone new), then the old admin's access is suspended or they leave. Nothing is deleted: the new
 * admin sees all of the school's data.
 */
export function ReplaceAdminModal({ open, admin, onClose }: { open: boolean; admin: { id: string; firstName: string; lastName: string } | null; onClose: () => void }) {
  const me = useSchoolUser();
  const [mode, setMode] = useState<Mode>('self');
  const [employeeId, setEmployeeId] = useState('');
  const [person, setPerson] = useState({ firstName: '', lastName: '', email: '' });
  const [action, setAction] = useState<Action>('suspend');
  const [reason, setReason] = useState('');
  const [login, setLogin] = useState<LoginHandover | null>(null);
  useEffect(() => {
    if (open) { setMode('self'); setEmployeeId(''); setPerson({ firstName: '', lastName: '', email: '' }); setAction('suspend'); setReason(''); }
  }, [open]);
  const staff = useQuery({ queryKey: ['staff', 'list', 'replace-admin'], queryFn: () => staffService.list({ page: 1, pageSize: 200, status: 'active' }), enabled: open && mode === 'staff' });
  const save = useStaffAction(
    () => api<{ credentials: ApiCredentials | null }>(`/staff/${admin!.id}/replace-admin`, {
      method: 'POST',
      body: { action, reason: reason || null, newAdmin: mode === 'self' ? { mode } : mode === 'staff' ? { mode, employeeId } : { mode, ...person } },
    }),
    'School Admin replaced',
    (r) => {
      const c = (r as { credentials: ApiCredentials | null }).credentials;
      if (c) setLogin(handover(c.name?.split(' ')[0] ?? '', c.name?.split(' ').slice(1).join(' ') ?? '', 'School Admin', c));
      onClose();
    },
  );
  const ready = mode === 'self' || (mode === 'staff' && !!employeeId) || (mode === 'new' && !!person.firstName.trim() && !!person.lastName.trim() && /\S+@\S+\.\S+/.test(person.email));

  if (login) return <CredentialsModal credentials={login} title="New School Admin · login details" onClose={() => setLogin(null)} />;
  if (!admin) return null;
  const name = `${admin.firstName} ${admin.lastName}`;
  return (
    <Modal
      open={open}
      size="lg"
      title={`Replace School Admin · ${name}`}
      onClose={onClose}
      footer={<><Button variant="secondary" onClick={onClose}>Cancel</Button><Button icon={ShieldCheck} disabled={!ready} loading={save.isPending} onClick={() => save.mutate(undefined)}>Make new admin, then {action === 'suspend' ? 'suspend' : 'release'} {admin.firstName}</Button></>}
    >
      <div className="space-y-5">
        {save.error && <Alert>{errorMessage(save.error, 'Could not replace the admin.')}</Alert>}
        <Alert tone="info">
          A school always needs a School Admin, so the new admin is made first. Nothing is deleted: {admin.firstName}&apos;s staff record, everything they did (year by year in their Service record and in Activity) and the school&apos;s data all stay. Their period as admin is closed with today&apos;s date, the reason and who took over, and their login is closed.
        </Alert>

        <fieldset className="space-y-2">
          <legend className="mb-1 text-sm font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">1. New School Admin (required)</legend>
          <label className={option(mode === 'self')}><input type="radio" className="mt-1 accent-primary-600" checked={mode === 'self'} onChange={() => setMode('self')} /><span><strong>Me</strong> ({me.user.firstName} {me.user.lastName}): I take over as admin as well.</span></label>
          <label className={option(mode === 'staff')}>
            <input type="radio" className="mt-1 accent-primary-600" checked={mode === 'staff'} onChange={() => setMode('staff')} />
            <span className="flex-1"><strong>A staff member</strong>: give admin access to someone already on the staff.
              {mode === 'staff' && (
                <span className="mt-2 block">
                  <SearchSelect value={employeeId} onChange={setEmployeeId} placeholder="Search staff by name or number…" emptyText="No staff member matches"
                    options={(staff.data?.items ?? []).filter((e) => e.id !== admin.id).map((e) => ({ value: e.id, label: `${e.firstName} ${e.lastName}`, detail: `${e.designation} · ${e.employeeNo}` }))} />
                </span>
              )}
            </span>
          </label>
          <label className={option(mode === 'new')}>
            <input type="radio" className="mt-1 accent-primary-600" checked={mode === 'new'} onChange={() => setMode('new')} />
            <span className="flex-1"><strong>Someone new</strong>: a new admin by email (a staff record is made for them).
              {mode === 'new' && (
                <span className="mt-2 grid gap-2 sm:grid-cols-2">
                  <Input placeholder="First name" value={person.firstName} onChange={(e) => setPerson({ ...person, firstName: e.target.value })} />
                  <Input placeholder="Last name" value={person.lastName} onChange={(e) => setPerson({ ...person, lastName: e.target.value })} />
                  <span className="sm:col-span-2"><Input type="email" placeholder="Their own email" value={person.email} onChange={(e) => setPerson({ ...person, email: e.target.value })} /></span>
                </span>
              )}
            </span>
          </label>
        </fieldset>

        <fieldset className="space-y-2">
          <legend className="mb-1 text-sm font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">2. Then, {name}</legend>
          <label className={option(action === 'suspend')}><input type="radio" className="mt-1 accent-primary-600" checked={action === 'suspend'} onChange={() => setAction('suspend')} /><span><strong>Suspend access</strong>: their login is closed; they stay on the staff.</span></label>
          <label className={option(action === 'resigned')}><input type="radio" className="mt-1 accent-primary-600" checked={action === 'resigned'} onChange={() => setAction('resigned')} /><span><strong>Resigned</strong>: they leave the school (clearance, last salary in Payroll).</span></label>
          <label className={option(action === 'terminated')}><input type="radio" className="mt-1 accent-primary-600" checked={action === 'terminated'} onChange={() => setAction('terminated')} /><span><strong>Terminated</strong>: they are let go.</span></label>
          <Field label="Reason (optional)"><TextArea rows={2} maxLength={500} value={reason} onChange={(e) => setReason(e.target.value)} /></Field>
        </fieldset>
      </div>
    </Modal>
  );
}
