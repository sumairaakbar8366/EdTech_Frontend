import { Ban, CloudOff, SearchX } from 'lucide-react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router';
import { platformRouteTree } from '@/app/router/PlatformRoutes';
import { schoolRouteTree } from '@/app/router/SchoolRoutes';
import { Backdrop } from '@/components/effects/Backdrop';
import { FullPageMessage } from '@/components/ui';
import { AuthProvider, useAuth } from '@/features/auth/AuthProvider';
import { useState } from 'react';
import { ChangePasswordPage } from '@/features/auth/pages/ChangePasswordPage';
import { ForgotPasswordPage, ForgotUserIdPage, ResetPasswordPage, VerifyEmailPage } from '@/features/auth/pages/RecoveryPages';
import { WelcomePage } from '@/features/auth/pages/WelcomePage';
import { OpenLinkPage } from '@/features/auth/pages/OpenLinkPage';
import { LoginPage } from '@/features/auth/pages/LoginPage';
import { SchoolSitePage } from '@/features/website/pages/SchoolSitePage';
import { useTenant } from '@/features/tenancy/useTenant';
import { ApiError } from '@/services/api/http';
import type { Tenant } from '@/types/session';

/** A school's app or the platform console, depending on the host's tenant. */
export function TenantApp() {
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
      <BrowserRouter>
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
      {/* The school (or console) address itself is the sign-in page; dashboards live under their own paths. */}
      {/* A school's own address is its public website; the platform console starts at sign-in. */}
      <Route path="/" element={tenant.kind === 'school' ? <SchoolSitePage /> : <LoginPage tenant={tenant} />} />
      <Route path="/login" element={<LoginPage tenant={tenant} />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage tenant={tenant} />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      {tenant.kind === 'school' && <Route path="/forgot-user-id" element={<ForgotUserIdPage />} />}
      {tenant.kind === 'school' && <Route path="/welcome" element={<WelcomePage />} />}
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
