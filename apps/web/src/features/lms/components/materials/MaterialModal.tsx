import { Download, ExternalLink } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Alert, Badge, Button, Modal, Spinner } from '@/components/ui';
import { useToast } from '@/components/ui/Toast/Toast';
import { MaterialDiscussion } from '@/features/lms/components/materials/MaterialDiscussion';
import { MATERIAL_VISUAL } from '@/features/lms/constants';
import { lmsService } from '@/features/lms/services/lmsService';
import type { Material } from '@/features/lms/types/lms.types';
import { embedUrl, fileSize, formatDateTime } from '@/features/lms/utils/lms.utils';
import { errorMessage } from '@/lib/errors';

/** Material viewer with its threaded discussion (page 10). */
export function MaterialModal({ material, canManage, canComment, onClose }: { material: Material | null; canManage: boolean; canComment: boolean; onClose: () => void }) {
  const [preview, setPreview] = useState<string | null>(null);
  const [previewError, setPreviewError] = useState(false);
  const toast = useToast();
  const inline = material && ['pdf', 'image', 'video'].includes(material.type);

  useEffect(() => {
    setPreview(null);
    setPreviewError(false);
    if (!material || !inline) return;
    let url: string | null = null;
    let live = true;
    lmsService.materialPreview(material.id)
      .then((u) => {
        url = u;
        if (live) setPreview(u);
      })
      .catch(() => live && setPreviewError(true));
    return () => {
      live = false;
      if (url) URL.revokeObjectURL(url);
    };
  }, [material, inline]);

  if (!material) return null;
  const [Icon, tone, label] = MATERIAL_VISUAL[material.type];
  const embed = material.url ? embedUrl(material.url) : null;

  return (
    <Modal open title={material.title} onClose={onClose} size="xl">
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
          <Badge tone={tone}><Icon size={13} /> {label}</Badge>
          {material.fileName && <span>{material.fileName} · {fileSize(material.fileSize)}</span>}
          <span>Posted {formatDateTime(material.createdAt)}</span>
          {!material.isPublished && <Badge tone="slate">draft</Badge>}
          <span className="ml-auto flex gap-2">
            {material.fileName && (
              <Button variant="secondary" icon={Download} onClick={() => lmsService.downloadMaterial(material).catch((e) => toast.error(errorMessage(e, 'Download failed')))}>
                Download
              </Button>
            )}
            {material.url && (
              <a href={material.url} target="_blank" rel="noreferrer noopener" className="focus-ring inline-flex items-center gap-2 rounded-lg bg-white/80 px-4 py-2 text-base font-bold uppercase tracking-wide text-slate-700 ring-1 ring-slate-200 dark:bg-white/5 dark:text-slate-200 dark:ring-white/10">
                <ExternalLink size={16} /> Open link
              </a>
            )}
          </span>
        </div>
        {material.description && <p className="whitespace-pre-wrap text-slate-700 dark:text-slate-200">{material.description}</p>}

        {inline && !preview && !previewError && <Spinner label="Loading preview…" />}
        {previewError && <Alert>Could not load the preview.</Alert>}
        {preview && material.type === 'pdf' && <iframe title={material.title} src={preview} className="h-[60vh] w-full rounded-xl border border-slate-200 bg-white dark:border-white/10" />}
        {preview && material.type === 'image' && <img src={preview} alt={material.title} className="mx-auto max-h-[60vh] rounded-xl object-contain" />}
        {preview && material.type === 'video' && <video src={preview} controls className="max-h-[60vh] w-full rounded-xl bg-black" />}
        {embed && (
          <div className="aspect-video overflow-hidden rounded-xl bg-black">
            <iframe title={material.title} src={embed} className="h-full w-full" allow="accelerometer; encrypted-media; gyroscope; picture-in-picture; fullscreen" sandbox="allow-scripts allow-same-origin allow-presentation" />
          </div>
        )}

        <MaterialDiscussion materialId={material.id} canManage={canManage} canComment={canComment} />
      </div>
    </Modal>
  );
}
