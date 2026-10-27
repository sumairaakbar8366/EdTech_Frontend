import { ArrowLeft, Award, BookOpen, Briefcase, CircleUser, History } from 'lucide-react';
import { useState } from 'react';
import { useParams } from 'react-router';
import { AreaLink } from '@/app/router/area';
import { Card, EmptyState, Spinner, Tabs } from '@/components/ui';
import { EmploymentHistoryCard } from '@/features/staff/components/detail/EmploymentHistoryCard';
import { ExperienceTab } from '@/features/staff/components/detail/ExperienceTab';
import { QualificationsTab } from '@/features/staff/components/detail/QualificationsTab';
import { StaffLoginModal, StaffStatusModal } from '@/features/staff/components/detail/StaffAdminModals';
import { StaffHeader } from '@/features/staff/components/detail/StaffHeader';
import { ServiceRecordCard } from '@/features/staff/components/detail/ServiceRecordCard';
import { ReplaceAdminModal } from '@/features/staff/components/ReplaceAdminModal';
import { useSchoolUser } from '@/features/auth/usePermissions';
import { StaffOverviewTab } from '@/features/staff/components/detail/StaffOverviewTab';
import { TeachingTab } from '@/features/staff/components/detail/TeachingTab';
import { StaffFormModal } from '@/features/staff/components/form/StaffFormModal';
import { useStaffMember } from '@/features/staff/hooks/useStaff';
import { errorMessage } from '@/lib/errors';

type Tab = 'overview' | 'qualifications' | 'experience' | 'teaching' | 'history';
type Dialog = 'edit' | 'status' | 'login' | null;

/** Staff profile. `own` shows the signed-in user's record read-only. */
export function StaffDetailPage({ canEdit, canEditAcademics, own = false }: { canEdit: boolean; canEditAcademics: boolean; own?: boolean }) {
  const { id } = useParams();
  const [tab, setTab] = useState<Tab>('overview');
  const [dialog, setDialog] = useState<Dialog>(null);
  const detail = useStaffMember(id, own);
  const e = detail.data;
  const editable = canEdit && !own;
  const me = useSchoolUser();
  const [replacing, setReplacing] = useState(false);
  // Only the principal or a School Admin replaces an admin (never themself).
  const canReplace = editable && me.roles.some((r) => r.key === 'principal' || r.key === 'school_admin');

  if (detail.isLoading) return <Spinner />;
  if (detail.error || !e) {
    return (
      <Card>
        <EmptyState icon={CircleUser} title={own ? 'No staff record linked to your account' : 'Staff member not found'} tone="slate">
          {detail.error ? errorMessage(detail.error, '') : null}
        </EmptyState>
      </Card>
    );
  }
  const tabs = [
    { id: 'overview' as const, label: 'Overview', icon: CircleUser },
    { id: 'qualifications' as const, label: 'Qualifications', icon: Award },
    { id: 'experience' as const, label: 'Experience', icon: Briefcase },
    ...(e.staffType === 'teaching' ? [{ id: 'teaching' as const, label: 'Teaching', icon: BookOpen }] : []),
    { id: 'history' as const, label: 'History', icon: History },
  ];
  const close = () => setDialog(null);

  return (
    <div>
      {!own && (
        <AreaLink to="/staff" className="mb-4 inline-flex items-center gap-1.5 text-base font-semibold uppercase tracking-wide text-primary-600 hover:underline dark:text-primary-300">
          <ArrowLeft size={16} /> All staff
        </AreaLink>
      )}
      <StaffHeader employee={e} editable={editable} onLogin={() => setDialog('login')} onStatus={() => setDialog('status')} onEdit={() => setDialog('edit')} onReplaceAdmin={canReplace && e.userId !== me.user.id ? () => setReplacing(true) : undefined} />
      {!own && <ServiceRecordCard employeeId={e.id} />}
      <Tabs tabs={tabs} value={tab} onChange={setTab} />
      {tab === 'overview' && <StaffOverviewTab employee={e} />}
      {tab === 'qualifications' && <QualificationsTab employee={e} editable={editable} />}
      {tab === 'experience' && <ExperienceTab employee={e} editable={editable} />}
      {tab === 'teaching' && <TeachingTab employee={e} editable={canEditAcademics && !own} />}
      {tab === 'history' && <EmploymentHistoryCard employee={e} />}
      {editable && (
        <>
          <StaffFormModal open={dialog === 'edit'} employee={e} onClose={close} />
          <StaffStatusModal open={dialog === 'status'} employee={e} onClose={close} onReplaceAdmin={canReplace && e.userId !== me.user.id ? () => setReplacing(true) : undefined} />
          <ReplaceAdminModal open={replacing} admin={e} onClose={() => setReplacing(false)} />
          <StaffLoginModal open={dialog === 'login'} employee={e} onClose={close} />
        </>
      )}
    </div>
  );
}
