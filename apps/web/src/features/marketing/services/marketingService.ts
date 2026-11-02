import { api } from '@/services/api/http';

/** What the sign-up and sign-in screens may offer. */
export interface AuthConfig {
  /** OAuth client ID for "Continue with Google"; null when not set up. */
  googleClientId: string | null;
}

export type SocialProvider = 'google';

/** Where a sign-in on the main /login continues: one account, or the schools to choose from. */
export type SignInOutcome = { continueUrl: string } | { choose: { school: string; name: string }[] } | { twoFactor: { verificationId: string; email: string } };
/** Google sign-in on the main site with no account yet: point to the verified registration. */
export type SocialSignInOutcome = SignInOutcome | { noAccount: { email: string } };

/** Public (signed-out) marketing API. */
export const marketingService = {
  authConfig: () => api<AuthConfig>('/public/signup/config'),
  /** "Continue with Google": a one-time link into the person's school, or schools to choose from. */
  socialTicket: (body: { provider: SocialProvider; credential: string; nonce: string; school?: string }) => api<SocialSignInOutcome>('/public/social/ticket', { method: 'POST', body }),
  /** The single /login for the owner and every school (`school` picks one of several matches). */
  verifyOwner: (body: { verificationId: string; code: string }) => api<{ continueUrl: string }>('/public/login/verify', { method: 'POST', body }),
  login: (body: { identifier: string; password: string; school?: string; remember?: boolean }) => api<SignInOutcome>('/public/login', { method: 'POST', body }),
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
