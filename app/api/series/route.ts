import { getChatGPTUser } from "@/app/chatgpt-auth";
import { createSeries, getProfileByEmail, getProfileByHandle, listSeries } from "@/db";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const handle = url.searchParams.get("handle")?.trim();
  const mine = url.searchParams.get("mine") === "1";
  let ownerEmail: string | undefined;
  if (mine) {
    const user = await getChatGPTUser();
    if (!user) return Response.json({ error: "Sign in required." }, { status: 401 });
    ownerEmail = user.email;
  } else if (handle) {
    ownerEmail = (await getProfileByHandle(handle))?.email;
    if (!ownerEmail) return Response.json({ series: [] });
  }
  const items = await listSeries({ ownerEmail, limit: 100 });
  return Response.json({
    series: items.map(({ ownerEmail: privateOwnerEmail, ...item }) => {
      void privateOwnerEmail;
      return item;
    }),
  });
}

export async function POST(request: Request) {
  const user = await getChatGPTUser();
  if (!user) return Response.json({ error: "Sign in required." }, { status: 401 });
  if (!(await getProfileByEmail(user.email))) {
    return Response.json({ error: "Create a profile first." }, { status: 403 });
  }
  const input = await seriesInput(request);
  if ("error" in input) return Response.json(input, { status: 400 });
  return Response.json(
    { series: await createSeries({ ownerEmail: user.email, ...input }) },
    { status: 201 },
  );
}

export async function seriesInput(request: Request): Promise<
  | { title: string; description: string; status: "ongoing" | "completed" }
  | { error: string }
> {
  const body = (await request.json()) as Record<string, unknown>;
  const title = typeof body.title === "string" ? body.title.trim().slice(0, 100) : "";
  const description =
    typeof body.description === "string" ? body.description.trim().slice(0, 600) : "";
  const status = body.status === "completed" ? "completed" : "ongoing";
  if (title.length < 2) return { error: "Series title must contain at least two characters." };
  return { title, description, status };
}
