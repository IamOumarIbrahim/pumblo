import { getChatGPTUser } from "@/app/chatgpt-auth";
import { markNotificationsRead } from "@/db";

export async function POST() {
  const user = await getChatGPTUser();
  if (!user) return Response.json({ error: "Sign in required." }, { status: 401 });
  await markNotificationsRead(user.email);
  return Response.json({ read: true });
}
