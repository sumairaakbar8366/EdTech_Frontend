import { Rocket } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { Alert } from '@/components/ui';
import { userAreas } from '@/app/router/SchoolRoutes';
import { useAuth } from '@/features/auth/AuthProvider';
import { AuthCard } from '@/features/auth/components/AuthCard';
import { errorMessage } from '@/lib/errors';
import { PRODUCT_NAME } from '@/config/brand';

/** Where a new school's admin lands after sign-up: the one-time ticket becomes a session here. */
export function WelcomePage() {
  const [params] = useSearchParams();
  const { loginWithTicket } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const started = useRef(false);

  useEffect(() => {
    const ticket = params.get('ticket');
    if (started.current) return;
    started.current = true;
    if (!ticket) return setError('This link is incomplete. Please sign in with your User ID.');
    loginWithTicket(ticket).then(
      (me) => navigate(me.scope === 'school' ? `/${userAreas(me)[0] ?? ''}` : '/dashboard', { replace: true }),
      (e) => setError(errorMessage(e, 'Could not sign you in. Please sign in with your User ID.')),
    );
  }, [params, loginWithTicket, navigate]);

  return (
    <AuthCard icon={Rocket} title={`Welcome to ${PRODUCT_NAME}`} sub="Opening your school…" back={false}>
      {error ? (
        <div className="space-y-4">
          <Alert>{error}</Alert>
          <Link to="/login" className="font-semibold text-orange-700 hover:underline dark:text-orange-300">Go to sign in</Link>
        </div>
      ) : (
        <p className="text-sm text-slate-500">Signing you in…</p>
      )}
    </AuthCard>
  );
}
