import assert from "node:assert/strict";
import test from "node:test";
import {
  isQuickDuration,
  QUICK_DURATION_CEILING_SECONDS,
} from "../app/lib/quicks.ts";

test("Quicks are positive and strictly shorter than sixty seconds", () => {
  assert.equal(QUICK_DURATION_CEILING_SECONDS, 60);
  assert.equal(isQuickDuration(0), false);
  assert.equal(isQuickDuration(0.01), true);
  assert.equal(isQuickDuration(59.999), true);
  assert.equal(isQuickDuration(60), false);
  assert.equal(isQuickDuration(Number.NaN), false);
});
