import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

async function text(path) {
  return readFile(new URL(path, root), "utf8");
}

test("Sites provisioning declares durable database and film storage", async () => {
  const config = JSON.parse(await text(".openai/hosting.json"));
  assert.match(config.project_id, /^appgprj_/);
  assert.equal(config.d1, "DB");
  assert.equal(config.r2, "MEDIA");
});

test("growth is not blocked by a fake signup cap and storage guards remain", async () => {
  const database = await text("db/index.ts");
  assert.doesNotMatch(database, /MAX_PROFILES|10-person beta/);
  assert.doesNotMatch(database, /SELECT COUNT\(\*\) AS count FROM profiles/);
  assert.match(database, /MAX_VIDEO_BYTES = 90 \* 1024 \* 1024/);
  assert.match(await text("app/api/videos/route.ts"), /MAX_FILMS_PER_PROFILE = 5/);
});

test("film uploads stream into R2 instead of buffering multipart files", async () => {
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

test("the promised two-person journey has server routes", async () => {
  const paths = [
    "app/page.tsx",
    "app/settings/profile/page.tsx",
    "app/profile/[handle]/page.tsx",
    "app/upload/page.tsx",
    "app/watch/[id]/page.tsx",
    "app/media/[id]/route.ts",
    "app/api/videos/[id]/like/route.ts",
    "app/api/videos/[id]/comments/route.ts",
    "app/manifest.ts",
    "app/robots.ts",
    "app/sitemap.ts",
  ];
  await Promise.all(paths.map((path) => stat(new URL(path, root))));
});

test("the first-user wedge is explicit and has a direct publishing action", async () => {
  const home = await text("app/page.tsx");
  assert.match(home, /For AI motion creators/);
  assert.match(home, /Give the clip a home/);
  assert.match(home, /Create a film page/);
  assert.match(home, /useful before it is popular/i);
  assert.match(home, /Star Pumblo on GitHub/);
});

test("profile and upload setup remove avoidable friction", async () => {
  const profile = await text("app/components/ProfileForm.tsx");
  const upload = await text("app/components/UploadForm.tsx");
  assert.match(profile, /suggestedHandle\(suggestedName\)/);
  assert.equal((profile.match(/\brequired\b/g) ?? []).length, 2);
  assert.match(upload, /<input[\s\S]*name="generationTool"[\s\S]*list="generation-tools"/);
  assert.match(upload, /value="hybrid-workflow"/);
  assert.doesNotMatch(upload, /<select name="generationTool"/);
});

test("film pages have canonical metadata and progressive sharing", async () => {
  const layout = await text("app/layout.tsx");
  const watch = await text("app/watch/[id]/page.tsx");
  const engagement = await text("app/components/Engagement.tsx");
  assert.match(layout, /url: "\/og\.png"/);
  assert.match(watch, /alternates: \{ canonical: `\/watch\/\$\{video\.id\}` \}/);
  assert.match(engagement, /navigator\.share/);
  assert.match(engagement, /navigator\.clipboard\.writeText/);
});

test("the social preview is exactly 1200 by 630", async () => {
  const image = await readFile(new URL("public/og.png", root));
  assert.equal(image.subarray(1, 4).toString("ascii"), "PNG");
  assert.equal(image.readUInt32BE(16), 1200);
  assert.equal(image.readUInt32BE(20), 630);
});

test("market-facing source makes no unsupported trust or quality claim", async () => {
  const files = await Promise.all(
    [
      "README.md",
      "app/page.tsx",
      "app/about/page.tsx",
      "app/components/VideoCard.tsx",
      "app/components/UploadForm.tsx",
      "app/watch/[id]/page.tsx",
    ].map(text),
  );
  const marketSource = files.join("\n");
  assert.doesNotMatch(
    marketSource,
    /provably AI-generated|human verified|human signed|SQS|quality score|10-person beta/i,
  );
  assert.match(marketSource, /creator-declared/i);
});
