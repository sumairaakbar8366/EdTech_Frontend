import { Download, FileText, Image as ImageIcon, Paperclip, Trash2, Upload } from 'lucide-react';
import { useRef, useState } from 'react';
import { Button, Card, ConfirmDialog, EmptyState, Field, IconButton, Input, Select, Spinner } from '@/components/ui';
import { useToast } from '@/components/ui/Toast/Toast';
import { documentsKey, useDocuments } from '@/features/documents/hooks/useDocuments';
import { documentService } from '@/features/documents/services/documentService';
import type { DocumentOwnerType as OwnerType, DocumentRecord } from '@/features/documents/types/document.types';
import { errorMessage } from '@/lib/errors';
import { onSubmit } from '@/lib/forms';
import { formatDate } from '@/lib/format';
import { useAction } from '@/lib/hooks/useAction';

const size = (n: number) => (n < 1024 * 1024 ? `${Math.max(1, Math.round(n / 1024))} KB` : `${(n / 1024 / 1024).toFixed(1)} MB`);

/** Files attached to a record. Upload/delete controls appear only when `canEdit`. */
export function DocumentsPanel({
  ownerType,
  ownerId,
  canEdit,
  categories,
  title = 'Documents',
}: {
  ownerType: OwnerType;
  ownerId: string;
  canEdit: boolean;
  categories: { value: string; label: string }[];
  title?: string;
}) {
  const toast = useToast();
  const docs = useDocuments(ownerType, ownerId);
  const invalidate = [documentsKey(ownerType, ownerId)];
  const fileInput = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [docTitle, setDocTitle] = useState('');
  const [category, setCategory] = useState(categories[0]?.value ?? 'other');
  const [removing, setRemoving] = useState<DocumentRecord | null>(null);

  const add = useAction(() => documentService.upload({ ownerType, ownerId, category, title: docTitle || file!.name, file: file! }), {
    success: 'Document uploaded',
    invalidate,
    onDone: () => {
      setFile(null);
      setDocTitle('');
      if (fileInput.current) fileInput.current.value = '';
    },
  });
  const remove = useAction(documentService.remove, { success: 'Document deleted', invalidate, onDone: () => setRemoving(null) });

  const label = (v: string) => categories.find((c) => c.value === v)?.label ?? v;

  return (
    <Card title={title} icon={Paperclip} tone="slate">
      {docs.isLoading && <Spinner />}
      {docs.data?.length === 0 && <EmptyState icon={FileText} title="No documents yet" tone="slate" />}
      <ul className="divide-y divide-slate-200/70 dark:divide-white/5">
        {docs.data?.map((d) => (
          <li key={d.id} className="flex items-center gap-3 py-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-500 dark:bg-white/5">
              {d.mimeType.startsWith('image/') ? <ImageIcon size={18} /> : <FileText size={18} />}
            </span>
            <div className="min-w-0 flex-1">
              <div className="truncate font-semibold text-slate-800 dark:text-slate-100">{d.title}</div>
              <div className="text-sm text-slate-500 dark:text-slate-400">{label(d.category)} · {size(d.sizeBytes)} · {formatDate(d.createdAt)}</div>
            </div>
            <IconButton
              icon={Download}
              label={`Download ${d.title}`}
              onClick={() => documentService.download(d).catch((e) => toast.error(errorMessage(e, 'Download failed')))}
            />
            {canEdit && <IconButton icon={Trash2} label={`Delete ${d.title}`} tone="danger" onClick={() => setRemoving(d)} />}
          </li>
        ))}
      </ul>

      {canEdit && (
        <form
          onSubmit={onSubmit(() => file && add.mutate(undefined))}
          className="mt-4 grid gap-3 border-t border-slate-200 pt-4 sm:grid-cols-[1fr_1fr_auto] dark:border-white/5"
        >
          <Field label="Type">
            <Select value={category} onChange={(e) => setCategory(e.target.value)}>
              {categories.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </Select>
          </Field>
          <Field label="Title (optional)">
            <Input maxLength={150} value={docTitle} onChange={(e) => setDocTitle(e.target.value)} placeholder={file?.name ?? ''} />
          </Field>
          <div className="flex items-end">
            <Button type="button" variant="secondary" icon={Paperclip} onClick={() => fileInput.current?.click()}>{file ? 'Change file' : 'Choose file'}</Button>
          </div>
          <input
            ref={fileInput}
            type="file"
            accept=".pdf,.docx,.jpg,.jpeg,.png"
            className="hidden"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
          <div className="flex items-center justify-between gap-3 sm:col-span-3">
            <span className="truncate text-sm text-slate-500 dark:text-slate-400">{file ? `${file.name} (${size(file.size)})` : 'PDF, Word, JPG or PNG, up to 10 MB'}</span>
            <Button type="submit" icon={Upload} disabled={!file} loading={add.isPending}>Upload</Button>
          </div>
        </form>
      )}

      <ConfirmDialog
        open={!!removing}
        title="Delete document?"
        message={`“${removing?.title}” will be permanently deleted.`}
        loading={remove.isPending}
        onConfirm={() => removing && remove.mutate(removing.id)}
        onClose={() => setRemoving(null)}
      />
    </Card>
  );
}
