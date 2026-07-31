import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

async function text(path) {
  return readFile(new URL(path, root), "utf8");
}

test("Sites provisioning declares durable database and video storage", async () => {
  const config = JSON.parse(await text(".openai/hosting.json"));
  assert.match(config.project_id, /^appgprj_/);
  assert.equal(config.d1, "DB");
  assert.equal(config.r2, "MEDIA");
});

test("the beta capacity and upload ceiling are enforced in the data layer", async () => {
  const database = await text("db/index.ts");
  assert.match(database, /MAX_PROFILES = 10/);
  assert.match(database, /MAX_VIDEO_BYTES = 90 \* 1024 \* 1024/);
  assert.match(database, /The 10-person beta is currently full/);
});

test("video uploads stream into R2 instead of buffering multipart files", async () => {
  const route = await text("app/api/videos/route.ts");
  assert.match(route, /bucket\.put\(objectKey, request\.body/);
  assert.doesNotMatch(route, /request\.formData\(\)/);
  assert.match(route, /storedObject\.size !== declaredSize/);
});

test("production identity comes from Sign in with ChatGPT headers", async () => {
  const auth = await text("app/chatgpt-auth.ts");
  const devSession = await text("app/api/dev-session/route.ts");
  assert.match(auth, /oai-authenticated-user-email/);
  assert.match(devSession, /process\.env\.NODE_ENV !== "development"/);
  assert.match(devSession, /status: 404/);
});

test("the requested user journeys have server routes", async () => {
  const paths = [
    "app/page.tsx",
    "app/settings/profile/page.tsx",
    "app/profile/[handle]/page.tsx",
    "app/upload/page.tsx",
    "app/watch/[id]/page.tsx",
    "app/media/[id]/route.ts",
    "app/api/videos/[id]/like/route.ts",
    "app/api/videos/[id]/comments/route.ts",
  ];
  await Promise.all(paths.map((path) => stat(new URL(path, root))));
});

test("the social preview is the required Open Graph size", async () => {
  const image = await readFile(new URL("public/pumblo-social.png", root));
  assert.equal(image.subarray(1, 4).toString("ascii"), "PNG");
  assert.equal(image.readUInt32BE(16), 1200);
  assert.equal(image.readUInt32BE(20), 630);
});

test("README makes no unsupported cryptographic provenance claim", async () => {
  const readme = await text("README.md");
  assert.match(readme, /self-declared/i);
  assert.doesNotMatch(readme, /provably AI-generated/i);
  assert.doesNotMatch(readme, /C2PA verified/i);
});
