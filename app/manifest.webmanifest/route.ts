export function GET() {
  return Response.json(
    {
      name: "Pumblo - The AI-only video platform",
      short_name: "Pumblo",
      description:
        "Watch, upload, search, like, comment, and follow AI video creators.",
      start_url: "/",
      display: "standalone",
      background_color: "#090a0c",
      theme_color: "#b8ff3d",
      shortcuts: [
        { name: "Quicks", short_name: "Quicks", url: "/quicks" },
        { name: "Upload AI video", short_name: "Upload", url: "/upload" },
      ],
    },
    {
      headers: {
        "Cache-Control": "public, max-age=3600",
        "Content-Type": "application/manifest+json",
      },
    },
  );
}
