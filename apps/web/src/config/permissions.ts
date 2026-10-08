import { hasAccess, type AccessLevel, type Module } from '@schoolerp/shared';

/**
 * Named capabilities the UI checks, mapped onto the page-15 permission matrix (module + access
 * levels; decision 8). Components ask `can('fees.create')`, never "is this an admin?", so roles
 * and their grants can change without touching UI code. To add a capability, add one line here.
 */
export const CAPABILITIES = {
  'settings.manage': ['settings', ['crud']],
  'documents.request': ['documents', ['own', 'children']],

  'academics.view': ['academics', ['crud', 'view']],
  'academics.edit': ['academics', ['crud']],

  'staff.view': ['staff', ['crud', 'view']],
  'staff.edit': ['staff', ['crud']],
  'staff.own': ['staff', ['own']],

  'students.view': ['students', ['crud', 'view']],
  'students.edit': ['students', ['crud']],
  'students.own': ['students', ['own']],
  'students.children': ['students', ['children']],

  'admissions.view': ['admissions', ['crud', 'view']],
  'admissions.edit': ['admissions', ['crud']],

  'timetable.view': ['timetable', ['crud', 'view']],
  'timetable.edit': ['timetable', ['crud']],

  'attendance.view': ['attendance', ['crud', 'view']],
  'attendance.edit': ['attendance', ['crud']],
  'attendance.mark': ['attendance', ['mark']],
  'attendance.own': ['attendance', ['own', 'mark']],
  'attendance.children': ['attendance', ['children']],

  'leave.view': ['leave', ['approve', 'view']],
  'leave.approve': ['leave', ['approve']],
  'leave.own': ['leave', ['own']],

  'fees.view': ['fees', ['crud', 'view']],
  'fees.create': ['fees', ['crud']],
  'fees.own': ['fees', ['own', 'children']],

  'payroll.view': ['payroll', ['crud', 'approve']],
  'payroll.process': ['payroll', ['crud']],
  'payroll.approve': ['payroll', ['approve']],
  'payroll.own': ['payroll', ['own']],

  'lms.view': ['lms', ['crud', 'view']],
  'lms.manage': ['lms', ['crud']],

  'assignment.view': ['assignments', ['crud', 'submit', 'view']],
  'assignment.create': ['assignments', ['crud']],
  'assignment.grade': ['assignments', ['crud']],
  'assignment.submit': ['assignments', ['submit']],

  'exams.view': ['exams', ['crud', 'view']],
  'exams.manage': ['exams', ['crud']],

  'results.view': ['results', ['view']],
  'results.enter': ['results', ['crud', 'enter']],
  'results.publish': ['results', ['crud']],

  'communication.any': ['communication', ['crud', 'view', 'own']],
  'communication.manage': ['communication', ['crud']],
  'communication.converse': ['communication', ['crud', 'own']],

  'reports.all': ['reports', ['all']],
  'reports.finance': ['reports', ['all', 'finance']],

  'audit.view': ['audit', ['view']],
} as const satisfies Record<string, readonly [Module, readonly AccessLevel[]]>;

export type Capability = keyof typeof CAPABILITIES;
export type CanFn = (capability: Capability) => boolean;

/** True when the permission list grants the capability. */
export function can(permissions: readonly string[], capability: Capability): boolean {
  const [module, levels] = CAPABILITIES[capability];
  return hasAccess(permissions, module, levels);
}
