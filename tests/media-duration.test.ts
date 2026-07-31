import assert from "node:assert/strict";
import test from "node:test";
import { durationsAgree, readContainerDuration } from "../app/lib/media-duration.ts";

function box(type: string, ...payloads: Buffer[]): Buffer {
  const payload = Buffer.concat(payloads);
  const output = Buffer.alloc(8 + payload.length);
  output.writeUInt32BE(output.length, 0);
  output.write(type, 4, 4, "ascii");
  payload.copy(output, 8);
  return output;
}

function exactArrayBuffer(buffer: Buffer): ArrayBuffer {
  return buffer.buffer.slice(
    buffer.byteOffset,
    buffer.byteOffset + buffer.byteLength,
  ) as ArrayBuffer;
}

test("server-side MP4 inspection reads runtime and requires a video track", () => {
  const movieHeader = Buffer.alloc(20);
  movieHeader.writeUInt32BE(1_000, 12);
  movieHeader.writeUInt32BE(90_000, 16);
  const handler = Buffer.alloc(12);
  handler.write("vide", 8, 4, "ascii");
  const mp4 = Buffer.concat([
    box("ftyp", Buffer.from("isom0000")),
    box("moov", box("mvhd", movieHeader), box("trak", box("mdia", box("hdlr", handler)))),
  ]);
  assert.equal(readContainerDuration(exactArrayBuffer(mp4), "video/mp4"), 90);
});

test("server-side WebM inspection reads the container duration", () => {
  const duration = Buffer.alloc(8);
  duration.writeDoubleBE(72_500);
  const webm = Buffer.concat([
    Buffer.from("V_VP9", "ascii"),
    Buffer.from([0x44, 0x89, 0x88]),
    duration,
  ]);
  assert.equal(readContainerDuration(exactArrayBuffer(webm), "video/webm"), 72.5);
});

test("WebM inspection derives runtime from clusters when recorder output omits Duration", () => {
  const webm = Buffer.concat([
    Buffer.from("V_VP9", "ascii"),
    Buffer.from([
      0x1f, 0x43, 0xb6, 0x75, 0x8a,
      0xe7, 0x82, 0x03, 0xe8,
      0xa3, 0x84, 0x81, 0x01, 0xf4, 0x00,
    ]),
  ]);
  assert.equal(readContainerDuration(exactArrayBuffer(webm), "video/webm"), 1.5);
});

test("browser and server runtimes must agree within a narrow container tolerance", () => {
  assert.equal(durationsAgree(60, 60.8), true);
  assert.equal(durationsAgree(60, 65), false);
});
