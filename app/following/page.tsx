import Link from "next/link";
import { redirect } from "next/navigation";
import { requireChatGPTUser } from "@/app/chatgpt-auth";
import { VideoCard } from "@/app/components/VideoCard";
import { getProfileByEmail, listVideos } from "@/db";

export const dynamic = "force-dynamic";

export default async function FollowingPage() {
  const user = await requireChatGPTUser("/following");
  const profile = await getProfileByEmail(user.email);
  if (!profile) redirect("/settings/profile?next=%2Ffollowing");
  const videos = await listVideos({
    followedByEmail: user.email,
    sort: "newest",
    limit: 48,
  });

  return (
    <main className="following-page">
      <section className="page-heading">
        <span className="section-kicker">Your network</span>
        <h1>Following</h1>
        <p>Fresh AI videos from the creators you chose.</p>
      </section>
      {videos.length ? (
        <div className="video-grid">
          {videos.map((video) => (
            <VideoCard key={video.id} video={video} />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <h2>Your following feed is ready for creators.</h2>
          <p>Browse the public feed, open a creator channel, and follow work you want to see again.</p>
          <Link className="button button-primary" href="/#feed">
            Explore AI videos
          </Link>
        </div>
      )}
    </main>
  );
}

