import { getChatGPTUser } from "@/app/chatgpt-auth";
import { getProfileByEmail, saveProfile } from "@/db";

const allowedColors = new Set([
  "#b8ff3d",
  "#ff5f56",
  "#8f7cff",
  "#43d9ff",
  "#ffca3a",
  "#ff70a6",
]);

export async function GET() {
  const user = await getChatGPTUser();
  if (!user) return Response.json({ error: "Sign in required." }, { status: 401 });
  return Response.json({ profile: await getProfileByEmail(user.email) });
}

export async function POST(request: Request) {
  const user = await getChatGPTUser();
  if (!user) return Response.json({ error: "Sign in required." }, { status: 401 });

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const handle = clean(body.handle, 24).toLowerCase();
    const displayName = clean(body.displayName, 50);
    const bio = clean(body.bio, 280);
    const location = clean(body.location, 60);
    const website = normalizeWebsite(clean(body.website, 160));
    const avatarColor = clean(body.avatarColor, 10);

    if (!/^[a-z0-9_]{3,24}$/.test(handle)) {
      return Response.json(
        { error: "Handle must be 3–24 lowercase letters, numbers, or underscores." },
        { status: 400 },
      );
    }
    if (displayName.length < 2) {
      return Response.json(
        { error: "Display name must contain at least two characters." },
        { status: 400 },
      );
    }
    if (!allowedColors.has(avatarColor)) {
      return Response.json({ error: "Choose a valid profile color." }, { status: 400 });
    }

    const profile = await saveProfile({
      email: user.email,
      handle,
      displayName,
      bio,
      location,
      website,
      avatarColor,
    });
    return Response.json({ profile });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Profile could not be saved." },
      { status: 400 },
    );
  }
}

function clean(value: unknown, maxLength: number): string {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function normalizeWebsite(value: string): string {
  if (!value) return "";
  const candidate = /^https?:\/\//i.test(value) ? value : `https://${value}`;
  try {
    const url = new URL(candidate);
    if (!["http:", "https:"].includes(url.protocol)) return "";
    return url.toString();
  } catch {
    throw new Error("Enter a valid website address.");
  }
}
