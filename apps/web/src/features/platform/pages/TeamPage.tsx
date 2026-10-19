import { useQuery } from '@tanstack/react-query';
import { Copy, Crown, School, UserMinus, UserPlus, UserRoundCheck, Users } from 'lucide-react';
import { useState } from 'react';
import { Alert, Badge, Button, Card, ConfirmDialog, EmptyState, Field, IconButton, Input, Modal, PageHeader, SearchInput, Select, Spinner } from '@/components/ui';
import { matchesText } from '@/lib/textMatch';
import { useAuth } from '@/features/auth/AuthProvider';
import { api } from '@/services/api/http';
import { errorMessage } from '@/lib/errors';
import { onSubmit } from '@/lib/forms';
import { useAction } from '@/lib/hooks/useAction';

interface Owner {
  id: string;
  name: string;
  email: string;
  label: string | null;
  isPrimary: boolean;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
}

type LeadRole = 'principal' | 'school_admin';
interface Leader {
  userId: string;
  name: string;
  email: string | null;
  loginId: string;
  status: 'active' | 'disabled';
  lastLoginAt: string | null;
  /** principal, school_admin or delegate_N (shared admin). */
  role: string;
  roleName: string;
}
interface SchoolLeadership {
  school: { id: string; name: string; slug: string };
  people: Leader[];
}

const TEAM_KEY = ['platform', 'team'] as const;
const teamService = {
  list: () => api<Owner[]>('/platform/team'),
  leadership: () => api<SchoolLeadership[]>('/platform/team/leadership'),
  addLeader: (body: { schoolId: string; role: LeadRole; firstName: string; lastName: string; email: string }) =>
    api<{ temporaryPassword: string; credentials: { name: string; loginId: string; email: string | null } }>('/platform/team/leadership', { method: 'POST', body }),
  removeLeader: ({ schoolId, userId, role }: { schoolId: string; userId: string; role: LeadRole }) => api<{ disabled: boolean }>(`/platform/team/leadership/${schoolId}/${userId}?role=${role}`, { method: 'DELETE' }),
  add: (body: { name: string; email: string }) => api<{ admin: Owner; temporaryPassword: string }>('/platform/team', { method: 'POST', body }),
  setActive: ({ id, active }: { id: string; active: boolean }) => api<Owner>(`/platform/team/${id}/status`, { method: 'POST', body: { active } }),
};

const ROLE_TONE: Record<string, 'amber' | 'primary' | 'slate'> = { principal: 'amber', school_admin: 'primary' };

/**
 * Who leads each school: principals, School Admins and shared admins ("Admin 2"…). Any owner can add a
 * principal or admin (a new login, password shown once) and take the role away.
 */
