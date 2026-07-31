import { getChatGPTUser } from "@/app/chatgpt-auth";
import {
  getProfileByEmail,
  getProfileByHandle,
  toggleFollow,
} from "@/db";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ handle: string }> },
) {
  const user = await getChatGPTUser();
  if (!user) return Response.json({ error: "Sign in required." }, { status: 401 });

  const { handle } = await params;
  const [viewer, creator] = await Promise.all([
    getProfileByEmail(user.email),
    getProfileByHandle(handle),
  ]);
  if (!viewer) {
    return Response.json(
      { error: "Create your Pumblo profile before following creators." },
      { status: 403 },
    );
  }
  if (!creator) {
    return Response.json({ error: "Creator not found." }, { status: 404 });
  }
  if (creator.email === viewer.email) {
    return Response.json(
      { error: "You cannot follow yourself." },
      { status: 400 },
    );
  }

  const state = await toggleFollow(creator.email, viewer.email);
  return Response.json(state);
}

