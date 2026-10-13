import { ClipboardList } from 'lucide-react';
import { useState } from 'react';
import { Badge, Card, type Column, CompactNumber, DataTable, FilterBar, FilterSlot, Pagination, SearchInput, Select, Spinner } from '@/components/ui';
import { CandidateModal } from '@/features/hiring/components/candidate/CandidateModal';
import { STAGES } from '@/features/hiring/constants';
import { useApplications } from '@/features/hiring/hooks/useHiring';
import type { ApplicationRow, ApplicationStatus, JobPost } from '@/features/hiring/types/hiring.types';
import { compactNumber, formatDate } from '@/lib/format';

const ALL: { id: ApplicationStatus; label: string; tone: string }[] = [...STAGES, { id: 'rejected', label: 'Rejected', tone: 'rose' }, { id: 'withdrawn', label: 'Withdrawn', tone: 'slate' }];

/** The hiring log: every applicant with a status column; clicking a name opens the full profile. */
export function ApplicationsTable({ posts, canEdit }: { posts: JobPost[]; canEdit: boolean }) {
  const [postId, setPostId] = useState('');
  const [status, setStatus] = useState<ApplicationStatus | ''>('');
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [openId, setOpenId] = useState<string | null>(null);
  const list = useApplications({ postId: postId || undefined, status, q, page });
  const d = list.data;
  const total = d ? Object.values(d.byStatus).reduce((a, b) => a + (b ?? 0), 0) : 0;

  const cols: Column<ApplicationRow>[] = [
    {
      header: 'Applicant',
      cell: (a) => (
        <div>
          <button className="font-semibold text-primary-700 hover:underline dark:text-primary-300" onClick={() => setOpenId(a.id)}>{a.firstName} {a.lastName}</button>
          <div className="text-sm text-slate-500">{a.email}{a.phone ? ` · ${a.phone}` : ''}</div>
        </div>
      ),
    },
    { header: 'Post', cell: (a) => <div className="text-sm"><div>{a.jobPost.title}</div><div className="text-slate-500">{a.source === 'website' ? 'Website' : 'Office'} · {formatDate(a.createdAt)}</div></div> },
    { header: 'Qualification', cell: (a) => <div className="text-sm"><div>{a.highestQualification ?? '—'}</div>{a.majorSubjects && <div className="text-slate-500">{a.majorSubjects}</div>}</div> },
    { header: 'Experience', align: 'right', cell: (a) => <span className="text-sm tabular-nums">{a.experienceYears !== null ? `${a.experienceYears} yrs` : '—'}</span> },
    { header: 'Expected salary', align: 'right', cell: (a) => <span className="text-sm tabular-nums">{a.expectedSalary ? <CompactNumber value={a.expectedSalary} prefix="PKR " /> : '—'}</span> },
    {
      header: 'Status',
      cell: (a) => {
        const s = ALL.find((x) => x.id === a.status)!;
        const last = a.history[0];
        return (
          <div>
            <Badge tone={s.tone as never}>{s.label}</Badge>
            {last && <div className="mt-1 text-xs text-slate-500">{formatDate(last.createdAt)}{last.changedByName ? ` · ${last.changedByName}` : ''}</div>}
            {a.interviews[0]?.score && <div className="text-xs text-amber-600">Interview {a.interviews[0].score}/10</div>}
          </div>
        );
      },
    },
  ];

  return (
    <Card padded={false} title={`Applicants${d ? ` · ${compactNumber(total)}` : ''}`} icon={ClipboardList}>
      <div className="flex flex-wrap gap-1.5 border-b border-slate-200 px-4 pt-4 pb-3 dark:border-white/5">
        <button onClick={() => { setStatus(''); setPage(1); }} className={`rounded-full px-3 py-1 text-sm font-semibold ring-1 ${status === '' ? 'bg-slate-800 text-white ring-slate-800 dark:bg-white dark:text-slate-900' : 'text-slate-600 ring-slate-300 dark:text-slate-300 dark:ring-white/15'}`}>All {d ? total : ''}</button>
        {ALL.map((s) => (
          <button key={s.id} onClick={() => { setStatus(s.id); setPage(1); }} className={`rounded-full px-3 py-1 text-sm font-semibold ring-1 ${status === s.id ? 'bg-slate-800 text-white ring-slate-800 dark:bg-white dark:text-slate-900' : 'text-slate-600 ring-slate-300 dark:text-slate-300 dark:ring-white/15'}`}>{s.label} {d?.byStatus[s.id] ?? 0}</button>
        ))}
      </div>
      <FilterBar>
        <SearchInput label="Search applicants" placeholder="Name, email, phone or CNIC" value={q} onChange={(v) => { setQ(v); setPage(1); }} />
        <FilterSlot width="w-64">
          <Select aria-label="Post" value={postId} onChange={(e) => { setPostId(e.target.value); setPage(1); }}>
            <option value="">All posts</option>
            {posts.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
          </Select>
        </FilterSlot>
      </FilterBar>
      {list.isLoading && <div className="p-6"><Spinner /></div>}
      {d?.items.length === 0 && <p className="p-6 text-sm text-slate-500">No applicants match.</p>}
      {!!d?.items.length && <DataTable columns={cols} rows={d.items} rowKey={(a) => a.id} onRowClick={(a) => setOpenId(a.id)} />}
      {d && <div className="p-4"><Pagination page={d.page} pageSize={d.pageSize} total={d.total} onChange={setPage} /></div>}
      {openId && <CandidateModal applicationId={openId} canEdit={canEdit} onClose={() => setOpenId(null)} />}
    </Card>
  );
}
