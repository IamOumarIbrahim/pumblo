const WEBM_VIDEO_CODECS = ["V_VP8", "V_VP9", "V_AV1"].map((codec) =>
  [...codec].map((character) => character.charCodeAt(0)),
);

export function readContainerDuration(
  input: ArrayBuffer,
  contentType: "video/mp4" | "video/webm",
): number {
  const bytes = new Uint8Array(input);
  const duration =
    contentType === "video/mp4"
      ? readMp4Duration(bytes)
      : readWebmDuration(bytes);
  if (!Number.isFinite(duration) || duration <= 0 || duration > 21_600) {
    throw new Error("The uploaded file does not contain a valid video runtime.");
  }
  return duration;
}

export function durationsAgree(claimed: number, verified: number): boolean {
  return Math.abs(claimed - verified) <= Math.max(2, verified * 0.03);
}

function readMp4Duration(bytes: Uint8Array): number {
  const moov = boxes(bytes, 0, bytes.length).find((box) => box.type === "moov");
  if (!moov) throw new Error("The MP4 is missing its movie metadata.");
  const children = boxes(bytes, moov.payloadStart, moov.end);
  const mvhd = children.find((box) => box.type === "mvhd");
  const hasVideo = children
    .filter((box) => box.type === "trak")
    .some((track) => mp4TrackIsVideo(bytes, track));
  if (!mvhd || !hasVideo) throw new Error("The MP4 does not contain a video track.");

  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const payload = mvhd.payloadStart;
  if (payload + 20 > mvhd.end) throw new Error("The MP4 movie header is incomplete.");
  const version = bytes[payload];
  const timescaleOffset = version === 1 ? payload + 20 : payload + 12;
  const durationOffset = version === 1 ? payload + 24 : payload + 16;
  const required = version === 1 ? 8 : 4;
  if (durationOffset + required > mvhd.end) throw new Error("The MP4 duration is incomplete.");
  const timescale = view.getUint32(timescaleOffset);
  const duration =
    version === 1
      ? Number(view.getBigUint64(durationOffset))
      : view.getUint32(durationOffset);
  if (!timescale || !duration) throw new Error("The MP4 duration is unavailable.");
  return duration / timescale;
}

type Box = { type: string; payloadStart: number; end: number };

function boxes(bytes: Uint8Array, start: number, end: number): Box[] {
  const found: Box[] = [];
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  let offset = start;
  while (offset + 8 <= end) {
    const size32 = view.getUint32(offset);
    const type = ascii(bytes, offset + 4, 4);
    let headerSize = 8;
    let size = size32;
    if (size32 === 1) {
      if (offset + 16 > end) break;
      size = Number(view.getBigUint64(offset + 8));
      headerSize = 16;
    } else if (size32 === 0) {
      size = end - offset;
    }
    if (!Number.isSafeInteger(size) || size < headerSize || offset + size > end) break;
    found.push({ type, payloadStart: offset + headerSize, end: offset + size });
    offset += size;
  }
  return found;
}

function mp4TrackIsVideo(bytes: Uint8Array, track: Box): boolean {
  const mdia = boxes(bytes, track.payloadStart, track.end).find((box) => box.type === "mdia");
  if (!mdia) return false;
  const hdlr = boxes(bytes, mdia.payloadStart, mdia.end).find((box) => box.type === "hdlr");
  return Boolean(hdlr && hdlr.payloadStart + 12 <= hdlr.end && ascii(bytes, hdlr.payloadStart + 8, 4) === "vide");
}

function readWebmDuration(bytes: Uint8Array): number {
  if (!WEBM_VIDEO_CODECS.some((codec) => findSequence(bytes, codec, 0) >= 0)) {
    throw new Error("The WebM does not contain a supported video track.");
  }
  const scale = readEbmlUnsignedAfter(bytes, [0x2a, 0xd7, 0xb1]) ?? 1_000_000;
  const declared = readEbmlFloatAfter(bytes, [0x44, 0x89]);
  if (declared && declared > 0) return (declared * scale) / 1_000_000_000;

  const lastTimestamp = lastWebmBlockTimestamp(bytes);
  if (lastTimestamp <= 0) throw new Error("The WebM duration is unavailable.");
  return (lastTimestamp * scale) / 1_000_000_000;
}

