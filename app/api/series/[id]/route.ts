import { getChatGPTUser } from "@/app/chatgpt-auth";
import { deleteSeries, getSeries, updateSeries } from "@/db";
import { seriesInput } from "../route";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getChatGPTUser();
  if (!user) return Response.json({ error: "Sign in required." }, { status: 401 });
  const { id } = await params;
  const input = await seriesInput(request);
  if ("error" in input) return Response.json(input, { status: 400 });
  const series = await updateSeries(id, user.email, input);
  return series
    ? Response.json({ series })
    : Response.json({ error: "Series not found." }, { status: 404 });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getChatGPTUser();
  if (!user) return Response.json({ error: "Sign in required." }, { status: 401 });
  const { id } = await params;
  const existing = await getSeries(id);
  if (!existing) return Response.json({ error: "Series not found." }, { status: 404 });
  if (existing.ownerEmail !== user.email.toLowerCase()) {
    return Response.json({ error: "Only the series owner can delete it." }, { status: 403 });
  }
  await deleteSeries(id, user.email);
  return Response.json({ deleted: true });
}
