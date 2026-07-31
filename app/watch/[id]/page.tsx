import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  chatGPTSignInPath,
  getChatGPTUser,
} from "@/app/chatgpt-auth";
import { Avatar } from "@/app/components/Avatar";
import { Engagement } from "@/app/components/Engagement";
import { VideoCard } from "@/app/components/VideoCard";
import { compactNumber, relativeTime } from "@/app/lib/format";
import {
  getLikeState,
  getProfileByEmail,
  getVideo,
  incrementViews,
  listComments,
  listVideos,
} from "@/db";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const video = await getVideo(id);
  if (!video) return { title: "Film not found" };
  return {
    title: video.title,
    description:
      video.description || `AI-generated video made with ${video.generationTool}.`,
  };
}

export default async function WatchPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ uploaded?: string }>;
}) {
  const { id } = await params;
  const video = await getVideo(id);
  if (!video) notFound();

  const viewer = await getChatGPTUser();
  const [profile, comments, liked, related, query] = await Promise.all([
    viewer ? getProfileByEmail(viewer.email) : Promise.resolve(null),
    listComments(id),
    viewer ? getLikeState(id, viewer.email) : Promise.resolve(false),
    listVideos({ category: video.category, sort: "sqs", limit: 5 }),
    searchParams,
    incrementViews(id),
  ]);
  const relatedVideos = related.filter((item) => item.id !== id).slice(0, 4);

  return (
    <main className="watch-page">
      {query.uploaded === "1" ? (
        <div className="success-banner">
          <span>✓</span>
          Your film is live. Copy this page or share your channel when you are
          ready.
        </div>
      ) : null}

      <div className="watch-layout">
        <section className="watch-main">
          <div className="player-shell">
            <video
              src={`/media/${video.id}`}
              controls
              autoPlay={query.uploaded === "1"}
              playsInline
              preload="metadata"
            />
          </div>

          <div className="watch-copy">
            <div className="film-flags">
              <span>{video.category}</span>
              <span>{video.generationTool}</span>
              <span className="provenance-flag">Self-declared AI</span>
            </div>
            <h1>{video.title}</h1>
            <p className="watch-meta">
              {compactNumber(video.views + 1)} views · {relativeTime(video.createdAt)}
            </p>

            <div className="creator-strip">
              <Link href={`/profile/${video.ownerHandle}`}>
                <Avatar
                  name={video.ownerDisplayName}
                  color={video.ownerAvatarColor}
                  size="lg"
                />
              </Link>
              <div>
                <Link href={`/profile/${video.ownerHandle}`}>
                  {video.ownerDisplayName}
                </Link>
                <p>
                  @{video.ownerHandle} <span>✓ Human signed in</span>
                </p>
              </div>
              <Link
                className="button button-ghost"
                href={`/profile/${video.ownerHandle}`}
              >
                View channel
              </Link>
            </div>

            {video.description ? (
              <div className="film-description">
                <h2>About this film</h2>
                <p>{video.description}</p>
              </div>
            ) : null}

            <div className="provenance-panel">
              <div>
                <span className="section-kicker">Process card</span>
                <h2>How it was made</h2>
              </div>
              <dl>
                <div>
                  <dt>Tool</dt>
                  <dd>{video.generationTool}</dd>
                </div>
                <div>
                  <dt>Mode</dt>
                  <dd>{video.generationMode.replaceAll("-", " ")}</dd>
                </div>
                <div>
                  <dt>License</dt>
                  <dd>{video.license.replaceAll("-", " ")}</dd>
                </div>
                <div>
                  <dt>Provenance</dt>
                  <dd>{video.provenanceStatus.replaceAll("-", " ")}</dd>
                </div>
              </dl>
              {video.prompt ? (
                <details>
                  <summary>Creator’s prompt and process notes</summary>
                  <p>{video.prompt}</p>
                </details>
              ) : null}
            </div>

            <Engagement
              videoId={video.id}
              initialLikeCount={video.likeCount}
              initialLiked={liked}
              initialComments={comments}
              signedIn={Boolean(viewer)}
              hasProfile={Boolean(profile)}
              signInPath={chatGPTSignInPath(`/watch/${video.id}`)}
            />
          </div>
        </section>

        <aside className="watch-sidebar">
          <div className="sidebar-heading">
            <span className="section-kicker">Next up</span>
            <h2>Related films</h2>
          </div>
          {relatedVideos.length ? (
            relatedVideos.map((item) => (
              <VideoCard key={item.id} video={item} />
            ))
          ) : (
            <p className="sidebar-empty">
              More work in this category will appear here.
            </p>
          )}
        </aside>
      </div>
    </main>
  );
}
