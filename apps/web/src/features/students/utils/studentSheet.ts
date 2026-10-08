import type { ImportSpec } from '@/components/shared/ImportDialog';
import { academicsService } from '@/features/academics/services/academicsService';
import type { SchoolClass } from '@/features/academics/types/academics.types';
import { RELATION_LABEL } from '@/features/students/constants';
import { STUDENTS_KEY } from '@/features/students/hooks/useStudents';
import { studentService } from '@/features/students/services/studentService';
import type { CreateStudentPayload, StudentListItem } from '@/features/students/types/student.types';
import { blankToNull, digits, GENDER_OPTIONS, parseChoice, parseDate, parseNumber, RELATION_OPTIONS } from '@/lib/importParsers';
import type { ExportColumn } from '@/lib/spreadsheet';

/** Students list export: one row per student with the primary parent and current class. */
export const STUDENT_EXPORT: ExportColumn<StudentListItem>[] = [
  { header: 'Admission no.', value: (s) => s.admissionNo },
  { header: 'First name', value: (s) => s.firstName },
  { header: 'Last name', value: (s) => s.lastName },
  { header: 'Gender', value: (s) => s.gender ?? '' },
  { header: 'Date of birth', value: (s) => new Date(s.dateOfBirth) },
  { header: 'Class', value: (s) => s.enrollments[0]?.section.schoolClass.name ?? '' },
  { header: 'Section', value: (s) => s.enrollments[0]?.section.name ?? '' },
  { header: 'Roll no.', value: (s) => s.enrollments[0]?.rollNo ?? null },
  { header: 'Status', value: (s) => s.status },
  { header: 'Parent name', value: (s) => (s.guardians[0] ? `${s.guardians[0].guardian.firstName} ${s.guardians[0].guardian.lastName}` : '') },
  { header: 'Relationship', value: (s) => (s.guardians[0] ? RELATION_LABEL[s.guardians[0].relationship] : '') },
  { header: 'Parent phone', value: (s) => s.guardians[0]?.guardian.phone ?? '' },
  { header: 'Student login', value: (s) => (s.userId ? 'Yes' : 'No') },
];

interface Ctx {
  classes: SchoolClass[];
}

/** Finds the section by class + section name (+ campus when the name exists at several campuses). */
function findSection(ctx: Ctx, className: string, sectionName: string, campus: string): string | { error: string } {
  const norm = (s: string) => s.toLowerCase().replace(/\s+/g, '').replace(/^(grade|class)/, '');
  const cls = ctx.classes.find((c) => norm(c.name) === norm(className));
  if (!cls) return { error: `Class "${className}" not found` };
  let sections = cls.sections.filter((s) => s.name.toLowerCase() === sectionName.toLowerCase());
  if (campus) sections = sections.filter((s) => [s.campus.name, s.campus.code].some((x) => x?.toLowerCase() === campus.toLowerCase()));
  if (sections.length === 0) return { error: `Section "${sectionName}" not found in ${cls.name}${campus ? ` at ${campus}` : ''}` };
  if (sections.length > 1) return { error: `${cls.name} ${sectionName} exists at several campuses; fill the Campus column` };
  return sections[0]!.id;
}

type Payload = CreateStudentPayload & { parentPhoneDigits: string };

/**
 * Students import (with parents). A parent whose phone number already belongs to a parent in the
 * school is linked (siblings), otherwise a new parent record is created.
 */
