import { describe, it, expect, beforeEach } from 'vitest';
import { db } from '../db/index.js';
import { runAutomatedCSAMCheck, submitConsentDocumentation, isConsentApproved, processModerationFlag } from './index.js';

describe('Moderation, Consent Registry & Strikes Policy', () => {
  beforeEach(async () => {
    await db.clear();
  });

  it('detects prohibited CSAM content immediately', () => {
    const isViolation = runAutomatedCSAMCheck('csam_prohibited_signature_test');
    expect(isViolation).toBe(true);
  });

  it('manages Consent Registry records for real person depiction', async () => {
    const user = await db.createUser({
      email: 'creator@test.com',
      passwordHash: 'hash',
      handle: 'creator',
      isVerifiedEmail: true,
      isHumanVerified: true,
      role: 'user',
    });
    const video = await db.createVideo({
      title: 'Real Person Depiction',
      userId: user.id,
      generationTool: 'sora-2',
      generationMode: 'text-to-video',
      license: 'cc-by-4.0',
      depictsRealPerson: true,
      c2paVerified: true,
      pcsScore: 100,
      sqsScore: 85,
      videoUrl: 'https://cdn.pumblo.ai/video.mp4',
      status: 'moderation_review',
      hasSevereFlag: false,
    });

    expect(await isConsentApproved(video.id)).toBe(false);

    await submitConsentDocumentation(video.id, user.id, 'John Doe', 'doc_ref_123');
    expect(await isConsentApproved(video.id)).toBe(true);
  });

  it('accrues 3 strikes resulting in permanent account ban', async () => {
    const user = await db.createUser({
      email: 'spammer@test.com',
      passwordHash: 'hash',
      handle: 'spammer',
      isVerifiedEmail: true,
      isHumanVerified: true,
      role: 'user',
    });

    const v1 = await db.createVideo({
      title: 'V1', userId: user.id, generationTool: 'custom', generationMode: 'text-to-video',
      license: 'cc0', depictsRealPerson: false, c2paVerified: false, pcsScore: 0, sqsScore: 10,
      videoUrl: 'v1.mp4', status: 'published', hasSevereFlag: false,
    });
    const v2 = await db.createVideo({
      title: 'V2', userId: user.id, generationTool: 'custom', generationMode: 'text-to-video',
      license: 'cc0', depictsRealPerson: false, c2paVerified: false, pcsScore: 0, sqsScore: 10,
      videoUrl: 'v2.mp4', status: 'published', hasSevereFlag: false,
    });
    const v3 = await db.createVideo({
      title: 'V3', userId: user.id, generationTool: 'custom', generationMode: 'text-to-video',
      license: 'cc0', depictsRealPerson: false, c2paVerified: false, pcsScore: 0, sqsScore: 10,
      videoUrl: 'v3.mp4', status: 'published', hasSevereFlag: false,
    });

    await processModerationFlag(v1.id, true);
    await processModerationFlag(v2.id, true);
    expect(user.isBanned).toBe(false);

    await processModerationFlag(v3.id, true);
    expect(user.isBanned).toBe(true);
  });
});
