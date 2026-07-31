import { getChatGPTUser } from "@/app/chatgpt-auth";
import {
  MAX_VIDEO_BYTES,
  createVideo,
  getProfileByEmail,
  listVideos,
  mediaBucket,
} from "@/db";

const allowedTypes = new Set(["video/mp4", "video/webm"]);
const allowedModes = new Set([
  "text-to-video",
  "image-to-video",
  "video-to-video",
  "audio-to-video",
]);
const allowedCategories = new Set([
  "film",
  "animation",
  "music",
  "education",
  "experimental",
]);
const allowedLicenses = new Set([
  "all-rights-reserved",
  "cc-by-4.0",
  "cc-by-nc-4.0",
  "cc0",
]);

export async function GET(request: Request) {
  const url = new URL(request.url);
  const videos = await listVideos({
    query: url.searchParams.get("q")?.slice(0, 80) || undefined,
    category: url.searchParams.get("category") || undefined,
    sort: url.searchParams.get("sort") === "newest" ? "newest" : "sqs",
  });
  return Response.json({ videos });
}

export async function POST(request: Request) {
  const user = await getChatGPTUser();
  if (!user) return Response.json({ error: "Sign in required." }, { status: 401 });

  const profile = await getProfileByEmail(user.email);
  if (!profile) {
    return Response.json(
      { error: "Create your Pumblo profile before uploading." },
      { status: 403 },
    );
  }

  const existingVideos = await listVideos({ ownerEmail: user.email, limit: 6 });
  if (existingVideos.length >= 5) {
    return Response.json(
      { error: "Your five beta upload slots are already in use." },
      { status: 409 },
    );
  }

  try {
    const metadata = parseMetadata(request.headers.get("x-pumblo-metadata"));
    const contentType = request.headers.get("content-type")?.split(";")[0] ?? "";
    const contentLength = Number(request.headers.get("content-length") ?? 0);
    const declaredSize =
      typeof metadata.sizeBytes === "number" ? metadata.sizeBytes : Number.NaN;

    if (!request.body) {
      return Response.json({ error: "Choose a video file." }, { status: 400 });
    }
    if (!allowedTypes.has(contentType)) {
      return Response.json(
        { error: "Only MP4 and WebM videos are supported." },
        { status: 415 },
      );
    }
    if (
      !Number.isSafeInteger(declaredSize) ||
      declaredSize <= 0 ||
      declaredSize > MAX_VIDEO_BYTES ||
      contentLength > MAX_VIDEO_BYTES
    ) {
      return Response.json(
        { error: "Video must be between 1 byte and 90 MB." },
        { status: 413 },
      );
    }
    if (contentLength > 0 && contentLength !== declaredSize) {
      return Response.json(
        { error: "The video size changed during upload. Please retry." },
        { status: 400 },
      );
    }

    const title = text(metadata.title, 100);
    const description = text(metadata.description, 1000);
    const generationTool = text(metadata.generationTool, 50);
    const generationMode = text(metadata.generationMode, 30);
    const category = text(metadata.category, 30);
    const license = text(metadata.license, 40);
    const prompt = text(metadata.prompt, 1500);
    const declaration = metadata.aiDeclaration;

    if (title.length < 2 || !generationTool) {
      return Response.json(
        { error: "Title and generation tool are required." },
        { status: 400 },
      );
    }
    if (
      !allowedModes.has(generationMode) ||
      !allowedCategories.has(category) ||
      !allowedLicenses.has(license) ||
      declaration !== "yes"
    ) {
      return Response.json(
        { error: "Complete the required disclosure fields." },
        { status: 400 },
      );
    }

    const id = crypto.randomUUID();
    const extension = contentType === "video/webm" ? "webm" : "mp4";
    const objectKey = `videos/${profile.handle}/${id}.${extension}`;
    const bucket = mediaBucket();

    const storedObject = await bucket.put(objectKey, request.body, {
      httpMetadata: {
        contentType,
        cacheControl: "public, max-age=31536000, immutable",
      },
      customMetadata: {
        owner: profile.handle,
      },
    });

    try {
      if (storedObject.size !== declaredSize) {
        throw new Error("The stored video size did not match the upload.");
      }
      const completedFields = [description, prompt].filter(Boolean).length;
      const sqsScore = Math.min(92, 72 + completedFields * 5);
      const video = await createVideo({
        id,
        ownerEmail: user.email,
        title,
        description,
        generationTool,
        generationMode,
        category,
        license,
        prompt,
        objectKey,
        contentType,
        sizeBytes: storedObject.size,
        provenanceStatus: "self-declared",
        sqsScore,
      });
      return Response.json({ video }, { status: 201 });
    } catch (error) {
      await bucket.delete(objectKey);
      throw error;
    }
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error ? error.message : "The video could not be uploaded.",
      },
      { status: 400 },
    );
  }
}

type UploadMetadata = {
  title?: unknown;
  description?: unknown;
  generationTool?: unknown;
  generationMode?: unknown;
  category?: unknown;
  license?: unknown;
  prompt?: unknown;
  aiDeclaration?: unknown;
  sizeBytes?: unknown;
};

function parseMetadata(value: string | null): UploadMetadata {
  if (!value || value.length > 12_000) {
    throw new Error("The upload details are missing or too large.");
  }
  const parsed: unknown = JSON.parse(decodeURIComponent(value));
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("The upload details are invalid.");
  }
  return parsed as UploadMetadata;
}

function text(value: unknown, maxLength: number): string {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}
