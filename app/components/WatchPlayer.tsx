"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export function WatchPlayer({
  videoId,
  autoPlay,
  canPersist,
  initialProgress,
  autoplayNext,
  nextEpisode,
}: {
  videoId: string;
  autoPlay: boolean;
  canPersist: boolean;
  initialProgress: number;
  autoplayNext: boolean;
  nextEpisode: { id: string; title: string } | null;
}) {
  const playerRef = useRef<HTMLVideoElement>(null);
  const lastSentRef = useRef(0);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (!countdown || !nextEpisode) return;
    const timer = window.setTimeout(() => {
      if (countdown === 1) window.location.assign(`/watch/${nextEpisode.id}`);
      else setCountdown((value) => value - 1);
    }, 1_000);
    return () => window.clearTimeout(timer);
  }, [countdown, nextEpisode]);

  function persist(completed = false) {
    const player = playerRef.current;
    if (!player || !canPersist) return;
    void fetch(`/api/videos/${videoId}/progress`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ progressSeconds: player.currentTime, completed }),
      keepalive: true,
    });
  }

  return (
    <div className="player-shell">
      <video
        ref={playerRef}
        src={`/media/${videoId}`}
        controls
        autoPlay={autoPlay}
        playsInline
        preload="metadata"
        onLoadedMetadata={(event) => {
          if (initialProgress > 5 && initialProgress < event.currentTarget.duration - 5) {
            event.currentTarget.currentTime = initialProgress;
          }
        }}
        onTimeUpdate={(event) => {
          const second = Math.floor(event.currentTarget.currentTime);
          if (second - lastSentRef.current >= 10) {
            lastSentRef.current = second;
            persist(false);
          }
        }}
        onPause={() => persist(false)}
        onEnded={() => {
          persist(true);
          if (autoplayNext && nextEpisode) setCountdown(5);
        }}
      />
      {countdown && nextEpisode ? (
        <div className="next-episode-countdown">
          <span>Next episode in {countdown}</span>
          <strong>{nextEpisode.title}</strong>
          <div>
            <Link className="button button-primary" href={`/watch/${nextEpisode.id}`}>Play now</Link>
            <button className="button button-ghost" type="button" onClick={() => setCountdown(0)}>Cancel</button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
