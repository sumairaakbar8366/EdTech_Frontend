import { BadgeCheck, KeyRound } from 'lucide-react';
import { useState } from 'react';
import { Badge, Card, DataTable, FilterBar, Pagination, SearchInput, Spinner, type Column } from '@/components/ui';
import { useSchoolLogins } from '@/features/platform/hooks/useConsole';
import type { ConsoleLogin } from '@/features/platform/types/console.types';
import { formatDate } from '@/lib/format';

const METHOD: Record<string, string> = { password: 'password', google: 'Google', ticket: 'sign-up link', support: 'owner support' };
const KIND_TONE: Record<string, 'primary' | 'emerald' | 'amber' | 'slate'> = { Teacher: 'primary', Staff: 'slate', Student: 'emerald', Parent: 'amber' };
const when = (iso: string | null) => (iso ? new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) : 'Never');

/** Every User ID of one school in a single table: who it is assigned to, roles, email, status, sign-ins. */
export function SchoolLogins({ schoolId }: { schoolId: string }) {
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const logins = useSchoolLogins(schoolId, { q: q.trim() || undefined, page });
  const d = logins.data;

  const cols: Column<ConsoleLogin>[] = [
    { header: 'User ID', cell: (l) => <span className="whitespace-nowrap font-mono text-sm font-semibold text-slate-900 dark:text-white">{l.loginId}</span> },
    { header: 'Name', cell: (l) => <span className="whitespace-nowrap font-semibold text-slate-900 dark:text-white">{l.name}</span> },
    { header: 'Role', cell: (l) => <div className="flex flex-wrap gap-1 whitespace-nowrap">{l.roles.map((r) => <Badge key={r} tone="slate">{r}</Badge>)}</div> },
    {
      header: 'Assigned to',
      cell: (l) =>
        l.linkedTo ? (
          <div className="text-sm">
            <div className="flex items-center gap-1.5"><Badge tone={KIND_TONE[l.linkedTo.kind] ?? 'slate'}>{l.linkedTo.kind}</Badge>{l.linkedTo.reference && <span className="whitespace-nowrap font-mono text-xs text-slate-500">{l.linkedTo.reference}</span>}</div>
            <div className="mt-0.5 min-w-56 max-w-sm text-slate-500">{l.linkedTo.detail}</div>
          </div>
        ) : <span className="text-sm text-slate-500">School account</span>,
    },
    { header: 'Email', cell: (l) => (l.email ? <span className="inline-flex items-center gap-1 whitespace-nowrap text-sm">{l.email}{l.emailVerified && <BadgeCheck size={14} className="text-emerald-600" aria-label="Verified" />}</span> : <span className="text-sm text-slate-400">—</span>) },
    {
      header: 'Status',
      cell: (l) => (
        <div className="space-y-1">
          <Badge tone={l.status === 'active' ? 'emerald' : 'rose'}>{l.status}</Badge>
          {l.mustChangePassword && <div className="inline-flex items-center gap-1 text-xs text-amber-700 dark:text-amber-300"><KeyRound size={12} /> must set password</div>}
        </div>
      ),
    },
    { header: 'Last sign-in', cell: (l) => <div className="whitespace-nowrap text-sm"><div>{when(l.lastLoginAt)}</div>{l.lastLoginMethod && <div className="text-slate-500">via {METHOD[l.lastLoginMethod] ?? l.lastLoginMethod}</div>}</div> },
    { header: 'Created', cell: (l) => <span className="whitespace-nowrap text-sm text-slate-500">{formatDate(l.createdAt)}</span> },
  ];

  return (
    <Card padded={false}>
      <FilterBar>
        <SearchInput label="Search User IDs" placeholder="User ID, name or email" value={q} onChange={(v) => { setQ(v); setPage(1); }} />
        {d && <span className="text-sm text-slate-500">{d.total} User ID{d.total === 1 ? '' : 's'}</span>}
      </FilterBar>
      {logins.isLoading && <div className="p-6"><Spinner /></div>}
      {d?.items.length === 0 && <p className="p-6 text-sm text-slate-500">No User IDs found.</p>}
      {!!d?.items.length && <DataTable columns={cols} rows={d.items} rowKey={(l) => l.id} />}
      {d && d.total > d.pageSize && <div className="p-4"><Pagination page={d.page} pageSize={d.pageSize} total={d.total} onChange={setPage} /></div>}
    </Card>
  );
}
