import type { Metadata } from "next";
import { chatGPTSignInPath, getChatGPTUser } from "@/app/chatgpt-auth";
import { QuickFeed } from "@/app/components/QuickFeed";
import { toPublicVideo } from "@/app/lib/public-video";
import { QUICK_DURATION_CEILING_SECONDS } from "@/app/lib/quicks";
import { getProfileByEmail, listLikedVideoIds, listVideos } from "@/db";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Quicks",
  description: "Scroll community AI videos strictly under 60 seconds.",
  alternates: { canonical: "/quicks" },
};

export default async function QuicksPage() {
  const viewer = await getChatGPTUser();
  const profile = viewer ? await getProfileByEmail(viewer.email) : null;
  const videos = await listVideos({
    maxDurationSeconds: QUICK_DURATION_CEILING_SECONDS,
    sort: "newest",
    limit: 8,
  });
  const likedVideoIds = profile
    ? await listLikedVideoIds(videos.map((video) => video.id), viewer!.email)
    : [];

  return (
    <main className="quicks-page">
      <QuickFeed
        initialVideos={videos.map(toPublicVideo)}
        initialLikedVideoIds={likedVideoIds}
        initialHasMore={videos.length === 8}
        signedIn={Boolean(viewer)}
        hasProfile={Boolean(profile)}
        signInPath={chatGPTSignInPath("/quicks")}
      />
    </main>
  );
}
