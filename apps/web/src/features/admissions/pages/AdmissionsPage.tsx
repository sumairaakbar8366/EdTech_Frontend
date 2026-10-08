import { ClipboardList, Plus } from 'lucide-react';
import { useState } from 'react';
import { useAreaNavigate } from '@/app/router/area';
import { Button, Card, EmptyState, FilterBar, PageHeader, Pagination, SearchInput, Spinner } from '@/components/ui';
import { allPages } from '@/components/shared/ExportMenu';
import { SheetActions } from '@/components/shared/SheetActions';
import { ApplicationFormModal } from '@/features/admissions/components/ApplicationFormModal';
import { AdmissionTable } from '@/features/admissions/components/list/AdmissionTable';
import { PipelineStrip } from '@/features/admissions/components/list/PipelineStrip';
import { ADMISSION_LABEL } from '@/features/admissions/constants';
import { useAdmissionList } from '@/features/admissions/hooks/useAdmissions';
import { admissionService } from '@/features/admissions/services/admissionService';
import { ADMISSION_EXPORT, ADMISSION_IMPORT } from '@/features/admissions/utils/admissionSheet';
import type { AdmissionStatus } from '@/features/admissions/types/admission.types';
import { useDebouncedValue } from '@/lib/hooks/useDebouncedValue';

const PAGE_SIZE = 20;

/** Admissions (page 5): application pipeline. */
export function AdmissionsPage({ canEdit }: { canEdit: boolean }) {
  const navigate = useAreaNavigate();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'' | AdmissionStatus>('');
  const [page, setPage] = useState(1);
  const [adding, setAdding] = useState(false);
  const q = useDebouncedValue(search.trim());
  const list = useAdmissionList({ page, pageSize: PAGE_SIZE, q, status });

  return (
    <div>
      <PageHeader title="Admissions" sub="Applications, documents, interviews and enrollment" icon={ClipboardList} tone="teal" actions={
          <>
            <SheetActions fileName="Admissions" columns={ADMISSION_EXPORT} rows={() => allPages((p, size) => admissionService.list({ page: p, pageSize: size, q, status }))} importSpec={canEdit ? ADMISSION_IMPORT : undefined} />
            {canEdit && <Button icon={Plus} onClick={() => setAdding(true)}>New application</Button>}
          </>
        } />
      <PipelineStrip selected={status} onSelect={(s) => { setStatus(s); setPage(1); }} />
      <Card padded={false}>
        <FilterBar>
          <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search applicant, application no. or phone…" label="Search applications" />
          {status && <Button variant="ghost" onClick={() => setStatus('')}>Clear filter: {ADMISSION_LABEL[status]}</Button>}
        </FilterBar>
        {list.isLoading && <div className="px-5"><Spinner /></div>}
        {list.data?.items.length === 0 && <EmptyState icon={ClipboardList} title="No applications" tone="teal" />}
        {!!list.data?.items.length && <AdmissionTable applications={list.data.items} onOpen={(a) => navigate(`/admissions/${a.id}`)} />}
        {list.data && <Pagination page={page} pageSize={PAGE_SIZE} total={list.data.total} onChange={setPage} />}
      </Card>
      {canEdit && <ApplicationFormModal open={adding} onClose={() => setAdding(false)} onSaved={(id) => navigate(`/admissions/${id}`)} />}
    </div>
  );
}
