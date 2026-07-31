import type { MetadataRoute } from "next";

const base = "https://pumblo-ai-video.oumaribrahim123.chatgpt.site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/settings/", "/upload", "/api/"],
    },
    sitemap: `${base}/sitemap.xml`,
  };
}
