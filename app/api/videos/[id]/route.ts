import { getChatGPTUser } from "@/app/chatgpt-auth";
import { deleteVideo, getVideo, mediaBucket } from "@/db";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getChatGPTUser();
  if (!user) return Response.json({ error: "Sign in required." }, { status: 401 });

  const { id } = await params;
  const video = await getVideo(id);
  if (!video) return Response.json({ error: "Video not found." }, { status: 404 });
  if (video.ownerEmail !== user.email.toLowerCase()) {
    return Response.json(
      { error: "Only the owner can delete this video." },
      { status: 403 },
    );
  }

  await mediaBucket().delete(video.objectKey);
  const deleted = await deleteVideo(id, user.email);
  if (!deleted) return Response.json({ error: "Video not found." }, { status: 404 });
  return Response.json({ deleted: true });
}

