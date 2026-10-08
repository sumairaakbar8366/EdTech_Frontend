import { useQuery } from '@tanstack/react-query';
import { settingsService } from '@/features/settings/services/settingsService';
import { TENANT_KEY } from '@/features/tenancy/useTenant';
import { useAction } from '@/lib/hooks/useAction';

export const SETTINGS_KEY = ['settings'] as const;

export const useSchoolSettings = () => useQuery({ queryKey: SETTINGS_KEY, queryFn: settingsService.get });

/** A settings write; also refreshes the tenant so new branding applies immediately. */
export function useSettingsAction<TVars, TResult = unknown>(
  fn: (v: TVars) => Promise<TResult>,
  options: { success?: string | ((r: TResult) => string); onDone?: (r: TResult) => void; toastErrors?: boolean } = {},
) {
  return useAction(fn, { ...options, invalidate: [SETTINGS_KEY, TENANT_KEY] });
}
