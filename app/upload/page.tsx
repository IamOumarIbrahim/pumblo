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
          <h1>Put the work on screen.</h1>
          <p>
            Upload a browser-ready render, disclose how it was made, and
            publish it to Discovery.
          </p>
        </div>
        <div className="quota-card">
          <span>Beta allowance</span>
          <strong>{remaining} of 5 uploads remaining</strong>
          <small>90 MB maximum per film</small>
        </div>
      </div>
      {remaining > 0 ? (
        <UploadForm />
      ) : (
        <div className="empty-state">
          <h3>Your beta upload allowance is full</h3>
          <p>
            Each creator receives five upload slots while Pumblo remains on
            no-card infrastructure.
          </p>
        </div>
      )}
    </main>
  );
}
