export { MAX_PROFILE_IMAGE_BYTES } from "@/app/lib/limits";

export type ProfileMediaKind = "avatar" | "banner";

export function profileMediaUrl(
  handle: string,
  kind: ProfileMediaKind,
  updatedAt: string,
): string {
  return `/profile-media/${encodeURIComponent(handle)}/${kind}?v=${encodeURIComponent(updatedAt)}`;
}
