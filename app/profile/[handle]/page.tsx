import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { chatGPTSignInPath, getChatGPTUser } from "@/app/chatgpt-auth";
import { Avatar } from "@/app/components/Avatar";
import { FollowButton } from "@/app/components/FollowButton";
import { VideoCard } from "@/app/components/VideoCard";
import {
  getFollowState,
  getProfileByEmail,
  getProfileByHandle,
  listVideos,
} from "@/db";

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
      profile.bio || `Watch AI videos by ${profile.displayName} on Pumblo.`,
    alternates: { canonical: `/profile/${profile.handle}` },
    openGraph: {
      title: `${profile.displayName} on Pumblo`,
      description: profile.bio || `AI video channel by @${profile.handle}.`,
      url: `/profile/${profile.handle}`,
      type: "profile",
    },
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

  const viewer = await getChatGPTUser();
  const viewerProfile = viewer ? await getProfileByEmail(viewer.email) : null;
  const [videos, following] = await Promise.all([
    listVideos({ ownerEmail: profile.email, sort: "newest" }),
    viewer && viewer.email !== profile.email
      ? getFollowState(profile.email, viewer.email)
      : Promise.resolve(false),
  ]);
  const isOwner = viewer?.email === profile.email;
  const followActionPath = !viewer
    ? chatGPTSignInPath(`/profile/${profile.handle}`)
    : !viewerProfile
      ? `/settings/profile?next=${encodeURIComponent(`/profile/${profile.handle}`)}`
      : null;

  return (
    <main className="profile-page">
      <section
        className="profile-banner"
        style={{
          background: `linear-gradient(120deg, ${profile.avatarColor} 0%, #15171b 48%, #0a0b0d 100%)`,
        }}
      >
        <span>PUMBLO / AI VIDEO CREATOR</span>
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
                Edit channel
              </Link>
            ) : (
              <FollowButton
                handle={profile.handle}
                initialFollowing={following}
                initialCount={profile.followerCount}
                actionPath={followActionPath}
              />
            )}
          </div>
          <p className="profile-bio">
            {profile.bio || "This creator is letting the videos speak first."}
          </p>
          <div className="profile-details">
            <span>
              <b>{videos.length}</b> {videos.length === 1 ? "video" : "videos"}
            </span>
            <span><b>{profile.followerCount}</b> followers</span>
            <span><b>{profile.followingCount}</b> following</span>
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
            <span className="section-kicker">Channel</span>
            <h2>AI videos</h2>
          </div>
          {isOwner ? (
            <Link className="button button-primary" href="/upload">
              Upload video
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
            <h3>No videos yet</h3>
            <p>
              {isOwner
                ? "Your channel is ready. Upload the AI video you want people to discover."
                : "This creator has not uploaded a video yet."}
            </p>
            {isOwner ? (
              <Link className="button button-primary" href="/upload">
                Upload video
              </Link>
            ) : null}
          </div>
        )}
      </section>
    </main>
  );
}
