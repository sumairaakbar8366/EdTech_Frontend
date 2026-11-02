import { useQuery } from '@tanstack/react-query';
import { useAction } from '@/lib/hooks/useAction';
import { api, upload } from '@/services/api/http';

// The school's own online admission form (mirrors the API's admissions/admission-form.ts).

export const FIELD_TYPES = ['text', 'textarea', 'number', 'email', 'phone', 'date', 'select', 'multiselect', 'checkbox', 'file'] as const;
export type FieldType = (typeof FIELD_TYPES)[number];
export const FIELD_TYPE_LABEL: Record<FieldType, string> = {
  text: 'Short answer',
  textarea: 'Paragraph',
  number: 'Number',
  email: 'Email',
  phone: 'Phone number',
  date: 'Date',
  select: 'Dropdown (one choice)',
  multiselect: 'Checkboxes (several choices)',
  checkbox: 'Tick box (yes / I agree)',
  file: 'Document upload',
};

export type FormSection = 'student' | 'guardian' | 'additional' | 'documents';
export const SECTION_LABEL: Record<FormSection, string> = { student: 'Student', guardian: 'Parent / guardian', additional: 'Additional information', documents: 'Documents' };

export type OptionalBuiltin = 'photo' | 'gender' | 'previousSchool' | 'guardianEmail' | 'address' | 'notes';
export const BUILTIN_DEFAULT_LABEL: Record<OptionalBuiltin, string> = {
  photo: 'Student photo',
  gender: 'Gender',
  previousSchool: 'Previous school',
  guardianEmail: 'Email',
  address: 'Address',
  notes: 'Anything we should know?',
};
/** Always asked: enrollment needs them. */
export const CORE_FIELDS = ['Class applying for', 'Campus (when there is more than one)', 'Session (when there is more than one)', "Student's first and last name", 'Date of birth', "Parent's first and last name", 'Relationship', 'Mobile number'];

/** Student-record details an answer can be saved to on enrollment (mirrors the API's SAVE_TARGETS). */
const TEXTISH: FieldType[] = ['text', 'textarea', 'select'];
export const SAVE_TARGETS = {
  'student.nationalId': { label: "Student's B-Form / ID number", group: 'Student', types: ['text'], max: 40 },
  'student.bloodGroup': { label: 'Blood group', group: 'Student', types: ['select', 'text'], max: 3 },
  'student.religion': { label: 'Religion', group: 'Student', types: TEXTISH, max: 60 },
  'student.nationality': { label: 'Nationality', group: 'Student', types: TEXTISH, max: 60 },
  'guardian.occupation': { label: "Parent's occupation", group: 'Parent', types: TEXTISH, max: 100 },
  'guardian.nationalId': { label: "Parent's CNIC / ID number", group: 'Parent', types: ['text'], max: 40 },
  'medical.allergies': { label: 'Allergies', group: 'Medical', types: TEXTISH, max: 1000 },
  'medical.conditions': { label: 'Medical conditions', group: 'Medical', types: TEXTISH, max: 1000 },
  'medical.medications': { label: 'Medications', group: 'Medical', types: TEXTISH, max: 1000 },
  'medical.doctorName': { label: "Doctor's name", group: 'Medical', types: ['text'], max: 120 },
  'medical.doctorPhone': { label: "Doctor's phone", group: 'Medical', types: ['phone', 'text'], max: 32 },
  'emergency.name': { label: 'Emergency contact: name', group: 'Emergency contact', types: ['text'], max: 120 },
  'emergency.relationship': { label: 'Emergency contact: relationship', group: 'Emergency contact', types: TEXTISH, max: 60 },
  'emergency.phone': { label: 'Emergency contact: phone', group: 'Emergency contact', types: ['phone', 'text'], max: 32 },
  'previousSchool.lastClass': { label: 'Previous school: last class', group: 'Previous school', types: TEXTISH, max: 60 },
  'previousSchool.leftOn': { label: 'Previous school: date left', group: 'Previous school', types: ['date'], max: 10 },
  'previousSchool.reason': { label: 'Previous school: reason for leaving', group: 'Previous school', types: TEXTISH, max: 500 },
} satisfies Record<string, { label: string; group: string; types: FieldType[]; max: number }>;
export type SaveTarget = keyof typeof SAVE_TARGETS;
export const targetsFor = (type: FieldType) => (Object.keys(SAVE_TARGETS) as SaveTarget[]).filter((t) => (SAVE_TARGETS[t].types as FieldType[]).includes(type));

