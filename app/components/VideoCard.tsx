"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import type { Video } from "@/db";
import { compactNumber, relativeTime } from "@/app/lib/format";
import { Avatar } from "./Avatar";

export function VideoCard({
  video,
  progressSeconds = 0,
}: {
  video: Video;
  progressSeconds?: number;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [previewing, setPreviewing] = useState(false);
  const [soundBlocked, setSoundBlocked] = useState(false);

  async function startPreview(pointerType = "mouse") {
    if (pointerType !== "mouse") return;
    if (document.body.dataset.autoplayPreviews === "off") return;
    if (document.body.dataset.dataSaver === "on") return;
    const player = videoRef.current;
    if (!player) return;
    const wantsSound = document.body.dataset.previewSound !== "off";
    player.muted = !wantsSound;
    try {
      await player.play();
      setSoundBlocked(false);
      setPreviewing(true);
    } catch {
      player.muted = true;
      try {
        await player.play();
        setSoundBlocked(wantsSound);
        setPreviewing(true);
      } catch {
        setPreviewing(false);
      }
    }
  }

  function stopPreview() {
    const player = videoRef.current;
    if (player) {
      player.pause();
      player.currentTime = 0;
      player.muted = true;
    }
    setPreviewing(false);
    setSoundBlocked(false);
  }

  async function enableSound() {
    const player = videoRef.current;
    if (!player) return;
    player.muted = false;
    try {
      await player.play();
      setSoundBlocked(false);
      setPreviewing(true);
    } catch {
      setSoundBlocked(true);
    }
  }

  const progress =
    video.durationSeconds > 0
      ? Math.min(100, (progressSeconds / video.durationSeconds) * 100)
      : 0;

  return (
    <article
      className={previewing ? "video-card previewing" : "video-card"}
      onPointerEnter={(event) => void startPreview(event.pointerType)}
      onPointerLeave={stopPreview}
    >
      <div className="video-poster">
        <video
          ref={videoRef}
          src={`/media/${video.id}`}
          muted
          loop
          preload="metadata"
          playsInline
          aria-label={`Preview of ${video.title}`}
        />
        <Link
          className="video-poster-link"
          href={`/watch/${video.id}`}
          aria-label={`Watch ${video.title}`}
        />
        <span className="tool-pill">{video.generationTool}</span>
        {video.seriesId ? (
          <span className="episode-pill">
            S{video.seasonNumber} E{video.episodeNumber}
          </span>
        ) : null}
        <span className="play-disc" aria-hidden="true">▶</span>
        {soundBlocked ? (
          <button
            className="preview-sound-unlock"
            type="button"
            onClick={() => void enableSound()}
          >
            Click for sound
          </button>
        ) : previewing ? (
          <span className="preview-live">Live preview</span>
        ) : null}
        {progress > 0 ? (
          <span className="watch-progress-track" aria-label={`${Math.round(progress)}% watched`}>
            <span style={{ width: `${progress}%` }} />
          </span>
        ) : null}
      </div>
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
          {video.seriesTitle ? (
            <Link className="video-series-name" href={`/series/${video.seriesId}`}>
              {video.seriesTitle} · S{video.seasonNumber} E{video.episodeNumber}
            </Link>
          ) : null}
          <Link className="video-title" href={`/watch/${video.id}`}>
            {video.title}
          </Link>
          <Link className="creator-name" href={`/profile/${video.ownerHandle}`}>
            {video.ownerDisplayName}
          </Link>
          <p className="video-meta">
            {compactNumber(video.views)} views · {compactNumber(video.likeCount)} likes ·{" "}
            {relativeTime(video.createdAt)}
          </p>
        </div>
      </div>
    </article>
  );
}
