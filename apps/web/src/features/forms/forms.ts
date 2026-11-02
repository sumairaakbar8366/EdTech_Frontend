import { useQuery } from '@tanstack/react-query';
import { documentService } from '@/features/documents/services/documentService';
import { api } from '@/services/api/http';

// Custom forms: a form somebody designs (the platform owner, or a school's admin / principal) and the
// answers people give to it. The fields the system itself needs are built in; these are added on top.

export const FIELD_TYPES = ['text', 'textarea', 'number', 'email', 'phone', 'date', 'select', 'multiselect', 'checkbox', 'file'] as const;
export type FieldType = (typeof FIELD_TYPES)[number];

export const FIELD_TYPE_LABEL: Record<FieldType, string> = {
  text: 'Short answer', textarea: 'Paragraph', number: 'Number', email: 'Email', phone: 'Phone number', date: 'Date', select: 'Dropdown (one choice)', multiselect: 'Checkboxes (several choices)', checkbox: 'Tick box (yes / I agree)', file: 'Document upload',
};

/** Headings a school can group its fields under. */
export const FIELD_SECTIONS = ['Personal', 'Contact', 'Family', 'Education', 'Health', 'Documents', 'Additional information'] as const;

export interface CustomField {
  id: string;
  type: FieldType;
  label: string;
  section: string | null;
  help: string | null;
  required: boolean;
  options: string[];
  minLength: number | null;
  maxLength: number | null;
  min: number | null;
  max: number | null;
}
export interface CustomForm { intro: string | null; fields: CustomField[] }
export interface FileAnswer { documentId: string; fileName: string }
export type AnswerValue = string | number | boolean | string[] | FileAnswer;
/** Documents chosen but not yet uploaded (they upload once the person is saved). */
export type PendingFiles = Record<string, File>;
export type Answers = Record<string, AnswerValue>;

export type FormKind = 'teacher' | 'staff' | 'student' | 'guardian' | 'access';
export type AnswerSubject = 'employee' | 'student' | 'guardian';

export interface SchoolFormInfo { kind: FormKind; title: string; for: string; form: CustomForm; updatedAt: string | null }

export const emptyField = (n: number): CustomField => ({ id: `field-${n}`, type: 'text', label: '', section: null, help: null, required: false, options: [], minLength: null, maxLength: null, min: null, max: null });

export const formsService = {
  all: () => api<SchoolFormInfo[]>('/forms'),
  save: (kind: FormKind, form: CustomForm) => api<SchoolFormInfo>(`/forms/${kind}`, { method: 'PUT', body: form }),
  answers: (subject: AnswerSubject, id: string) => api<{ kind: FormKind; form: CustomForm; answers: Answers }>(`/forms/answers/${subject}/${id}`),
  saveAnswers: (subject: AnswerSubject, id: string, answers: Answers) => api<{ kind: FormKind; form: CustomForm; answers: Answers }>(`/forms/answers/${subject}/${id}`, { method: 'PUT', body: { answers } }),
};

export const FORMS_KEY = ['school-forms'] as const;
export const useSchoolForms = (enabled = true) => useQuery({ queryKey: FORMS_KEY, queryFn: formsService.all, enabled });
export const useAnswers = (subject: AnswerSubject, id: string | undefined) => useQuery({ queryKey: ['custom-answers', subject, id], queryFn: () => formsService.answers(subject, id!), enabled: !!id });

/** A field's answer as readable text ("Yes", "Math, Art", "12 Mar 2026"). */
export function answerText(f: CustomField, v: AnswerValue | undefined): string {
  if (v === undefined || v === '' || (Array.isArray(v) && v.length === 0)) return '—';
  if (f.type === 'checkbox') return v ? 'Yes' : 'No';
  if (f.type === 'file') return typeof v === 'object' && !Array.isArray(v) ? v.fileName : '—';
  if (Array.isArray(v)) return v.join(', ');
  if (f.type === 'date' && typeof v === 'string') return new Date(`${v}T00:00:00Z`).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
  return String(v);
}

/** Checks required fields on the client so the person sees what is missing before sending. */
export function missingRequired(form: CustomForm, answers: Answers, files: PendingFiles = {}): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const f of form.fields) {
    const v = answers[f.id];
    const empty = (f.type === 'file' && !files[f.id] && !v) || (f.type !== 'file' && (v === undefined || v === '')) || (Array.isArray(v) && v.length === 0) || (f.type === 'checkbox' && v === false);
    if (f.required && empty) errors[f.id] = 'Required';
  }
  return errors;
}

/** Uploads the documents chosen on a form to the person's documents and returns the answers with them filled in. */
export async function withUploadedFiles(subject: AnswerSubject, id: string, form: CustomForm, answers: Answers, files: PendingFiles): Promise<Answers> {
  const next = { ...answers };
  for (const f of form.fields) {
    const file = files[f.id];
    if (f.type !== 'file' || !file) continue;
    const doc = await documentService.upload({ ownerType: subject, ownerId: id, category: 'other', title: f.label.slice(0, 150), file });
    next[f.id] = { documentId: doc.id, fileName: doc.fileName };
  }
  return next;
}

/** Fields grouped by their heading, in order of first use. */
export function bySection(form: CustomForm): { section: string; fields: CustomField[] }[] {
  const groups = new Map<string, CustomField[]>();
  for (const f of form.fields) groups.set(f.section ?? 'Additional information', [...(groups.get(f.section ?? 'Additional information') ?? []), f]);
  return [...groups.entries()].map(([section, fields]) => ({ section, fields }));
}