function SchoolLeadershipCard() {
  const list = useQuery({ queryKey: [...TEAM_KEY, 'leadership'], queryFn: teamService.leadership });
  const [text, setText] = useState('');
  const [role, setRole] = useState<'' | LeadRole | 'shared'>('');
  const [adding, setAdding] = useState<{ school: SchoolLeadership['school']; role: LeadRole } | null>(null);
  const [f, setF] = useState({ firstName: '', lastName: '', email: '' });
  const [created, setCreated] = useState<{ school: string; role: LeadRole; temporaryPassword: string; credentials: { name: string; loginId: string; email: string | null } } | null>(null);
  const [removing, setRemoving] = useState<{ school: SchoolLeadership['school']; person: Leader } | null>(null);
  const add = useAction(teamService.addLeader, {
    invalidate: [TEAM_KEY],
    onDone: (r) => { setCreated({ school: adding!.school.name, role: adding!.role, ...r }); setAdding(null); setF({ firstName: '', lastName: '', email: '' }); },
    toastErrors: false,
  });
  const remove = useAction(teamService.removeLeader, { success: 'Role removed', invalidate: [TEAM_KEY], onDone: () => setRemoving(null), toastErrors: false });

  const rows = (list.data ?? []).flatMap((s) =>
    (s.people.length ? s.people : [null]).map((p) => ({ s, p })),
  ).filter(({ s, p }) =>
    (!role || (p && (role === 'shared' ? p.role.startsWith('delegate_') : p.role === role))) &&
    matchesText(text, s.school.name, s.school.slug, p?.name, p?.email, p?.loginId, p?.roleName),
  );

  return (
    <Card title="Who leads each school" icon={School} padded={false} className="mt-5">
      <div className="flex flex-wrap items-center gap-3 border-b border-(--surface-border) p-4">
        <SearchInput label="Search schools and people" value={text} onChange={setText} placeholder="Search school, name, email or User ID…" />
        <div className="w-44">
          <Select aria-label="Role" value={role} onChange={(e) => setRole(e.target.value as typeof role)}>
            <option value="">All roles</option>
            <option value="principal">Principals</option>
            <option value="school_admin">School Admins</option>
            <option value="shared">Shared admins</option>
          </Select>
        </div>
      </div>
      {list.isLoading && <div className="p-6"><Spinner /></div>}
      {remove.error && <div className="p-4"><Alert>{(remove.error as Error).message}</Alert></div>}
      {list.data && rows.length === 0 && <p className="px-5 py-4 text-sm text-slate-500">Nothing matches.</p>}
      {rows.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-(--surface-border) bg-slate-50/60 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:bg-white/[0.02]">
              <tr><th className="px-5 py-3">School</th><th className="px-5 py-3">Role</th><th className="px-5 py-3">Person</th><th className="px-5 py-3">User ID</th><th className="px-5 py-3">Last sign-in</th><th className="px-5 py-3 text-right">Actions</th></tr>
            </thead>
            <tbody className="divide-y divide-(--surface-border)">
              {rows.map(({ s, p }, i) => {
                const first = i === 0 || rows[i - 1]!.s.school.id !== s.school.id;
                return (
                  <tr key={`${s.school.id}-${p?.userId ?? 'none'}-${p?.role ?? ''}`} className={p?.status === 'disabled' ? 'opacity-60' : ''}>
                    <td className="px-5 py-2.5 align-top">
                      {first && (
                        <>
                          <div className="font-semibold text-slate-800 dark:text-slate-100">{s.school.name}</div>
                          <div className="text-xs text-slate-500">{s.school.slug}</div>
                          <div className="mt-1.5 flex flex-wrap gap-1">
                            <Button variant="secondary" icon={UserPlus} onClick={() => setAdding({ school: s.school, role: 'principal' })}>Principal</Button>
                            <Button variant="secondary" icon={UserPlus} onClick={() => setAdding({ school: s.school, role: 'school_admin' })}>Admin</Button>
                          </div>
                        </>
                      )}
                    </td>
                    <td className="px-5 py-2.5 align-top">{p ? <Badge tone={ROLE_TONE[p.role] ?? 'slate'}>{p.roleName}</Badge> : <span className="text-slate-400">—</span>}</td>
                    <td className="px-5 py-2.5 align-top">{p ? <><div className="font-semibold text-slate-800 dark:text-slate-100">{p.name}{p.status === 'disabled' && <span className="ml-1.5 text-xs font-normal text-rose-500">disabled</span>}</div><div className="text-xs text-slate-500">{p.email ?? 'No email'}</div></> : <span className="text-slate-400">No principal or admin</span>}</td>
                    <td className="px-5 py-2.5 align-top font-mono text-xs">{p?.loginId ?? ''}</td>
                    <td className="whitespace-nowrap px-5 py-2.5 align-top text-xs text-slate-500">{p ? (p.lastLoginAt ? new Date(p.lastLoginAt).toLocaleString() : 'Never') : ''}</td>
                    <td className="px-5 py-2.5 text-right align-top">
                      {p && (p.role === 'principal' || p.role === 'school_admin') && (
                        <IconButton icon={UserMinus} tone="danger" label={`Remove ${p.name} as ${p.roleName}`} onClick={() => setRemoving({ school: s.school, person: p })} />
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      <p className="border-t border-(--surface-border) px-5 py-2.5 text-xs text-slate-500">Shared admins (Admin 2, Admin 3…) are added and removed by the school&apos;s own admin in Users &amp; Access.</p>

      <Modal open={!!adding} title={`Add ${adding?.role === 'principal' ? 'principal' : 'School Admin'} · ${adding?.school.name ?? ''}`} onClose={() => setAdding(null)} footer={<><Button variant="secondary" onClick={() => setAdding(null)}>Cancel</Button><Button type="submit" form="leader-form" loading={add.isPending}>Add</Button></>}>
        <form id="leader-form" onSubmit={onSubmit(() => adding && add.mutate({ schoolId: adding.school.id, role: adding.role, ...f }))} className="space-y-4">
          {add.error && <Alert>{errorMessage(add.error, 'Could not add the login.')}</Alert>}
          <p className="text-sm text-slate-600 dark:text-slate-300">
            {adding?.role === 'principal' ? 'The principal sees everything in the school, gets the approvals and can make basic changes; settings, billing and Users & Access stay with the admin.' : 'The School Admin manages the whole school, including Users & Access and billing.'}
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="First name"><Input required maxLength={80} value={f.firstName} onChange={(e) => setF({ ...f, firstName: e.target.value })} /></Field>
            <Field label="Last name"><Input required maxLength={80} value={f.lastName} onChange={(e) => setF({ ...f, lastName: e.target.value })} /></Field>
            <div className="sm:col-span-2"><Field label="Their own email"><Input required type="email" maxLength={254} value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></Field></div>
          </div>
        </form>
      </Modal>

      <Modal open={!!created} title={`${created?.role === 'principal' ? 'Principal' : 'School Admin'} added · ${created?.school ?? ''}`} onClose={() => setCreated(null)} footer={<Button onClick={() => setCreated(null)}>Done</Button>}>
        {created && (
          <div className="space-y-3 text-sm">
            <p>Give these to <strong>{created.credentials.name}</strong> privately. The password is shown only now; they choose their own at first sign-in.</p>
            <div className="rounded-lg bg-slate-500/5 p-3 font-mono">
              <div>User ID: {created.credentials.loginId}</div>
              {created.credentials.email && <div>Email: {created.credentials.email}</div>}
              <div>Temporary password: {created.temporaryPassword}</div>
            </div>
            <Button variant="secondary" icon={Copy} onClick={() => void navigator.clipboard?.writeText(`User ID: ${created.credentials.loginId}\nEmail: ${created.credentials.email ?? ''}\nTemporary password: ${created.temporaryPassword}`)}>Copy</Button>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={!!removing}
        title={`Remove ${removing?.person.name} as ${removing?.person.roleName}?`}
        message={`${removing?.person.name} will no longer be ${removing?.person.roleName} of ${removing?.school.name}. If this was their only role, their login is disabled and signed out. Their activity stays in the log.`}
        confirmLabel="Remove"
        loading={remove.isPending}
        onConfirm={() => removing && remove.mutate({ schoolId: removing.school.id, userId: removing.person.userId, role: removing.person.role as LeadRole })}
        onClose={() => setRemoving(null)}
      />
    </Card>
  );
}

/**
 * Owner team: the main owner shares the console with others to make the work easier. Each shared
 * owner is "Owner 2", "Owner 3"… with their own email and password, so the activity log shows who did
 * what. Only the main owner adds or disables owners.
 */
export function TeamPage() {
  const { me } = useAuth();
  const primary = me?.scope === 'platform' && !!me.admin.isPrimary;
  const team = useQuery({ queryKey: TEAM_KEY, queryFn: teamService.list });
  const [adding, setAdding] = useState(false);
  const [f, setF] = useState({ name: '', email: '' });
  const [created, setCreated] = useState<{ admin: Owner; temporaryPassword: string } | null>(null);
  const [toggling, setToggling] = useState<Owner | null>(null);
  const add = useAction(teamService.add, { invalidate: [TEAM_KEY], onDone: (r) => { setAdding(false); setF({ name: '', email: '' }); setCreated(r); }, toastErrors: false });
  const toggle = useAction(teamService.setActive, { success: 'Owner account updated', invalidate: [TEAM_KEY], onDone: () => setToggling(null) });

  return (
    <div>
      <PageHeader
        title="Leadership"
        sub="Who owns the platform and who leads each school: owners, principals and admins"
        icon={Users}
        actions={primary && <Button icon={UserPlus} onClick={() => setAdding(true)}>Add owner</Button>}
      />
      {!primary && <div className="mb-4"><Alert tone="info">Only the main owner can add or disable owner accounts.</Alert></div>}
      <Card title="Owners" icon={Crown} padded={false}>
        {team.isLoading && <div className="p-6"><Spinner /></div>}
        {team.data?.length === 1 && <EmptyState icon={Users} title="Only you so far">Add an owner to share the work; you can disable them any time.</EmptyState>}
        <ul className="divide-y divide-(--surface-border)">
          {team.data?.map((o) => (
            <li key={o.id} className={`flex flex-wrap items-center gap-3 px-5 py-3 ${o.isActive ? '' : 'opacity-60'}`}>
              <Badge tone={o.isPrimary ? 'amber' : 'primary'}>{o.isPrimary ? <><Crown size={12} /> Main owner</> : o.label}</Badge>
              <div className="min-w-0 flex-1">
                <div className="font-semibold text-slate-800 dark:text-slate-100">{o.name}{me?.scope === 'platform' && me.admin.id === o.id && <span className="ml-1.5 text-xs font-normal text-slate-400">(you)</span>}</div>
                <div className="text-sm text-slate-500">{o.email} · last sign-in {o.lastLoginAt ? new Date(o.lastLoginAt).toLocaleString() : 'never'}</div>
              </div>
              {!o.isActive && <Badge tone="rose">Disabled</Badge>}
              {primary && !o.isPrimary && (
                <IconButton icon={o.isActive ? UserMinus : UserRoundCheck} label={o.isActive ? `Disable ${o.label}` : `Enable ${o.label}`} tone={o.isActive ? 'danger' : undefined} onClick={() => setToggling(o)} />
              )}
            </li>
          ))}
        </ul>
      </Card>

      <SchoolLeadershipCard />

      <Modal open={adding} title="Add owner" onClose={() => setAdding(false)} footer={<><Button variant="secondary" onClick={() => setAdding(false)}>Cancel</Button><Button type="submit" form="owner-form" loading={add.isPending}>Add owner</Button></>}>
        <form id="owner-form" onSubmit={onSubmit(() => add.mutate(f))} className="space-y-4">
          {add.error && <Alert>{errorMessage(add.error, 'Could not add the owner.')}</Alert>}
          <p className="text-sm text-slate-600 dark:text-slate-300">They get the full owner console with their own sign-in. Everything they do appears in Activity → Owner team under their name. Only you can add owners and edit or delete logs.</p>
          <Field label="Name"><Input required maxLength={100} value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></Field>
          <Field label="Their own email"><Input required type="email" maxLength={254} value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></Field>
        </form>
      </Modal>

      <Modal open={!!created} title={`${created?.admin.label ?? 'Owner'} added`} onClose={() => setCreated(null)} footer={<Button onClick={() => setCreated(null)}>Done</Button>}>
        {created && (
          <div className="space-y-3 text-sm">
            <p>Give these to <strong>{created.admin.name}</strong> privately. The password is shown only now; they can set their own with “Forgot password” on the sign-in page.</p>
            <div className="rounded-lg bg-slate-500/5 p-3 font-mono">
              <div>Email: {created.admin.email}</div>
              <div>Temporary password: {created.temporaryPassword}</div>
            </div>
            <Button variant="secondary" icon={Copy} onClick={() => void navigator.clipboard?.writeText(`Owner console: ${window.location.origin}/login\nEmail: ${created.admin.email}\nTemporary password: ${created.temporaryPassword}`)}>Copy</Button>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={!!toggling}
        title={toggling?.isActive ? `Disable ${toggling?.label}?` : `Enable ${toggling?.label}?`}
        message={toggling?.isActive ? `${toggling?.name} will be signed out and cannot sign in. Their activity stays in the log.` : `${toggling?.name} will be able to sign in again.`}
        confirmLabel={toggling?.isActive ? 'Disable' : 'Enable'}
        loading={toggle.isPending}
        onConfirm={() => toggling && toggle.mutate({ id: toggling.id, active: !toggling.isActive })}
        onClose={() => setToggling(null)}
      />
    </div>
  );
}
