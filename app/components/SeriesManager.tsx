"use client";

import Link from "next/link";
import { useState } from "react";
import type { Series } from "@/db";

export function SeriesManager({ initialSeries }: { initialSeries: Series[] }) {
  const [items, setItems] = useState(initialSeries);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  async function create(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setStatus("");
    const response = await fetch("/api/series", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ title, description, status: "ongoing" }),
    });
    const payload = (await response.json()) as { series?: Series; error?: string };
    if (response.ok && payload.series) {
      setItems((current) => [payload.series!, ...current]);
      setTitle("");
      setDescription("");
      setStatus("Series created. Add its first episode from Upload.");
    } else setStatus(payload.error ?? "Series could not be created.");
    setBusy(false);
  }

  async function changeStatus(series: Series) {
    const nextStatus = series.status === "ongoing" ? "completed" : "ongoing";
    const response = await fetch(`/api/series/${series.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        title: series.title,
        description: series.description,
        status: nextStatus,
      }),
    });
    const payload = (await response.json()) as { series?: Series; error?: string };
    if (payload.series) {
      setItems((current) =>
        current.map((item) => (item.id === series.id ? payload.series! : item)),
      );
    } else setStatus(payload.error ?? "Series could not be updated.");
  }

  async function remove(series: Series) {
    if (!window.confirm(`Delete “${series.title}”? Its videos stay published but become standalone.`)) return;
    const response = await fetch(`/api/series/${series.id}`, { method: "DELETE" });
    const payload = (await response.json()) as { deleted?: boolean; error?: string };
    if (payload.deleted) setItems((current) => current.filter((item) => item.id !== series.id));
    else setStatus(payload.error ?? "Series could not be deleted.");
  }

  return (
    <div className="series-manager">
      <form className="series-create" onSubmit={create}>
        <div>
          <span className="section-kicker">New story</span>
          <h2>Create a series</h2>
        </div>
        <label>
          <span>Series title</span>
          <input required minLength={2} maxLength={100} value={title} onChange={(event) => setTitle(event.target.value)} />
        </label>
        <label>
          <span>Premise <i>optional</i></span>
          <textarea rows={3} maxLength={600} value={description} onChange={(event) => setDescription(event.target.value)} />
        </label>
        <button className="button button-primary" disabled={busy}>{busy ? "Creating…" : "Create series"}</button>
      </form>
      {status ? <p className="form-status" role="status">{status}</p> : null}
      <div className="managed-series-list">
        {items.length ? items.map((series) => (
          <article key={series.id}>
            <div>
              <span>{series.status} · {series.episodeCount} episodes</span>
              <h3><Link href={`/series/${series.id}`}>{series.title}</Link></h3>
              <p>{series.description || "No premise added yet."}</p>
            </div>
            <div className="series-actions">
              <button className="button button-ghost" type="button" onClick={() => void changeStatus(series)}>
                Mark {series.status === "ongoing" ? "complete" : "ongoing"}
              </button>
              <button className="button button-danger" type="button" onClick={() => void remove(series)}>Delete</button>
            </div>
          </article>
        )) : <div className="empty-state compact"><h3>No series yet</h3><p>Create the story your next upload belongs to.</p></div>}
      </div>
    </div>
  );
}
