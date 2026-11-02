import { api } from '@/services/api/http';
import type { CustomForm } from '@/features/forms/forms';

export interface TrialBand { upTo: number | null; days: number; label: string }

/** What the registration page needs: the owner's extra questions, the choices and the trial rules. */
export interface RegistrationFormInfo {
  form: CustomForm;
  countries: string[];
  provinces: string[];
  cities: Record<string, string[]>;
  schoolTypes: string[];
  designations: string[];
  requirePhoneCode: boolean;
  trialBands: TrialBand[];
  minStudents: number;
}

export interface RegisterBody {
  schoolName: string;
  schoolType?: string;
  registrationNo?: string;
  ntn: string;
  country: string;
  province: string;
  city: string;
  address: string;
  postalCode?: string;
  studentCount: number;
  teacherCount: number;
  staffCount: number;
  ownerFirstName: string;
  ownerLastName: string;
  designation: string;
  nic: string;
  email: string;
  phone: string;
  emailProof: string;
  phoneProof?: string;
  answers: Record<string, unknown>;
  declaration: boolean;
}

/** What the applicant gets back: nothing is created yet; the team verifies the application first. */
export interface RegisterResult {
  reference: string;
  message: string;
}

export interface CheckLine { key: string; label: string; passed: boolean }

export const registrationService = {
  form: () => api<RegistrationFormInfo>('/public/registration/form'),
  emailCode: (email: string) => api<{ verificationId: string; resendInSeconds: number }>('/public/registration/email-code', { method: 'POST', body: { email } }),
  emailVerify: (b: { email: string; verificationId: string; code: string }) => api<{ email: string; proof: string }>('/public/registration/email-verify', { method: 'POST', body: b }),
  google: (b: { provider: 'google'; credential: string; nonce: string }) => api<{ email: string; firstName: string; lastName: string; proof: string }>('/public/registration/google', { method: 'POST', body: b }),
  phoneCode: (phone: string) => api<{ verificationId: string; phone: string; channel: string; resendInSeconds: number }>('/public/registration/phone-code', { method: 'POST', body: { phone, channel: 'whatsapp' } }),
  phoneVerify: (b: { phone: string; verificationId: string; code: string }) => api<{ phone: string; proof: string }>('/public/registration/phone-verify', { method: 'POST', body: b }),
  register: (b: RegisterBody) => api<RegisterResult>('/public/registration', { method: 'POST', body: b }),
};

/** The trial a school of this size earns (mirrors the server's rule so the page can say it before sending). */
export function trialFor(bands: TrialBand[], people: number): TrialBand | null {
  return bands.find((b) => b.upTo === null || people <= b.upTo) ?? bands[bands.length - 1] ?? null;
}

// --- The Google round trip returns to /register#g=…; the proof comes back in the address fragment ---
export interface GoogleReturn { email: string; name?: string; proof: string }

export function packGoogleReturn(g: GoogleReturn): string {
  return `g=${encodeURIComponent(btoa(unescape(encodeURIComponent(JSON.stringify(g)))))}`;
}

/** Reads (and removes from the address bar) a Google result handed back by /sso/callback. */
export function takeGoogleReturn(): GoogleReturn | null {
  const m = /(?:^#|&)g=([^&]+)/.exec(window.location.hash);
  if (!m) return null;
  window.history.replaceState(null, '', window.location.pathname + window.location.search);
  try {
    const g = JSON.parse(decodeURIComponent(escape(atob(decodeURIComponent(m[1]!))))) as GoogleReturn;
    return g.email && g.proof ? g : null;
  } catch {
    return null;
  }
}

const DRAFT_KEY = 'schoolerp.registration.draft';
export const loadDraft = <T,>(): T | null => { try { return JSON.parse(sessionStorage.getItem(DRAFT_KEY) ?? 'null') as T | null; } catch { return null; } };
export const saveDraft = (d: unknown) => { try { sessionStorage.setItem(DRAFT_KEY, JSON.stringify(d)); } catch { /* private mode */ } };
export const clearDraft = () => { try { sessionStorage.removeItem(DRAFT_KEY); } catch { /* private mode */ } };
