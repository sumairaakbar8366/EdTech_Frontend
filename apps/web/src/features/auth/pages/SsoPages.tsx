import { LogIn, UserPlus } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router';
import { Alert, Spinner } from '@/components/ui';
import { schoolOrigin } from '@/config/site';
import { AuthCard } from '@/features/auth/components/AuthCard';
import { useAuthConfig } from '@/features/auth/components/SocialButtons';
import { SchoolChoice } from '@/features/auth/components/SchoolChoice';
import { PROVIDER_LABEL, readSsoCallback, redirectToProvider, type SsoResult } from '@/features/auth/sso';
import { ProviderSignupFinish } from '@/features/marketing/components/QuickSignup';
import { marketingService, type SocialProvider } from '@/features/marketing/services/marketingService';
import { errorMessage } from '@/lib/errors';

const isProvider = (p: string | null): p is SocialProvider => p === 'google';

/** Main site, /sso/start: sends the person to Google (see features/auth/sso.ts). */
export function SsoStartPage() {
  const [params] = useSearchParams();
  const config = useAuthConfig();
  const provider = params.get('provider');
  const purpose = params.get('purpose') === 'login' ? 'login' : 'signup';
  const school = params.get('school') ?? undefined;
  const clientId = isProvider(provider) ? config.data?.googleClientId : null;
  const problem = !isProvider(provider)
    ? 'This sign-in link is incomplete.'
    : config.data && !clientId
        ? `${PROVIDER_LABEL[provider]} sign-in is not set up on this server yet. Use your email instead.`
        : config.isError
          ? 'Sign-in options could not be loaded. Please try again.'
          : null;

  useEffect(() => {
    if (!problem && clientId && isProvider(provider)) redirectToProvider({ provider, purpose, school }, clientId);
  }, [problem, clientId, provider, purpose, school]);

  return (
    <AuthCard icon={purpose === 'login' ? LogIn : UserPlus} title={isProvider(provider) ? `Continue with ${PROVIDER_LABEL[provider]}` : 'Sign in'} sub={problem ? undefined : 'Taking you to the sign-in page…'} back={false}>
      {problem ? (
        <div className="space-y-4">
          <Alert>{problem}</Alert>
          <BackLink school={school} purpose={purpose} />
        </div>
      ) : (
        <Spinner />
      )}
    </AuthCard>
  );
}

/** Main site, /sso/callback: finishes a sign-up here, or hands a sign-in to the person's school. */
export function SsoCallbackPage() {
  const [result] = useState<SsoResult>(() => readSsoCallback());
  const [error, setError] = useState<string | null>(result.ok ? null : result.message);
  const [choices, setChoices] = useState<{ school: string; name: string }[] | null>(null);
  const [busy, setBusy] = useState(false);
  const started = useRef(false);
  const request = result.request;

  // A sign-in: exchange Google's token for a one-time link into the school (or pick one of several).
  const ticket = (school?: string) => {
    if (!result.ok) return;
    setBusy(true);
    setError(null);
    marketingService
      .socialTicket({ provider: result.request.provider, credential: result.credential, nonce: result.nonce, school })
      .then(
        (r) => ('continueUrl' in r ? window.location.replace(r.continueUrl) : setChoices(r.choose)),
        (e) => setError(errorMessage(e, 'You could not be signed in. Please try again.')),
      )
      .finally(() => setBusy(false));
  };
  useEffect(() => {
    if (!result.ok || result.request.purpose !== 'login' || started.current) return;
    started.current = true;
    ticket(result.request.school);
  }, [result]);

  const signup = request?.purpose !== 'login';
  return (
    <AuthCard
      icon={signup ? UserPlus : LogIn}
      title={signup ? 'Start your free trial' : 'Signing you in'}
      sub={!error && result.ok && !signup ? 'Opening your school…' : undefined}
      back={false}
    >
      {choices ? (
        <SchoolChoice choices={choices} busy={busy} error={error} onPick={(s) => ticket(s)} />
      ) : error ? (
        <div className="space-y-4">
          <Alert>{error}</Alert>
          <BackLink school={request?.school} purpose={signup ? 'signup' : 'login'} />
        </div>
      ) : result.ok && signup ? (
        <ProviderSignupFinish provider={result.request.provider} credential={result.credential} nonce={result.nonce} email={result.profile.email} name={result.profile.name} />
      ) : (
        <Spinner />
      )}
    </AuthCard>
  );
}

function BackLink({ school, purpose }: { school?: string; purpose: 'signup' | 'login' }) {
  return purpose === 'login' ? (
    <a href={school ? `${schoolOrigin(school)}/login` : '/login'} className="font-semibold text-orange-700 hover:underline dark:text-orange-300">← Back to sign in</a>
  ) : (
    <a href="/access?mode=signup" className="font-semibold text-orange-700 hover:underline dark:text-orange-300">← Back to the free trial</a>
  );
}
