import type { ImportSpec } from '@/components/shared/ImportDialog';
import { ADMISSION_LABEL } from '@/features/admissions/constants';
import { ADMISSIONS_KEY } from '@/features/admissions/hooks/useAdmissions';
import { admissionService, type ApplicationPayload } from '@/features/admissions/services/admissionService';
import type { AdmissionApplication } from '@/features/admissions/types/admission.types';
import { academicsService } from '@/features/academics/services/academicsService';
import type { Campus, SchoolClass } from '@/features/academics/types/academics.types';
import { campusService } from '@/features/campuses/services/campusService';
import { RELATION_LABEL } from '@/features/students/constants';
import { blankToNull, digits, GENDER_OPTIONS, parseChoice, parseDate, RELATION_OPTIONS } from '@/lib/importParsers';
import type { ExportColumn } from '@/lib/spreadsheet';

export const ADMISSION_EXPORT: ExportColumn<AdmissionApplication>[] = [
  { header: 'Application no.', value: (a) => a.applicationNo },
  { header: 'Applied on', value: (a) => new Date(a.createdAt) },
  { header: 'Status', value: (a) => ADMISSION_LABEL[a.status] },
  { header: 'Session', value: (a) => a.academicYear.name },
  { header: 'Class', value: (a) => a.schoolClass.name },
  { header: 'Campus', value: (a) => a.campus.name },
  { header: 'Child first name', value: (a) => a.firstName },
  { header: 'Child last name', value: (a) => a.lastName },
  { header: 'Gender', value: (a) => a.gender ?? '' },
  { header: 'Date of birth', value: (a) => new Date(a.dateOfBirth) },
  { header: 'Previous school', value: (a) => a.previousSchool ?? '' },
  { header: 'Parent name', value: (a) => `${a.guardianFirstName} ${a.guardianLastName}` },
  { header: 'Relationship', value: (a) => RELATION_LABEL[a.guardianRelation] },
  { header: 'Parent phone', value: (a) => a.guardianPhone },
  { header: 'Parent email', value: (a) => a.guardianEmail ?? '' },
  { header: 'Address', value: (a) => a.address ?? '', width: 32 },
];

export const ADMISSION_IMPORT: ImportSpec<ApplicationPayload, { classes: SchoolClass[]; campuses: Campus[] }> = {
  title: 'Import admission applications',
  name: 'Admissions',
  notes: ['Applications are created as "Submitted" for the current session; review them in the pipeline as usual.'],
  columns: [
    { key: 'className', header: 'Class', required: true, hint: 'Applying for, e.g. Grade 1', example: 'Grade 1' },
    { key: 'campus', header: 'Campus', hint: 'Name or code; empty = first campus', example: 'Main Campus' },
    { key: 'firstName', header: 'Child first name', required: true, aliases: ['First name'], example: 'Hareem' },
    { key: 'lastName', header: 'Child last name', required: true, aliases: ['Last name'], example: 'Fatima' },
    { key: 'gender', header: 'Gender', hint: 'Male / Female', example: 'Female' },
    { key: 'dateOfBirth', header: 'Date of birth', required: true, hint: 'DD/MM/YYYY', aliases: ['DOB'], example: '11/03/2021' },
    { key: 'previousSchool', header: 'Previous school', example: '' },
    { key: 'guardianFirstName', header: 'Parent first name', required: true, aliases: ['Father name'], example: 'Kamran' },
    { key: 'guardianLastName', header: 'Parent last name', required: true, example: 'Fatima' },
    { key: 'relation', header: 'Relationship', hint: 'Father / Mother / Guardian … (empty = Father)', example: 'Father' },
    { key: 'phone', header: 'Parent phone', required: true, aliases: ['Phone', 'Mobile'], example: '+92 300 1234567' },
    { key: 'email', header: 'Parent email', example: '' },
    { key: 'address', header: 'Address', example: 'Gulberg, Lahore' },
    { key: 'notes', header: 'Notes', example: '' },
  ],
  prepare: async () => {
    const [classes, campuses] = await Promise.all([academicsService.classes(), campusService.list()]);
    return { classes, campuses };
  },
  toPayload: (r, { classes, campuses }) => {
    const norm = (s: string) => s.toLowerCase().replace(/\s+/g, '').replace(/^(grade|class)/, '');
    const cls = classes.find((c) => norm(c.name) === norm(r.className!));
    if (!cls) return `Class "${r.className}" not found`;
    const campus = r.campus ? campuses.find((c) => [c.name, c.code].some((x) => x.toLowerCase() === r.campus!.toLowerCase())) : campuses[0];
    if (!campus) return `Campus "${r.campus}" not found`;
    const dateOfBirth = parseDate(r.dateOfBirth!);
    if (!dateOfBirth) return `Date of birth "${r.dateOfBirth}" is not a date`;
    const gender = r.gender ? parseChoice(r.gender, GENDER_OPTIONS) : null;
    if (r.gender && !gender) return `Gender "${r.gender}" should be Male or Female`;
    const guardianRelation = r.relation ? parseChoice(r.relation, RELATION_OPTIONS) : 'father';
    if (!guardianRelation) return `Relationship "${r.relation}" is not allowed`;
    if (digits(r.phone!).length < 10) return `Phone "${r.phone}" looks incomplete`;
    return {
      classId: cls.id, campusId: campus.id, firstName: r.firstName!, lastName: r.lastName!, gender, dateOfBirth,
      previousSchool: blankToNull(r.previousSchool ?? ''), guardianFirstName: r.guardianFirstName!, guardianLastName: r.guardianLastName!,
      guardianRelation, guardianPhone: r.phone!, guardianEmail: blankToNull(r.email ?? ''), address: blankToNull(r.address ?? ''), notes: blankToNull(r.notes ?? ''),
    };
  },
  create: (p) => admissionService.create(p),
  invalidate: [ADMISSIONS_KEY],
};
