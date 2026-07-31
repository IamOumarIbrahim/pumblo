const base = "https://pumblo-ai-video.oumaribrahim123.chatgpt.site";

export function GET() {
  return new Response(
    [
      "User-agent: *",
      "Allow: /",
      "Disallow: /settings/",
      "Disallow: /upload",
      "Disallow: /api/",
      `Sitemap: ${base}/sitemap.xml`,
      "",
    ].join("\n"),
    {
      headers: {
        "Cache-Control": "public, max-age=3600",
        "Content-Type": "text/plain; charset=utf-8",
      },
    },
  );
}
