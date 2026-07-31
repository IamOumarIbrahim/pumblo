"use client";

import { useEffect, useRef, useState } from "react";

type MediaChange = { action: "upload"; blob: Blob } | { action: "delete" };

export function ImageCropField({
  kind,
  initialUrl,
  onChange,
  onEditingChange,
}: {
  kind: "avatar" | "banner";
  initialUrl: string;
  onChange: (change: MediaChange) => void;
  onEditingChange: (editing: boolean) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dragRef = useRef<{ x: number; y: number } | null>(null);
  const objectUrlRef = useRef("");
  const [sourceUrl, setSourceUrl] = useState(initialUrl);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [zoom, setZoom] = useState(1);
  const [positionX, setPositionX] = useState(0);
  const [positionY, setPositionY] = useState(0);
  const [error, setError] = useState("");
  const [committed, setCommitted] = useState(Boolean(initialUrl));
  const output = kind === "avatar" ? { width: 512, height: 512 } : { width: 1600, height: 480 };

  useEffect(() => {
    if (!sourceUrl) return;
    let active = true;
    const nextImage = new Image();
    nextImage.onload = () => {
      if (active) setImage(nextImage);
    };
    nextImage.onerror = () => {
      if (active) setError("That image could not be opened.");
    };
    nextImage.src = sourceUrl;
    return () => {
      active = false;
    };
  }, [sourceUrl]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !image) return;
    drawCrop(canvas, image, output.width, output.height, zoom, positionX, positionY);
  }, [image, output.height, output.width, positionX, positionY, zoom]);

  useEffect(
    () => () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    },
    [],
  );

  function chooseFile(file: File | null) {
    setError("");
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("Choose a JPEG, PNG, or WebP image.");
      return;
    }
    if (file.size > 12 * 1024 * 1024) {
      setError("Choose an image smaller than 12 MB before cropping.");
      return;
    }
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    objectUrlRef.current = URL.createObjectURL(file);
    setSourceUrl(objectUrlRef.current);
    setZoom(1);
    setPositionX(0);
    setPositionY(0);
    setCommitted(false);
    onEditingChange(true);
  }

  function markEditing() {
    setCommitted(false);
    onEditingChange(true);
  }

  function commitCrop() {
    const canvas = canvasRef.current;
    if (!canvas || !image) return;
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          setError("The crop could not be prepared.");
          return;
        }
        onChange({ action: "upload", blob });
        onEditingChange(false);
        setCommitted(true);
        setError("");
      },
      "image/jpeg",
      0.88,
    );
  }

  function removeImage() {
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    objectUrlRef.current = "";
    setSourceUrl("");
    setImage(null);
    setCommitted(false);
    setError("");
    onChange({ action: "delete" });
    onEditingChange(false);
    if (inputRef.current) inputRef.current.value = "";
  }

  function drag(event: React.PointerEvent<HTMLCanvasElement>) {
    if (!dragRef.current) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const dx = ((event.clientX - dragRef.current.x) / bounds.width) * 200;
    const dy = ((event.clientY - dragRef.current.y) / bounds.height) * 200;
    dragRef.current = { x: event.clientX, y: event.clientY };
    setPositionX((value) => clamp(value + dx, -100, 100));
    setPositionY((value) => clamp(value + dy, -100, 100));
    markEditing();
  }

  return (
    <section className={`crop-field crop-field-${kind}`}>
      <div className="crop-field-heading">
        <div>
          <span>{kind === "avatar" ? "Profile picture" : "Profile banner"}</span>
          <small>
            {kind === "avatar" ? "Square crop · saved at 512 × 512" : "Wide crop · saved at 1600 × 480"}
          </small>
        </div>
        <button className="button button-ghost" type="button" onClick={() => inputRef.current?.click()}>
          {sourceUrl ? "Choose another" : "Choose image"}
        </button>
      </div>

      <input
        ref={inputRef}
        hidden
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={(event) => chooseFile(event.target.files?.[0] ?? null)}
      />

      <div className={`crop-stage ${sourceUrl ? "has-image" : ""}`}>
        {sourceUrl ? (
          <canvas
            ref={canvasRef}
            width={output.width}
            height={output.height}
            aria-label={`Cropping preview for profile ${kind}`}
            onPointerDown={(event) => {
              event.currentTarget.setPointerCapture(event.pointerId);
              dragRef.current = { x: event.clientX, y: event.clientY };
            }}
            onPointerMove={drag}
            onPointerUp={() => { dragRef.current = null; }}
            onPointerCancel={() => { dragRef.current = null; }}
          />
        ) : (
          <button type="button" onClick={() => inputRef.current?.click()}>
            <strong>Add {kind === "avatar" ? "a profile picture" : "a channel banner"}</strong>
            <small>JPEG, PNG, or WebP · crop before saving</small>
          </button>
        )}
      </div>

      {sourceUrl ? (
        <div className="crop-controls">
          <label>
            <span>Zoom</span>
            <input
              type="range"
              min="1"
              max="3"
              step="0.01"
              value={zoom}
              onChange={(event) => { setZoom(Number(event.target.value)); markEditing(); }}
            />
          </label>
          <label>
            <span>Horizontal</span>
            <input
              type="range"
              min="-100"
              max="100"
              value={positionX}
              onChange={(event) => { setPositionX(Number(event.target.value)); markEditing(); }}
            />
          </label>
          <label>
            <span>Vertical</span>
            <input
              type="range"
              min="-100"
              max="100"
              value={positionY}
              onChange={(event) => { setPositionY(Number(event.target.value)); markEditing(); }}
            />
          </label>
          <div className="crop-actions">
            <button className="button button-primary" type="button" onClick={commitCrop}>
              {committed ? "Crop ready ✓" : "Use this crop"}
            </button>
            <button className="button button-danger" type="button" onClick={removeImage}>
              Remove
            </button>
          </div>
          <small className="crop-hint">Drag the preview or use the controls. “Use this crop” prepares the exact image that will be saved.</small>
        </div>
      ) : null}
      {error ? <p className="form-error">{error}</p> : null}
    </section>
  );
}

function drawCrop(
  canvas: HTMLCanvasElement,
  image: HTMLImageElement,
  width: number,
  height: number,
  zoom: number,
  positionX: number,
  positionY: number,
) {
  const context = canvas.getContext("2d");
  if (!context) return;
  const scale = Math.max(width / image.naturalWidth, height / image.naturalHeight) * zoom;
  const drawWidth = image.naturalWidth * scale;
  const drawHeight = image.naturalHeight * scale;
  const travelX = Math.max(0, (drawWidth - width) / 2);
  const travelY = Math.max(0, (drawHeight - height) / 2);
  const drawX = (width - drawWidth) / 2 + (positionX / 100) * travelX;
  const drawY = (height - drawHeight) / 2 + (positionY / 100) * travelY;
  context.clearRect(0, 0, width, height);
  context.drawImage(image, drawX, drawY, drawWidth, drawHeight);
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.max(minimum, Math.min(maximum, value));
}
