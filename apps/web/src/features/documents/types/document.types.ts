export interface DocumentRecord {
  id: string;
  category: string;
  title: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  createdAt: string;
}

export type DocumentOwnerType = 'student' | 'employee' | 'guardian' | 'admission_application' | 'school' | 'job_application';
