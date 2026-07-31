import { listProfiles, listSeries, listVideos } from "@/db";

const base = "https://pumblo-ai-video.oumaribrahim123.chatgpt.site";

export async function GET() {
  const [videos, profiles, series] = await Promise.all([
    listVideos({ sort: "newest", limit: 100 }),
    listProfiles({ limit: 100 }),
    listSeries({ limit: 100 }),
  ]);
  const entries = [
    urlEntry(base, new Date().toISOString(), "daily", "1.0"),
    urlEntry(`${base}/quicks`, new Date().toISOString(), "daily", "0.9"),
    urlEntry(`${base}/about`, undefined, "monthly", "0.6"),
    ...series.map((item) =>
      urlEntry(`${base}/series/${encodeURIComponent(item.id)}`, item.updatedAt, "weekly", "0.8"),
    ),
    ...profiles.map((profile) =>
      urlEntry(
        `${base}/profile/${encodeURIComponent(profile.handle)}`,
        profile.updatedAt,
        "weekly",
        "0.7",
      ),
    ),
    ...videos.map((video) =>
      urlEntry(
        `${base}/watch/${encodeURIComponent(video.id)}`,
        video.createdAt,
        "weekly",
        "0.8",
      ),
    ),
  ].join("");

  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${entries}</urlset>`,
    {
      headers: {
        "Cache-Control": "public, max-age=900",
        "Content-Type": "application/xml; charset=utf-8",
      },
    },
  );
}

function urlEntry(
  url: string,
  lastModified: string | undefined,
  frequency: string,
  priority: string,
): string {
  return `<url><loc>${escapeXml(url)}</loc>${lastModified ? `<lastmod>${escapeXml(lastModified)}</lastmod>` : ""}<changefreq>${frequency}</changefreq><priority>${priority}</priority></url>`;
}

function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}
