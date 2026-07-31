import { redirect } from "next/navigation";
import { requireChatGPTUser } from "@/app/chatgpt-auth";
import { UploadForm } from "@/app/components/UploadForm";
import {
  MAX_VIDEO_BYTES,
  MAX_VIDEOS_PER_PROFILE,
} from "@/app/lib/limits";
import { getProfileByEmail, listVideos } from "@/db";

export const dynamic = "force-dynamic";

export default async function UploadPage() {
  const user = await requireChatGPTUser("/upload");
  const profile = await getProfileByEmail(user.email);
  if (!profile) redirect("/settings/profile?next=/upload");

  const videos = await listVideos({
    ownerEmail: user.email,
    limit: MAX_VIDEOS_PER_PROFILE + 1,
  });
  const remaining = Math.max(0, MAX_VIDEOS_PER_PROFILE - videos.length);

  return (
    <main className="upload-page">
      <div className="upload-heading">
        <div>
          <span className="section-kicker">Upload studio</span>
          <h1>Share an AI video with the network.</h1>
          <p>
            The video is the main event. Tools, workflow, license, and process
            notes are optional context viewers can open afterward.
          </p>
        </div>
        <div className="quota-card">
          <span>Launch allowance</span>
          <strong>{remaining} of {MAX_VIDEOS_PER_PROFILE} active uploads available</strong>
          <small>MP4 or WebM · {MAX_VIDEO_BYTES / 1024 / 1024} MB maximum</small>
        </div>
      </div>
      {remaining > 0 ? (
        <UploadForm />
      ) : (
        <div className="empty-state">
          <h3>Your active upload allowance is full</h3>
          <p>
            Delete one of your videos from its watch page to free a slot and
            keep the no-card launch capacity predictable.
          </p>
        </div>
      )}
    </main>
  );
}