export const STUDENT_IMPORT: ImportSpec<Payload, Ctx> = {
  title: 'Import students',
  name: 'Students',
  notes: ['Siblings are linked automatically: if the parent phone matches an existing parent, the student is added to that family.'],
  columns: [
    { key: 'firstName', header: 'First name', required: true, example: 'Ayesha' },
    { key: 'lastName', header: 'Last name', required: true, example: 'Khan' },
    { key: 'gender', header: 'Gender', hint: 'Male / Female', example: 'Female' },
    { key: 'dateOfBirth', header: 'Date of birth', required: true, hint: 'DD/MM/YYYY or YYYY-MM-DD', aliases: ['DOB', 'Birth date'], example: '14/08/2018' },
    { key: 'admissionDate', header: 'Admission date', hint: 'Empty = today', example: '01/04/2026' },
    { key: 'admissionNo', header: 'Admission no.', hint: 'Empty = automatic (ADM-0001…)', aliases: ['Admission number', 'GR no', 'Reg no'], example: '' },
    { key: 'className', header: 'Class', hint: 'As in Academics, e.g. Grade 3', example: 'Grade 3' },
    { key: 'section', header: 'Section', hint: 'Needed with Class', example: 'A' },
    { key: 'campus', header: 'Campus', hint: 'Only if the section exists at several campuses (name or code)', example: '' },
    { key: 'rollNo', header: 'Roll no.', hint: 'Number', example: '12' },
    { key: 'bloodGroup', header: 'Blood group', hint: 'A+, B-, O+, AB+ …', example: 'B+' },
    { key: 'nationalId', header: 'B-Form / national ID', aliases: ['B-Form', 'CNIC', 'National ID'], example: '' },
    { key: 'address', header: 'Home address', aliases: ['Address'], example: 'House 12, Street 4, Model Town, Lahore' },
    { key: 'parentFirstName', header: 'Parent first name', required: true, aliases: ['Father name', 'Guardian first name'], example: 'Imran' },
    { key: 'parentLastName', header: 'Parent last name', required: true, aliases: ['Guardian last name'], example: 'Khan' },
    { key: 'relationship', header: 'Relationship', hint: 'Father / Mother / Guardian / Grandparent / Sibling / Other (empty = Father)', example: 'Father' },
    { key: 'parentPhone', header: 'Parent phone', required: true, aliases: ['Phone', 'Mobile', 'Contact'], example: '+92 300 1234567' },
    { key: 'parentEmail', header: 'Parent email', example: 'imran.khan@gmail.com' },
    { key: 'parentOccupation', header: 'Parent occupation', aliases: ['Occupation'], example: 'Engineer' },
  ],
  prepare: async () => ({ classes: await academicsService.classes() }),
  toPayload: (r, ctx) => {
    const dateOfBirth = parseDate(r.dateOfBirth!);
    if (!dateOfBirth) return `Date of birth "${r.dateOfBirth}" is not a date`;
    const admissionDate = r.admissionDate ? parseDate(r.admissionDate) : new Date().toISOString().slice(0, 10);
    if (!admissionDate) return `Admission date "${r.admissionDate}" is not a date`;
    const gender = r.gender ? parseChoice(r.gender, GENDER_OPTIONS) : null;
    if (r.gender && !gender) return `Gender "${r.gender}" should be Male or Female`;
    const relationship = r.relationship ? parseChoice(r.relationship, RELATION_OPTIONS) : 'father';
    if (!relationship) return `Relationship "${r.relationship}" is not one of the allowed values`;
    if (digits(r.parentPhone!).length < 10) return `Parent phone "${r.parentPhone}" looks incomplete`;
    if (r.bloodGroup && !/^(A|B|AB|O)[+-]$/i.test(r.bloodGroup.replace(/\s/g, ''))) return `Blood group "${r.bloodGroup}" should look like B+ or O-`;
    let enrollment: CreateStudentPayload['enrollment'];
    if (r.className || r.section) {
      if (!r.className || !r.section) return 'Fill both Class and Section (or neither)';
      const section = findSection(ctx, r.className, r.section, r.campus ?? '');
      if (typeof section !== 'string') return section.error;
      const roll = r.rollNo ? parseNumber(r.rollNo) : null;
      if (r.rollNo && (roll === null || !Number.isInteger(roll) || roll < 1)) return `Roll no. "${r.rollNo}" should be a whole number`;
      enrollment = { sectionId: section, rollNo: roll };
    }
    return {
      ...(r.admissionNo && { admissionNo: r.admissionNo.toUpperCase().replace(/\s+/g, '-') }),
      firstName: r.firstName!,
      lastName: r.lastName!,
      gender,
      dateOfBirth,
      admissionDate,
      profile: { bloodGroup: r.bloodGroup ? r.bloodGroup.replace(/\s/g, '').toUpperCase() : null, nationalId: blankToNull(r.nationalId ?? ''), address: blankToNull(r.address ?? '') },
      guardians: [{ details: { firstName: r.parentFirstName!, lastName: r.parentLastName!, phone: r.parentPhone!, email: blankToNull(r.parentEmail ?? ''), occupation: blankToNull(r.parentOccupation ?? '') }, relationship, isPrimary: true }],
      ...(enrollment && { enrollment }),
      parentPhoneDigits: digits(r.parentPhone!),
    };
  },
  create: async ({ parentPhoneDigits, ...payload }) => {
    // Link an existing parent with the same phone (siblings) instead of creating a duplicate.
    const [match] = await studentService.guardiansByPhone(parentPhoneDigits);
    const guardian = payload.guardians[0]!;
    const guardians = match ? [{ guardianId: match.id, relationship: guardian.relationship, isPrimary: true as const }] : payload.guardians;
    return studentService.create({ ...payload, guardians });
  },
  invalidate: [STUDENTS_KEY],
};
