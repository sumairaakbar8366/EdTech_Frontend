import { ArrowRight, CircleX, ClipboardList, History } from 'lucide-react';
import { useState } from 'react';
import { Button, Field, Modal, Spinner, TextArea } from '@/components/ui';
import { DocumentsPanel } from '@/features/documents/components/DocumentsPanel';
import { CandidateProfile, StatusLogList } from '@/features/hiring/components/candidate/CandidateProfile';
import { HireForm } from '@/features/hiring/components/candidate/HireForm';
import { InterviewsSection } from '@/features/hiring/components/candidate/InterviewsSection';
import { NEXT_STAGE, STAGES, isActiveCandidate } from '@/features/hiring/constants';
import { useApplication, useHiringAction } from '@/features/hiring/hooks/useHiring';
import { hiringService } from '@/features/hiring/services/hiringService';
import type { ApplicationStatus } from '@/features/hiring/types/hiring.types';
import { CredentialsModal } from '@/features/users/components/CredentialsModal';
import type { LoginHandover } from '@/features/users/users';

const DOC_CATEGORIES = [
  { value: 'cv', label: 'CV / résumé' },
  { value: 'certificate', label: 'Degree / certificate' },
  { value: 'experience_letter', label: 'Experience letter' },
  { value: 'cnic', label: 'CNIC copy' },
  { value: 'other', label: 'Other' },
];

/** One applicant, at any stage: the full application, status log, documents, interviews, hiring and moves. */
export function CandidateModal({ applicationId, canEdit, onClose }: { applicationId: string; canEdit: boolean; onClose: () => void }) {
  const detail = useApplication(applicationId);
  const app = detail.data;
  const [closing, setClosing] = useState<'rejected' | 'withdrawn' | null>(null);
  const [note, setNote] = useState('');
  const move = useHiringAction(({ status, note }: { status: ApplicationStatus; note?: string }) => hiringService.move(applicationId, status, note), 'Candidate moved', () => { setClosing(null); setNote(''); });
  // After hiring, the new login is shown once here (the hire form itself disappears with the status).
  const [login, setLogin] = useState<LoginHandover | null>(null);
  if (login) return <CredentialsModal credentials={login} title={`${app?.firstName ?? ''} hired · login details`} onClose={onClose} />;
  const next = app ? NEXT_STAGE[app.status] : undefined;

  return (
    <Modal open size="xl" title={app ? `${app.firstName} ${app.lastName}` : 'Applicant'} onClose={onClose}>
      {!app ? (
        <Spinner />
      ) : (
        <div className="space-y-6">
          <CandidateProfile app={app} />
          <div className="rounded-lg border border-slate-200 p-4 dark:border-white/10">
            <div className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-500"><History size={15} /> Status log</div>
            <StatusLogList history={app.history} />
          </div>
          <DocumentsPanel ownerType="job_application" ownerId={app.id} canEdit={canEdit} categories={DOC_CATEGORIES} title="CV & documents" />
          <InterviewsSection app={app} canEdit={canEdit} />
          {canEdit && app.status === 'selected' && <HireForm app={app} post={app.jobPost} hiredCount={app.hiredCount} onHired={(l) => (l ? setLogin(l) : onClose())} />}
          {canEdit && isActiveCandidate(app.status) && (
            closing ? (
              <div className="space-y-3 rounded-lg border border-rose-200 p-4 dark:border-rose-400/30">
                <Field label={closing === 'rejected' ? 'Reason for rejecting (kept in the status log)' : 'Note (optional)'}>
                  <TextArea rows={2} maxLength={1000} required={closing === 'rejected'} value={note} onChange={(e) => setNote(e.target.value)} />
                </Field>
                <div className="flex justify-end gap-2">
                  <Button variant="secondary" onClick={() => setClosing(null)}>Cancel</Button>
                  <Button variant="danger" loading={move.isPending} disabled={closing === 'rejected' && !note.trim()} onClick={() => move.mutate({ status: closing, note: note.trim() || undefined })}>{closing === 'rejected' ? 'Reject candidate' : 'Mark withdrawn'}</Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap justify-end gap-2 border-t border-slate-200 pt-4 dark:border-white/10">
                {app.status !== 'selected' && <Button variant="ghost" onClick={() => setClosing('withdrawn')}>Withdrawn</Button>}
                <Button variant="danger" icon={CircleX} onClick={() => setClosing('rejected')}>Reject</Button>
                {next && <Button icon={ArrowRight} onClick={() => move.mutate({ status: next })} loading={move.isPending}>Move to {STAGES.find((s) => s.id === next)?.label}</Button>}
                {app.status === 'shortlisted' && <span className="self-center text-sm text-slate-500"><ClipboardList size={14} className="inline" /> Schedule an interview to move forward</span>}
              </div>
            )
          )}
        </div>
      )}
    </Modal>
  );
}
