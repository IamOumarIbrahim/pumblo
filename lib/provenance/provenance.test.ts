import { describe, it, expect } from 'vitest';
import { parseAndVerifyC2PAManifest } from './c2pa.js';

describe('C2PA Provenance & Ingest Validation', () => {
  it('assigns PCS 100 and verified badge for valid C2PA manifest', async () => {
    const res = await parseAndVerifyC2PAManifest('c2pa_manifest_valid_data', 'runway-gen4');
    expect(res.c2paVerified).toBe(true);
    expect(res.pcsScore).toBe(100);
    expect(res.requiresReview).toBe(false);
  });

  it('assigns PCS 50 and triggers moderation review for self-declared tool without C2PA', async () => {
    const res = await parseAndVerifyC2PAManifest(undefined, 'sora-2');
    expect(res.c2paVerified).toBe(false);
    expect(res.pcsScore).toBe(50);
    expect(res.requiresReview).toBe(true);
  });

  it('rejects real camera footage at ingest', async () => {
    const res = await parseAndVerifyC2PAManifest(undefined, 'none', 'camera_raw_001.mp4');
    expect(res.isCameraFootage).toBe(true);
    expect(res.pcsScore).toBe(0);
    expect(res.requiresReview).toBe(true);
  });
});
