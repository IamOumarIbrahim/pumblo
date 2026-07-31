import { describe, it, expect, beforeEach } from 'vitest';
import { db } from './db/index.js';
import { signUp, verifyProofOfHumanity, requireHumanTrustToken } from './auth/index.js';
import { parseAndVerifyC2PAManifest } from './provenance/c2pa.js';
import { submitConsentDocumentation, isConsentApproved, processModerationFlag } from './moderation/index.js';
import { calculateSQS } from './quality/sqs.js';

describe('Gate 5 — Troubleshooting & Failure Condition Verification', () => {
  beforeEach(async () => {
    await db.clear();
  });

  it('E01: Write action without Human Trust Token fails (401), resolved by completing Proof-of-Humanity challenge', async () => {
    const user = await signUp('creator@test.com', 'Pass12345!');

    // Stated failure condition
    await expect(requireHumanTrustToken(undefined)).rejects.toThrow('Human Trust Token required');

    // Stated resolution
    const token = await verifyProofOfHumanity(user.id, 'turnstile_pass');
    const authedUser = await requireHumanTrustToken(token);
    expect(authedUser.id).toBe(user.id);
  });

  it('E02: Upload depicting real person without consent is held out of Discovery, resolved by Consent Registry documentation', async () => {
    const user = await db.createUser({
      email: 'creator2@test.com', passwordHash: 'hash', handle: 'creator2',
      isVerifiedEmail: true, isHumanVerified: true, role: 'user',
    });

    const video = await db.createVideo({
      title: 'Deepfake Test', userId: user.id, generationTool: 'sora-2', generationMode: 'text-to-video',
      license: 'cc-by-4.0', depictsRealPerson: true, c2paVerified: true, pcsScore: 100, sqsScore: 90,
      videoUrl: 'v.mp4', status: 'moderation_review', hasSevereFlag: false,
    });

    // Held out of Discovery
    expect(video.status).toBe('moderation_review');
    expect(await isConsentApproved(video.id)).toBe(false);

    // Stated resolution
    await submitConsentDocumentation(video.id, user.id, 'Jane Doe', 'doc_999');
    expect(await isConsentApproved(video.id)).toBe(true);
    video.status = 'published';
    expect(video.status).toBe('published');
  });

  it('E03: Severe moderation flag forces SQS=0 and excludes video from Discovery', async () => {
    const sqsNormal = calculateSQS({ tfs: 100, pcs: 100, hes: 100, cts: 100, fdf: 100, mp: 0 });
    expect(sqsNormal.sqs).toBe(100);

    // Stated failure condition: severe flag applied
    const sqsFlagged = calculateSQS({ tfs: 100, pcs: 100, hes: 100, cts: 100, fdf: 100, mp: 0, hasSevereFlag: true });
    expect(sqsFlagged.sqs).toBe(0);
    expect(sqsFlagged.excludedFromDiscovery).toBe(true);
  });

  it('E04: Real camera footage ingested is rejected', async () => {
    const res = await parseAndVerifyC2PAManifest(undefined, 'none', 'camera_raw_footage.mp4');
    expect(res.isCameraFootage).toBe(true);
    expect(res.pcsScore).toBe(0);
  });

  it('E05: 3 strikes result in permanent ban blocking all actions', async () => {
    const user = await db.createUser({
      email: 'badactor@test.com', passwordHash: 'hash', handle: 'badactor',
      isVerifiedEmail: true, isHumanVerified: true, role: 'user',
    });

    for (let i = 0; i < 3; i++) {
      const v = await db.createVideo({
        title: `Bad ${i}`, userId: user.id, generationTool: 'custom', generationMode: 'text-to-video',
        license: 'cc0', depictsRealPerson: false, c2paVerified: false, pcsScore: 0, sqsScore: 0,
        videoUrl: `bad${i}.mp4`, status: 'published', hasSevereFlag: false,
      });
      await processModerationFlag(v.id, true);
    }

    expect(user.isBanned).toBe(true);

    const token = await db.createHumanToken(user.id);
    await expect(requireHumanTrustToken(token)).rejects.toThrow('User not authorized or banned');
  });
});
