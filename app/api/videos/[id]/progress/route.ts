import { getChatGPTUser } from "@/app/chatgpt-auth";
import { getProfileByEmail, getVideo, saveWatchProgress } from "@/db";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getChatGPTUser();
  if (!user) return Response.json({ error: "Sign in required." }, { status: 401 });
  if (!(await getProfileByEmail(user.email))) return Response.json({ error: "Profile required." }, { status: 403 });
  const { id } = await params;
  const video = await getVideo(id);
  if (!video) return Response.json({ error: "Video not found." }, { status: 404 });
  const body = (await request.json()) as { progressSeconds?: unknown; completed?: unknown };
  const progressSeconds =
    typeof body.progressSeconds === "number" && Number.isFinite(body.progressSeconds)
      ? Math.max(0, Math.min(body.progressSeconds, video.durationSeconds || 21_600))
      : 0;
  await saveWatchProgress({
    videoId: id,
    userEmail: user.email,
    progressSeconds,
    completed: body.completed === true,
  });
  return Response.json({ saved: true });
}
