/**
 * Implements the Synthesis Quality Score (SQS) calculation as specified in the README section:
 * "The Synthesis Quality Score"
 * 
 * Formula:
 * SQS = (0.30 * TFS) + (0.20 * PCS) + (0.25 * HES) + (0.15 * CTS) + (0.10 * FDF) - MP
 * 
 * TFS  Technical Fidelity Score       [0–100]
 * PCS  Provenance Completeness Score  [0–100]
 * HES  Human Engagement Score         [0–100]
 * CTS  Creator Trust Score            [0–100]
 * FDF  Freshness Decay Factor         [0–100]
 * MP   Moderation Penalty             [0–100]
 * 
 * Hard rule: Any video carrying an unresolved severe moderation flag is excluded
 * from Discovery regardless of its SQS.
 */

export interface SQSSignals {
  tfs: number; // Technical Fidelity Score [0-100]
  pcs: number; // Provenance Completeness Score [0-100]
  hes: number; // Human Engagement Score [0-100]
  cts: number; // Creator Trust Score [0-100]
  fdf: number; // Freshness Decay Factor [0-100]
  mp: number;  // Moderation Penalty [0-100]
  hasSevereFlag?: boolean;
}

export interface SQSResult {
  sqs: number;
  excludedFromDiscovery: boolean;
  breakdown: SQSSignals;
}

export function calculateSQS(signals: SQSSignals): SQSResult {
  const clamp = (val: number) => Math.max(0, Math.min(100, val));

  const tfs = clamp(signals.tfs);
  const pcs = clamp(signals.pcs);
  const hes = clamp(signals.hes);
  const cts = clamp(signals.cts);
  const fdf = clamp(signals.fdf);
  const mp = clamp(signals.mp);

  if (signals.hasSevereFlag) {
    return {
      sqs: 0,
      excludedFromDiscovery: true,
      breakdown: { tfs, pcs, hes, cts, fdf, mp, hasSevereFlag: true },
    };
  }

  const rawSqs = (0.30 * tfs) + (0.20 * pcs) + (0.25 * hes) + (0.15 * cts) + (0.10 * fdf) - mp;
  const sqs = Math.max(0, Math.min(100, Math.round(rawSqs * 100) / 100));

  return {
    sqs,
    excludedFromDiscovery: false,
    breakdown: { tfs, pcs, hes, cts, fdf, mp, hasSevereFlag: false },
  };
}
