import { ArrowLeft, CircleUser, History, Paperclip, Users } from 'lucide-react';
import { useState } from 'react';
import { useParams } from 'react-router';
import { AreaLink } from '@/app/router/area';
import { Card, EmptyState, Spinner, Tabs } from '@/components/ui';
import { DocumentsPanel } from '@/features/documents/components/DocumentsPanel';
import { ClassHistoryCard } from '@/features/students/components/detail/ClassHistoryCard';
import { OverviewTab } from '@/features/students/components/detail/OverviewTab';
import { FormAnswersCard } from '@/features/admissions/components/detail/FormAnswersCard';
import { ParentsTab } from '@/features/students/components/detail/ParentsTab';
import { MoveSectionModal, StudentLoginModal, StudentStatusModal } from '@/features/students/components/detail/StudentAdminModals';
import { StudentHeader } from '@/features/students/components/detail/StudentHeader';
import { EditStudentModal } from '@/features/students/components/forms/EditStudentModal';
import { STUDENT_DOC_CATEGORIES } from '@/features/students/constants';
import { useStudentDetail } from '@/features/students/hooks/useStudents';
import { errorMessage } from '@/lib/errors';

type Mode = 'admin' | 'own' | 'child';
type Tab = 'overview' | 'parents' | 'classes' | 'documents';
type Dialog = 'edit' | 'status' | 'move' | 'login' | null;

const TABS = [
  { id: 'overview' as const, label: 'Overview', icon: CircleUser },
  { id: 'parents' as const, label: 'Parents', icon: Users },
  { id: 'classes' as const, label: 'Class history', icon: History },
  { id: 'documents' as const, label: 'Documents', icon: Paperclip },
];

/** Student record for admins (editable), the student themself, or their parent (read-only). */
export function StudentDetailPage({ mode, canEdit = false }: { mode: Mode; canEdit?: boolean }) {
  const { id } = useParams();
  const [tab, setTab] = useState<Tab>('overview');
  const [dialog, setDialog] = useState<Dialog>(null);
  const detail = useStudentDetail(mode, id);
  const s = detail.data;
  const editable = mode === 'admin' && canEdit;

  if (detail.isLoading) return <Spinner />;
  if (!s) return <Card><EmptyState icon={CircleUser} title="Student not found" tone="slate">{detail.error ? errorMessage(detail.error, '') : null}</EmptyState></Card>;
  const current = s.enrollments.find((e) => e.academicYear.isCurrent && e.status === 'enrolled');
  const close = () => setDialog(null);

  return (
    <div>
      {mode !== 'own' && (
        <AreaLink to={mode === 'child' ? '/my-children' : '/students'} className="mb-4 inline-flex items-center gap-1.5 text-base font-semibold uppercase tracking-wide text-primary-600 hover:underline dark:text-primary-300">
          <ArrowLeft size={16} /> {mode === 'child' ? 'My children' : 'All students'}
        </AreaLink>
      )}
      <StudentHeader student={s} current={current} editable={editable} onMove={() => setDialog('move')} onLogin={() => setDialog('login')} onStatus={() => setDialog('status')} onEdit={() => setDialog('edit')} />
      <Tabs tabs={TABS} value={tab} onChange={setTab} />
      {tab === 'overview' && <OverviewTab student={s} editable={editable} />}
      {tab === 'overview' && mode === 'admin' && !!s.admissionApplication?.formAnswers?.length && (
        <div className="mt-6"><FormAnswersCard answers={s.admissionApplication.formAnswers} title={`Admission form answers · ${s.admissionApplication.applicationNo}`} /></div>
      )}
      {tab === 'parents' && <ParentsTab student={s} editable={editable} />}
      {tab === 'classes' && <ClassHistoryCard student={s} />}
      {tab === 'documents' && <DocumentsPanel ownerType="student" ownerId={s.id} canEdit={editable} categories={STUDENT_DOC_CATEGORIES} />}
      {editable && (
        <>
          <EditStudentModal open={dialog === 'edit'} student={s} onClose={close} />
          <StudentStatusModal open={dialog === 'status'} student={s} onClose={close} />
          <MoveSectionModal open={dialog === 'move'} student={s} currentSectionId={current?.section.id} currentRoll={current?.rollNo ?? null} onClose={close} />
          <StudentLoginModal open={dialog === 'login'} student={s} onClose={close} />
        </>
      )}
    </div>
  );
}