function lastWebmBlockTimestamp(bytes: Uint8Array): number {
  let cursor = 0;
  let maximum = 0;
  while (cursor < bytes.length) {
    const clusterStart = findSequence(bytes, [0x1f, 0x43, 0xb6, 0x75], cursor);
    if (clusterStart < 0) break;
    const size = readVint(bytes, clusterStart + 4);
    if (!size) break;
    const payloadStart = clusterStart + 4 + size.length;
    const clusterEnd = size.unknown
      ? bytes.length
      : Math.min(bytes.length, payloadStart + size.value);
    let clusterTime = 0;
    let child = payloadStart;
    while (child < clusterEnd) {
      const id = readEbmlId(bytes, child);
      if (!id) break;
      const childSize = readVint(bytes, child + id.length);
      if (!childSize) break;
      const dataStart = child + id.length + childSize.length;
      const dataEnd = childSize.unknown
        ? clusterEnd
        : Math.min(clusterEnd, dataStart + childSize.value);
      if (id.value === 0xe7) {
        clusterTime = readUnsigned(bytes, dataStart, dataEnd);
      } else if (id.value === 0xa3 || id.value === 0xa1) {
        const relative = readBlockRelativeTime(bytes, dataStart, dataEnd);
        if (relative !== null) maximum = Math.max(maximum, clusterTime + relative);
      }
      if (dataEnd <= child) break;
      child = dataEnd;
    }
    cursor = Math.max(clusterStart + 4, clusterEnd);
  }
  return maximum;
}

function readBlockRelativeTime(bytes: Uint8Array, start: number, end: number): number | null {
  const track = readVint(bytes, start);
  if (!track || start + track.length + 2 > end) return null;
  const offset = start + track.length;
  const value = (bytes[offset] << 8) | bytes[offset + 1];
  return value & 0x8000 ? value - 0x10000 : value;
}

function readEbmlUnsignedAfter(bytes: Uint8Array, id: number[]): number | null {
  const position = findSequence(bytes, id, 0);
  if (position < 0) return null;
  const size = readVint(bytes, position + id.length);
  if (!size || size.unknown) return null;
  const start = position + id.length + size.length;
  return readUnsigned(bytes, start, Math.min(bytes.length, start + size.value));
}

function readEbmlFloatAfter(bytes: Uint8Array, id: number[]): number | null {
  let cursor = 0;
  while (cursor < bytes.length) {
    const position = findSequence(bytes, id, cursor);
    if (position < 0) return null;
    const size = readVint(bytes, position + id.length);
    if (size && !size.unknown && (size.value === 4 || size.value === 8)) {
      const start = position + id.length + size.length;
      if (start + size.value <= bytes.length) {
        const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
        const value = size.value === 4 ? view.getFloat32(start) : view.getFloat64(start);
        if (Number.isFinite(value) && value > 0) return value;
      }
    }
    cursor = position + id.length;
  }
  return null;
}

function readVint(
  bytes: Uint8Array,
  offset: number,
): { value: number; length: number; unknown: boolean } | null {
  if (offset >= bytes.length) return null;
  const first = bytes[offset];
  let mask = 0x80;
  let length = 1;
  while (length <= 8 && !(first & mask)) {
    mask >>= 1;
    length += 1;
  }
  if (length > 8 || offset + length > bytes.length) return null;
  let value = first & (mask - 1);
  let unknown = value === mask - 1;
  for (let index = 1; index < length; index += 1) {
    value = value * 256 + bytes[offset + index];
    unknown = unknown && bytes[offset + index] === 0xff;
  }
  return { value, length, unknown };
}

function readEbmlId(bytes: Uint8Array, offset: number): { value: number; length: number } | null {
  if (offset >= bytes.length) return null;
  const first = bytes[offset];
  const length = first & 0x80 ? 1 : first & 0x40 ? 2 : first & 0x20 ? 3 : first & 0x10 ? 4 : 0;
  if (!length || offset + length > bytes.length) return null;
  let value = 0;
  for (let index = 0; index < length; index += 1) value = value * 256 + bytes[offset + index];
  return { value, length };
}

function readUnsigned(bytes: Uint8Array, start: number, end: number): number {
  let value = 0;
  for (let index = start; index < end; index += 1) value = value * 256 + bytes[index];
  return value;
}

function findSequence(bytes: Uint8Array, sequence: number[], from: number): number {
  for (let index = from; index <= bytes.length - sequence.length; index += 1) {
    if (sequence.every((value, offset) => bytes[index + offset] === value)) return index;
  }
  return -1;
}

function ascii(bytes: Uint8Array, start: number, length: number): string {
  return String.fromCharCode(...bytes.subarray(start, start + length));
}
