"use client";

import { useState } from "react";

export function ReportButton({ videoId, actionPath }: { videoId: string; actionPath: string | null }) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (actionPath) {
      window.location.assign(actionPath);
      return;
    }
    const form = new FormData(event.currentTarget);
    const response = await fetch(`/api/videos/${videoId}/report`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ reason: form.get("reason"), details: form.get("details") }),
    });
    const payload = (await response.json()) as { reported?: boolean; error?: string };
    if (payload.reported) {
      setStatus("Report received. Thank you for documenting the problem.");
      setOpen(false);
    } else setStatus(payload.error ?? "Report could not be sent.");
  }

  return (
    <div className="report-control">
      <button className="text-button" type="button" onClick={() => setOpen((value) => !value)}>Report video</button>
      {open ? (
        <form onSubmit={submit}>
          <select name="reason" required defaultValue="">
            <option value="" disabled>Choose a reason</option>
            <option value="rights">Copyright or creator rights</option>
            <option value="impersonation">Impersonation or deceptive identity</option>
            <option value="non-consensual">Non-consensual or exploitative media</option>
            <option value="hate">Hate or harassment</option>
            <option value="spam">Spam or misleading metadata</option>
            <option value="other">Other</option>
          </select>
          <textarea name="details" maxLength={500} rows={3} placeholder="Add useful context (optional)" />
          <button className="button button-danger">Submit report</button>
        </form>
      ) : null}
      {status ? <p role="status">{status}</p> : null}
    </div>
  );
}
