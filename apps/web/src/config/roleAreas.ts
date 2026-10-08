import type { SchoolRoleKey } from '@schoolerp/shared';

/**
 * Each school role has its own URL area (/admin, /teacher, …), dashboard and menu.
 * A person with several roles (e.g. a teacher who is also a parent) switches area in the header.
 * Adding a role = one entry here + its routes file in app/router/areas.
 */
export const AREAS = {
  admin: { role: 'school_admin', label: 'Administration' },
  accounts: { role: 'accounts', label: 'Accounts' },
  teacher: { role: 'teacher', label: 'Teaching' },
  staff: { role: 'non_teaching_staff', label: 'Staff' },
  student: { role: 'student', label: 'Student' },
  parent: { role: 'parent', label: 'Parent' },
} as const satisfies Record<string, { role: SchoolRoleKey; label: string }>;

export type AreaSlug = keyof typeof AREAS;

export function areaForRole(role: SchoolRoleKey): AreaSlug {
  return (Object.keys(AREAS) as AreaSlug[]).find((a) => AREAS[a].role === role)!;
}

export function isAreaSlug(value: string | undefined): value is AreaSlug {
  return !!value && value in AREAS;
}
