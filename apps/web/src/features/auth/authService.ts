import { api } from '@/services/api/http';

export interface CodeSent {
  verificationId: string;
  email: string;
  expiresInSeconds: number;
  resendInSeconds: number;
}

/** Self-service account recovery and email verification (OTP). */
export const authService = {
  /** School: by User ID; platform: by email. The answer is the same whether or not it exists. */
  forgotPassword: (identifier: string) => api<{ message: string }>('/auth/forgot-password', { method: 'POST', body: { identifier } }),
  forgotUserId: (email: string) => api<{ message: string }>('/auth/forgot-user-id', { method: 'POST', body: { email } }),
  checkResetToken: (token: string) => api<{ valid: boolean }>('/auth/reset-password/check', { method: 'POST', body: { token } }),
  resetPassword: (token: string, newPassword: string) => api<void>('/auth/reset-password', { method: 'POST', body: { token, newPassword } }),
  /** Sends a 6-digit code to the signed-in user's email, or to a new address. */
  sendEmailCode: (email?: string) => api<CodeSent>('/auth/email/code', { method: 'POST', body: email ? { email } : {} }),
  verifyEmail: (verificationId: string, code: string) => api<{ email: string; emailVerified: true }>('/auth/email/verify', { method: 'POST', body: { verificationId, code } }),
};
