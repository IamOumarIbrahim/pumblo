"use client";

import { useState } from "react";

export function DeleteVideoButton({
  videoId,
  returnTo,
}: {
  videoId: string;
  returnTo: string;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function remove() {
    if (
      !window.confirm(
        "Delete this video permanently? Its likes and comments will also be removed.",
      )
    ) {
      return;
    }
    setBusy(true);
    setError("");
    const response = await fetch(`/api/videos/${videoId}`, { method: "DELETE" });
    const payload = (await response.json()) as { deleted?: boolean; error?: string };
    if (!response.ok || !payload.deleted) {
      setError(payload.error ?? "Video could not be deleted.");
      setBusy(false);
      return;
    }
    window.location.href = returnTo;
  }

  return (
    <div className="delete-video-control">
      <button
        className="button button-danger"
        type="button"
        disabled={busy}
        onClick={remove}
      >
        {busy ? "Deleting…" : "Delete video"}
      </button>
      {error ? <span className="form-error">{error}</span> : null}
    </div>
  );
}

