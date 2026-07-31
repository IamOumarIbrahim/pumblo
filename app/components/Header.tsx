import Link from "next/link";
import {
  chatGPTSignOutPath,
  getChatGPTUser,
} from "@/app/chatgpt-auth";
import { getProfileByEmail } from "@/db";
import { Avatar } from "./Avatar";

export async function Header() {
  const user = await getChatGPTUser();
  const profile = user ? await getProfileByEmail(user.email) : null;

  return (
    <header className="site-header">
      <div className="header-inner">
        <Link className="brand" href="/" aria-label="Pumblo home">
          <span className="brand-mark">P</span>
          <span>Pumblo</span>
        </Link>

        <form className="header-search" action="/" role="search">
          <span aria-hidden="true">⌕</span>
          <input
            name="q"
            type="search"
            placeholder="Search videos, creators, tools"
            aria-label="Search Pumblo"
          />
        </form>

        <nav className="header-actions" aria-label="Primary navigation">
          <Link className="nav-link desktop-only" href="/#feed">
            Browse
          </Link>
          {user ? (
            <>
              <Link className="nav-link desktop-only" href="/following">
                Following
              </Link>
              <Link className="button button-primary" href="/upload">
                <span aria-hidden="true">＋</span> Upload video
              </Link>
              <Link
                className="profile-chip"
                href={profile ? `/profile/${profile.handle}` : "/settings/profile"}
              >
                <Avatar
                  name={profile?.displayName ?? user.displayName}
                  color={profile?.avatarColor ?? "#b8ff3d"}
                  size="sm"
                />
                <span className="desktop-only">
                  {profile?.displayName ?? "Create profile"}
                </span>
              </Link>
              <Link
                className="nav-link desktop-only"
                href={chatGPTSignOutPath("/")}
              >
                Sign out
              </Link>
            </>
          ) : (
            <Link className="button button-primary" href="/upload">
              Upload video
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
