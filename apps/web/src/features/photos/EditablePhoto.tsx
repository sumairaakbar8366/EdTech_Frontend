import { Camera } from 'lucide-react';
import { useState } from 'react';
import { Avatar, Button, Modal } from '@/components/ui';
import { PhotoPicker } from '@/features/photos/PhotoPicker';
import { photoService, usePhotoAction } from '@/features/photos/photos';

/** A profile's large picture; the admin can replace it from here. */
export function EditablePhoto({ photoKey, name, kind, id, editable }: { photoKey?: string | null; name: string; kind: 'students' | 'staff' | 'guardians' | 'users'; id: string; editable: boolean }) {
  const [open, setOpen] = useState(false);
  const [photoId, setPhotoId] = useState<string | null>(null);
  const save = usePhotoAction((p: string) => photoService.setFor(kind, id, p), { success: 'Picture updated', onDone: () => { setPhotoId(null); setOpen(false); } });
  return (
    <div className="relative shrink-0">
      <Avatar photoKey={photoKey} name={name} size="xl" ring />
      {editable && (
        <button onClick={() => setOpen(true)} className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-orange-500 text-white shadow-md ring-2 ring-white transition hover:bg-orange-600 dark:ring-slate-900" aria-label={`Change ${name}'s picture`} title="Change picture">
          <Camera size={15} />
        </button>
      )}
      <Modal open={open} title={`Picture · ${name}`} onClose={() => setOpen(false)} footer={<><Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button><Button disabled={!photoId} loading={save.isPending} onClick={() => photoId && save.mutate(photoId)}>Save picture</Button></>}>
        <PhotoPicker value={photoId} onChange={setPhotoId} name={name} currentKey={photoKey} label="Profile picture" />
      </Modal>
    </div>
  );
}
