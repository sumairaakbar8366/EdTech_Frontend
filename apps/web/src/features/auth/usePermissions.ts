import { useCallback } from 'react';
import { can, type CanFn } from '@/config/permissions';
import { useAuth } from '@/features/auth/AuthProvider';

/** `const can = useCan(); can('payroll.approve')` for the signed-in school user. */
export function useCan(): CanFn {
  const { me } = useAuth();
  const permissions = me?.scope === 'school' ? me.permissions : [];
  return useCallback((capability) => can(permissions, capability), [permissions]);
}

/** The signed-in school user; throws on the platform console (use inside school areas only). */
export function useSchoolUser() {
  const { me } = useAuth();
  if (me?.scope !== 'school') throw new Error('useSchoolUser used outside a school area');
  return me;
}
