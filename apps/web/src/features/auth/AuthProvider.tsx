import { useQuery, useQueryClient } from '@tanstack/react-query';
import { createContext, useCallback, useContext, useMemo, type ReactNode } from 'react';
import { api, changePassword as apiChangePassword, login as apiLogin, logout as apiLogout, refreshSession } from '@/services/api/http';
import { type Me } from '@/types/session';

interface AuthState {
  me: Me | null;
  isLoading: boolean;
  /** Signs in and returns the new user (so the caller can open their home page). */
  login: (email: string, password: string, remember?: boolean) => Promise<Me>;
  logout: () => Promise<void>;
  /** Replaces the password and reloads the user (clears the "must change" flag). */
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);
const ME_KEY = ['auth', 'me'] as const;

/** Restores the session from the refresh cookie on load, then exposes the current user. */
export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ME_KEY,
    queryFn: async (): Promise<Me | null> => {
      if (!(await refreshSession())) return null;
      return api<Me>('/auth/me');
    },
    staleTime: Infinity,
    retry: false,
  });

  const login = useCallback(
    async (email: string, password: string, remember = false) => {
      await apiLogin(email, password, remember);
      const me = await api<Me>('/auth/me');
      queryClient.setQueryData(ME_KEY, me);
      return me;
    },
    [queryClient],
  );

  const logout = useCallback(async () => {
    await apiLogout();
    // Drop every user-specific cache entry; keep the public tenant info for the login screen.
    queryClient.removeQueries({ predicate: (q) => q.queryKey[0] !== 'tenant' && q.queryKey[0] !== 'auth' });
    queryClient.setQueryData(ME_KEY, null);
  }, [queryClient]);

  const changePassword = useCallback(
    async (currentPassword: string, newPassword: string) => {
      await apiChangePassword(currentPassword, newPassword);
      queryClient.setQueryData(ME_KEY, await api<Me>('/auth/me'));
    },
    [queryClient],
  );

  const value = useMemo(
    () => ({ me: data ?? null, isLoading, login, logout, changePassword }),
    [data, isLoading, login, logout, changePassword],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
