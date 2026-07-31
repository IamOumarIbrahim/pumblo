import { getVideo, mediaBucket } from "@/db";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const video = await getVideo(id);
  if (!video) return new Response("Video not found", { status: 404 });

  const object = await mediaBucket().get(video.objectKey, {
    range: request.headers,
  });
  if (!object) return new Response("Video bytes not found", { status: 404 });

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("etag", object.httpEtag);
  headers.set("accept-ranges", "bytes");
  headers.set("cache-control", "public, max-age=31536000, immutable");

  const ranged = object as R2ObjectBody & {
    range?: { offset: number; length: number };
  };
  if (ranged.range) {
    const { offset, length } = ranged.range;
    headers.set("content-length", String(length));
    headers.set(
      "content-range",
      `bytes ${offset}-${offset + length - 1}/${object.size}`,
    );
    return new Response(object.body, { status: 206, headers });
  }

  headers.set("content-length", String(object.size));
  return new Response(object.body, { headers });
}
