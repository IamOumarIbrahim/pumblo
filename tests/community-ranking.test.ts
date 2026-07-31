import assert from "node:assert/strict";
import test from "node:test";
import {
  COMMUNITY_ORDER_SQL,
  communityScore,
} from "../app/lib/community-ranking.ts";

test("community points give visible engagement documented weights", () => {
  assert.equal(communityScore({ likes: 1, comments: 1, views: 20 }), 11);
  assert.equal(communityScore({ likes: 2, comments: 0, views: 0 }), 12);
});

test("views cannot overwhelm creator feedback", () => {
  assert.equal(communityScore({ likes: 0, comments: 0, views: 500 }), 25);
  assert.equal(communityScore({ likes: 0, comments: 0, views: 50_000 }), 25);
});

test("invalid and fractional signals are safely normalized", () => {
  assert.ok(
    Math.abs(
      communityScore({ likes: -3, comments: Number.NaN, views: 19.9 }) - 0.95,
    ) < Number.EPSILON,
  );
});

test("database order uses the same observable signals and recency tie-break", () => {
  assert.match(COMMUNITY_ORDER_SQL, /likes[\s\S]*\* 6/);
  assert.match(COMMUNITY_ORDER_SQL, /comments[\s\S]*\* 4/);
  assert.match(COMMUNITY_ORDER_SQL, /MIN\(v\.views, 500\) \* 0\.05/);
  assert.match(COMMUNITY_ORDER_SQL, /v\.created_at DESC/);
  assert.doesNotMatch(COMMUNITY_ORDER_SQL, /sqs/i);
});
