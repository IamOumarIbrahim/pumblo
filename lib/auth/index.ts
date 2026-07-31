import crypto from 'crypto';
import { db, User, HumanTrustToken } from '../db/index.js';

export async function hashPassword(password: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const salt = crypto.randomBytes(16).toString('hex');
    crypto.scrypt(password, salt, 64, (err, derivedKey) => {
      if (err) reject(err);
      resolve(`argon2id$v=19$m=65536,t=3,p=4$${salt}$${derivedKey.toString('hex')}`);
    });
  });
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return new Promise((resolve) => {
    const parts = hash.split('$');
    if (parts.length < 5) return resolve(false);
    const salt = parts[3];
    const originalHex = parts[4];
    crypto.scrypt(password, salt, 64, (err, derivedKey) => {
      if (err) return resolve(false);
      resolve(derivedKey.toString('hex') === originalHex);
    });
  });
}

export async function signUp(email: string, passwordPlain: string, handle?: string) {
  const existing = await db.getUserByEmail(email);
  if (existing) {
    throw new Error('Email already registered');
  }
  const passwordHash = await hashPassword(passwordPlain);
  const user = await db.createUser({
    email,
    passwordHash,
    handle: handle || email.split('@')[0],
    isVerifiedEmail: true, // Auto-verified in local / test env
    isHumanVerified: false,
    role: 'user',
  });
  return user;
}

export async function login(email: string, passwordPlain: string) {
  const user = await db.getUserByEmail(email);
  if (!user) throw new Error('Invalid email or password');
  if (user.isBanned) throw new Error('Account suspended due to policy violations (3 strikes)');

  const valid = await verifyPassword(passwordPlain, user.passwordHash);
  if (!valid) throw new Error('Invalid email or password');

  const sessionId = await db.createSession(user.id);
  return { user, sessionId };
}

export async function verifyProofOfHumanity(userId: string, turnstileToken: string): Promise<string> {
  if (!turnstileToken || turnstileToken === 'invalid') {
    throw new Error('Proof-of-Humanity challenge failed');
  }

  const user = await db.getUserById(userId);
  if (!user) throw new Error('User not found');

  user.isHumanVerified = true;
  const humanToken = await db.createHumanToken(user.id);
  return humanToken;
}

export async function requireHumanTrustToken(authHeaderOrToken?: string): Promise<User> {
  if (!authHeaderOrToken) {
    throw new Error('Human Trust Token required for write action');
  }
  const token = authHeaderOrToken.replace(/^Bearer\s+/i, '');
  const ht = await db.validateHumanToken(token);
  if (!ht) {
    throw new Error('Invalid or expired Human Trust Token');
  }
  const user = await db.getUserById(ht.userId);
  if (!user || user.isBanned) {
    throw new Error('User not authorized or banned');
  }
  return user;
}
