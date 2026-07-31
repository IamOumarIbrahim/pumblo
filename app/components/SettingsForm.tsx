"use client";

import { useState } from "react";
import type { ProfileSettings } from "@/db";

type SettingKey = Exclude<keyof ProfileSettings, "updatedAt">;

const groups: Array<{
  title: string;
  description: string;
  settings: Array<{ key: SettingKey; label: string; detail: string }>;
}> = [
  {
    title: "Playback & performance",
    description: "Control bandwidth, motion, and what starts automatically.",
    settings: [
      { key: "autoplayPreviews", label: "Hover previews", detail: "Play video cards while the pointer is over them." },
      { key: "previewSound", label: "Preview sound", detail: "Ask the browser to play hover previews with sound; blocked browsers fall back to muted." },
      { key: "dataSaver", label: "Data saver", detail: "Avoid eager video loading and automatic feed playback." },
      { key: "reducedMotion", label: "Reduced motion", detail: "Remove non-essential transitions and smooth scrolling." },
    ],
  },
  {
    title: "Content",
    description: "Choose how Pumblo guides longer viewing sessions.",
    settings: [
      { key: "autoplayNext", label: "Binge mode", detail: "Continue to the next numbered episode after a series video ends." },
      { key: "preferLongform", label: "Prefer stories", detail: "Surface series and longer connected work before isolated clips where possible." },
    ],
  },
  {
    title: "Notifications",
    description: "Choose which activity appears in your Pumblo inbox.",
    settings: [
      { key: "notifyLikes", label: "New likes", detail: "Notify me when another profile likes my video." },
      { key: "notifyComments", label: "New comments", detail: "Notify me when another profile comments on my video." },
      { key: "notifyFollows", label: "New followers", detail: "Notify me when another profile follows my channel." },
      { key: "notifySeries", label: "Series releases", detail: "Notify me when a creator I follow publishes a new episode." },
    ],
  },
  {
    title: "Public profile privacy",
    description: "Your email and private viewing activity are never public.",
    settings: [
      { key: "showLocation", label: "Show location", detail: "Display the location entered on your public creator profile." },
      { key: "showSocials", label: "Show creator links", detail: "Display your ChatGPT, Discord, X, GitHub, and YouTube links." },
      { key: "showFollowerCounts", label: "Show follower counts", detail: "Display follower and following totals on your profile." },
    ],
  },
];

export function SettingsForm({ initial }: { initial: ProfileSettings }) {
  const [settings, setSettings] = useState(initial);
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);

  async function save(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setStatus("");
    const response = await fetch("/api/settings", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(settings),
    });
    const payload = (await response.json()) as { settings?: ProfileSettings; error?: string };
    if (response.ok && payload.settings) {
      setSettings(payload.settings);
      setStatus("Settings saved.");
    } else {
      setStatus(payload.error ?? "Settings could not be saved.");
    }
    setSaving(false);
  }

  return (
    <form className="settings-form" onSubmit={save}>
      {groups.map((group) => (
        <fieldset className="settings-group" key={group.title}>
          <legend>{group.title}</legend>
          <p>{group.description}</p>
          {group.settings.map((item) => (
            <label className="setting-row" key={item.key}>
              <span>
                <strong>{item.label}</strong>
                <small>{item.detail}</small>
              </span>
              <input
                type="checkbox"
                checked={settings[item.key]}
                onChange={(event) =>
                  setSettings((current) => ({
                    ...current,
                    [item.key]: event.target.checked,
                  }))
                }
              />
            </label>
          ))}
        </fieldset>
      ))}
      <div className="settings-actions">
        <button className="button button-primary" disabled={saving}>
          {saving ? "Saving…" : "Save settings"}
        </button>
        <a className="button button-ghost" href="/api/account/export">
          Export my Pumblo data
        </a>
        {status ? <span role="status">{status}</span> : null}
      </div>
    </form>
  );
}
