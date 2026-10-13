import { Mail } from 'lucide-react';
import { useState } from 'react';
import { Alert, Button, Modal } from '@/components/ui';
import { EmailProofField } from '@/features/users/components/EmailProofField';
import { usersService, useUsersAction, type EmailProof, type SchoolLogin } from '@/features/users/users';
import { errorMessage } from '@/lib/errors';
import { onSubmit } from '@/lib/forms';

/** Change a login's personal email. The User ID stays the same; the new address is unverified unless a code is entered. */
export function EmailEditModal({ user, onClose }: { user: SchoolLogin | null; onClose: () => void }) {
  return user ? <EmailEditForm key={user.id} user={user} onClose={onClose} /> : null;
}

function EmailEditForm({ user, onClose }: { user: SchoolLogin; onClose: () => void }) {
  const [email, setEmail] = useState(user.email ?? '');
  const [proof, setProof] = useState<EmailProof | null>(null);
  const save = useUsersAction(usersService.setEmail, { success: 'Email saved', onDone: onClose, toastErrors: false });
  return (
    <Modal
      open
      title={`Email · ${user.firstName} ${user.lastName}`}
      onClose={onClose}
      footer={<><Button variant="secondary" onClick={onClose}>Cancel</Button><Button type="submit" form="email-edit" icon={Mail} loading={save.isPending}>Save</Button></>}
    >
      <form id="email-edit" onSubmit={onSubmit(() => save.mutate({ id: user.id, email: email.trim() || null, ...(proof && { verification: proof }) }))} className="space-y-4">
        {save.error && <Alert>{errorMessage(save.error, 'Could not save the email.')}</Alert>}
        <p className="text-sm text-slate-600 dark:text-slate-300">
          User ID <strong className="font-mono">{user.loginId}</strong> does not change. {user.email && <>Current email: <strong>{user.email}</strong> ({user.emailVerified ? 'verified' : 'not verified'}).</>}
        </p>
        <EmailProofField email={email} onEmailChange={setEmail} onProof={setProof} label="New email" />
      </form>
    </Modal>
  );
}
