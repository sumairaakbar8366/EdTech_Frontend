import { Briefcase, GraduationCap, UserRound, Users } from 'lucide-react';
import { useState } from 'react';
import { Badge, Card, DataTable, FilterBar, Pagination, SearchInput, Spinner, Tabs, type Column } from '@/components/ui';
import { useSchoolPeople } from '@/features/platform/hooks/useConsole';
import type { ConsolePerson, PersonKind } from '@/features/platform/types/console.types';
import { compactNumber, formatDate } from '@/lib/format';

const TABS: { id: PersonKind; label: string; icon: typeof Users }[] = [
  { id: 'teacher', label: 'Teachers', icon: GraduationCap },
  { id: 'staff', label: 'Non-teaching staff', icon: Briefcase },
  { id: 'student', label: 'Students', icon: UserRound },
  { id: 'parent', label: 'Parents', icon: Users },
];
const NUMBER_LABEL: Record<PersonKind, string> = { teacher: 'Employee no.', staff: 'Employee no.', student: 'Admission no.', parent: '' };
const when = (iso: string | null) => (iso ? new Date(iso).toLocaleString(undefined, { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' }) : 'Never');

/** One school's teachers, staff, students and parents (each from its own table), with their logins. */
export function SchoolPeople({ schoolId, counts }: { schoolId: string; counts?: Partial<Record<PersonKind, number>> }) {
  const [type, setType] = useState<PersonKind>('teacher');
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const people = useSchoolPeople({ type, schoolId, q: q.trim() || undefined, page });
  const d = people.data;

  const cols: Column<ConsolePerson>[] = [
    { header: 'Name', cell: (p) => <div><div className="font-semibold text-slate-900 dark:text-white">{p.name}</div><div className="text-sm text-slate-500">{p.detail}</div></div> },
    ...(NUMBER_LABEL[type] ? [{ header: NUMBER_LABEL[type], cell: (p: ConsolePerson) => <span className="font-mono text-sm">{p.number}</span> }] : []),
    { header: 'Contact', cell: (p) => <div className="text-sm"><div>{p.email ?? '—'}</div>{p.phone && <div className="text-slate-500">{p.phone}</div>}</div> },
    {
      header: 'Login',
      cell: (p) =>
        p.login ? (
          <div className="text-sm">
            <div className="flex items-center gap-1.5 font-mono">{p.login.loginId}{p.login.status !== 'active' && <Badge tone="rose">{p.login.status}</Badge>}</div>
            <div className="text-slate-500">Last sign-in: {when(p.login.lastLoginAt)}</div>
          </div>
        ) : <span className="text-sm text-slate-400">No login</span>,
    },
    { header: 'Status', cell: (p) => <div><Badge tone={['active', 'enrolled'].includes(p.status) ? 'emerald' : p.status === 'on_leave' ? 'amber' : 'slate'}>{p.status.replace('_', ' ')}</Badge><div className="mt-1 text-xs text-slate-500">since {formatDate(p.since)}</div></div> },
  ];

  return (
    <div>
      <Tabs tabs={TABS.map((t) => ({ ...t, label: counts?.[t.id] !== undefined ? `${t.label} · ${compactNumber(counts[t.id] ?? 0)}` : t.label }))} value={type} onChange={(t) => { setType(t); setPage(1); }} />
      <Card padded={false}>
        <FilterBar>
          <SearchInput label="Search people" placeholder="Name, email, number or User ID" value={q} onChange={(v) => { setQ(v); setPage(1); }} />
        </FilterBar>
        {people.isLoading && <div className="p-6"><Spinner /></div>}
        {d?.items.length === 0 && <p className="p-6 text-sm text-slate-500">Nobody here yet.</p>}
        {!!d?.items.length && <DataTable columns={cols} rows={d.items} rowKey={(p) => p.id} />}
        {d && <div className="p-4"><Pagination page={d.page} pageSize={d.pageSize} total={d.total} onChange={setPage} /></div>}
      </Card>
    </div>
  );
}
