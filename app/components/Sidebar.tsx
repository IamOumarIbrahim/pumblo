import { chatGPTSignInPath, getChatGPTUser } from "@/app/chatgpt-auth";
import { profileMediaUrl } from "@/app/lib/profile-media";
import { getProfileByEmail } from "@/db";
import { SidebarNav } from "./SidebarNav";

export async function Sidebar() {
  const user = await getChatGPTUser();
  const profile = user ? await getProfileByEmail(user.email) : null;
  return (
    <SidebarNav
      signedIn={Boolean(user)}
      signInPath={chatGPTSignInPath("/")}
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

