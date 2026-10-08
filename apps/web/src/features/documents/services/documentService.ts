import type { DocumentOwnerType, DocumentRecord } from '@/features/documents/types/document.types';
import { api, download, upload } from '@/services/api/http';

/** Files attached to a student, employee, guardian, application or the school. */
export const documentService = {
  list: (ownerType: DocumentOwnerType, ownerId: string) => api<DocumentRecord[]>(`/documents?ownerType=${ownerType}&ownerId=${ownerId}`),
  upload: (d: { ownerType: DocumentOwnerType; ownerId: string; category: string; title: string; file: File }) => {
    const form = new FormData();
    form.set('ownerType', d.ownerType);
    form.set('ownerId', d.ownerId);
    form.set('category', d.category);
    form.set('title', d.title);
    form.set('file', d.file);
    return upload<DocumentRecord>('/documents', form);
  },
  remove: (id: string) => api(`/documents/${id}`, { method: 'DELETE' }),
  download: (d: Pick<DocumentRecord, 'id' | 'fileName'>) => download(`/documents/${d.id}/download`, d.fileName),
};
