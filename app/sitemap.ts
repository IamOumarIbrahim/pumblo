import type { MetadataRoute } from "next";
import { listVideos } from "@/db";

const base = "https://pumblo-ai-video.oumaribrahim123.chatgpt.site";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const videos = await listVideos({ sort: "newest", limit: 100 });
  return [
    {
      url: base,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${base}/about`,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    ...videos.map((video) => ({
      url: `${base}/watch/${video.id}`,
      lastModified: new Date(video.createdAt),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
