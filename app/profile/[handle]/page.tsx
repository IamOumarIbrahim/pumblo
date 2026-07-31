import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getChatGPTUser } from "@/app/chatgpt-auth";
import { Avatar } from "@/app/components/Avatar";
import { VideoCard } from "@/app/components/VideoCard";
import { getProfileByHandle, listVideos } from "@/db";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string }>;
}): Promise<Metadata> {
  const { handle } = await params;
  const profile = await getProfileByHandle(handle);
  if (!profile) return { title: "Channel not found" };
  return {
    title: `@${profile.handle}`,
    description:
      profile.bio || `Watch AI-generated films by ${profile.displayName}.`,
  };
}

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  const profile = await getProfileByHandle(handle);
  if (!profile) notFound();

  const [viewer, videos] = await Promise.all([
    getChatGPTUser(),
    listVideos({ ownerEmail: profile.email, sort: "newest" }),
  ]);
  const isOwner = viewer?.email === profile.email;

  return (
    <main className="profile-page">
      <section
        className="profile-banner"
        style={{
          background: `linear-gradient(120deg, ${profile.avatarColor} 0%, #15171b 48%, #0a0b0d 100%)`,
        }}
      >
        <span>PUMBLO / CREATOR</span>
      </section>
      <section className="profile-intro">
        <Avatar
          name={profile.displayName}
          color={profile.avatarColor}
          size="xl"
        />
        <div className="profile-identity">
          <div className="profile-name-row">
            <div>
              <h1>{profile.displayName}</h1>
              <p>@{profile.handle}</p>
            </div>
            {isOwner ? (
              <Link className="button button-ghost" href="/settings/profile">
                Edit profile
              </Link>
            ) : null}
          </div>
          <p className="profile-bio">
            {profile.bio || "This creator is letting the work speak first."}
          </p>
          <div className="profile-details">
            <span>
              <b>{videos.length}</b> {videos.length === 1 ? "film" : "films"}
            </span>
            <span className="human-badge">✓ Human signed in</span>
            {profile.location ? <span>{profile.location}</span> : null}
            {profile.website ? (
              <a href={profile.website} rel="noreferrer" target="_blank">
                Website ↗
              </a>
            ) : null}
          </div>
        </div>
      </section>

      <section className="profile-films">
        <div className="section-heading">
          <div>
            <span className="section-kicker">Filmography</span>
            <h2>Published work</h2>
          </div>
          {isOwner ? (
            <Link className="button button-primary" href="/upload">
              Upload
            </Link>
          ) : null}
        </div>
        {videos.length ? (
          <div className="video-grid">
            {videos.map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
        ) : (
          <div className="empty-state compact">
            <h3>No films yet</h3>
            <p>
              {isOwner
                ? "Your channel is ready. Publish your first AI-generated video."
                : "This creator has not published a film yet."}
            </p>
            {isOwner ? (
              <Link className="button button-primary" href="/upload">
                Upload a video
              </Link>
            ) : null}
          </div>
        )}
      </section>
    </main>
  );
}
