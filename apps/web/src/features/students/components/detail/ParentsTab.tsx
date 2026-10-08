import { Plus } from 'lucide-react';
import { useState } from 'react';
import { Button, ConfirmDialog, Field, Input, Modal } from '@/components/ui';
import { AddGuardianModal } from '@/features/students/components/detail/AddGuardianModal';
import { GuardianCard } from '@/features/students/components/detail/GuardianCard';
import { useStudentsAction } from '@/features/students/hooks/useStudents';
import { studentService } from '@/features/students/services/studentService';
import type { StudentDetail } from '@/features/students/types/student.types';
import { onSubmit } from '@/lib/forms';

/** The student's parents/guardians: primary contact, parent logins, add and remove. */
export function ParentsTab({ student, editable }: { student: StudentDetail; editable: boolean }) {
  const [adding, setAdding] = useState(false);
  const [unlinking, setUnlinking] = useState<string | null>(null);
  const [loginFor, setLoginFor] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const setPrimary = useStudentsAction((gid: string) => studentService.setPrimaryGuardian(student.id, gid), 'Primary contact updated');
  const unlink = useStudentsAction((gid: string) => studentService.unlinkGuardian(student.id, gid), 'Guardian removed', () => setUnlinking(null));
  const login = useStudentsAction(() => studentService.createGuardianLogin(loginFor!, password), 'Parent login created', () => {
    setLoginFor(null);
    setPassword('');
  });

  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-2">
        {student.guardians.map((link) => (
          <GuardianCard
            key={link.guardianId}
            link={link}
            editable={editable}
            canRemove={student.guardians.length > 1}
            onMakePrimary={() => setPrimary.mutate(link.guardianId)}
            onCreateLogin={() => setLoginFor(link.guardianId)}
            onRemove={() => setUnlinking(link.guardianId)}
          />
        ))}
      </div>
      {editable && <Button icon={Plus} onClick={() => setAdding(true)}>Add parent / guardian</Button>}
      {editable && <AddGuardianModal open={adding} studentId={student.id} onClose={() => setAdding(false)} />}
      <ConfirmDialog
        open={!!unlinking}
        title="Remove guardian?"
        message="The guardian will no longer be linked to this student. Their record is kept for other children."
        confirmLabel="Remove"
        loading={unlink.isPending}
        onConfirm={() => unlinking && unlink.mutate(unlinking)}
        onClose={() => setUnlinking(null)}
      />
      <Modal
        open={!!loginFor}
        title="Create parent login"
        onClose={() => setLoginFor(null)}
        footer={<><Button variant="secondary" onClick={() => setLoginFor(null)}>Cancel</Button><Button type="submit" form="parent-login" loading={login.isPending}>Create login</Button></>}
      >
        <form id="parent-login" onSubmit={onSubmit(() => login.mutate(undefined))} className="space-y-3">
          <p className="text-base text-slate-600 dark:text-slate-300">The parent signs in with their email and sees all of their children.</p>
          <Field label="Temporary password" hint="At least 12 characters"><Input type="password" autoComplete="new-password" required minLength={12} value={password} onChange={(e) => setPassword(e.target.value)} /></Field>
        </form>
      </Modal>
    </div>
  );
}
