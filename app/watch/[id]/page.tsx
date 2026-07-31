import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { chatGPTSignInPath, getChatGPTUser } from "@/app/chatgpt-auth";
import { Avatar } from "@/app/components/Avatar";
import { DeleteVideoButton } from "@/app/components/DeleteVideoButton";
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
const base = "https://pumblo-ai-video.oumaribrahim123.chatgpt.site";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const video = await getVideo(id);
  if (!video) return { title: "Video not found" };
  return {
    title: video.title,
    description:
      video.description || `AI video created with ${video.generationTool}.`,
    alternates: { canonical: `/watch/${video.id}` },
    openGraph: {
      title: `${video.title} by ${video.ownerDisplayName}`,
      description:
        video.description ||
        `Watch this AI video and see the ${video.generationTool} process behind it.`,
      type: "video.other",
      url: `/watch/${video.id}`,
    },
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
    listVideos({ category: video.category, sort: "community", limit: 5 }),
    searchParams,
    incrementViews(id),
  ]);
  const relatedVideos = related.filter((item) => item.id !== id).slice(0, 4);
  const isOwner = viewer?.email === video.ownerEmail;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: video.title,
    description:
      video.description || `AI video created with ${video.generationTool}.`,
    uploadDate: video.createdAt,
    contentUrl: `${base}/media/${video.id}`,
    embedUrl: `${base}/watch/${video.id}`,
    creator: {
      "@type": "Person",
      name: video.ownerDisplayName,
      url: `${base}/profile/${video.ownerHandle}`,
    },
  };

  return (
    <main className="watch-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replaceAll("<", "\\u003c"),
        }}
      />
      {query.uploaded === "1" ? (
        <div className="success-banner">
          <span>✓</span>
          Your video is live. Share the link or keep exploring the feed.
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
              <span className="provenance-flag">Creator-declared AI process</span>
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
                  src={video.ownerAvatarUrl || undefined}
                  size="lg"
                />
              </Link>
              <div>
                <Link href={`/profile/${video.ownerHandle}`}>
                  {video.ownerDisplayName}
                </Link>
                <p>@{video.ownerHandle}</p>
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
                <h2>About this video</h2>
                <p>{video.description}</p>
              </div>
            ) : null}

            <div className="provenance-panel">
              <div>
                <span className="section-kicker">Optional creator feature</span>
                <h2>Behind the render</h2>
              </div>
              <dl>
                <div><dt>Tool</dt><dd>{video.generationTool}</dd></div>
                <div><dt>Mode</dt><dd>{video.generationMode.replaceAll("-", " ")}</dd></div>
                <div><dt>License</dt><dd>{video.license.replaceAll("-", " ")}</dd></div>
                <div><dt>Provenance</dt><dd>creator declared</dd></div>
              </dl>
              {video.prompt ? (
                <details>
                  <summary>Open prompt and process notes</summary>
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

            {isOwner ? (
              <DeleteVideoButton
                videoId={video.id}
                returnTo={`/profile/${video.ownerHandle}`}
              />
            ) : null}
          </div>
        </section>

        <aside className="watch-sidebar">
          <div className="sidebar-heading">
            <span className="section-kicker">Next up</span>
            <h2>Related videos</h2>
          </div>
          {relatedVideos.length ? (
            relatedVideos.map((item) => (
              <VideoCard key={item.id} video={item} />
            ))
          ) : (
            <p className="sidebar-empty">
              More videos in this category will appear here.
            </p>
          )}
        </aside>
      </div>
    </main>
  );
}
