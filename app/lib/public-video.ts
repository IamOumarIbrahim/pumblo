import type { Video } from "@/db";

export type PublicVideo = Omit<
  Video,
  | "ownerEmail"
  | "objectKey"
  | "contentHash"
  | "originalSizeBytes"
  | "storageSavingsBytes"
>;

export function toPublicVideo(video: Video): PublicVideo {
  return {
    id: video.id,
    title: video.title,
    description: video.description,
    generationTool: video.generationTool,
    generationMode: video.generationMode,
    category: video.category,
    license: video.license,
    prompt: video.prompt,
    contentType: video.contentType,
    sizeBytes: video.sizeBytes,
    durationSeconds: video.durationSeconds,
    seriesId: video.seriesId,
    seriesTitle: video.seriesTitle,
    seriesStatus: video.seriesStatus,
    seasonNumber: video.seasonNumber,
    episodeNumber: video.episodeNumber,
    sourceCreditUrl: video.sourceCreditUrl,
    provenanceStatus: video.provenanceStatus,
    views: video.views,
    createdAt: video.createdAt,
    ownerHandle: video.ownerHandle,
    ownerDisplayName: video.ownerDisplayName,
    ownerAvatarColor: video.ownerAvatarColor,
    ownerAvatarUrl: video.ownerAvatarUrl,
    likeCount: video.likeCount,
    commentCount: video.commentCount,
  };
}
