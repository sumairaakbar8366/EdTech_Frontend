import { ArrowLeft, ClipboardCheck } from 'lucide-react';
import { useState } from 'react';
import { useParams } from 'react-router';
import { AreaLink } from '@/app/router/area';
import { Card, EmptyState, Spinner } from '@/components/ui';
import { ApplicationFormModal } from '@/features/admissions/components/ApplicationFormModal';
import { AdmissionHeader } from '@/features/admissions/components/detail/AdmissionHeader';
import { ApplicantCard } from '@/features/admissions/components/detail/ApplicantCard';
import { AssessmentsCard } from '@/features/admissions/components/detail/AssessmentsCard';
import { DecisionCard } from '@/features/admissions/components/detail/DecisionCard';
import { EnrollCard } from '@/features/admissions/components/detail/EnrollCard';
import { HistoryCard } from '@/features/admissions/components/detail/HistoryCard';
import { ADMISSION_DOC_CATEGORIES } from '@/features/admissions/constants';
import { useAdmission } from '@/features/admissions/hooks/useAdmissions';
import { isClosed } from '@/features/admissions/utils/admission.utils';
import { DocumentsPanel } from '@/features/documents/components/DocumentsPanel';

/** One application: details, documents, assessments, decision, enrollment and history. */
export function AdmissionDetailPage({ canEdit }: { canEdit: boolean }) {
  const { id } = useParams();
  const app = useAdmission(id);
  const [editing, setEditing] = useState(false);

  if (app.isLoading) return <Spinner />;
  const a = app.data;
  if (!a) return <Card><EmptyState icon={ClipboardCheck} title="Application not found" tone="slate" /></Card>;
  const closed = isClosed(a);

  return (
    <div>
      <AreaLink to="/admissions" className="mb-4 inline-flex items-center gap-1.5 text-base font-semibold uppercase tracking-wide text-primary-600 hover:underline dark:text-primary-300"><ArrowLeft size={16} /> All applications</AreaLink>
      <AdmissionHeader application={a} canEdit={canEdit && !closed} onEdit={() => setEditing(true)} />
      <div className="grid gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <ApplicantCard application={a} />
          <DocumentsPanel ownerType="admission_application" ownerId={a.id} canEdit={canEdit && !closed} categories={ADMISSION_DOC_CATEGORIES} title="Application documents" />
          <AssessmentsCard application={a} canEdit={canEdit} closed={closed} />
        </div>
        <div className="space-y-6">
          {canEdit && <DecisionCard application={a} />}
          {canEdit && a.status === 'approved' && <EnrollCard application={a} />}
          <HistoryCard application={a} />
        </div>
      </div>
      {canEdit && <ApplicationFormModal open={editing} application={a} onClose={() => setEditing(false)} />}
    </div>
  );
}
