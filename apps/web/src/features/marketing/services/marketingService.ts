import { api } from '@/services/api/http';

export interface SignupDetails {
  schoolName: string;
  slug: string;
  city: string;
  firstName: string;
  lastName: string;
  designation: string;
  email: string;
  phone: string;
  password: string;
}

export interface SlugCheck {
  slug: string;
  available: boolean;
  reason: string | null;
  suggestion: string | null;
}

export interface SignupResult {
  school: { id: string; name: string; slug: string };
  loginId: string;
  trialEndsAt: string;
  signInUrl: string;
  /** Opens the school's site already signed in (valid 2 minutes, once). */
  continueUrl: string;
  /** Quick sign-up: where the generated password was emailed. */
  passwordSentTo?: string | null;
}

/** What the sign-up and sign-in screens may offer. */
export interface AuthConfig {
  /** OAuth client ID for "Continue with Google"; null when not set up. */
  googleClientId: string | null;
  /** "off" while testing: any email is accepted without a code. */
  emailVerification: 'required' | 'off';
}

export type SocialProvider = 'google';

/** Where a sign-in on the main /login continues: one account, or the schools to choose from. */
export type SignInOutcome = { continueUrl: string } | { choose: { school: string; name: string }[] };

/** The "Start free trial" sign-up: a school name plus Google, or an email and name. */
export interface QuickSignup {
  schoolName: string;
  provider?: SocialProvider;
  credential?: string;
  nonce?: string;
  email?: string;
  name?: string;
  verificationId?: string;
  code?: string;
}

/** Public (signed-out) marketing API. */
export const marketingService = {
  checkSlug: (slug: string) => api<SlugCheck>(`/public/signup/slug?slug=${encodeURIComponent(slug)}`),
  /** A 6-digit code to the admin's email (proves the address before the school is created). */
  signupCode: (email: string) => api<{ verificationId: string | null; skipped?: boolean }>('/public/signup/code', { method: 'POST', body: { email } }),
  authConfig: () => api<AuthConfig>('/public/signup/config'),
  quickSignup: (body: QuickSignup) => api<SignupResult>('/public/signup/quick', { method: 'POST', body }),
  /** "Continue with Google": a one-time link into the person's school, or schools to choose from. */
  socialTicket: (body: { provider: SocialProvider; credential: string; nonce: string; school?: string }) => api<SignInOutcome>('/public/social/ticket', { method: 'POST', body }),
  /** The single /login for the owner and every school (`school` picks one of several matches). */
  login: (body: { identifier: string; password: string; school?: string; remember?: boolean }) => api<SignInOutcome>('/public/login', { method: 'POST', body }),
  signup: (body: Omit<SignupDetails, 'city'> & { city?: string; verificationId: string; code: string }) => api<SignupResult>('/public/signup', { method: 'POST', body }),
};

/** The payment gateway's checkout (the built-in test gateway's page lives on this site). */
export interface CheckoutSession {
  provider: string;
  school: string;
  plan: string;
  billingCycle: 'monthly' | 'annual';
  amount: string;
  currency: 'PKR';
  status: 'initiated' | 'pending' | 'confirmed' | 'rejected' | 'failed';
  expiresAt: string | null;
  expired: boolean;
  returnUrl: string;
}

export type GatewayMethod = 'card' | 'bank_account' | 'jazzcash' | 'easypaisa';

export const gatewayService = {
  session: (token: string) => api<CheckoutSession>(`/public/pay/${encodeURIComponent(token)}`),
  /** Test gateway only: the outcome and display details, never a card number. */
  pay: (token: string, body: { method: GatewayMethod; outcome: 'success' | 'decline'; cardBrand?: string; last4?: string; payerName?: string }) =>
    api<{ status: 'paid' | 'failed'; returnUrl: string }>(`/public/pay/${encodeURIComponent(token)}/complete`, { method: 'POST', body }),
};
