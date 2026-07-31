import { getVideo, incrementViews } from "@/db";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const video = await getVideo(id);
  if (!video) return Response.json({ error: "Video not found." }, { status: 404 });
  await incrementViews(id);
  return new Response(null, { status: 204 });
}

