import { getChatGPTUser } from "@/app/chatgpt-auth";
import { MAX_PROFILE_IMAGE_BYTES } from "@/app/lib/profile-media";
import {
  getProfileByEmail,
  mediaBucket,
  setProfileMedia,
} from "@/db";

const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

export async function POST(
  request: Request,
  { params }: { params: Promise<{ kind: string }> },
) {
  const user = await getChatGPTUser();
  if (!user) return Response.json({ error: "Sign in required." }, { status: 401 });

  const { kind: rawKind } = await params;
  const kind = mediaKind(rawKind);
  if (!kind) return Response.json({ error: "Invalid image kind." }, { status: 400 });

  const profile = await getProfileByEmail(user.email);
  if (!profile) {
    return Response.json(
      { error: "Create your Pumblo profile before adding images." },
      { status: 403 },
    );
  }

  const contentType = request.headers.get("content-type")?.split(";")[0] ?? "";
  const contentLength = Number(request.headers.get("content-length") ?? 0);
  const declaredSize = Number(request.headers.get("x-pumblo-size") ?? contentLength);
  if (!request.body || !allowedTypes.has(contentType)) {
    return Response.json(
      { error: "Use a cropped JPEG, PNG, or WebP image." },
      { status: 415 },
    );
  }
  if (
    !Number.isSafeInteger(declaredSize) ||
    declaredSize <= 0 ||
    declaredSize > MAX_PROFILE_IMAGE_BYTES ||
    contentLength > MAX_PROFILE_IMAGE_BYTES
  ) {
    return Response.json(
      { error: "The cropped image must be 3 MB or smaller." },
      { status: 413 },
    );
  }

  let bytes: Uint8Array;
  try {
    bytes = await readLimitedImage(request.body, MAX_PROFILE_IMAGE_BYTES);
  } catch {
    return Response.json(
      { error: "The cropped image must be 3 MB or smaller." },
      { status: 413 },
    );
  }
  if (bytes.byteLength !== declaredSize || !matchesImageType(bytes, contentType)) {
    return Response.json(
      { error: "The uploaded bytes do not match the declared image." },
      { status: 400 },
    );
  }

  const extension = contentType === "image/png" ? "png" : contentType === "image/webp" ? "webp" : "jpg";
  const objectKey = `profiles/${profile.handle}/${kind}-${crypto.randomUUID()}.${extension}`;
  const oldObjectKey = kind === "avatar" ? profile.avatarObjectKey : profile.bannerObjectKey;
  const bucket = mediaBucket();
  const stored = await bucket.put(objectKey, bytes, {
    httpMetadata: {
      contentType,
      cacheControl: "public, max-age=31536000, immutable",
    },
    customMetadata: { owner: profile.handle, kind },
  });

  if (stored.size !== declaredSize) {
    await bucket.delete(objectKey);
    return Response.json(
      { error: "The stored image size did not match the upload." },
      { status: 400 },
    );
  }

  try {
    const updated = await setProfileMedia(user.email, kind, objectKey);
    if (oldObjectKey && oldObjectKey !== objectKey) {
      try {
        await bucket.delete(oldObjectKey);
      } catch {
        // The new object is already live; a stale object must not break the profile.
      }
    }
    return Response.json({
      kind,
      url: `/profile-media/${encodeURIComponent(updated.handle)}/${kind}?v=${encodeURIComponent(updated.updatedAt)}`,
    });
  } catch (error) {
    await bucket.delete(objectKey);
    return Response.json(
      { error: error instanceof Error ? error.message : "Image could not be saved." },
      { status: 400 },
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ kind: string }> },
) {
  const user = await getChatGPTUser();
  if (!user) return Response.json({ error: "Sign in required." }, { status: 401 });

  const { kind: rawKind } = await params;
  const kind = mediaKind(rawKind);
  if (!kind) return Response.json({ error: "Invalid image kind." }, { status: 400 });

  const profile = await getProfileByEmail(user.email);
  if (!profile) return Response.json({ error: "Profile not found." }, { status: 404 });
  const oldObjectKey = kind === "avatar" ? profile.avatarObjectKey : profile.bannerObjectKey;
  await setProfileMedia(user.email, kind, "");
  if (oldObjectKey) {
    try {
      await mediaBucket().delete(oldObjectKey);
    } catch {
      // The profile deletion is authoritative even if storage cleanup must retry later.
    }
  }
  return Response.json({ deleted: true, kind });
}

function mediaKind(value: string): "avatar" | "banner" | null {
  return value === "avatar" || value === "banner" ? value : null;
}

async function readLimitedImage(
  stream: ReadableStream<Uint8Array>,
  maximumBytes: number,
): Promise<Uint8Array> {
  const reader = stream.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > maximumBytes) {
      await reader.cancel();
      throw new Error("Image too large.");
    }
    chunks.push(value);
  }
  const output = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    output.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return output;
}

function matchesImageType(data: Uint8Array, contentType: string): boolean {
  if (contentType === "image/jpeg") {
    return data.length >= 3 && data[0] === 0xff && data[1] === 0xd8 && data[2] === 0xff;
  }
  if (contentType === "image/png") {
    const signature = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
    return data.length >= signature.length && signature.every((byte, index) => data[index] === byte);
  }
  return (
    data.length >= 12 &&
    String.fromCharCode(...data.slice(0, 4)) === "RIFF" &&
    String.fromCharCode(...data.slice(8, 12)) === "WEBP"
  );
}
