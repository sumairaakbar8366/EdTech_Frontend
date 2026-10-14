import { BrowserRouter, Navigate, Route, Routes } from 'react-router';
import { TenantApp } from '@/app/router/TenantApp';
import { appLocation } from '@/config/site';
import { MainLoginPage } from '@/features/auth/pages/MainLoginPage';
import { SsoCallbackPage, SsoStartPage } from '@/features/auth/pages/SsoPages';
import { AccessPage } from '@/features/marketing/pages/AccessPage';
import { CheckoutPage } from '@/features/marketing/pages/CheckoutPage';
import { LandingPage } from '@/features/marketing/pages/LandingPage';
import { setApiBase } from '@/services/api/http';

/**
 * The address decides the app (see config/site.ts): the public site and the single /login, the
 * owner console at /console/…, a school at /<slug>/…, or a school on its own domain.
 */
export function App() {
  const where = appLocation();
  if (where.app !== 'site') {
    setApiBase(where.apiBase);
    return <TenantApp basename={where.basename} />;
  }
  setApiBase('/api');
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        {/* One sign-in for the owner and every school; it continues in the right dashboard. */}
        <Route path="/login" element={<MainLoginPage />} />
        <Route path="/access" element={<AccessPage />} />
        <Route path="/signup" element={<Navigate to="/access?mode=signup" replace />} />
        {/* "Continue with Google": the Google round trip always runs on the main site. */}
        <Route path="/sso/start" element={<SsoStartPage />} />
        <Route path="/sso/callback" element={<SsoCallbackPage />} />
        {/* The payment gateway's checkout (the built-in test gateway lives here). */}
        <Route path="/pay/:token" element={<CheckoutPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
