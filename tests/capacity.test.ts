import assert from "node:assert/strict";
import test from "node:test";
import {
  LAUNCH_CREATOR_TARGET,
  MAX_LAUNCH_MEDIA_BYTES,
  MAX_LAUNCH_PROFILE_MEDIA_BYTES,
  MAX_LAUNCH_STORAGE_BYTES,
  MAX_PROFILE_IMAGE_BYTES,
  MAX_VIDEO_BYTES,
  MAX_VIDEOS_PER_PROFILE,
} from "../app/lib/limits.ts";

test("the launch envelope is 100 creators, two 40 MB videos each", () => {
  assert.equal(LAUNCH_CREATOR_TARGET, 100);
  assert.equal(MAX_VIDEOS_PER_PROFILE, 2);
  assert.equal(MAX_VIDEO_BYTES, 40 * 1024 * 1024);
  assert.equal(
    MAX_LAUNCH_MEDIA_BYTES,
    LAUNCH_CREATOR_TARGET * MAX_VIDEOS_PER_PROFILE * MAX_VIDEO_BYTES,
  );
  assert.ok(MAX_LAUNCH_MEDIA_BYTES <= 8_000 * 1024 * 1024);
  assert.equal(MAX_PROFILE_IMAGE_BYTES, 3 * 1024 * 1024);
  assert.equal(
    MAX_LAUNCH_PROFILE_MEDIA_BYTES,
    LAUNCH_CREATOR_TARGET * 2 * MAX_PROFILE_IMAGE_BYTES,
  );
  assert.equal(
    MAX_LAUNCH_STORAGE_BYTES,
    MAX_LAUNCH_MEDIA_BYTES + MAX_LAUNCH_PROFILE_MEDIA_BYTES,
  );
  assert.ok(MAX_LAUNCH_STORAGE_BYTES <= 8_600 * 1024 * 1024);
});
