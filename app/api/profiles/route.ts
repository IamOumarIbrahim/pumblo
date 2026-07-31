import { listProfiles } from "@/db";
import { profileMediaUrl } from "@/app/lib/profile-media";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const query = url.searchParams.get("q")?.trim().slice(0, 80) || undefined;
  const profiles = await listProfiles({ query, limit: query ? 24 : 12 });
  return Response.json({
    profiles: profiles.map((profile) => ({
      handle: profile.handle,
      displayName: profile.displayName,
      bio: profile.bio,
      location: profile.location,
      website: profile.website,
      avatarColor: profile.avatarColor,
      avatarUrl: profile.avatarObjectKey
        ? profileMediaUrl(profile.handle, "avatar", profile.updatedAt)
        : "",
      bannerUrl: profile.bannerObjectKey
        ? profileMediaUrl(profile.handle, "banner", profile.updatedAt)
        : "",
      followerCount: profile.followerCount,
      followingCount: profile.followingCount,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
    })),
    query: query ?? "",
  });
}
