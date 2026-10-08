import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api/http';
import type { Tenant } from '@/types/session';

export const TENANT_KEY = ['tenant'] as const;

/** The school (or platform console) this host belongs to, with its public branding. */
export const tenantService = {
  current: () => api<Tenant>('/tenant'),
};

export function useTenant() {
  return useQuery({ queryKey: TENANT_KEY, queryFn: tenantService.current, retry: false, staleTime: Infinity });
}
