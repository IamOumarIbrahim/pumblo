"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import type { PublicVideo } from "@/app/lib/public-video";
import { compactNumber } from "@/app/lib/format";
import { Avatar } from "./Avatar";

export function QuickFeed({
  initialVideos,
  initialLikedVideoIds,
  initialHasMore,
  signedIn,
  hasProfile,
  signInPath,
  dataSaver,
  reducedMotion,
}: {
  initialVideos: PublicVideo[];
  initialLikedVideoIds: string[];
  initialHasMore: boolean;
  signedIn: boolean;
  hasProfile: boolean;
  signInPath: string;
  dataSaver: boolean;
  reducedMotion: boolean;
}) {
  const feedRef = useRef<HTMLDivElement>(null);
  const viewedRef = useRef(new Set<string>());
  const [videos, setVideos] = useState(initialVideos);
  const [liked, setLiked] = useState<Record<string, boolean>>(
    Object.fromEntries(initialLikedVideoIds.map((id) => [id, true])),
  );
  const [likeCounts, setLikeCounts] = useState<Record<string, number>>({});
  const [activeIndex, setActiveIndex] = useState(0);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [loading, setLoading] = useState(false);
  const [muted, setMuted] = useState(true);
  const [notice, setNotice] = useState("");

  const actionPath = !signedIn
    ? signInPath
    : !hasProfile
      ? `/settings/profile?next=${encodeURIComponent("/quicks")}`
      : null;

  const scrollToIndex = useCallback((index: number) => {
    const bounded = Math.max(0, Math.min(index, videos.length - 1));
    feedRef.current
      ?.querySelector<HTMLElement>(`[data-quick-index="${bounded}"]`)
      ?.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
  }, [reducedMotion, videos.length]);

  const loadMore = useCallback(async () => {
    if (!hasMore || loading) return;
    setLoading(true);
    try {
      const response = await fetch(`/api/quicks?offset=${videos.length}`);
      const payload = (await response.json()) as {
        videos?: PublicVideo[];
        likedVideoIds?: string[];
        hasMore?: boolean;
      };
      const additions = payload.videos ?? [];
      setVideos((current) => {
        const known = new Set(current.map((video) => video.id));
        return [...current, ...additions.filter((video) => !known.has(video.id))];
      });
      setLiked((current) => ({
        ...current,
        ...Object.fromEntries((payload.likedVideoIds ?? []).map((id) => [id, true])),
      }));
      setHasMore(Boolean(payload.hasMore));
    } catch {
      setNotice("More Quicks could not be loaded.");
    } finally {
      setLoading(false);
    }
  }, [hasMore, loading, videos.length]);

  useEffect(() => {
    const feed = feedRef.current;
    if (!feed) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) {
          const nextIndex = Number((visible.target as HTMLElement).dataset.quickIndex);
          setActiveIndex(nextIndex);
          if (nextIndex >= videos.length - 2) void loadMore();
        }
      },
      { root: feed, threshold: [0.55, 0.75] },
    );
    feed.querySelectorAll("[data-quick-index]").forEach((item) => observer.observe(item));
    return () => observer.disconnect();
  }, [loadMore, videos.length]);

  useEffect(() => {
    feedRef.current?.querySelectorAll<HTMLVideoElement>("video").forEach((video, index) => {
      video.muted = muted;
      if (index === activeIndex && !dataSaver) void video.play().catch(() => undefined);
      else video.pause();
    });
    const current = videos[activeIndex];
    if (current && !viewedRef.current.has(current.id)) {
      viewedRef.current.add(current.id);
      void fetch(`/api/videos/${current.id}/view`, { method: "POST" });
    }
  }, [activeIndex, dataSaver, muted, videos]);

  useEffect(() => {
    function handleKey(event: KeyboardEvent) {
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) return;
      if (["ArrowDown", "PageDown", "j"].includes(event.key)) {
        event.preventDefault();
        scrollToIndex(activeIndex + 1);
      }
      if (["ArrowUp", "PageUp", "k"].includes(event.key)) {
        event.preventDefault();
        scrollToIndex(activeIndex - 1);
      }
      if (event.key.toLowerCase() === "m") setMuted((value) => !value);
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [activeIndex, scrollToIndex]);

  async function toggleLike(video: PublicVideo) {
    if (actionPath) {
      window.location.assign(actionPath);
      return;
    }
    const response = await fetch(`/api/videos/${video.id}/like`, { method: "POST" });
    const payload = (await response.json()) as { liked?: boolean; count?: number; error?: string };
    if (!response.ok || typeof payload.liked !== "boolean") {
      setNotice(payload.error ?? "Like could not be saved.");
      return;
    }
    setLiked((current) => ({ ...current, [video.id]: payload.liked! }));
    setLikeCounts((current) => ({ ...current, [video.id]: payload.count ?? video.likeCount }));
  }

  function openComments(videoId: string) {
    window.location.assign(actionPath || `/watch/${videoId}#comments`);
  }

  async function share(video: PublicVideo) {
    const url = `${window.location.origin}/watch/${video.id}`;
    const canShare = typeof navigator.share === "function";
    try {
      if (canShare) await navigator.share({ title: video.title, text: "Watch this AI Quick on Pumblo.", url });
      else await navigator.clipboard.writeText(url);
      setNotice(canShare ? "Shared" : "Link copied");
    } catch (error) {
      if (!(error instanceof DOMException && error.name === "AbortError")) setNotice("Share could not be opened.");
    }
  }

  if (!videos.length) {
    return (
      <section className="quicks-empty">
        <span className="section-kicker">Quicks</span>
        <h1>AI video in under sixty seconds.</h1>
        <p>The first community upload under 60 seconds will start this vertical feed.</p>
        <Link className="button button-primary button-large" href="/upload">Upload the first Quick</Link>
      </section>
    );
  }

  return (
    <>
      <div className="quicks-feed" ref={feedRef} aria-label="Quicks video feed">
        {videos.map((video, index) => (
          <article className="quick-item" data-quick-index={index} key={video.id}>
            <div className="quick-stage">
              <video
                src={`/media/${video.id}`}
                loop
                muted={muted}
                playsInline
                preload={dataSaver ? "metadata" : Math.abs(index - activeIndex) <= 1 ? "auto" : "metadata"}
                onClick={(event) => {
                  if (event.currentTarget.paused) void event.currentTarget.play();
                  else event.currentTarget.pause();
                }}
              />
              <button className="quick-sound" type="button" onClick={() => setMuted((value) => !value)}>
                <span aria-hidden="true">{muted ? "⌁" : "◖"}</span>
                {muted ? "Sound off" : "Sound on"}
              </button>
              <div className="quick-copy">
                <Link href={`/profile/${video.ownerHandle}`} className="quick-creator">
                  <Avatar
                    name={video.ownerDisplayName}
                    color={video.ownerAvatarColor}
                    src={video.ownerAvatarUrl || undefined}
                    size="sm"
                  />
                  <strong>@{video.ownerHandle}</strong>
                </Link>
                <h2>{video.title}</h2>
                {video.seriesId ? (
                  <Link className="quick-series" href={`/series/${video.seriesId}`}>
                    {video.seriesTitle} · S{video.seasonNumber} E{video.episodeNumber}
                  </Link>
                ) : null}
                <p>{video.description || `Created with ${video.generationTool}.`}</p>
                <span>{Math.ceil(video.durationSeconds)}s · {video.generationTool}</span>
              </div>
              <div className="quick-actions" aria-label={`Actions for ${video.title}`}>
                <button type="button" aria-label="Like" aria-pressed={Boolean(liked[video.id])} onClick={() => toggleLike(video)}>
                  <b aria-hidden="true">{liked[video.id] ? "♥" : "♡"}</b>
                  <span>{compactNumber(likeCounts[video.id] ?? video.likeCount)}</span>
                </button>
                <button type="button" aria-label="Comment" onClick={() => openComments(video.id)}>
                  <b aria-hidden="true">▢</b>
                  <span>{compactNumber(video.commentCount)}</span>
                </button>
                <button type="button" aria-label="Share" onClick={() => share(video)}>
                  <b aria-hidden="true">↗</b>
                  <span>Share</span>
                </button>
                <Link href={`/profile/${video.ownerHandle}`} aria-label={`Open ${video.ownerDisplayName}'s channel`}>
                  <Avatar
                    name={video.ownerDisplayName}
                    color={video.ownerAvatarColor}
                    src={video.ownerAvatarUrl || undefined}
                    size="md"
                  />
                </Link>
              </div>
            </div>
          </article>
        ))}
        {loading ? <p className="quicks-loading">Loading more Quicks…</p> : null}
      </div>
      <nav className="quick-stepper" aria-label="Move through Quicks">
        <button type="button" aria-label="Previous Quick" disabled={activeIndex === 0} onClick={() => scrollToIndex(activeIndex - 1)}>↑</button>
        <button type="button" aria-label="Next Quick" disabled={activeIndex >= videos.length - 1 && !hasMore} onClick={() => scrollToIndex(activeIndex + 1)}>↓</button>
        <small>{activeIndex + 1}</small>
      </nav>
      <p className="quick-key-hint">↑ / ↓ or J / K to move · M to mute</p>
      {notice ? <button className="quick-notice" type="button" onClick={() => setNotice("")}>{notice}</button> : null}
    </>
  );
}
