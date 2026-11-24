import { createPublicKey, randomBytes, verify } from 'node:crypto';
import { newKeyPair, signChallengeWith } from '../src/services/signing';
import { bytesToBase64, bytesToHex, hexToBytes, textBytes } from '../src/utils/base64';

/** The same check the school's server makes (apps/api/src/attendance/biometric.service.ts verifyAppSignature). */
const SPKI = Buffer.from('3059301306072a8648ce3d020106082a8648ce3d030107034200', 'hex');
function serverVerifies(publicKeyBase64: string, challenge: string, signatureBase64: string): boolean {
  try {
    const key = createPublicKey({ key: Buffer.concat([SPKI, Buffer.from(publicKeyBase64, 'base64')]), format: 'der', type: 'spki' });
    const sig = Buffer.from(signatureBase64, 'base64');
    return sig.length === 64 && verify('sha256', Buffer.from(challenge, 'utf8'), { key, dsaEncoding: 'ieee-p1363' }, sig);
  } catch { return false; }
}

describe('attendance key (phone signs, server verifies)', () => {
  const phone = newKeyPair(randomBytes(32));
  it('the public key has the shape the server expects (65-byte point, base64 of 88 characters)', () => {
    expect(phone.publicKeyBase64).toMatch(/^[A-Za-z0-9+/]{87}=$/);
    expect(Buffer.from(phone.publicKeyBase64, 'base64')[0]).toBe(4);
  });
  it('a signature over the challenge is accepted by the server\'s check', () => {
    const challenge = randomBytes(32).toString('base64url');
    expect(serverVerifies(phone.publicKeyBase64, challenge, signChallengeWith(phone.privateKey, challenge))).toBe(true);
  });
  it('is refused for another challenge or another phone', () => {
    const other = newKeyPair(randomBytes(32));
    const sig = signChallengeWith(phone.privateKey, 'challenge-1');
    expect(serverVerifies(phone.publicKeyBase64, 'challenge-2', sig)).toBe(false);
    expect(serverVerifies(other.publicKeyBase64, 'challenge-1', sig)).toBe(false);
  });
});

describe('byte helpers', () => {
  it('base64 matches Node for every length', () => { for (let n = 0; n < 40; n++) { const b = randomBytes(n); expect(bytesToBase64(b)).toBe(b.toString('base64')); } });
  it('hex round trip and utf-8', () => {
    const b = randomBytes(33); expect(Buffer.from(hexToBytes(bytesToHex(b)))).toEqual(b);
    expect(Buffer.from(textBytes('Aé€😀'))).toEqual(Buffer.from('Aé€😀', 'utf8'));
  });
});
