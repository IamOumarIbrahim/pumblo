import { requireChatGPTUser } from "@/app/chatgpt-auth";
import { ProfileForm } from "@/app/components/ProfileForm";
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
          {profile ? "Channel settings" : "One last step"}
        </span>
        <h1>{profile ? "Shape your public profile." : "Create your Pumblo profile."}</h1>
        <p>
          {profile
            ? "Update the details viewers see when they visit your channel."
            : "Choose how you will appear beside your films, likes, and comments."}
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
                avatarColor: profile.avatarColor,
              }
            : null
        }
        suggestedName={user.displayName}
        nextPath={safeNext}
      />
    </main>
  );
}
