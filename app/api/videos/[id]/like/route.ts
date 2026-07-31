import { getChatGPTUser } from "@/app/chatgpt-auth";
import { getProfileByEmail, getVideo, toggleLike } from "@/db";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getChatGPTUser();
  if (!user) return Response.json({ error: "Sign in required." }, { status: 401 });
  if (!(await getProfileByEmail(user.email))) {
    return Response.json(
      { error: "Create your profile before liking videos." },
      { status: 403 },
    );
  }

  const { id } = await params;
  if (!(await getVideo(id))) {
    return Response.json({ error: "Video not found." }, { status: 404 });
  }

  return Response.json(await toggleLike(id, user.email));
}
