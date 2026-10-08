import { createContext, useCallback, useContext, type ReactNode } from 'react';
import { Link, useNavigate, type LinkProps, type NavigateOptions } from 'react-router';
import type { AreaSlug } from '@/config/roleAreas';

const AreaContext = createContext<AreaSlug | null>(null);

export function AreaProvider({ area, children }: { area: AreaSlug; children: ReactNode }) {
  return <AreaContext.Provider value={area}>{children}</AreaContext.Provider>;
}

export function useArea(): AreaSlug {
  const area = useContext(AreaContext);
  if (!area) throw new Error('useArea must be used inside a role area');
  return area;
}

/**
 * Turns an in-app path ("/students/1") into the current role area's URL ("/admin/students/1").
 * Outside a role area (the platform console) paths are used as they are.
 */
export function useAreaPath(): (path: string) => string {
  const area = useContext(AreaContext);
  return useCallback(
    (path: string) => (!area ? path : path === '/' || path === '' ? `/${area}` : `/${area}${path.startsWith('/') ? path : `/${path}`}`),
    [area],
  );
}

/** Link whose `to` is an in-app path, resolved inside the current role area. */
export function AreaLink({ to, ...props }: Omit<LinkProps, 'to'> & { to: string }) {
  const path = useAreaPath();
  return <Link to={path(to)} {...props} />;
}

/** navigate() for in-app paths inside the current role area; numbers go back/forward. */
export function useAreaNavigate() {
  const navigate = useNavigate();
  const path = useAreaPath();
  return useCallback(
    (to: string | number, options?: NavigateOptions) => (typeof to === 'number' ? navigate(to) : navigate(path(to), options)),
    [navigate, path],
  );
}
