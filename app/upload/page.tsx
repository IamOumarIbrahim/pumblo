import { redirect } from "next/navigation";
import { requireChatGPTUser } from "@/app/chatgpt-auth";
import { UploadForm } from "@/app/components/UploadForm";
import { getProfileByEmail, listVideos } from "@/db";

export const dynamic = "force-dynamic";

export default async function UploadPage() {
  const user = await requireChatGPTUser("/upload");
  const profile = await getProfileByEmail(user.email);
  if (!profile) redirect("/settings/profile?next=/upload");

  const videos = await listVideos({ ownerEmail: user.email, limit: 10 });
  const remaining = Math.max(0, 5 - videos.length);

  return (
    <main className="upload-page">
      <div className="upload-heading">
        <div>
          <span className="section-kicker">Upload studio</span>
          <h1>Turn a render into a page worth sharing.</h1>
          <p>
            Add the context that gets lost in a file attachment: tool,
            workflow, license, and optional process notes.
          </p>
        </div>
        <div className="quota-card">
          <span>Creator allowance</span>
          <strong>{remaining} of 5 film pages available</strong>
          <small>MP4 or WebM · 90 MB maximum</small>
        </div>
      </div>
      {remaining > 0 ? (
        <UploadForm />
      ) : (
        <div className="empty-state">
          <h3>Your beta upload allowance is full</h3>
          <p>
            Each creator has five film pages during the open beta so storage
            stays predictable.
          </p>
        </div>
      )}
    </main>
  );
}
