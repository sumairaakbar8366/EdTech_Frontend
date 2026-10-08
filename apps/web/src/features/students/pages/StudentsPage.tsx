import { ArrowUpRight, FileUp, GraduationCap, Plus } from 'lucide-react';
import { useState } from 'react';
import { useAreaNavigate } from '@/app/router/area';
import { allPages, ExportMenu } from '@/components/shared/ExportMenu';
import { ImportDialog } from '@/components/shared/ImportDialog';
import { Button, Card, EmptyState, PageHeader, Pagination, Spinner } from '@/components/ui';
import { AddStudentModal } from '@/features/students/components/forms/AddStudentModal';
import { PromoteStudentsModal } from '@/features/students/components/list/PromoteStudentsModal';
import { StudentFilters, type StudentFilterValues } from '@/features/students/components/list/StudentFilters';
import { StudentStats } from '@/features/students/components/list/StudentStats';
import { StudentTable } from '@/features/students/components/list/StudentTable';
import { useStudentList } from '@/features/students/hooks/useStudents';
import { studentService } from '@/features/students/services/studentService';
import { STUDENT_EXPORT, STUDENT_IMPORT } from '@/features/students/utils/studentSheet';
import { useDebouncedValue } from '@/lib/hooks/useDebouncedValue';

const PAGE_SIZE = 20;

/** Student directory (page 5). */
export function StudentsPage({ canEdit }: { canEdit: boolean }) {
  const navigate = useAreaNavigate();
  const [filters, setFilters] = useState<StudentFilterValues>({ search: '', classId: '', sectionId: '', status: 'active' });
  const [page, setPage] = useState(1);
  const [adding, setAdding] = useState(false);
  const [promoting, setPromoting] = useState(false);
  const [importing, setImporting] = useState(false);
  const q = useDebouncedValue(filters.search.trim());
  const list = useStudentList({ page, pageSize: PAGE_SIZE, q, classId: filters.classId, sectionId: filters.sectionId, status: filters.status });
  const filtered = !!(q || filters.classId || filters.sectionId || filters.status !== 'active');

  return (
    <div>
      <PageHeader
        title="Students"
        sub="Profiles, parents, classes and documents"
        icon={GraduationCap}
        tone="emerald"
        actions={
          <>
            <ExportMenu
              fileName="Students"
              columns={STUDENT_EXPORT}
              rows={() => allPages((p, size) => studentService.list({ page: p, pageSize: size, q, classId: filters.classId, sectionId: filters.sectionId, status: filters.status }))}
            />
            {canEdit && (
            <>
              <Button variant="secondary" icon={FileUp} onClick={() => setImporting(true)}>Import</Button>
              <Button variant="secondary" icon={ArrowUpRight} onClick={() => setPromoting(true)}>Promote</Button>
              <Button icon={Plus} onClick={() => setAdding(true)}>Add student</Button>
            </>
            )}
          </>
        }
      />
      <StudentStats />
      <Card padded={false}>
        <StudentFilters value={filters} onChange={(f) => { setFilters(f); setPage(1); }} />
        {list.isLoading && <div className="px-5"><Spinner /></div>}
        {list.data?.items.length === 0 && (
          <EmptyState icon={GraduationCap} title={filtered ? 'No students match these filters' : 'No students yet'} tone="emerald">
            {canEdit && !filtered && 'Add students directly, or enroll them from Admissions.'}
          </EmptyState>
        )}
        {!!list.data?.items.length && <StudentTable students={list.data.items} onOpen={(s) => navigate(`/students/${s.id}`)} />}
        {list.data && <Pagination page={page} pageSize={PAGE_SIZE} total={list.data.total} onChange={setPage} />}
      </Card>
      {canEdit && <AddStudentModal open={adding} onClose={() => setAdding(false)} onCreated={(id) => navigate(`/students/${id}`)} />}
      {canEdit && <PromoteStudentsModal open={promoting} onClose={() => setPromoting(false)} />}
      {canEdit && <ImportDialog spec={STUDENT_IMPORT} open={importing} onClose={() => setImporting(false)} />}
    </div>
  );
}
