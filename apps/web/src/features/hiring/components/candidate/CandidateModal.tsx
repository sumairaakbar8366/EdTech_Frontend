import { ArrowRight, CircleX, ClipboardList } from 'lucide-react';
import { useState } from 'react';
import { Button, Modal } from '@/components/ui';
import { CandidateProfile } from '@/features/hiring/components/candidate/CandidateProfile';
import { HireForm } from '@/features/hiring/components/candidate/HireForm';
import { InterviewsSection } from '@/features/hiring/components/candidate/InterviewsSection';
import { NEXT_STAGE, STAGES, isActiveCandidate } from '@/features/hiring/constants';
import { useHiringAction } from '@/features/hiring/hooks/useHiring';
import { hiringService } from '@/features/hiring/services/hiringService';
import type { ApplicationStatus, JobApplication, JobPost } from '@/features/hiring/types/hiring.types';
import { CredentialsModal } from '@/features/users/components/CredentialsModal';
import type { LoginHandover } from '@/features/users/users';

/** One candidate: profile, interviews, hiring and stage moves. */
export function CandidateModal({ app, post, hiredCount, canEdit, onClose }: { app: JobApplication; post: JobPost; hiredCount: number; canEdit: boolean; onClose: () => void }) {
  const move = useHiringAction((status: ApplicationStatus) => hiringService.move(app.id, status), 'Candidate moved');
  const next = NEXT_STAGE[app.status];
  // After hiring, the new login is shown once here (the hire form itself disappears with the status).
  const [login, setLogin] = useState<LoginHandover | null>(null);
  if (login) return <CredentialsModal credentials={login} title={`${app.firstName} hired · login details`} onClose={onClose} />;
  return (
    <Modal open size="xl" title={`${app.firstName} ${app.lastName}`} onClose={onClose}>
      <div className="space-y-5">
        <CandidateProfile app={app} />
        <InterviewsSection app={app} canEdit={canEdit} />
        {canEdit && app.status === 'selected' && <HireForm app={app} post={post} hiredCount={hiredCount} onHired={(l) => (l ? setLogin(l) : onClose())} />}
        {canEdit && isActiveCandidate(app.status) && (
          <div className="flex flex-wrap justify-end gap-2 border-t border-slate-200 pt-4 dark:border-white/10">
            {app.status !== 'selected' && <Button variant="ghost" onClick={() => move.mutate('withdrawn')}>Withdrawn</Button>}
            <Button variant="danger" icon={CircleX} onClick={() => move.mutate('rejected')} loading={move.isPending}>Reject</Button>
            {next && <Button icon={ArrowRight} onClick={() => move.mutate(next)} loading={move.isPending}>Move to {STAGES.find((s) => s.id === next)?.label}</Button>}
            {app.status === 'shortlisted' && <span className="self-center text-sm text-slate-500"><ClipboardList size={14} className="inline" /> Schedule an interview to move forward</span>}
          </div>
        )}
      </div>
    </Modal>
  );
}
