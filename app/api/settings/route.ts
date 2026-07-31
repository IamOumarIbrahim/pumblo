import { getChatGPTUser } from "@/app/chatgpt-auth";
import {
  DEFAULT_PROFILE_SETTINGS,
  getProfileByEmail,
  getProfileSettings,
  saveProfileSettings,
} from "@/db";

export async function GET() {
  const user = await getChatGPTUser();
  if (!user) return Response.json({ error: "Sign in required." }, { status: 401 });
  return Response.json({ settings: await getProfileSettings(user.email) });
}

export async function POST(request: Request) {
  const user = await getChatGPTUser();
  if (!user) return Response.json({ error: "Sign in required." }, { status: 401 });
  if (!(await getProfileByEmail(user.email))) {
    return Response.json({ error: "Create a profile first." }, { status: 403 });
  }
  const body = (await request.json()) as Record<string, unknown>;
  const settings = Object.fromEntries(
    Object.keys(DEFAULT_PROFILE_SETTINGS)
      .filter((key) => key !== "updatedAt")
      .map((key) => [key, body[key] === true]),
  ) as Omit<typeof DEFAULT_PROFILE_SETTINGS, "updatedAt">;
  return Response.json({ settings: await saveProfileSettings(user.email, settings) });
}
