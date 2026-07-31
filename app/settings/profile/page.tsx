import { requireChatGPTUser } from "@/app/chatgpt-auth";
import { ProfileForm } from "@/app/components/ProfileForm";
import { profileMediaUrl } from "@/app/lib/profile-media";
import { getProfileByEmail } from "@/db";

export const dynamic = "force-dynamic";

export default async function ProfileSettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const user = await requireChatGPTUser("/settings/profile");
  const profile = await getProfileByEmail(user.email);
  const { next } = await searchParams;
  const safeNext =
    next && next.startsWith("/") && !next.startsWith("//") ? next : null;

  return (
    <main className="form-page">
      <div className="form-page-heading">
        <span className="section-kicker">
          {profile ? "Creator settings" : "30-second setup"}
        </span>
        <h1>
          {profile ? "Keep your creator page current." : "Claim your creator page."}
        </h1>
        <p>
          {profile
            ? "Update the public details on your creator channel."
            : "A display name and handle are all you need. Everything else is optional."}
        </p>
      </div>
      <ProfileForm
        initial={
          profile
            ? {
                handle: profile.handle,
                displayName: profile.displayName,
                bio: profile.bio,
                location: profile.location,
                website: profile.website,
                chatgptUrl: profile.chatgptUrl,
                discordUrl: profile.discordUrl,
                xUrl: profile.xUrl,
                githubUrl: profile.githubUrl,
                youtubeUrl: profile.youtubeUrl,
                avatarColor: profile.avatarColor,
                avatarUrl: profile.avatarObjectKey
                  ? profileMediaUrl(profile.handle, "avatar", profile.updatedAt)
                  : "",
                bannerUrl: profile.bannerObjectKey
                  ? profileMediaUrl(profile.handle, "banner", profile.updatedAt)
                  : "",
              }
            : null
        }
        suggestedName={user.displayName}
        nextPath={safeNext}
      />
    </main>
  );
}
