import { browserSupportsWebAuthn, platformAuthenticatorIsAvailable, startAuthentication, startRegistration } from '@simplewebauthn/browser';
import { ApiError, api } from '@/services/api/http';
import { inNativeApp, nativeCall, NativeError } from '@/lib/nativeBridge';
import { attendanceService, type BiometricProof } from '@/features/attendance/services/attendanceService';

/** Who is signed in (the phone app keeps one attendance key per person). */
let cachedUser: string | null = null;
const userId = async (): Promise<string> => (cachedUser ??= (await api<{ user: { id: string } }>('/auth/me')).user.id);

/** Can this phone/browser ask for a fingerprint or face (or at least the screen lock)? */
export async function phoneCanVerify(): Promise<boolean> {
  if (inNativeApp()) { try { return (await nativeCall<{ available: boolean }>('biometric.support')).available; } catch { return false; } }
  try { return browserSupportsWebAuthn() && (await platformAuthenticatorIsAvailable()); } catch { return false; }
}

/** What the person sees when they cancel the phone's fingerprint / face prompt. */
export function biometricMessage(e: unknown): string | null {
  if (e instanceof NativeError) return e.message;
  const name = (e as { name?: string })?.name;
  if (name === 'NotAllowedError' || name === 'AbortError') return 'The fingerprint or face check was cancelled. Please try again.';
  if (name === 'InvalidStateError') return 'This phone is already registered.';
  return null;
}

/** Enrols this phone: its fingerprint / face lock opens, and the office is asked to approve it. */
export async function registerThisPhone(label: string): Promise<void> {
  if (inNativeApp()) {
    // The app makes a key behind the phone's lock; only its public half is sent to the school.
    const { publicKey } = await nativeCall<{ publicKey: string }>('biometric.createKey', { userId: await userId() });
    try { await attendanceService.registerApp({ publicKey, label }); }
    catch (e) { await nativeCall('biometric.forgetKey', { userId: await userId() }).catch(() => undefined); throw e; }
    return;
  }
  const { challengeId, options } = await attendanceService.registerOptions();
  const response = await startRegistration({ optionsJSON: options as never });
  await attendanceService.registerPhone({ challengeId, response, label });
}

/** Opens the phone's fingerprint / face lock and returns the signed proof for a check-in or check-out. */
export async function proveItIsYou(): Promise<BiometricProof> {
  if (inNativeApp()) {
    const c = await attendanceService.appChallenge();
    const { signature } = await nativeCall<{ signature: string }>('biometric.sign', { userId: await userId(), challenge: c.challenge });
    return { challengeId: c.challengeId, response: { type: 'skool-app', credentialId: c.credentialId, signature } };
  }
  const { challengeId, options } = await attendanceService.authOptions();
  const response = await startAuthentication({ optionsJSON: options as never });
  return { challengeId, response };
}

/**
 * A scan that did not work (the phone's prompt was cancelled, timed out or did not match) is reported, so a
 * third miss reaches the office and a fifth starts a short cooling period. A broken browser or phone is
 * reported as a system problem. Answers from our own server are not reported again.
 */
export async function reportTrouble(e: unknown, purpose: 'check_in' | 'check_out' | 'register'): Promise<void> {
  if (e instanceof ApiError) return;
  const name = e instanceof NativeError ? 'NotAllowedError' : ((e as { name?: string })?.name ?? 'Error');
  const miss = name === 'NotAllowedError' || name === 'AbortError';
  await attendanceService.reportAttempt({ purpose, outcome: miss ? 'failed' : 'error', reason: name }).catch(() => undefined);
}
