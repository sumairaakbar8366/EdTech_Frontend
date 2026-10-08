import { Upload } from 'lucide-react';
import { useState } from 'react';
import { Alert, Button, Field, Input, Modal, TextArea } from '@/components/ui';
import { LMS_FILE_ACCEPT } from '@/features/lms/constants';
import { useLmsAction } from '@/features/lms/hooks/useLms';
import { lmsService } from '@/features/lms/services/lmsService';
import { errorMessage } from '@/lib/errors';
import { onSubmit } from '@/lib/forms';

/** Post a file or a link to a course. */
export function AddMaterialModal({ open, courseId, onClose }: { open: boolean; courseId: string; onClose: () => void }) {
  const [kind, setKind] = useState<'file' | 'link'>('file');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [url, setUrl] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const save = useLmsAction(() => lmsService.addMaterial(courseId, { title, description, ...(kind === 'link' ? { url } : { file }) }), {
    success: 'Material posted',
    onDone: () => {
      reset();
      onClose();
    },
    toastErrors: false,
  });
  function reset() { setTitle(''); setDescription(''); setUrl(''); setFile(null); save.reset(); }
  return (
    <Modal
      open={open}
      title="Add learning material"
      onClose={onClose}
      footer={<><Button variant="secondary" onClick={onClose}>Cancel</Button><Button type="submit" form="material" icon={Upload} loading={save.isPending} disabled={kind === 'file' ? !file : !url}>Post</Button></>}
    >
      <form id="material" onSubmit={onSubmit(() => save.mutate(undefined))} className="space-y-4">
        {save.error && <Alert>{errorMessage(save.error, 'Upload failed.')}</Alert>}
        <div className="flex gap-2">
          {(['file', 'link'] as const).map((k) => (
            <button key={k} type="button" onClick={() => setKind(k)} className={`flex-1 rounded-lg px-3 py-2 text-base font-bold uppercase tracking-wide ring-1 transition ${kind === k ? 'bg-brand text-white ring-transparent' : 'text-slate-600 ring-slate-300 dark:text-slate-300 dark:ring-white/10'}`}>
              {k === 'file' ? 'Upload a file' : 'Add a link'}
            </button>
          ))}
        </div>
        <Field label="Title"><Input required maxLength={150} value={title} onChange={(e) => setTitle(e.target.value)} /></Field>
        {kind === 'file' ? (
          <Field label="File" hint="PDF, Word (.docx), JPG, PNG or MP4 video, up to 50 MB">
            <Input type="file" accept={LMS_FILE_ACCEPT} required onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
          </Field>
        ) : (
          <Field label="Link" hint="Web page, YouTube or Vimeo video"><Input type="url" required placeholder="https://" value={url} onChange={(e) => setUrl(e.target.value)} /></Field>
        )}
        <Field label="Description"><TextArea maxLength={2000} value={description} onChange={(e) => setDescription(e.target.value)} /></Field>
      </form>
    </Modal>
  );
}
