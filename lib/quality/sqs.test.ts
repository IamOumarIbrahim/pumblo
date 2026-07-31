import { describe, it, expect } from 'vitest';
import { calculateSQS } from './sqs.js';

describe('Synthesis Quality Score (SQS) - README Mathematical Foundations', () => {
  it('correctly calculates SQS for reference case 1 (hand-computed: 91.25)', () => {
    const res = calculateSQS({
      tfs: 90,
      pcs: 100,
      hes: 80,
      cts: 95,
      fdf: 100,
      mp: 0,
    });
    expect(res.sqs).toBe(91.25);
    expect(res.excludedFromDiscovery).toBe(false);
  });

  it('correctly applies moderation penalty (hand-computed: 53.5)', () => {
    const res = calculateSQS({
      tfs: 80,
      pcs: 50,
      hes: 60,
      cts: 70,
      fdf: 90,
      mp: 15,
    });
    expect(res.sqs).toBe(53.5);
    expect(res.excludedFromDiscovery).toBe(false);
  });

  it('enforces hard exclusion rule for severe moderation flags', () => {
    const res = calculateSQS({
      tfs: 100,
      pcs: 100,
      hes: 100,
      cts: 100,
      fdf: 100,
      mp: 0,
      hasSevereFlag: true,
    });
    expect(res.sqs).toBe(0);
    expect(res.excludedFromDiscovery).toBe(true);
  });
});
