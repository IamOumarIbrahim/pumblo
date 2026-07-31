import { chatGPTSignInPath, getChatGPTUser } from "@/app/chatgpt-auth";
import { profileMediaUrl } from "@/app/lib/profile-media";
import { getProfileByEmail, unreadNotificationCount } from "@/db";
import { SidebarNav } from "./SidebarNav";

export async function Sidebar() {
  const user = await getChatGPTUser();
  const profile = user ? await getProfileByEmail(user.email) : null;
  const unread = user && profile ? await unreadNotificationCount(user.email) : 0;
  return (
    <SidebarNav
      signedIn={Boolean(user)}
      signInPath={chatGPTSignInPath("/")}
      unreadNotifications={unread}
      profile={
        profile
          ? {
              handle: profile.handle,
              displayName: profile.displayName,
              avatarColor: profile.avatarColor,
              avatarUrl: profile.avatarObjectKey
                ? profileMediaUrl(profile.handle, "avatar", profile.updatedAt)
                : "",
            }
          : null
      }
    />
  );
}
