import { useQuery } from '@tanstack/react-query';
import { GraduationCap, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { ExportMenu } from '@/components/shared/ExportMenu';
import { Badge, Card, DataTable, EmptyState, FilterBar, PageHeader, SearchInput, Spinner, type Column, type Tone } from '@/components/ui';
import { STUDENTS_KEY } from '@/features/students/hooks/useStudents';
import { taughtStudents, type TaughtSection } from '@/features/students/services/studentService';

type Row = TaughtSection['students'][number];
const rateTone = (r: number | null): Tone => (r === null ? 'slate' : r >= 90 ? 'emerald' : r >= 75 ? 'amber' : 'rose');
const rateLabel = (r: number | null) => (r === null ? 'No marks yet' : r >= 90 ? 'Regular' : r >= 75 ? 'Watch' : 'At risk');

/** Teacher "My Students": one tab per section taught, students in a sortable table with attendance. */
export function MyStudentsPage() {
  const sections = useQuery({ queryKey: [...STUDENTS_KEY, 'taught'], queryFn: taughtStudents });
  const [active, setActive] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  useEffect(() => {
    if (!active && sections.data?.[0]) setActive(sections.data[0].sectionId);
  }, [sections.data, active]);
  const current = sections.data?.find((s) => s.sectionId === active);
  const q = search.trim().toLowerCase();
  const rows = (current?.students ?? [])
    .filter((s) => !q || `${s.firstName} ${s.lastName} ${s.admissionNo}`.toLowerCase().includes(q))
    .sort((a, b) => (a.rollNo ?? 9999) - (b.rollNo ?? 9999) || a.firstName.localeCompare(b.firstName));
  const total = sections.data?.reduce((n, s) => n + s.students.length, 0) ?? 0;

  const columns: Column<Row>[] = [
    { header: 'Roll', className: 'w-16 tabular-nums text-slate-500', cell: (s) => s.rollNo ?? '—' },
    {
      header: 'Student',
      cell: (s) => (
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-(--ink-soft) text-sm font-bold text-(--ink)">{s.firstName[0]}{s.lastName[0]}</span>
          <div className="min-w-0"><div className="font-semibold text-slate-800 dark:text-slate-100">{s.firstName} {s.lastName}</div><div className="text-sm text-slate-500">{s.admissionNo}</div></div>
        </div>
      ),
    },
    {
      header: 'Attendance',
      cell: (s) => (
        <div className="flex min-w-40 items-center gap-3">
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
            <div className={`h-full rounded-full ${s.attendanceRate === null ? '' : s.attendanceRate >= 90 ? 'bg-emerald-500' : s.attendanceRate >= 75 ? 'bg-amber-500' : 'bg-rose-500'}`} style={{ width: `${s.attendanceRate ?? 0}%` }} />
          </div>
          <span className="w-12 text-right text-sm tabular-nums">{s.attendanceRate === null ? '—' : `${s.attendanceRate}%`}</span>
        </div>
      ),
    },
    { header: 'Status', cell: (s) => <Badge tone={rateTone(s.attendanceRate)}>{rateLabel(s.attendanceRate)}</Badge> },
  ];

  return (
    <div>
      <PageHeader title="My Students" sub={`The classes you teach this year · ${total} students`} icon={Users} tone="emerald" />
      {sections.isLoading && <Spinner />}
      {sections.data?.length === 0 && <Card><EmptyState icon={Users} title="No classes assigned yet" tone="emerald">The administrator assigns teachers to sections under Academics.</EmptyState></Card>}
      {!!sections.data?.length && (
        <div role="tablist" className="mb-5 flex flex-wrap gap-2">
          {sections.data.map((s) => (
            <button key={s.sectionId} role="tab" aria-selected={s.sectionId === active} onClick={() => { setActive(s.sectionId); setSearch(''); }}
              className={`focus-ring rounded-full px-4 py-1.5 text-sm font-semibold ring-1 transition-colors ${s.sectionId === active ? 'bg-(--ink) text-white ring-(--ink) dark:bg-white dark:text-slate-900' : 'bg-white text-slate-700 ring-slate-300 hover:bg-slate-50 dark:bg-white/5 dark:text-slate-200 dark:ring-white/15'}`}>
              {s.name} · {s.students.length}
            </button>
          ))}
        </div>
      )}
      {current && (
        <Card
          padded={false}
          title={current.name}
          icon={GraduationCap}
          actions={<ExportMenu fileName={`Students ${current.name}`} rows={async () => rows} columns={[
            { header: 'Roll no.', value: (s: Row) => s.rollNo },
            { header: 'Admission no.', value: (s: Row) => s.admissionNo },
            { header: 'Name', value: (s: Row) => `${s.firstName} ${s.lastName}` },
            { header: 'Attendance %', value: (s: Row) => s.attendanceRate },
          ]} />}
        >
          <FilterBar>
            <SearchInput value={search} onChange={setSearch} placeholder="Search name or admission no.…" label="Search students" />
            <span className="text-sm text-slate-500">You teach {current.subjects.join(', ')}</span>
          </FilterBar>
          {rows.length === 0 ? <EmptyState icon={GraduationCap} title={q ? 'No student matches' : 'No students enrolled'} tone="emerald" /> : <DataTable columns={columns} rows={rows} rowKey={(s) => s.id} />}
        </Card>
      )}
    </div>
  );
}
