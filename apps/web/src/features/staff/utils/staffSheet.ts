import type { ImportSpec } from '@/components/shared/ImportDialog';
import type { Campus } from '@/features/academics/types/academics.types';
import { campusService } from '@/features/campuses/services/campusService';
import { STAFF_KEY } from '@/features/staff/hooks/useStaff';
import { staffService } from '@/features/staff/services/staffService';
import type { EmployeeListItem } from '@/features/staff/types/staff.types';
import type { StaffPayload } from '@/features/staff/utils/staff.utils';
import { blankToNull, GENDER_OPTIONS, parseChoice, parseDate } from '@/lib/importParsers';
import type { ExportColumn } from '@/lib/spreadsheet';

const TYPE_LABEL = { teaching: 'Teaching', non_teaching: 'Non-teaching' } as const;
const EMPLOYMENT_LABEL = { full_time: 'Full time', part_time: 'Part time', contract: 'Contract' } as const;
const STATUS_LABEL = { active: 'Active', on_leave: 'On leave', resigned: 'Resigned', terminated: 'Terminated' } as const;

export const STAFF_EXPORT: ExportColumn<EmployeeListItem>[] = [
  { header: 'Employee no.', value: (e) => e.employeeNo },
  { header: 'First name', value: (e) => e.firstName },
  { header: 'Last name', value: (e) => e.lastName },
  { header: 'Staff type', value: (e) => TYPE_LABEL[e.staffType] },
  { header: 'Designation', value: (e) => e.designation, width: 26 },
  { header: 'Department', value: (e) => e.department ?? '' },
  { header: 'Campus', value: (e) => e.campus.name },
  { header: 'Employment type', value: (e) => EMPLOYMENT_LABEL[e.employmentType] },
  { header: 'Joining date', value: (e) => new Date(e.joinDate) },
  { header: 'Email', value: (e) => e.email ?? '', width: 28 },
  { header: 'Phone', value: (e) => e.phone ?? '' },
  { header: 'Status', value: (e) => STATUS_LABEL[e.status] },
  { header: 'Has login', value: (e) => (e.userId ? 'Yes' : 'No') },
];

type Payload = StaffPayload & { employeeNo?: string };

export const STAFF_IMPORT: ImportSpec<Payload, { campuses: Campus[] }> = {
  title: 'Import staff',
  name: 'Staff',
  notes: ['Logins are not created by the import. Give access afterwards from Users & Access (a temporary password is generated).'],
  columns: [
    { key: 'firstName', header: 'First name', required: true, example: 'Sana' },
    { key: 'lastName', header: 'Last name', required: true, example: 'Javed' },
    { key: 'staffType', header: 'Staff type', required: true, hint: 'Teaching / Non-teaching', example: 'Teaching' },
    { key: 'designation', header: 'Designation', required: true, aliases: ['Job title', 'Post'], example: 'English Teacher' },
    { key: 'joinDate', header: 'Joining date', required: true, hint: 'DD/MM/YYYY or YYYY-MM-DD', aliases: ['Join date', 'Date of joining'], example: '01/08/2023' },
    { key: 'campus', header: 'Campus', hint: 'Name or code; empty = the only/first campus', example: 'Main Campus' },
    { key: 'department', header: 'Department', example: 'English' },
    { key: 'employmentType', header: 'Employment type', hint: 'Full time / Part time / Contract (empty = Full time)', example: 'Full time' },
    { key: 'employeeNo', header: 'Employee no.', hint: 'Empty = automatic (EMP-0001…)', aliases: ['Employee number', 'Staff ID'], example: '' },
    { key: 'email', header: 'Email', example: 'sana.javed@gmail.com' },
    { key: 'phone', header: 'Phone', aliases: ['Mobile'], example: '+92 321 1234567' },
    { key: 'gender', header: 'Gender', hint: 'Male / Female', example: 'Female' },
    { key: 'dateOfBirth', header: 'Date of birth', hint: 'DD/MM/YYYY', aliases: ['DOB'], example: '16/05/1991' },
    { key: 'nationalId', header: 'CNIC', aliases: ['National ID', 'National ID / CNIC'], example: '35202-1234567-8' },
    { key: 'address', header: 'Address', example: 'Township, Lahore' },
    { key: 'specialization', header: 'Specialization', hint: 'Teaching staff', example: 'English Literature' },
  ],
  prepare: async () => ({ campuses: await campusService.list() }),
  toPayload: (r, { campuses }) => {
    const staffType = parseChoice(r.staffType!, { teaching: ['teacher', 'academic'], non_teaching: ['nonteaching', 'support', 'admin', 'non teaching staff'] });
    if (!staffType) return `Staff type "${r.staffType}" should be Teaching or Non-teaching`;
    const joinDate = parseDate(r.joinDate!);
    if (!joinDate) return `Joining date "${r.joinDate}" is not a date`;
    const dateOfBirth = r.dateOfBirth ? parseDate(r.dateOfBirth) : null;
    if (r.dateOfBirth && !dateOfBirth) return `Date of birth "${r.dateOfBirth}" is not a date`;
    const gender = r.gender ? parseChoice(r.gender, GENDER_OPTIONS) : null;
    if (r.gender && !gender) return `Gender "${r.gender}" should be Male or Female`;
    const employmentType = r.employmentType ? parseChoice(r.employmentType, { full_time: ['fulltime', 'permanent', 'regular'], part_time: ['parttime'], contract: ['contractual', 'temporary'] }) : 'full_time';
    if (!employmentType) return `Employment type "${r.employmentType}" should be Full time, Part time or Contract`;
    const campus = r.campus ? campuses.find((c) => [c.name, c.code].some((x) => x.toLowerCase() === r.campus!.toLowerCase())) : campuses[0];
    if (!campus) return `Campus "${r.campus}" not found`;
    if (r.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(r.email)) return `Email "${r.email}" is not valid`;
    return {
      ...(r.employeeNo && { employeeNo: r.employeeNo.toUpperCase().replace(/\s+/g, '-') }),
      campusId: campus.id,
      firstName: r.firstName!,
      lastName: r.lastName!,
      email: blankToNull(r.email ?? ''),
      phone: blankToNull(r.phone ?? ''),
      gender,
      dateOfBirth,
      staffType,
      designation: r.designation!,
      department: blankToNull(r.department ?? ''),
      employmentType,
      joinDate,
      profile: { address: blankToNull(r.address ?? ''), nationalId: blankToNull(r.nationalId ?? ''), emergencyContactName: null, emergencyContactPhone: null, bloodGroup: null },
      ...(staffType === 'teaching' && { teacherProfile: { specialization: blankToNull(r.specialization ?? '') } }),
    } as Payload;
  },
  create: (payload) => staffService.create(payload),
  invalidate: [STAFF_KEY],
};
