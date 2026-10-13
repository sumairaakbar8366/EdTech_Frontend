import { BrowserRouter, Navigate, Route, Routes } from 'react-router';
import { TenantApp } from '@/app/router/TenantApp';
import { isMarketingHost } from '@/config/site';
import { AccessPage } from '@/features/marketing/pages/AccessPage';
import { CheckoutPage } from '@/features/marketing/pages/CheckoutPage';
import { LandingPage } from '@/features/marketing/pages/LandingPage';

/** The host decides the app: the public site, a school's role areas, or the platform console. */
export function App() {
  if (!isMarketingHost()) return <TenantApp />;
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/access" element={<AccessPage />} />
        {/* The payment gateway's checkout (the built-in test gateway lives here). */}
        <Route path="/pay/:token" element={<CheckoutPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
