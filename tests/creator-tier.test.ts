import assert from "node:assert/strict";
import test from "node:test";
import { creatorTier, type TierEpisode } from "../app/lib/creator-tier.ts";

function episodes(
  seriesId: string,
  count: number,
  durationSeconds: number,
  startDay: number,
): TierEpisode[] {
  return Array.from({ length: count }, (_, index) => ({
    seriesId,
    seasonNumber: 1,
    episodeNumber: index + 1,
    durationSeconds,
    createdAt: new Date(Date.UTC(2026, 0, startDay + index)).toISOString(),
  }));
}

test("Story Tier starts at Rising and awards C only for a real three-part season", () => {
  assert.equal(creatorTier([]).grade, "Rising");
  assert.equal(creatorTier(episodes("one", 3, 60, 1)).grade, "C");
  assert.equal(
    creatorTier([
      ...episodes("split", 2, 90, 1),
      { ...episodes("split", 1, 90, 3)[0], seasonNumber: 2 },
    ]).grade,
    "Rising",
  );
});

test("short, duplicate, and gapped episodes cannot inflate Story Tier", () => {
  assert.equal(creatorTier(episodes("short", 3, 59.99, 1)).grade, "Rising");
  const gap = episodes("gap", 3, 90, 1);
  gap[2].episodeNumber = 4;
  assert.equal(creatorTier(gap).grade, "Rising");
  const duplicate = episodes("duplicate", 3, 90, 1);
  duplicate[2].episodeNumber = 2;
  assert.equal(creatorTier(duplicate).grade, "Rising");
});

test("B and A require increasing series, runtime, episode, and publishing-span proof", () => {
  const tierB = creatorTier([
    ...episodes("one", 3, 70, 1),
    ...episodes("two", 3, 70, 8),
  ]);
  assert.equal(tierB.grade, "B");
  assert.equal(tierB.totalRuntimeSeconds, 420);

  const tierA = creatorTier([
    ...episodes("one", 3, 80, 1),
    ...episodes("two", 3, 80, 11),
    ...episodes("three", 3, 80, 22),
  ]);
  assert.equal(tierA.grade, "A");
  assert.equal(tierA.qualifyingSeries, 3);
  assert.equal(tierA.qualifyingEpisodes, 9);
  assert.equal(tierA.totalRuntimeSeconds, 720);
  assert.ok(tierA.publishingSpanDays >= 21);
});
