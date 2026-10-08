import type { SchoolRoleKey } from '@schoolerp/shared';
import { KeyRound, ShieldCheck, ShieldOff, UserCheck, UserCog, UserPlus, Users, UserX } from 'lucide-react';
import { useState } from 'react';
import { Badge, Button, Card, ConfirmDialog, DataTable, EmptyState, FilterBar, FilterSlot, IconButton, PageHeader, Pagination, SearchInput, Select, Spinner, StatCard, type Column } from '@/components/ui';
import { useAuth } from '@/features/auth/AuthProvider';
import { allPages, ExportMenu } from '@/components/shared/ExportMenu';
import type { ExportColumn } from '@/lib/spreadsheet';
import { CredentialsModal } from '@/features/users/components/CredentialsModal';
import { EditRolesModal } from '@/features/users/components/EditRolesModal';
import { GrantAccessModal } from '@/features/users/components/GrantAccessModal';
import { loginStatus, PERSON_LABEL, usersService, useUsers, useUsersAction, useUsersSummary, type Credentials, type PersonType, type SchoolLogin, type UserStatusFilter } from '@/features/users/users';

const ROLE_FILTER: { key: SchoolRoleKey; label: string }[] = [
  { key: 'school_admin', label: 'School Admin' },
  { key: 'accounts', label: 'Accounts' },
  { key: 'teacher', label: 'Teacher' },
  { key: 'non_teaching_staff', label: 'Non-teaching staff' },
  { key: 'parent', label: 'Parent' },
  { key: 'student', label: 'Student' },
];

