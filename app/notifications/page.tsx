import { redirect } from "next/navigation";
import { requireChatGPTUser } from "@/app/chatgpt-auth";
import { NotificationList } from "@/app/components/NotificationList";
import { getProfileByEmail, listNotifications } from "@/db";

export const dynamic = "force-dynamic";

export default async function NotificationsPage() {
  const user = await requireChatGPTUser("/notifications");
  if (!(await getProfileByEmail(user.email))) redirect("/settings/profile?next=/notifications");
  const notifications = await listNotifications(user.email);
  return (
    <main className="notifications-page">
      <header className="form-page-heading">
        <span className="section-kicker">Activity inbox</span>
        <h1>What happened while you were creating.</h1>
        <p>Notification preferences live in Settings.</p>
      </header>
      <NotificationList notifications={notifications} />
    </main>
  );
}
