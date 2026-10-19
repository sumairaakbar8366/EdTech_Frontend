import type { SchoolRoleKey } from '@schoolerp/shared';

/**
 * Each school role has its own URL area (/admin, /teacher, …), dashboard and menu.
 * A person with several roles (e.g. a teacher who is also a parent) switches area in the header.
 * Adding a role = one entry here + its routes file in app/router/areas.
 */
export const AREAS = {
  principal: { role: 'principal', label: 'Principal' },
  admin: { role: 'school_admin', label: 'Administration' },
  accounts: { role: 'accounts', label: 'Accounts' },
  teacher: { role: 'teacher', label: 'Teaching' },
  staff: { role: 'non_teaching_staff', label: 'Staff' },
  student: { role: 'student', label: 'Student' },
  parent: { role: 'parent', label: 'Parent' },
} as const satisfies Record<string, { role: SchoolRoleKey; label: string }>;

export type AreaSlug = keyof typeof AREAS;

/** Shared admin accounts ("Admin 2"…, role key delegate_N) work in the admin area with only their granted parts. */
export function areaForRole(role: SchoolRoleKey | string): AreaSlug {
  if (role.startsWith('delegate_')) return 'admin';
  return (Object.keys(AREAS) as AreaSlug[]).find((a) => AREAS[a].role === role) ?? 'admin';
}

export function isAreaSlug(value: string | undefined): value is AreaSlug {
  return !!value && value in AREAS;
}