export interface BuiltinSetting { enabled: boolean; required: boolean; label: string | null }
export interface FormField {
  id: string;
  type: FieldType;
  label: string;
  section: FormSection;
  help: string | null;
  required: boolean;
  options: string[];
  minLength: number | null;
  maxLength: number | null;
  min: number | null;
  max: number | null;
  classIds: string[];
  /** Copied to this student-record detail when the applicant is enrolled. */
  saveTo: SaveTarget | null;
}
export interface AdmissionForm {
  intro: string | null;
  builtins: Record<OptionalBuiltin, BuiltinSetting>;
  fields: FormField[];
}

export type AnswerValue = string | number | boolean | string[] | { documentId: string; fileName: string };
export interface FormAnswer { fieldId: string; label: string; type: FieldType; section: FormSection; saveTo: SaveTarget | null; value: AnswerValue }

export const builtinLabel = (form: AdmissionForm, k: OptionalBuiltin) => form.builtins[k].label || BUILTIN_DEFAULT_LABEL[k];
export const fieldsForClass = (form: AdmissionForm, classId: string) => form.fields.filter((f) => !f.classIds.length || f.classIds.includes(classId));
export const newFieldId = () => `f${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

/** Longest answer a field may allow (and the default without a limit), as on the server. */
export const TEXT_LIMIT = { text: 200, textarea: 3000 } as const;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE = /^\+?[0-9 ()-]{7,24}$/;
const empty = (v: unknown) => v === undefined || v === null || (typeof v === 'string' && v.trim() === '') || (Array.isArray(v) && v.length === 0);

/** The same checks the server makes, for instant feedback; the server's answer is final. */
export function checkAnswer(f: FormField, v: unknown): string | null {
  if (empty(v) || (f.type === 'checkbox' && v === false)) {
    if (!f.required) return null;
    return f.type === 'checkbox' ? 'Please tick this box' : f.type === 'file' ? 'Please attach this document' : 'This field is required';
  }
  const s = typeof v === 'string' ? v.trim() : '';
  switch (f.type) {
    case 'text':
    case 'textarea': {
      const max = f.maxLength ?? TEXT_LIMIT[f.type];
      if (f.minLength !== null && s.length < f.minLength) return `Enter at least ${f.minLength} characters`;
      return s.length > max ? `Enter at most ${max} characters` : null;
    }
    case 'number': {
      const n = Number(s);
      if (s === '' || !Number.isFinite(n)) return 'Enter a number';
      if (f.min !== null && n < f.min) return `Enter ${f.min} or more`;
      return f.max !== null && n > f.max ? `Enter ${f.max} or less` : null;
    }
    case 'email': return EMAIL.test(s) ? null : 'Enter a valid email address';
    case 'phone': return PHONE.test(s) && s.replace(/\D/g, '').length >= 7 ? null : 'Enter a valid phone number, e.g. 0300 1234567';
    default: return null;
  }
}

export const admissionFormService = {
  get: () => api<{ form: AdmissionForm; classes: { id: string; name: string }[] }>('/website/admission-form'),
  save: (form: AdmissionForm) => api<AdmissionForm>('/website/admission-form', { method: 'PUT', body: form }),
  /** Website: uploads a document before the form is sent; the form sends the returned id. */
  stageFile: (file: File) => {
    const form = new FormData();
    form.append('file', file);
    return upload<{ fileId: string; fileName: string }>('/public/admission-files', form);
  },
};

const KEY = ['website', 'admission-form'] as const;
export const useAdmissionFormAdmin = () => useQuery({ queryKey: KEY, queryFn: admissionFormService.get });
export const useSaveAdmissionForm = () => useAction(admissionFormService.save, { success: 'Admission form saved: it is live on your website', invalidate: [['website']] });
