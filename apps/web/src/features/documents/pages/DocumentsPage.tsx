import { FolderOpen, Inbox } from 'lucide-react';
import { useSearchParams } from 'react-router';
import { Card, EmptyState, PageHeader, Spinner, Tabs } from '@/components/ui';
import { RequestsAdminPanel } from '@/features/document-requests/components/RequestsAdminPanel';
import { useCan, useSchoolUser } from '@/features/auth/usePermissions';
import { DocumentsPanel } from '@/features/documents/components/DocumentsPanel';
import { STUDENT_DOC_CATEGORIES } from '@/features/students/constants';
import { useMyChildren, useStudentDetail } from '@/features/students/hooks/useStudents';

const SCHOOL_DOC_CATEGORIES = [
  { value: 'policy', label: 'Policy' },
  { value: 'circular', label: 'Circular' },
  { value: 'certificate', label: 'Certificate' },
  { value: 'other', label: 'Other' },
];

/** Admin "Documents": the school's own files (policies, circulars, certificates). */
export function SchoolDocumentsPage() {
  const me = useSchoolUser();
  const can = useCan();
  const [params, setParams] = useSearchParams();
  const tab = params.get('tab') === 'requests' ? 'requests' : 'files';
  return (
    <div>
      <PageHeader title="Documents" sub="School files, and document requests from parents and students" icon={FolderOpen} tone="slate" />
      <Tabs
        tabs={[{ id: 'files', label: 'School files', icon: FolderOpen }, { id: 'requests', label: 'Requests', icon: Inbox }]}
        value={tab}
        onChange={(t) => setParams(t === 'requests' ? { tab: 'requests' } : {}, { replace: true })}
      />
      {tab === 'files' && me.school && <DocumentsPanel ownerType="school" ownerId={me.school.id} canEdit={can('settings.manage')} categories={SCHOOL_DOC_CATEGORIES} title="School documents" />}
      {tab === 'requests' && <RequestsAdminPanel />}
    </div>
  );
}

/** Student "Documents": files the school keeps on the student's record. */
export function MyDocumentsPage() {
  const me = useStudentDetail('own');
  return (
    <div>
      <PageHeader title="Documents" sub="Certificates and records the school holds for you" icon={FolderOpen} tone="slate" />
      {me.isLoading && <Spinner />}
      {me.data && <DocumentsPanel ownerType="student" ownerId={me.data.id} canEdit={false} categories={STUDENT_DOC_CATEGORIES} title="My documents" />}
    </div>
  );
}

/** Parent "Documents": each child's documents. */
export function ChildrenDocumentsPage() {
  const children = useMyChildren();
  return (
    <div>
      <PageHeader title="Documents" sub="Certificates and records the school holds for your children" icon={FolderOpen} tone="slate" />
      {children.isLoading && <Spinner />}
      {children.data?.length === 0 && <Card><EmptyState icon={FolderOpen} title="No children linked to your account" tone="slate" /></Card>}
      <div className="grid gap-4 xl:grid-cols-2">
        {children.data?.map((c) => (
          <DocumentsPanel key={c.id} ownerType="student" ownerId={c.id} canEdit={false} categories={STUDENT_DOC_CATEGORIES} title={`${c.firstName} ${c.lastName}`} />
        ))}
      </div>
    </div>
  );
}
