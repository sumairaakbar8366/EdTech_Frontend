import { Briefcase, FileUp, ListChecks, Plus, UserPlus } from 'lucide-react';
import { useState } from 'react';
import { AreaLink, useAreaNavigate } from '@/app/router/area';
import { allPages, ExportMenu } from '@/components/shared/ExportMenu';
import { ImportDialog } from '@/components/shared/ImportDialog';
import { Button, Card, EmptyState, PageHeader, Pagination, Spinner } from '@/components/ui';
import { StaffFormModal } from '@/features/staff/components/form/StaffFormModal';
import { StaffFilters, type StaffFilterValues } from '@/features/staff/components/list/StaffFilters';
import { StaffStats } from '@/features/staff/components/list/StaffStats';
import { StaffTable } from '@/features/staff/components/list/StaffTable';
import { useStaffList } from '@/features/staff/hooks/useStaff';
import { staffService } from '@/features/staff/services/staffService';
import { STAFF_EXPORT, STAFF_IMPORT } from '@/features/staff/utils/staffSheet';
import { useDebouncedValue } from '@/lib/hooks/useDebouncedValue';

const PAGE_SIZE = 20;

/** Staff directory (page 6). */
export function StaffPage({ canEdit }: { canEdit: boolean }) {
  const navigate = useAreaNavigate();
  const [filters, setFilters] = useState<StaffFilterValues>({ search: '', staffType: '', status: 'active', campusId: '' });
  const [page, setPage] = useState(1);
  const [adding, setAdding] = useState(false);
  const [importing, setImporting] = useState(false);
  const q = useDebouncedValue(filters.search.trim());
  const list = useStaffList({ page, pageSize: PAGE_SIZE, q, staffType: filters.staffType, status: filters.status, campusId: filters.campusId });
  const filtered = !!(q || filters.staffType || filters.status || filters.campusId);

  return (
    <div>
      <PageHeader
        title="Staff"
        sub="Teaching and non-teaching staff"
        icon={Briefcase}
        tone="sky"
        actions={
          <>
            <AreaLink to="/staff/hiring" className="focus-ring inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-base font-bold uppercase tracking-wide text-slate-700 shadow-depth-1 ring-1 ring-slate-200 hover:bg-slate-50 dark:bg-white/5 dark:text-slate-200 dark:ring-white/10">
              <UserPlus size={16} /> Hiring
            </AreaLink>
            {canEdit && (
              <AreaLink to="/staff/tasks" className="focus-ring inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-base font-bold uppercase tracking-wide text-slate-700 shadow-depth-1 ring-1 ring-slate-200 hover:bg-slate-50 dark:bg-white/5 dark:text-slate-200 dark:ring-white/10">
                <ListChecks size={16} /> Tasks
              </AreaLink>
            )}
            <ExportMenu fileName="Staff" columns={STAFF_EXPORT} rows={() => allPages((p, size) => staffService.list({ page: p, pageSize: size, q, staffType: filters.staffType, status: filters.status, campusId: filters.campusId }))} />
            {canEdit && <Button variant="secondary" icon={FileUp} onClick={() => setImporting(true)}>Import</Button>}
            {canEdit && <Button icon={Plus} onClick={() => setAdding(true)}>Add staff</Button>}
          </>
        }
      />
      <StaffStats />
      <Card padded={false}>
        <StaffFilters value={filters} onChange={(f) => { setFilters(f); setPage(1); }} showCampus={canEdit} />
        {list.isLoading && <div className="px-5"><Spinner /></div>}
        {list.data?.items.length === 0 && (
          <EmptyState icon={Briefcase} title={filtered ? 'No staff match these filters' : 'No staff yet'} tone="sky">
            {canEdit && !q && 'Add your teachers and support staff to get started.'}
          </EmptyState>
        )}
        {!!list.data?.items.length && <StaffTable staff={list.data.items} onOpen={(e) => navigate(`/staff/${e.id}`)} />}
        {list.data && <Pagination page={page} pageSize={PAGE_SIZE} total={list.data.total} onChange={setPage} />}
      </Card>
      {canEdit && <StaffFormModal open={adding} onClose={() => setAdding(false)} />}
      {canEdit && <ImportDialog spec={STAFF_IMPORT} open={importing} onClose={() => setImporting(false)} />}
    </div>
  );
}
