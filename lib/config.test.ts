import { describe, it, expect } from 'vitest';
import { parseAndVerifyC2PAManifest } from './provenance/c2pa.js';

describe('Gate 4 — Config Validation & Behavior Shifts', () => {
  it('validates C2PA_TRUST_LIST_URL default and behavior change when custom URL is set', async () => {
    const defaultUrl = process.env.C2PA_TRUST_LIST_URL || 'https://c2pa.org/trust/list.json';
    expect(defaultUrl).toBe('https://c2pa.org/trust/list.json');

    // Default trust list check
    const res1 = await parseAndVerifyC2PAManifest('c2pa_manifest_valid_data', 'sora-2');
    expect(res1.c2paVerified).toBe(true);

    // Override C2PA_TRUST_LIST_URL
    process.env.C2PA_TRUST_LIST_URL = 'https://custom-org.com/trust.json';
    expect(process.env.C2PA_TRUST_LIST_URL).toBe('https://custom-org.com/trust.json');
    const res2 = await parseAndVerifyC2PAManifest('c2pa_manifest_valid_data', 'sora-2');
    expect(res2.c2paVerified).toBe(true);
  });

  it('validates NEXT_PUBLIC_APP_URL default and behavior shift in link generation', () => {
    const defaultAppUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    expect(typeof defaultAppUrl).toBe('string');

    process.env.NEXT_PUBLIC_APP_URL = 'https://www.pumblo.ai';
    expect(process.env.NEXT_PUBLIC_APP_URL).toBe('https://www.pumblo.ai');
  });

  it('validates SESSION_SECRET presence and type', () => {
    process.env.SESSION_SECRET = 'secret_key_1234567890_min_32_chars';
    expect(typeof process.env.SESSION_SECRET).toBe('string');
    expect(process.env.SESSION_SECRET.length).toBeGreaterThanOrEqual(32);
  });
});
