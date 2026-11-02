import { LogIn, UserPlus } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router';
import { Alert, Spinner } from '@/components/ui';
import { schoolOrigin } from '@/config/site';
import { AuthCard } from '@/features/auth/components/AuthCard';
import { useAuthConfig } from '@/features/auth/components/SocialButtons';
import { SchoolChoice } from '@/features/auth/components/SchoolChoice';
import { PROVIDER_LABEL, readSsoCallback, redirectToProvider, type SsoPurpose, type SsoResult } from '@/features/auth/sso';
import { marketingService, type SocialProvider } from '@/features/marketing/services/marketingService';
import { packGoogleReturn, registrationService } from '@/features/registration/registration';
import { api } from '@/services/api/http';
import { errorMessage } from '@/lib/errors';

const isProvider = (p: string | null): p is SocialProvider => p === 'google';
const toPurpose = (p: string | null): SsoPurpose => (p === 'login' || p === 'access' ? p : 'register');

/** Main site, /sso/start: sends the person to Google (see features/auth/sso.ts). */
export function SsoStartPage() {
  const [params] = useSearchParams();
  const config = useAuthConfig();
  const provider = params.get('provider');
  const purpose = toPurpose(params.get('purpose'));
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

/**
 * Main site, /sso/callback: signs the person in at their school, or (registering a school / asking a
 * school for access) turns Google's answer into a proof of their email and returns them to that page.
 */
export function SsoCallbackPage() {
  const [result] = useState<SsoResult>(() => readSsoCallback());
  const [error, setError] = useState<string | null>(result.ok ? null : result.message);
  const [choices, setChoices] = useState<{ school: string; name: string }[] | null>(null);
  const [busy, setBusy] = useState(false);
  /** Signed in with Google but no account uses this email. */
  const [noAccount, setNoAccount] = useState(false);
  const started = useRef(false);
  const request = result.request;

  const ticket = (school?: string) => {
    if (!result.ok) return;
    setBusy(true);
    setError(null);
    marketingService
      .socialTicket({ provider: result.request.provider, credential: result.credential, nonce: result.nonce, school })
      .then(
        (r) => ('continueUrl' in r ? window.location.replace(r.continueUrl) : 'noAccount' in r ? setNoAccount(true) : 'choose' in r ? setChoices(r.choose) : undefined),
        (e) => setError(errorMessage(e, 'You could not be signed in. Please try again.')),
      )
      .finally(() => setBusy(false));
  };

  useEffect(() => {
    if (!result.ok || started.current) return;
    started.current = true;
    const { purpose, school, provider } = result.request;
    if (purpose === 'login') return ticket(school);
    // Prove the email, then go back to where the person was filling a form.
    const prove = purpose === 'register'
      ? registrationService.google({ provider, credential: result.credential, nonce: result.nonce }).then((g) => `/register#${packGoogleReturn({ email: g.email, name: `${g.firstName} ${g.lastName}`.trim(), proof: g.proof })}`)
      : api<{ email: string; firstName: string; lastName: string; proof: string }>(`/s/${school}/public/access/google`, { method: 'POST', body: { provider, credential: result.credential, nonce: result.nonce } }).then((g) => `${schoolOrigin(school!)}/request-access#${packGoogleReturn({ email: g.email, name: `${g.firstName} ${g.lastName}`.trim(), proof: g.proof })}`);
    setBusy(true);
    prove.then((url) => window.location.replace(url), (e) => { setError(errorMessage(e, 'Google could not be verified. Please try again.')); setBusy(false); });
  }, [result]);

  return (
    <AuthCard
      icon={request?.purpose === 'login' ? LogIn : UserPlus}
      title={request?.purpose === 'login' ? 'Signing you in' : 'Verifying your Google account'}
      sub={noAccount ? 'No account uses this Google email yet.' : !error && result.ok ? 'One moment…' : undefined}
      back={false}
    >
      {noAccount ? (
        <div className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
          <p>If you run a school, <a href="/register" className="font-semibold text-orange-700 hover:underline dark:text-orange-300">register it here</a> (we verify it first). If you are a teacher, student, parent or staff member, open your school’s sign-in page and choose “Request access”: once the administrator approves, your User ID and password are emailed to you.</p>
        </div>
      ) : choices ? (
        <SchoolChoice choices={choices} busy={busy} error={error} onPick={(s) => ticket(s)} />
      ) : error ? (
        <div className="space-y-4">
          <Alert>{error}</Alert>
          <BackLink school={request?.school} purpose={request?.purpose ?? 'register'} />
        </div>
      ) : (
        <Spinner />
      )}
    </AuthCard>
  );
}

function BackLink({ school, purpose }: { school?: string; purpose: SsoPurpose }) {
  const [href, label] = purpose === 'login' ? [school ? `${schoolOrigin(school)}/login` : '/login', '← Back to sign in'] : purpose === 'access' && school ? [`${schoolOrigin(school)}/request-access`, '← Back to the access request'] : ['/register', '← Back to registration'];
  return <a href={href} className="font-semibold text-orange-700 hover:underline dark:text-orange-300">{label}</a>;
}
