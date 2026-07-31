import { getChatGPTUser } from "@/app/chatgpt-auth";
import { toPublicVideo } from "@/app/lib/public-video";
import { QUICK_DURATION_CEILING_SECONDS } from "@/app/lib/quicks";
import { getProfileByEmail, listLikedVideoIds, listVideos } from "@/db";

const PAGE_SIZE = 8;

export async function GET(request: Request) {
  const url = new URL(request.url);
  const offset = Math.max(0, Math.min(Number(url.searchParams.get("offset")) || 0, 10_000));
  const videos = await listVideos({
    maxDurationSeconds: QUICK_DURATION_CEILING_SECONDS,
    sort: "newest",
    limit: PAGE_SIZE,
    offset,
  });
  const user = await getChatGPTUser();
  const profile = user ? await getProfileByEmail(user.email) : null;
  const likedVideoIds = profile
    ? await listLikedVideoIds(videos.map((video) => video.id), user!.email)
    : [];

  return Response.json({
    videos: videos.map(toPublicVideo),
    likedVideoIds,
    hasMore: videos.length === PAGE_SIZE,
  });
}
