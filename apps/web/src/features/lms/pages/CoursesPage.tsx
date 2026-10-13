import { BookOpen, FileText, NotebookPen } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useAreaNavigate } from '@/app/router/area';
import { Card, DataTable, EmptyState, FilterBar, FilterSlot, PageHeader, SearchInput, Select, Spinner, type Column } from '@/components/ui';
import { useChildSwitch } from '@/features/lms/hooks/useChildSwitch';
import { useCourses } from '@/features/lms/hooks/useLms';
import { compactNumber } from '@/lib/format';

type Course = NonNullable<ReturnType<typeof useCourses>['data']>[number];
const sortText = (a: string, b: string) => a.localeCompare(b, undefined, { numeric: true });

/**
 * Courses (page 10) as a table: one row per subject per section, with filters for class, subject and
 * teacher. Admins see every course, teachers theirs, students and parents their class's.
 */
export function CoursesPage({ title = 'Learning', sub = 'Courses, learning material and assignments' }: { title?: string; sub?: string }) {
  const { childId, ready, switcher } = useChildSwitch();
  const courses = useCourses(childId, ready);
  const navigate = useAreaNavigate();
  const [q, setQ] = useState('');
  const [cls, setCls] = useState('');
  const [subject, setSubject] = useState('');
  const [teacher, setTeacher] = useState('');
  const list = courses.data ?? [];

  const options = useMemo(() => ({
    classes: [...new Set(list.map((c) => c.section.schoolClass.name))].sort(sortText),
    subjects: [...new Set(list.map((c) => c.subject.name))].sort(sortText),
    teachers: [...new Set(list.map((c) => c.teacher ?? 'No teacher'))].sort(sortText),
  }), [list]);

  const rows = useMemo(() => {
    const term = q.trim().toLowerCase();
    return list
      .filter((c) => (!cls || c.section.schoolClass.name === cls) && (!subject || c.subject.name === subject) && (!teacher || (c.teacher ?? 'No teacher') === teacher))
      .filter((c) => !term || [c.subject.name, c.section.schoolClass.name, c.section.name, c.teacher ?? ''].some((v) => v.toLowerCase().includes(term)))
      .sort((a, b) => sortText(a.section.schoolClass.name, b.section.schoolClass.name) || sortText(a.section.name, b.section.name) || sortText(a.subject.name, b.subject.name));
  }, [list, q, cls, subject, teacher]);

  const showFilters = list.length > 6;
  const cols: Column<Course>[] = [
    { header: 'Subject', cell: (c) => <span className="font-semibold text-slate-900 dark:text-white">{c.subject.name}</span> },
    { header: 'Class', cell: (c) => <span>{c.section.schoolClass.name} · Section {c.section.name}</span> },
    { header: 'Teacher', cell: (c) => <span className={c.teacher ? '' : 'text-slate-400'}>{c.teacher ?? 'No teacher'}</span> },
    { header: 'Material', align: 'right', cell: (c) => <span className="inline-flex items-center gap-1 tabular-nums"><FileText size={14} className="text-slate-400" /> {c._count.materials}</span> },
    { header: 'Assignments', align: 'right', cell: (c) => <span className="inline-flex items-center gap-1 tabular-nums"><NotebookPen size={14} className="text-slate-400" /> {c._count.assignments}</span> },
  ];

  return (
    <div>
      <PageHeader title={title} sub={sub} icon={BookOpen} tone="magenta" />
      {switcher}
      {courses.isLoading && <Spinner />}
      {courses.data?.length === 0 && (
        <Card><EmptyState icon={BookOpen} title="No courses yet" tone="magenta">Courses appear once teachers are assigned to subjects for the current academic year.</EmptyState></Card>
      )}
      {list.length > 0 && (
        <Card padded={false} title={`Courses · ${compactNumber(rows.length)}${rows.length !== list.length ? ` of ${compactNumber(list.length)}` : ''}`} icon={BookOpen}>
          {showFilters && (
            <FilterBar>
              <SearchInput label="Search courses" placeholder="Subject, class or teacher" value={q} onChange={setQ} />
              <FilterSlot width="w-40"><Select aria-label="Class" value={cls} onChange={(e) => setCls(e.target.value)}><option value="">All classes</option>{options.classes.map((v) => <option key={v}>{v}</option>)}</Select></FilterSlot>
              <FilterSlot width="w-44"><Select aria-label="Subject" value={subject} onChange={(e) => setSubject(e.target.value)}><option value="">All subjects</option>{options.subjects.map((v) => <option key={v}>{v}</option>)}</Select></FilterSlot>
              <FilterSlot width="w-48"><Select aria-label="Teacher" value={teacher} onChange={(e) => setTeacher(e.target.value)}><option value="">All teachers</option>{options.teachers.map((v) => <option key={v}>{v}</option>)}</Select></FilterSlot>
            </FilterBar>
          )}
          {rows.length === 0 ? <p className="p-6 text-sm text-slate-500">No courses match.</p> : (
            <DataTable columns={cols} rows={rows} rowKey={(c) => c.id} onRowClick={(c) => navigate(`/lms/courses/${c.id}${childId ? `?studentId=${childId}` : ''}`)} />
          )}
        </Card>
      )}
    </div>
  );
}
