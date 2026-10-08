import { FileText, FileType2, Image, Link2, Video, type LucideIcon } from 'lucide-react';
import type { Tone } from '@/components/ui';
import type { MaterialType } from '@/features/lms/types/lms.types';

export const MATERIAL_VISUAL: Record<MaterialType, [LucideIcon, Tone, string]> = {
  pdf: [FileText, 'rose', 'PDF'],
  document: [FileType2, 'sky', 'Word'],
  video: [Video, 'magenta', 'Video'],
  image: [Image, 'teal', 'Image'],
  link: [Link2, 'amber', 'Link'],
};

/** File types teachers and students may upload (matches the API's LMS_TYPES). */
export const LMS_FILE_ACCEPT = '.pdf,.docx,.png,.jpg,.jpeg,.mp4';
