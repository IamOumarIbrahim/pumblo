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

test("the 100-creator launch has enforceable media guards and no signup wall", async () => {
  const database = await text("db/index.ts");
  const limits = await text("app/lib/limits.ts");
  assert.doesNotMatch(database, /MAX_PROFILES|SELECT COUNT\(\*\) AS count FROM profiles/);
  assert.match(limits, /LAUNCH_CREATOR_TARGET = 100/);
  assert.match(limits, /MAX_VIDEOS_PER_PROFILE = 2/);
  assert.match(limits, /MAX_VIDEO_BYTES = 40 \* 1024 \* 1024/);
  assert.match(await text("app/api/videos/route.ts"), /MAX_VIDEOS_PER_PROFILE/);
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

test("the promised two-person journey has server routes", async () => {
  const paths = [
    "app/page.tsx",
    "app/settings/profile/page.tsx",
    "app/profile/[handle]/page.tsx",
    "app/profile-media/[handle]/[kind]/route.ts",
    "app/following/page.tsx",
    "app/quicks/page.tsx",
    "app/upload/page.tsx",
    "app/watch/[id]/page.tsx",
    "app/media/[id]/route.ts",
    "app/api/videos/[id]/like/route.ts",
    "app/api/videos/[id]/comments/route.ts",
    "app/api/videos/[id]/route.ts",
    "app/api/videos/[id]/view/route.ts",
    "app/api/quicks/route.ts",
    "app/api/profile/media/[kind]/route.ts",
    "app/api/profiles/[handle]/follow/route.ts",
    "app/manifest.webmanifest/route.ts",
    "app/robots.txt/route.ts",
    "app/sitemap.xml/route.ts",
    "app/favicon.svg/route.ts",
  ];
  await Promise.all(paths.map((path) => stat(new URL(path, root))));
});

test("profiles support cropped avatar and banner create, update, read, and removal", async () => {
  const crop = await text("app/components/ImageCropField.tsx");
  const form = await text("app/components/ProfileForm.tsx");
  const mediaApi = await text("app/api/profile/media/[kind]/route.ts");
  const mediaRead = await text("app/profile-media/[handle]/[kind]/route.ts");
  const schema = await text("db/schema.ts");
  assert.match(crop, /512, height: 512/);
  assert.match(crop, /1600, height: 480/);
  assert.match(crop, /toBlob/);
  assert.match(crop, /positionX/);
  assert.match(crop, /positionY/);
  assert.match(form, /Finish each open crop/);
  assert.match(form, /method: action\.action === "delete" \? "DELETE" : "POST"/);
  assert.match(mediaApi, /MAX_PROFILE_IMAGE_BYTES/);
  assert.match(mediaApi, /matchesImageType/);
  assert.match(mediaApi, /readLimitedImage/);
  assert.doesNotMatch(mediaApi, /request\.arrayBuffer/);
  assert.match(mediaRead, /mediaBucket\(\)\.get/);
  assert.match(schema, /avatarObjectKey/);
  assert.match(schema, /bannerObjectKey/);
});

test("Quicks is a strict, paginated, keyboard-accessible community feed", async () => {
  const database = await text("db/index.ts");
  const feed = await text("app/components/QuickFeed.tsx");
  const upload = await text("app/components/UploadForm.tsx");
  const api = await text("app/api/quicks/route.ts");
  assert.match(database, /v\.duration_seconds > 0 AND v\.duration_seconds < /);
  assert.match(database, /OFFSET/);
  assert.match(feed, /ArrowDown/);
  assert.match(feed, /ArrowUp/);
  assert.match(feed, /IntersectionObserver/);
  assert.match(feed, /api\/videos\/\$\{current\.id\}\/view/);
  assert.match(upload, /isQuickDuration/);
  assert.match(api, /QUICK_DURATION_CEILING_SECONDS/);
  assert.doesNotMatch(api, /ownerEmail|objectKey/);
});

test("the left navigation keeps guest viewing open and gates only write actions", async () => {
  const navigation = await text("app/components/SidebarNav.tsx");
  const quicks = await text("app/components/QuickFeed.tsx");
  assert.match(navigation, /label: "Quicks"/);
  assert.match(navigation, /Watch as a guest/);
  assert.match(navigation, /Sign in with ChatGPT/);
  assert.match(quicks, /signInPath/);
  assert.match(quicks, /api\/videos\/\$\{video\.id\}\/like/);
});

test("migration 0003 adds durable profile media references and video duration", async () => {
  const migration = await text("drizzle/0003_flimsy_microchip.sql");
  assert.match(migration, /avatar_object_key/);
  assert.match(migration, /banner_object_key/);
  assert.match(migration, /duration_seconds/);
});

test("the main product is an AI-only video network", async () => {
  const home = await text("app/page.tsx");
  assert.match(home, /AI-only video-sharing network/);
  assert.match(home, /Watch what AI can imagine/);
  assert.match(home, /Explore videos/);
  assert.match(home, /Trending/);
  assert.match(home, /Latest/);
  assert.match(home, /likes, comments, and follows/i);
  assert.match(home, /Star Pumblo on GitHub/);
  assert.doesNotMatch(home, /Give the clip a home/);
});

test("behind-the-render context remains a secondary feature", async () => {
  const home = await text("app/page.tsx");
  const watch = await text("app/watch/[id]/page.tsx");
  assert.match(home, /Go behind the render/);
  assert.match(home, /It supports the video;[\s\S]*does not replace it/);
  assert.match(watch, /Optional creator feature/);
  assert.match(watch, /Behind the render/);
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

test("following is persisted, protected, and queryable", async () => {
  const schema = await text("db/schema.ts");
  const database = await text("db/index.ts");
  const route = await text("app/api/profiles/[handle]/follow/route.ts");
  assert.match(schema, /export const follows = sqliteTable/);
  assert.match(database, /followedByEmail/);
  assert.match(database, /toggleFollow/);
  assert.match(route, /getChatGPTUser/);
  assert.match(route, /You cannot follow yourself/);
});

test("search reaches videos, creators, and creator identities", async () => {
  const database = await text("db/index.ts");
  const home = await text("app/page.tsx");
  const profilesApi = await text("app/api/profiles/route.ts");
  assert.match(database, /LOWER\(p\.handle\)/);
  assert.match(database, /export async function listProfiles/);
  assert.match(home, /listProfiles\(\{ query, limit: 6 \}\)/);
  assert.match(profilesApi, /listProfiles/);
});

test("public query APIs never expose identity emails or storage keys", async () => {
  const videoApi = await text("app/api/videos/route.ts");
  const profileApi = await text("app/api/profiles/route.ts");
  const videoGet = videoApi.slice(
    videoApi.indexOf("export async function GET"),
    videoApi.indexOf("export async function POST"),
  );
  assert.doesNotMatch(videoGet, /ownerEmail|objectKey/);
  assert.doesNotMatch(profileApi, /profile\.email/);
  assert.match(profileApi, /handle: profile\.handle/);
});

test("owners can delete videos and reclaim storage", async () => {
  const route = await text("app/api/videos/[id]/route.ts");
  const button = await text("app/components/DeleteVideoButton.tsx");
  assert.match(route, /Only the owner can delete this video/);
  assert.match(route, /mediaBucket\(\)\.delete/);
  assert.match(button, /method: "DELETE"/);
  assert.match(button, /likes and comments will also be removed/);
});

test("video pages have canonical metadata, structured data, and progressive sharing", async () => {
  const layout = await text("app/layout.tsx");
  const watch = await text("app/watch/[id]/page.tsx");
  const engagement = await text("app/components/Engagement.tsx");
  assert.match(layout, /url: "\/og\.png"/);
  assert.match(layout, /manifest: "\/manifest\.webmanifest"/);
  assert.match(watch, /alternates: \{ canonical: `\/watch\/\$\{video\.id\}` \}/);
  assert.match(watch, /"@type": "VideoObject"/);
  assert.match(engagement, /navigator\.share/);
  assert.match(engagement, /navigator\.clipboard\.writeText/);
});

test("metadata endpoints are explicit Vinext routes and index public entities", async () => {
  const manifest = await text("app/manifest.webmanifest/route.ts");
  const robots = await text("app/robots.txt/route.ts");
  const sitemap = await text("app/sitemap.xml/route.ts");
  const favicon = await text("app/favicon.svg/route.ts");
  assert.match(manifest, /application\/manifest\+json/);
  assert.match(robots, /Sitemap: \$\{base\}\/sitemap\.xml/);
  assert.match(sitemap, /application\/xml/);
  assert.match(sitemap, /listProfiles\(\{ limit: 100 \}\)/);
  assert.match(sitemap, /profile\.handle/);
  assert.match(favicon, /image\/svg\+xml/);
  assert.match(favicon, /aria-label="Pumblo"/);
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
