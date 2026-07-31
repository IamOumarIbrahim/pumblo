"use client";

import { useState } from "react";

export function FollowButton({
  handle,
  initialFollowing,
  initialCount,
  actionPath,
}: {
  handle: string;
  initialFollowing: boolean;
  initialCount: number;
  actionPath: string | null;
}) {
  const [following, setFollowing] = useState(initialFollowing);
  const [count, setCount] = useState(initialCount);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function toggle() {
    if (actionPath) {
      window.location.href = actionPath;
      return;
    }
    setBusy(true);
    setError("");
    const response = await fetch(`/api/profiles/${encodeURIComponent(handle)}/follow`, {
      method: "POST",
    });
    const payload = (await response.json()) as {
      following?: boolean;
      count?: number;
      error?: string;
    };
    if (!response.ok || typeof payload.following !== "boolean") {
      setError(payload.error ?? "Follow could not be saved.");
    } else {
      setFollowing(payload.following);
      setCount(payload.count ?? count);
    }
    setBusy(false);
  }

  return (
    <div className="follow-control">
      <button
        className={following ? "button button-ghost" : "button button-primary"}
        type="button"
        aria-pressed={following}
        disabled={busy}
        onClick={toggle}
      >
        {busy ? "Saving…" : following ? "Following" : "Follow"}
      </button>
      <small>{count} {count === 1 ? "follower" : "followers"}</small>
      {error ? <span className="form-error">{error}</span> : null}
    </div>
  );
}

