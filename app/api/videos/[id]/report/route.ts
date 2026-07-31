import { getChatGPTUser } from "@/app/chatgpt-auth";
import { getProfileByEmail, getVideo, reportVideo } from "@/db";

const reasons = new Set(["rights", "impersonation", "non-consensual", "hate", "spam", "other"]);

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
  if (video.ownerEmail === user.email.toLowerCase()) {
    return Response.json({ error: "Use your delete control for your own video." }, { status: 400 });
  }
  const body = (await request.json()) as { reason?: unknown; details?: unknown };
  const reason = typeof body.reason === "string" ? body.reason : "";
  const details = typeof body.details === "string" ? body.details.trim().slice(0, 500) : "";
  if (!reasons.has(reason)) return Response.json({ error: "Choose a report reason." }, { status: 400 });
  await reportVideo({ videoId: id, reporterEmail: user.email, reason, details });
  return Response.json({ reported: true });
}
