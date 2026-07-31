import { getProfileByHandle, mediaBucket } from "@/db";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ handle: string; kind: string }> },
) {
  const { handle, kind } = await params;
  if (kind !== "avatar" && kind !== "banner") {
    return new Response("Image not found", { status: 404 });
  }
  const profile = await getProfileByHandle(handle);
  if (!profile) return new Response("Profile not found", { status: 404 });
  const objectKey = kind === "avatar" ? profile.avatarObjectKey : profile.bannerObjectKey;
  if (!objectKey) return new Response("Image not found", { status: 404 });

  const object = await mediaBucket().get(objectKey);
  if (!object) return new Response("Image bytes not found", { status: 404 });
  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("etag", object.httpEtag);
  headers.set("cache-control", "public, max-age=31536000, immutable");
  headers.set("content-length", String(object.size));
  headers.set("x-content-type-options", "nosniff");
  return new Response(object.body, { headers });
}