function when(iso: string | null): string {
  if (!iso) return 'Never';
  return new Date(iso).toLocaleString(undefined, { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' });
}

const USER_EXPORT: ExportColumn<SchoolLogin>[] = [
  { header: 'First name', value: (u) => u.firstName },
  { header: 'Last name', value: (u) => u.lastName },
  { header: 'Email', value: (u) => u.email, width: 30 },
  { header: 'Roles', value: (u) => u.roles.map((r) => r.name).join(', ') },
  { header: 'Linked to', value: (u) => u.people.map((p) => `${PERSON_LABEL[p.type]}: ${p.detail}`).join('; '), width: 34 },
  { header: 'Status', value: (u) => loginStatus(u).label },
  { header: 'Last sign-in', value: (u) => (u.lastLoginAt ? new Date(u.lastLoginAt) : '') },
];

/** Users & Access: every login of the school, who can sign in with which roles, and handing out access. */
export function UsersPage() {
  const { me } = useAuth();
  const myId = me?.scope === 'school' ? me.user.id : '';
  const [q, setQ] = useState('');
  const [role, setRole] = useState<SchoolRoleKey | ''>('');
  const [status, setStatus] = useState<UserStatusFilter | ''>('');
  const [personType, setPersonType] = useState<PersonType | ''>('');
  const [page, setPage] = useState(1);
  const filters = { q: q.trim(), role, status, personType, page };
  const list = useUsers(filters);
  const summary = useUsersSummary().data;

  const [granting, setGranting] = useState(false);
  const [credentials, setCredentials] = useState<{ c: Credentials; title: string } | null>(null);
  const [editing, setEditing] = useState<SchoolLogin | null>(null);
  const [resetting, setResetting] = useState<SchoolLogin | null>(null);
  const [toggling, setToggling] = useState<SchoolLogin | null>(null);
  const reset = useUsersAction(usersService.resetPassword, { onDone: (c) => { setResetting(null); setCredentials({ c, title: 'Password reset' }); } });
  const toggle = useUsersAction(usersService.setStatus, { success: 'Login updated', onDone: () => setToggling(null) });
  const set = <T,>(fn: (v: T) => void) => (v: T) => { fn(v); setPage(1); };

  const columns: Column<SchoolLogin>[] = [
    {
      header: 'Person',
      cell: (u) => (
        <div className="min-w-0">
          <div className="font-semibold text-slate-900 dark:text-white">{u.firstName} {u.lastName}{u.id === myId && <span className="ml-1.5 text-xs font-normal text-slate-400">(you)</span>}</div>
          <div className="text-sm text-slate-500">{u.email}</div>
        </div>
      ),
    },
    { header: 'Roles', cell: (u) => <div className="flex flex-wrap gap-1">{u.roles.map((r) => <Badge key={r.key} tone={r.key === 'school_admin' ? 'primary' : 'slate'}>{r.name}</Badge>)}</div> },
    { header: 'Linked to', cell: (u) => <div className="text-sm text-slate-600 dark:text-slate-300">{u.people.map((p) => <div key={p.id}>{PERSON_LABEL[p.type]} · {p.detail}</div>)}</div> },
    { header: 'Status', cell: (u) => { const s = loginStatus(u); return <Badge tone={s.tone}>{s.label}</Badge>; } },
    { header: 'Last sign-in', cell: (u) => <span className="text-sm text-slate-500">{when(u.lastLoginAt)}</span> },
    {
      header: '',
      align: 'right',
      cell: (u) => (
        <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          <IconButton icon={UserCog} label="Edit roles" onClick={() => setEditing(u)} />
          <IconButton icon={KeyRound} label="Reset password" disabled={u.id === myId || u.status !== 'active'} onClick={() => setResetting(u)} />
          {u.status === 'active'
            ? <IconButton icon={UserX} tone="danger" label="Disable login" disabled={u.id === myId} onClick={() => setToggling(u)} />
            : <IconButton icon={UserCheck} label="Enable login" onClick={() => setToggling(u)} />}
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader title="Users & Access" sub="Who can sign in, with which roles" icon={ShieldCheck} actions={<><ExportMenu fileName="Logins" columns={USER_EXPORT} rows={() => allPages((p, size) => usersService.list({ q: q.trim(), role, status, personType, page: p, pageSize: size }))} /><Button icon={UserPlus} onClick={() => setGranting(true)}>Give access</Button></>} />

      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Logins" value={summary?.total ?? '–'} icon={Users} tone="primary" />
        <StatCard label="Active" value={summary?.active ?? '–'} icon={UserCheck} tone="emerald" />
        <StatCard label="Waiting for first sign-in" value={summary?.pending ?? '–'} icon={KeyRound} tone="amber" hint="Temporary password not changed yet" />
        <StatCard label="Disabled" value={summary?.disabled ?? '–'} icon={ShieldOff} tone="rose" />
      </div>

      <Card padded={false}>
        <FilterBar>
          <SearchInput value={q} onChange={set(setQ)} placeholder="Search name or email…" label="Search logins" />
          <FilterSlot width="w-48">
            <Select aria-label="Role" value={role} onChange={(e) => set(setRole)(e.target.value as SchoolRoleKey | '')}>
              <option value="">All roles</option>
              {ROLE_FILTER.map((r) => <option key={r.key} value={r.key}>{r.label}{summary ? ` (${summary.byRole.find((b) => b.key === r.key)?.count ?? 0})` : ''}</option>)}
            </Select>
          </FilterSlot>
          <FilterSlot width="w-52">
            <Select aria-label="Status" value={status} onChange={(e) => set(setStatus)(e.target.value as UserStatusFilter | '')}>
              <option value="">All statuses</option>
              <option value="active">Active</option>
              <option value="pending">Waiting for first sign-in</option>
              <option value="disabled">Disabled</option>
            </Select>
          </FilterSlot>
          <FilterSlot width="w-40">
            <Select aria-label="Type" value={personType} onChange={(e) => set(setPersonType)(e.target.value as PersonType | '')}>
              <option value="">Everyone</option>
              {(Object.keys(PERSON_LABEL) as PersonType[]).map((t) => <option key={t} value={t}>{PERSON_LABEL[t]}s</option>)}
            </Select>
          </FilterSlot>
        </FilterBar>
        {list.isLoading && <div className="p-6"><Spinner /></div>}
        {list.data?.items.length === 0 && <EmptyState icon={Users} title="No logins match">Try another filter, or give someone access.</EmptyState>}
        {!!list.data?.items.length && <DataTable columns={columns} rows={list.data.items} rowKey={(u) => u.id} onRowClick={setEditing} />}
        {list.data && <Pagination page={page} pageSize={list.data.pageSize} total={list.data.total} onChange={setPage} />}
      </Card>

      <GrantAccessModal open={granting} onClose={() => setGranting(false)} onCreated={(c) => setCredentials({ c, title: 'Login created' })} />
      <CredentialsModal credentials={credentials?.c ?? null} title={credentials?.title ?? ''} onClose={() => setCredentials(null)} />
      <EditRolesModal user={editing} onClose={() => setEditing(null)} />
      <ConfirmDialog
        open={!!resetting}
        title="Reset password?"
        message={`${resetting?.firstName} ${resetting?.lastName} will be signed out everywhere and get a new temporary password to change at next sign-in.`}
        confirmLabel="Reset password"
        loading={reset.isPending}
        onConfirm={() => resetting && reset.mutate(resetting.id)}
        onClose={() => setResetting(null)}
      />
      <ConfirmDialog
        open={!!toggling}
        title={toggling?.status === 'active' ? 'Disable this login?' : 'Enable this login?'}
        message={toggling?.status === 'active' ? `${toggling?.firstName} will be signed out and cannot sign in until the login is enabled again. Their records are kept.` : `${toggling?.firstName} will be able to sign in again with their current password.`}
        confirmLabel={toggling?.status === 'active' ? 'Disable' : 'Enable'}
        loading={toggle.isPending}
        onConfirm={() => toggling && toggle.mutate({ id: toggling.id, status: toggling.status === 'active' ? 'disabled' : 'active' })}
        onClose={() => setToggling(null)}
      />
    </div>
  );
}
