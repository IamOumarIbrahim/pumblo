import Link from "next/link";
import type { Video } from "@/db";
import { compactNumber, relativeTime } from "@/app/lib/format";
import { Avatar } from "./Avatar";

export function VideoCard({ video }: { video: Video }) {
  return (
    <article className="video-card">
      <Link className="video-poster" href={`/watch/${video.id}`}>
        <video
          src={`/media/${video.id}`}
          muted
          preload="metadata"
          playsInline
          aria-label={`Preview of ${video.title}`}
        />
        <span className="tool-pill">{video.generationTool}</span>
        <span className="play-disc" aria-hidden="true">
          ▶
        </span>
      </Link>
      <div className="video-card-body">
        <Link href={`/profile/${video.ownerHandle}`}>
          <Avatar
            name={video.ownerDisplayName}
            color={video.ownerAvatarColor}
            src={video.ownerAvatarUrl || undefined}
            size="md"
          />
        </Link>
        <div className="video-card-copy">
          <Link className="video-title" href={`/watch/${video.id}`}>
            {video.title}
          </Link>
          <Link className="creator-name" href={`/profile/${video.ownerHandle}`}>
            {video.ownerDisplayName}
          </Link>
          <p className="video-meta">
            {compactNumber(video.views)} views · {compactNumber(video.likeCount)}{" "}
            likes · {relativeTime(video.createdAt)}
          </p>
        </div>
      </div>
    </article>
  );
}
