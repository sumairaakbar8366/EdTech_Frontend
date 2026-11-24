import { useQuery, useQueryClient } from '@tanstack/react-query';
import { createContext, useCallback, useContext, useMemo, type ReactNode } from 'react';
import { api, changePassword as apiChangePassword, exchangeTicket, getOfflineState, login as apiLogin, logout as apiLogout, refreshSession, rememberSignedInUser } from '@/services/api/http';
import { prefetchForOffline } from '../../lib/offline/prefetch';
import { type Me } from '@/types/session';

interface AuthState {
  me: Me | null;
  isLoading: boolean;
  /** Signs in and returns the new user (so the caller can open their home page). */
  login: (identifier: string, password: string, remember?: boolean) => Promise<Me>;
  logout: () => Promise<void>;
  /** Replaces the password and reloads the user (clears the "must change" flag). */
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  /** Reloads the signed-in user (after verifying an email). */
  reload: () => Promise<void>;
  /** Signs in with a one-time ticket (after sign-up) and returns the user. */
  loginWithTicket: (ticket: string) => Promise<Me>;
}

const AuthContext = createContext<AuthState | null>(null);
export const ME_KEY = ['auth', 'me'] as const;

/** After signing in (or reopening): keep this person's saved copies, and save the day's first screens for offline use. */
async function afterSignIn(me: Me): Promise<void> {
  if (me.scope !== 'school') return;
  await rememberSignedInUser(me.user.id);
  if (getOfflineState().offline) return;
  try {
    const last = Number(localStorage.getItem('skool:prefetch-at') ?? 0);
    if (Date.now() - last < 20 * 60_000) return;
    localStorage.setItem('skool:prefetch-at', String(Date.now()));
  } catch { /* storage blocked: save anyway */ }
  void prefetchForOffline((p) => api(p), me).catch(() => undefined);
}

/** Restores the session from the refresh cookie on load, then exposes the current user. */
export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ME_KEY,
    queryFn: async (): Promise<Me | null> => {
      if (!(await refreshSession())) return null;
      const me = await api<Me>('/auth/me');
      void afterSignIn(me);
      return me;
    },
    staleTime: Infinity,
    retry: false,
  });

  const login = useCallback(
    async (identifier: string, password: string, remember = false) => {
      await apiLogin(identifier, password, remember);
      const me = await api<Me>('/auth/me');
      void afterSignIn(me);
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

  const loginWithTicket = useCallback(
    async (ticket: string) => {
      await exchangeTicket(ticket);
      const me = await api<Me>('/auth/me');
      void afterSignIn(me);
      queryClient.setQueryData(ME_KEY, me);
      return me;
    },
    [queryClient],
  );

  const reload = useCallback(async () => {
    queryClient.setQueryData(ME_KEY, await api<Me>('/auth/me'));
  }, [queryClient]);

  const value = useMemo(
    () => ({ me: data ?? null, isLoading, login, logout, changePassword, reload, loginWithTicket }),
    [data, isLoading, login, logout, changePassword, reload, loginWithTicket],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
