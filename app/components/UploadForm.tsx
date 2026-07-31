"use client";

import { useRef, useState } from "react";
import { MAX_VIDEO_BYTES } from "@/app/lib/limits";

export function UploadForm() {
  const fileInput = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState<"idle" | "uploading" | "saving" | "done">(
    "idle",
  );
  const [error, setError] = useState("");

  function chooseFile(nextFile: File | null) {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setError("");
    setProgress(0);
    if (!nextFile) {
      setFile(null);
      setPreviewUrl("");
      return;
    }
    if (!["video/mp4", "video/webm"].includes(nextFile.type)) {
      setError("Use an MP4 or WebM video.");
      return;
    }
    if (nextFile.size > MAX_VIDEO_BYTES) {
      setError("Video must be smaller than 40 MB for the no-card launch.");
      return;
    }
    setFile(nextFile);
    setPreviewUrl(URL.createObjectURL(nextFile));
  }

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!file) {
      setError("Choose a video before publishing.");
      return;
    }

    setError("");
    setPhase("uploading");
    const form = new FormData(event.currentTarget);
    const metadata = {
      title: field(form, "title"),
      description: field(form, "description"),
      generationTool: field(form, "generationTool"),
      generationMode: field(form, "generationMode"),
      category: field(form, "category"),
      license: field(form, "license"),
      prompt: field(form, "prompt"),
      aiDeclaration: field(form, "aiDeclaration"),
      sizeBytes: file.size,
    };

    const request = new XMLHttpRequest();
    request.open("POST", "/api/videos");
    request.setRequestHeader("Content-Type", file.type);
    request.setRequestHeader(
      "X-Pumblo-Metadata",
      encodeURIComponent(JSON.stringify(metadata)),
    );
    request.upload.addEventListener("progress", (progressEvent) => {
      if (progressEvent.lengthComputable) {
        setProgress(
          Math.min(96, Math.round((progressEvent.loaded / progressEvent.total) * 96)),
        );
      }
    });
    request.upload.addEventListener("load", () => {
      setPhase("saving");
      setProgress(98);
    });
    request.addEventListener("load", () => {
      let payload: { error?: string; video?: { id: string } } = {};
      try {
        payload = JSON.parse(request.responseText);
      } catch {
        payload = { error: "The upload returned an invalid response." };
      }

      if (request.status < 200 || request.status >= 300 || !payload.video) {
        setError(payload.error ?? "Upload failed. Please try again.");
        setPhase("idle");
        setProgress(0);
        return;
      }

      setPhase("done");
      setProgress(100);
      window.location.assign(`/watch/${payload.video.id}?uploaded=1`);
    });
    request.addEventListener("error", () => {
      setError("The upload was interrupted. Check your connection and retry.");
      setPhase("idle");
      setProgress(0);
    });
    request.send(file);
  }

  return (
    <form className="upload-form" onSubmit={submit}>
      <div
        className={file ? "dropzone has-file" : "dropzone"}
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          chooseFile(event.dataTransfer.files[0] ?? null);
        }}
      >
        {previewUrl ? (
          <video src={previewUrl} controls playsInline />
        ) : (
          <button type="button" onClick={() => fileInput.current?.click()}>
            <span className="upload-glyph" aria-hidden="true">
              ↑
            </span>
            <strong>Drop your finished render here</strong>
            <small>or choose an MP4 / WebM file · maximum 40 MB</small>
          </button>
        )}
        <input
          ref={fileInput}
          hidden
          type="file"
          name="file"
          accept="video/mp4,video/webm"
          onChange={(event) => chooseFile(event.target.files?.[0] ?? null)}
        />
        {file ? (
          <div className="selected-file">
            <span>
              <strong>{file.name}</strong>
              <small>{(file.size / 1024 / 1024).toFixed(1)} MB</small>
            </span>
            <button type="button" onClick={() => fileInput.current?.click()}>
              Replace
            </button>
          </div>
        ) : null}
      </div>

      <div className="upload-recipe" aria-label="Upload checklist">
        <span>Before you publish</span>
        <p>
          Use a browser-ready H.264 MP4 or WebM, keep it below 40 MB, and make
          sure you have the right to share every element.
        </p>
      </div>

      <div className="upload-fields">
        <label className="full-field">
          <span>Title</span>
          <input
            required
            name="title"
            minLength={2}
            maxLength={100}
            placeholder="Give the video a memorable title"
          />
        </label>
        <label className="full-field">
          <span>Description</span>
          <textarea
            name="description"
            rows={4}
            maxLength={1000}
            placeholder="What should viewers know before they press play?"
          />
        </label>

        <label>
          <span>Generation tool</span>
          <input
            required
            name="generationTool"
            maxLength={50}
            list="generation-tools"
            placeholder="Runway, Veo, Kling, ComfyUI…"
          />
          <datalist id="generation-tools">
            <option value="Runway" />
            <option value="Veo" />
            <option value="Kling" />
            <option value="Pika" />
            <option value="Luma" />
            <option value="ComfyUI" />
          </datalist>
          <small>Type any model, tool, or custom pipeline.</small>
        </label>
        <label>
          <span>Generation mode</span>
          <select name="generationMode" defaultValue="text-to-video">
            <option value="text-to-video">Text to video</option>
            <option value="image-to-video">Image to video</option>
            <option value="video-to-video">Video to video</option>
            <option value="audio-to-video">Audio to video</option>
            <option value="hybrid-workflow">Hybrid workflow</option>
          </select>
        </label>
        <label>
          <span>Category</span>
          <select name="category" defaultValue="film">
            <option value="film">Film</option>
            <option value="animation">Animation</option>
            <option value="music">Music</option>
            <option value="education">Education</option>
            <option value="experimental">Experimental</option>
          </select>
        </label>
        <label>
          <span>License</span>
          <select name="license" defaultValue="all-rights-reserved">
            <option value="all-rights-reserved">All rights reserved</option>
            <option value="cc-by-4.0">CC BY 4.0</option>
            <option value="cc-by-nc-4.0">CC BY-NC 4.0</option>
            <option value="cc0">CC0 / public domain</option>
          </select>
        </label>

        <label className="full-field">
          <span>Prompt or process notes <i>optional</i></span>
          <textarea
            name="prompt"
            rows={3}
            maxLength={1500}
            placeholder="Share the prompt, image workflow, model settings, or editing process."
          />
        </label>
      </div>

      <label className="policy-check">
        <input required type="checkbox" name="aiDeclaration" value="yes" />
        <span>
          I confirm AI was a material part of this video’s production, I have the
          right to publish it, and the process details above are accurate.
        </span>
      </label>

      {phase !== "idle" ? (
        <div className="upload-progress" aria-live="polite">
          <div>
            <span style={{ width: `${progress}%` }} />
          </div>
          <p>
            {phase === "uploading"
              ? `Uploading securely… ${progress}%`
              : phase === "saving"
                ? "Saving video details…"
                : "Published. Opening your video…"}
          </p>
        </div>
      ) : null}

      {error ? <p className="form-error">{error}</p> : null}

      <div className="publish-row">
        <button
          className="button button-primary button-large"
          disabled={phase !== "idle"}
        >
          {phase === "idle" ? "Publish video" : "Publishing…"}
        </button>
        <p>
          Videos are public immediately. Process information is optional and
          clearly labeled creator-declared.
        </p>
      </div>
    </form>
  );
}

function field(form: FormData, name: string): string {
  const value = form.get(name);
  return typeof value === "string" ? value : "";
}
