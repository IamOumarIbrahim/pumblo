import { getChatGPTUser } from "@/app/chatgpt-auth";
import { getAccountExport } from "@/db";

export async function GET() {
  const user = await getChatGPTUser();
  if (!user) return Response.json({ error: "Sign in required." }, { status: 401 });
  const payload = JSON.stringify(await getAccountExport(user.email), null, 2);
  return new Response(payload, {
    headers: {
      "content-type": "application/json; charset=utf-8",
      "content-disposition": `attachment; filename="pumblo-export-${new Date().toISOString().slice(0, 10)}.json"`,
      "cache-control": "private, no-store",
    },
  });
}
