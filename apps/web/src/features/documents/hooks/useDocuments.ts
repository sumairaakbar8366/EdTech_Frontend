import { useQuery } from '@tanstack/react-query';
import { documentService } from '@/features/documents/services/documentService';
import type { DocumentOwnerType } from '@/features/documents/types/document.types';

export const documentsKey = (ownerType: DocumentOwnerType, ownerId: string) => ['documents', ownerType, ownerId] as const;

export const useDocuments = (ownerType: DocumentOwnerType, ownerId: string, enabled = true) =>
  useQuery({ queryKey: documentsKey(ownerType, ownerId), queryFn: () => documentService.list(ownerType, ownerId), enabled: enabled && !!ownerId });
