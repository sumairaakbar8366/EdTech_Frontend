import * as Crypto from 'expo-crypto';
import * as LocalAuth from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import { bytesToHex, hexToBytes } from '@/utils/base64';
import { KEYS, secure } from './secureStore';
import { isValidKey, newKeyPair, signChallengeWith } from './signing';

/**
 * The phone's attendance key. A P-256 key pair is made on the phone; the private half stays in the secure store (see the
 * two ways below). The server only ever receives the public half. To mark attendance the app signs the server's challenge.
 */

// ---- the phone's side -------------------------------------------------------------------------------

const keyName = (userId: string) => `skool.devkey.${userId.replace(/[^a-zA-Z0-9]/g, '')}`;
const flagName = (userId: string) => `skool.devkeyset.${userId.replace(/[^a-zA-Z0-9]/g, '')}`;

export interface BiometricSupport { available: boolean; kind: 'face' | 'fingerprint' | 'both' | 'none'; label: string; reason?: string }

/** Does this phone have a fingerprint / face lock that is set up? */
export async function biometricSupport(): Promise<BiometricSupport> {
  try {
    const [hw, enrolled, types] = await Promise.all([LocalAuth.hasHardwareAsync(), LocalAuth.isEnrolledAsync(), LocalAuth.supportedAuthenticationTypesAsync()]);
    const face = types.includes(LocalAuth.AuthenticationType.FACIAL_RECOGNITION);
    const finger = types.includes(LocalAuth.AuthenticationType.FINGERPRINT);
    const kind = face && finger ? 'both' : face ? 'face' : finger ? 'fingerprint' : 'none';
    const label = kind === 'both' ? 'Face or fingerprint' : kind === 'face' ? 'Face' : kind === 'fingerprint' ? 'Fingerprint' : 'Fingerprint / face';
    if (!hw) return { available: false, kind, label, reason: 'This phone has no fingerprint or face sensor.' };
    if (!enrolled) return { available: false, kind, label, reason: 'No fingerprint or face is set up on this phone yet. Add one in the phone\'s Settings, then come back.' };
    return { available: true, kind, label };
  } catch {
    return { available: false, kind: 'none', label: 'Fingerprint / face', reason: 'Could not check this phone\'s fingerprint / face lock.' };
  }
}

/** A stable id for this installation (sent with check-ins so the office can see which phone was used). */
export async function installationId(): Promise<string> {
  let id = await secure.get(KEYS.installId);
  if (!id) { id = bytesToHex(await Crypto.getRandomBytesAsync(16)); await secure.set(KEYS.installId, id); }
  return id;
}

export const hasDeviceKey = async (userId: string) => !!(await secure.get(flagName(userId)));

/**
 * Two ways to keep the key. In the installed app the phone itself guards it ("require authentication": every read asks for
 * the fingerprint or face). In Expo Go on an iPhone that is not possible (Expo Go has no Face ID permission), so the key is
 * kept in the secure store and the app asks for the fingerprint / face before every use ("soft").
 */
const NEEDS_FULL_APP = /NSFaceIDUsageDescription|requireAuthentication|Info\.plist/i;

async function confirmPerson(prompt: string): Promise<void> {
  // Fingerprint / face ONLY: the phone's PIN or passcode is not accepted (anyone who knows it could mark attendance for a teacher).
  const r = await LocalAuth.authenticateAsync({ promptMessage: prompt, cancelLabel: 'Cancel', disableDeviceFallback: true, fallbackLabel: '' });
  if (!r.success) {
    const why = 'error' in r ? String(r.error) : '';
    if (/missing_usage_description|not_available|not_enrolled/i.test(why)) throw new Error('Fingerprint / face is not available here. Use the installed app (APK / IPA) on a phone with a fingerprint or face enrolled.');
    throw new Error('The fingerprint or face check was cancelled or did not match.');
  }
}

/** Makes the key (asks for fingerprint / face once to store it) and returns the public half for the school. */
export async function createDeviceKey(userId: string): Promise<string> {
  let random = await Crypto.getRandomBytesAsync(32);
  while (!isValidKey(random)) random = await Crypto.getRandomBytesAsync(32);
  const pair = newKeyPair(random);
  const hex = bytesToHex(pair.privateKey);
  try {
    await SecureStore.setItemAsync(keyName(userId), hex, { requireAuthentication: true, authenticationPrompt: 'Set up fingerprint or face for attendance', keychainAccessible: SecureStore.WHEN_PASSCODE_SET_THIS_DEVICE_ONLY });
    await secure.set(flagName(userId), '1');
  } catch (e) {
    if (!NEEDS_FULL_APP.test(e instanceof Error ? e.message : String(e))) throw e;
    await confirmPerson('Set up fingerprint or face for attendance');
    await secure.set(keyName(userId), hex);
    await secure.set(flagName(userId), 'soft');
  }
  return pair.publicKeyBase64;
}

/** Asks for the fingerprint / face, then signs the challenge. Throws if the person cancels or does not match. */
export async function signChallenge(userId: string, challenge: string): Promise<string> {
  const mode = await secure.get(flagName(userId));
  let hex: string | null;
  if (mode === 'soft') { await confirmPerson('Verify to mark attendance'); hex = await secure.get(keyName(userId)); }
  else hex = await SecureStore.getItemAsync(keyName(userId), { requireAuthentication: true, authenticationPrompt: 'Verify to mark attendance' });
  if (!hex) throw new Error('This phone has no attendance key. Set up fingerprint / face again.');
  return signChallengeWith(hexToBytes(hex), challenge);
}

export async function forgetDeviceKey(userId: string): Promise<void> {
  await SecureStore.deleteItemAsync(keyName(userId)).catch(() => undefined);
  await secure.del(keyName(userId));
  await secure.del(flagName(userId));
}
