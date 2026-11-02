import { useState } from 'react';
import { Alert, Button, Modal } from '@/components/ui';
import { useAuth } from '@/features/auth/AuthProvider';
import { PhotoPicker } from '@/features/photos/PhotoPicker';
import { photoService, usePhotoAction } from '@/features/photos/photos';

/**
 * The signed-in person's own picture. Parents may add one (optional, shown on their dashboard);
 * students and staff who already have one send the new picture to the admin for approval.
 */
export function MyPhotoModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { me } = useAuth();
  const [photoId, setPhotoId] = useState<string | null>(null);
  const save = usePhotoAction(photoService.setMine, {
    success: (r) => (r.status === 'requested' ? 'Sent to the school admin for approval' : 'Your picture is updated'),
    onDone: () => { setPhotoId(null); onClose(); },
  });
  if (me?.scope !== 'school') return null;
  const isParentOnly = me.roles.every((r) => r.key === 'parent');
  const name = `${me.user.firstName} ${me.user.lastName}`;
  return (
    <Modal open={open} title="My picture" onClose={onClose} footer={<><Button variant="secondary" onClick={onClose}>Cancel</Button><Button disabled={!photoId} loading={save.isPending} onClick={() => photoId && save.mutate(photoId)}>{me.user.photoNeedsApproval ? 'Send for approval' : 'Save picture'}</Button></>}>
      <div className="space-y-4">
        {me.user.photoNeedsApproval && <Alert tone="info">Your picture is on your school record. A new one is shown after the school admin approves it.</Alert>}
        <PhotoPicker
          value={photoId}
          onChange={setPhotoId}
          name={name}
          currentKey={me.user.photoKey}
          label={isParentOnly ? 'Father / guardian picture (optional)' : 'Profile picture'}
          hint={isParentOnly ? 'Upload a picture of the father or guardian. It is only shown on your dashboard; you can skip it.' : undefined}
        />
      </div>
    </Modal>
  );
}
