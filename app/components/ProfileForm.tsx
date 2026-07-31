"use client";

import { useState } from "react";

type ProfileDraft = {
  handle: string;
  displayName: string;
  bio: string;
  location: string;
  website: string;
  avatarColor: string;
};

const colors = [
  "#b8ff3d",
  "#ff5f56",
  "#8f7cff",
  "#43d9ff",
  "#ffca3a",
  "#ff70a6",
];

export function ProfileForm({
  initial,
  suggestedName,
  nextPath,
}: {
  initial: ProfileDraft | null;
  suggestedName: string;
  nextPath: string | null;
}) {
  const [form, setForm] = useState<ProfileDraft>(
    initial ?? {
      handle: "",
      displayName: suggestedName,
      bio: "",
      location: "",
      website: "",
      avatarColor: colors[0],
    },
  );
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  function update<K extends keyof ProfileDraft>(
    key: K,
    value: ProfileDraft[K],
  ) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");

    const response = await fetch("/api/profile", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(form),
    });
    const payload = (await response.json()) as {
      error?: string;
      profile?: { handle: string };
    };

    if (!response.ok || !payload.profile) {
      setError(payload.error ?? "Profile could not be saved.");
      setSaving(false);
      return;
    }

    window.location.assign(nextPath || `/profile/${payload.profile.handle}`);
  }

  return (
    <form className="profile-form" onSubmit={submit}>
      <div className="form-split">
        <label>
          <span>Display name</span>
          <input
            required
            minLength={2}
            maxLength={50}
            value={form.displayName}
            onChange={(event) => update("displayName", event.target.value)}
            placeholder="Oumar Ibrahim"
          />
        </label>
        <label>
          <span>Channel handle</span>
          <div className="input-prefix">
            <b>@</b>
            <input
              required
              minLength={3}
              maxLength={24}
              pattern="[a-z0-9_]+"
              value={form.handle}
              onChange={(event) =>
                update(
                  "handle",
                  event.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""),
                )
              }
              placeholder="oumar"
            />
          </div>
          <small>Lowercase letters, numbers, and underscores.</small>
        </label>
      </div>

      <label>
        <span>Bio</span>
        <textarea
          maxLength={280}
          rows={4}
          value={form.bio}
          onChange={(event) => update("bio", event.target.value)}
          placeholder="What do you make, and what are you exploring?"
        />
        <small>{form.bio.length}/280</small>
      </label>

      <div className="form-split">
        <label>
          <span>Location</span>
          <input
            maxLength={60}
            value={form.location}
            onChange={(event) => update("location", event.target.value)}
            placeholder="Dubai, UAE"
          />
        </label>
        <label>
          <span>Website</span>
          <input
            maxLength={160}
            value={form.website}
            onChange={(event) => update("website", event.target.value)}
            placeholder="https://your-site.com"
          />
        </label>
      </div>

      <fieldset className="color-fieldset">
        <legend>Profile color</legend>
        <div className="color-options">
          {colors.map((color) => (
            <button
              key={color}
              className={form.avatarColor === color ? "selected" : ""}
              style={{ backgroundColor: color }}
              type="button"
              aria-label={`Use ${color} as profile color`}
              aria-pressed={form.avatarColor === color}
              onClick={() => update("avatarColor", color)}
            />
          ))}
        </div>
      </fieldset>

      {error ? <p className="form-error">{error}</p> : null}

      <div className="form-actions">
        <button className="button button-primary button-large" disabled={saving}>
          {saving ? "Saving…" : initial ? "Save changes" : "Create my profile"}
        </button>
        <p>
          Your sign-in email stays private. Only your public Pumblo profile is
          shown.
        </p>
      </div>
    </form>
  );
}
