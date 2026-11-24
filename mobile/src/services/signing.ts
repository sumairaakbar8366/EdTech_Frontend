import { p256 } from '@noble/curves/p256';
import { sha256 } from '@noble/hashes/sha256';
import { bytesToBase64, textBytes } from '@/utils/base64';

/** The phone's attendance key maths (pure, so it is tested on its own). The server checks it with Node's crypto. */

export function newKeyPair(random32: Uint8Array): { privateKey: Uint8Array; publicKeyBase64: string } {
  if (!p256.utils.isValidPrivateKey(random32)) throw new Error('bad random key');
  return { privateKey: random32, publicKeyBase64: bytesToBase64(p256.getPublicKey(random32, false)) };
}

/** Signs sha256(challenge) with the private key; r||s (64 bytes) in base64: what the server checks. */
export function signChallengeWith(privateKey: Uint8Array, challenge: string): string {
  return bytesToBase64(p256.sign(sha256(textBytes(challenge)), privateKey).toCompactRawBytes());
}

export const isValidKey = (k: Uint8Array) => p256.utils.isValidPrivateKey(k);
