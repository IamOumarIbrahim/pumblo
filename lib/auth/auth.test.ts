import { describe, it, expect, beforeEach } from 'vitest';
import { db } from '../db/index.js';
import { signUp, login, verifyProofOfHumanity, requireHumanTrustToken, hashPassword, verifyPassword } from './index.js';

describe('Auth & Human Trust Token System', () => {
  beforeEach(async () => {
    await db.clear();
  });

  it('hashes passwords securely and verifies them', async () => {
    const hash = await hashPassword('SecretPass123!');
    expect(hash).toContain('argon2id');
    const valid = await verifyPassword('SecretPass123!', hash);
    expect(valid).toBe(true);
    const invalid = await verifyPassword('WrongPass', hash);
    expect(invalid).toBe(false);
  });

  it('enforces email signup and login session creation', async () => {
    const user = await signUp('creator@example.com', 'Pass12345!', 'creator1');
    expect(user.email).toBe('creator@example.com');
    expect(user.isHumanVerified).toBe(false);

    const { sessionId } = await login('creator@example.com', 'Pass12345!');
    expect(sessionId).toMatch(/^sess_/);
  });

  it('requires Proof-of-Humanity before issuing Human Trust Token', async () => {
    const user = await signUp('human@example.com', 'Pass12345!');
    
    // Attempt write without Human Trust Token
    await expect(requireHumanTrustToken(undefined)).rejects.toThrow('Human Trust Token required');

    // Complete Proof of Humanity challenge
    const token = await verifyProofOfHumanity(user.id, 'turnstile_pass_token');
    expect(token).toMatch(/^htt_/);

    const verifiedUser = await requireHumanTrustToken(token);
    expect(verifiedUser.id).toBe(user.id);
  });
});
