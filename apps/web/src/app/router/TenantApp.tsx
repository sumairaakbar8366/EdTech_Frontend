import { Ban, CloudOff, SearchX } from 'lucide-react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router';
import { platformRouteTree } from '@/app/router/PlatformRoutes';
import { schoolRouteTree } from '@/app/router/SchoolRoutes';
import { Backdrop } from '@/components/effects/Backdrop';
import { FullPageMessage } from '@/components/ui';
import { AuthProvider, useAuth } from '@/features/auth/AuthProvider';
import { useEffect, useState } from 'react';
import { ChangePasswordPage } from '@/features/auth/pages/ChangePasswordPage';
import { ForgotPasswordPage, ForgotUserIdPage, ResetPasswordPage, VerifyEmailPage } from '@/features/auth/pages/RecoveryPages';
import { WelcomePage } from '@/features/auth/pages/WelcomePage';
import { OpenLinkPage } from '@/features/auth/pages/OpenLinkPage';
import { LoginPage } from '@/features/auth/pages/LoginPage';
import { SchoolSitePage } from '@/features/website/pages/SchoolSitePage';
import { useTenant } from '@/features/tenancy/useTenant';
import { ApiError } from '@/services/api/http';
import { marketingOrigin } from '@/config/site';
import type { Tenant } from '@/types/session';

/** The owner console has no sign-in page of its own: it uses the main /login. */
function ToMainLogin() {
  useEffect(() => window.location.replace(`${marketingOrigin()}/login`), []);
  return <><Backdrop /><FullPageMessage title="Opening sign-in…" /></>;
}

/**
 * A school's app or the platform console. On the main domain it lives under a path (`basename`:
 * /<slug> or /console); on a school's own domain at the root.
 */
export function TenantApp({ basename }: { basename: string }) {
  const tenant = useTenant();
  if (tenant.isLoading) return <><Backdrop /><FullPageMessage title="Loading…" /></>;
  if (tenant.error || !tenant.data) {
    const status = tenant.error instanceof ApiError ? tenant.error.status : 0;
    return (
      <>
        <Backdrop />
        {status === 404 ? (
          <FullPageMessage title="School not found" icon={SearchX}>Check the address and try again.</FullPageMessage>
        ) : status === 403 ? (
          <FullPageMessage title="Account suspended" icon={Ban}>This school's account is suspended. Please contact support.</FullPageMessage>
        ) : (
          <FullPageMessage title="Service unavailable" icon={CloudOff}>Please try again shortly.</FullPageMessage>
        )}
      </>
    );
  }
  return (
    <AuthProvider>
      <BrowserRouter basename={basename}>
        <SignedInRoutes tenant={tenant.data} />
      </BrowserRouter>
    </AuthProvider>
  );
}

/** Students may postpone confirming an email (many young students have none); others may not. */
const SKIP_KEY = 'schoolerp.skipEmailVerification';

function SignedInRoutes({ tenant }: { tenant: Tenant }) {
  const { me, isLoading } = useAuth();
  const [skipped, setSkipped] = useState(() => {
    try { return sessionStorage.getItem(SKIP_KEY) === '1'; } catch { return false; }
  });
  if (isLoading) return <><Backdrop /><FullPageMessage title="Loading…" /></>;
  const brandColor = tenant.kind === 'school' ? tenant.school.branding?.primaryColor ?? null : null;
  return (
    <Routes>
      {/* A school's address is its public website; the console opens its dashboard (or the main /login). */}
      <Route path="/" element={tenant.kind === 'school' ? <SchoolSitePage /> : me ? <Navigate to="/dashboard" replace /> : <ToMainLogin />} />
      <Route path="/login" element={tenant.kind === 'school' ? <LoginPage tenant={tenant} /> : me ? <Navigate to="/dashboard" replace /> : <ToMainLogin />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage tenant={tenant} />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      {tenant.kind === 'school' && <Route path="/forgot-user-id" element={<ForgotUserIdPage />} />}
      {/* A sign-in made on the main /login (or at sign-up) continues here with a one-time ticket. */}
      <Route path="/welcome" element={<WelcomePage />} />
      {tenant.kind === 'school' && <Route path="/open" element={<OpenLinkPage />} />}
      {!me ? (
        <Route path="*" element={<Navigate to="/login" replace />} />
      ) : me.scope === 'platform' ? (
        platformRouteTree(me)
      ) : me.user.mustChangePassword ? (
        // An administrator-issued password must be replaced before anything else (the API enforces it too).
        <Route path="*" element={<ChangePasswordPage />} />
      ) : !me.user.emailVerified && !skipped && !me.support ? (
        // Then they confirm their own email (OTP), which "forgot password" relies on.
        <Route
          path="*"
          element={
            <VerifyEmailPage
              optional={me.roles.every((r) => r.key === 'student')}
              onSkip={() => {
                try { sessionStorage.setItem(SKIP_KEY, '1'); } catch { /* private mode */ }
                setSkipped(true);
              }}
            />
          }
        />
      ) : (
        schoolRouteTree(me, brandColor)
      )}
    </Routes>
  );
}
