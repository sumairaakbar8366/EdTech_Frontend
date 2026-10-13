import { Navigate, useLocation, useSearchParams } from 'react-router';
import { userAreas } from '@/app/router/SchoolRoutes';
import { useAuth } from '@/features/auth/AuthProvider';

/**
 * Target of links in emails and push notifications: /open?to=/fees. Opens that page in the person's
 * own area (/parent/fees, /admin/fees …); signs in first when needed, then comes back here.
 */
export function OpenLinkPage() {
  const { me } = useAuth();
  const [params] = useSearchParams();
  const location = useLocation();
  if (!me) return <Navigate to={`/login?next=${encodeURIComponent(location.pathname + location.search)}`} replace />;
  if (me.scope !== 'school') return <Navigate to="/dashboard" replace />;
  const to = params.get('to') ?? '/';
  const safe = to.startsWith('/') && !to.startsWith('//') ? to : '/';
  const area = userAreas(me)[0] ?? '';
  return <Navigate to={`/${area}${safe === '/' ? '' : safe}`} replace />;
}
