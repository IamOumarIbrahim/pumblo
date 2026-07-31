import Link from "next/link";
import { redirect } from "next/navigation";
import { requireChatGPTUser } from "@/app/chatgpt-auth";
import { SettingsForm } from "@/app/components/SettingsForm";
import { getProfileByEmail, getProfileSettings } from "@/db";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const user = await requireChatGPTUser("/settings");
  const profile = await getProfileByEmail(user.email);
  if (!profile) redirect("/settings/profile?next=/settings");
  const settings = await getProfileSettings(user.email);

  return (
    <main className="settings-page">
      <div className="form-page-heading">
        <span className="section-kicker">Account controls</span>
        <h1>Make Pumblo work your way.</h1>
        <p>
          Your ChatGPT identity is connected for sign-in. Public creator links
          are managed separately in <Link href="/settings/profile">Edit profile</Link>.
        </p>
      </div>
      <SettingsForm initial={settings} />
    </main>
  );
}
