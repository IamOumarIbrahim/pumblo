import { redirect } from "next/navigation";
import { requireChatGPTUser } from "@/app/chatgpt-auth";
import { VideoCard } from "@/app/components/VideoCard";
import { getProfileByEmail, listContinueWatching, listWatchLater } from "@/db";

export const dynamic = "force-dynamic";

export default async function LibraryPage() {
  const user = await requireChatGPTUser("/library");
  if (!(await getProfileByEmail(user.email))) redirect("/settings/profile?next=/library");
  const [continuing, saved] = await Promise.all([
    listContinueWatching(user.email),
    listWatchLater(user.email),
  ]);
  return (
    <main className="library-page">
      <header className="form-page-heading">
        <span className="section-kicker">Private library</span>
        <h1>Pick up where you left off.</h1>
        <p>Your viewing progress and Watch Later list are visible only to your signed-in account.</p>
      </header>
      <LibrarySection title="Continue watching" empty="Start a video and your progress will appear here.">
        {continuing.map((item) => <VideoCard key={item.id} video={item} progressSeconds={item.progressSeconds} />)}
      </LibrarySection>
      <LibrarySection title="Watch later" empty="Save a video from its watch page to build this queue.">
        {saved.map((video) => <VideoCard key={video.id} video={video} />)}
      </LibrarySection>
    </main>
  );
}

function LibrarySection({ title, empty, children }: { title: string; empty: string; children: React.ReactNode[] }) {
  return (
    <section className="library-section">
      <div className="section-heading"><div><span className="section-kicker">Your queue</span><h2>{title}</h2></div></div>
      {children.length ? <div className="video-grid">{children}</div> : <div className="empty-state compact"><p>{empty}</p></div>}
    </section>
  );
}
