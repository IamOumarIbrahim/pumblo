export const QUICK_DURATION_CEILING_SECONDS = 60;

export function isQuickDuration(durationSeconds: number): boolean {
  return (
    Number.isFinite(durationSeconds) &&
    durationSeconds > 0 &&
    durationSeconds < QUICK_DURATION_CEILING_SECONDS
  );
}
