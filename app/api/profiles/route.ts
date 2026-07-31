import { getProfileSettings, listProfiles } from "@/db";
import { profileMediaUrl } from "@/app/lib/profile-media";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const query = url.searchParams.get("q")?.trim().slice(0, 80) || undefined;
  const profiles = await listProfiles({ query, limit: query ? 24 : 12 });
  return Response.json({
    profiles: await Promise.all(profiles.map(async (profile) => {
      const settings = await getProfileSettings(profile.email);
      return {
        handle: profile.handle,
        displayName: profile.displayName,
        bio: profile.bio,
        location: settings.showLocation ? profile.location : "",
        website: profile.website,
        chatgptUrl: settings.showSocials ? profile.chatgptUrl : "",
        discordUrl: settings.showSocials ? profile.discordUrl : "",
        xUrl: settings.showSocials ? profile.xUrl : "",
        githubUrl: settings.showSocials ? profile.githubUrl : "",
        youtubeUrl: settings.showSocials ? profile.youtubeUrl : "",
        avatarColor: profile.avatarColor,
        avatarUrl: profile.avatarObjectKey
          ? profileMediaUrl(profile.handle, "avatar", profile.updatedAt)
          : "",
        bannerUrl: profile.bannerObjectKey
          ? profileMediaUrl(profile.handle, "banner", profile.updatedAt)
          : "",
        followerCount: settings.showFollowerCounts ? profile.followerCount : null,
        followingCount: settings.showFollowerCounts ? profile.followingCount : null,
        createdAt: profile.createdAt,
        updatedAt: profile.updatedAt,
      };
    })),
    query: query ?? "",
  });
}
