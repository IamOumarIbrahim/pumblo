import Link from "next/link";
import { Avatar } from "@/app/components/Avatar";
import { VideoCard } from "@/app/components/VideoCard";
import { listProfiles, listVideos } from "@/db";
import { profileMediaUrl } from "@/app/lib/profile-media";

export const dynamic = "force-dynamic";

const categories = [
  ["all", "All"],
  ["film", "Film"],
  ["animation", "Animation"],
  ["music", "Music"],
  ["education", "Education"],
  ["experimental", "Experimental"],
] as const;

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; sort?: string }>;
}) {
  const params = await searchParams;
  const query = params.q?.trim().slice(0, 80) ?? "";
  const category = params.category ?? "all";
  const sort = params.sort === "newest" ? "newest" : "community";
  const [videos, creators] = await Promise.all([
    listVideos({ query, category, sort }),
    query ? listProfiles({ query, limit: 6 }) : Promise.resolve([]),
  ]);

  return (
    <main>
      <section className="hero">
        <div className="hero-grid">
          <div className="eyebrow">
            <span className="live-dot" />
            AI video / open beta
          </div>
          <h1>
            Watch what AI can imagine.
            <br />
            <em>Nothing else.</em>
          </h1>
          <p className="hero-copy">
            Pumblo is an AI-only video-sharing network. Watch, upload, search,
            follow creators, and join the conversation around every render.
          </p>
          <div className="hero-actions">
            <a className="button button-primary button-large" href="#feed">
              Explore videos <span aria-hidden="true">↓</span>
            </a>
            <Link className="button button-ghost button-large" href="/upload">
              Upload video <span aria-hidden="true">↗</span>
            </Link>
            <Link className="button button-ghost button-large" href="/quicks">
              Watch Quicks <span aria-hidden="true">ϟ</span>
            </Link>
          </div>
          <p className="hero-note">
            Free to watch · creator channels · likes, comments, and follows
          </p>
        </div>
        <aside className="hero-manifesto">
          <span className="manifesto-index">THE FEED HAS ONE RULE</span>
          <p>
            AI must materially shape every video. The work leads; the process
            card is there when you want the story behind it.
          </p>
          <div className="manifesto-rule" />
          <div className="manifesto-stats">
            <span>
              <strong>100</strong>
              creator launch
            </span>
            <span>
              <strong>40 MB</strong>
              per video
            </span>
            <span>
              <strong>AGPL</strong>
              open source
            </span>
          </div>
        </aside>
      </section>

      <section className="discovery" id="feed">
        <div className="section-heading">
          <div>
            <span className="section-kicker">AI-only feed</span>
            <h2>{query ? `Results for “${query}”` : "Trending AI videos"}</h2>
          </div>
          <div className="sort-links" aria-label="Sort videos">
            <Link
              className={sort === "community" ? "active" : ""}
              href={filterHref({ query, category, sort: "community" })}
            >
              Trending
            </Link>
            <Link
              className={sort === "newest" ? "active" : ""}
              href={filterHref({ query, category, sort: "newest" })}
            >
              Latest
            </Link>
          </div>
        </div>

        <div className="category-row" aria-label="Filter by category">
          {categories.map(([value, label]) => (
            <Link
              key={value}
              className={category === value ? "category active" : "category"}
              href={filterHref({ query, category: value, sort })}
            >
              {label}
            </Link>
          ))}
        </div>

        {creators.length ? (
          <div className="creator-results" aria-label="Matching creators">
            <span className="section-kicker">Creators</span>
            <div>
              {creators.map((creator) => (
                <Link key={creator.handle} href={`/profile/${creator.handle}`}>
                  <Avatar
                    name={creator.displayName}
                    color={creator.avatarColor}
                    src={
                      creator.avatarObjectKey
                        ? profileMediaUrl(creator.handle, "avatar", creator.updatedAt)
                        : undefined
                    }
                    size="md"
                  />
                  <span>
                    <strong>{creator.displayName}</strong>
                    <small>@{creator.handle} · {creator.followerCount} followers</small>
                  </span>
                </Link>
              ))}
            </div>
          </div>
        ) : null}

        {videos.length ? (
          <div className="video-grid">
            {videos.map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <span className="empty-glyph" aria-hidden="true">◇</span>
            <h3>
              {query ? "No AI videos matched that search" : "The feed is ready for its first AI video"}
            </h3>
            <p>
              {query
                ? "Try a title, creator, tool, or broader phrase."
                : "Upload something AI made possible. Viewers can watch without creating an account."}
            </p>
            <Link className="button button-primary" href="/upload">
              Upload the first video
            </Link>
          </div>
        )}
      </section>

      <section className="value-section" aria-labelledby="value-title">
        <div className="value-heading">
          <span className="section-kicker">A video network with receipts</span>
          <h2 id="value-title">Watch first. Go deeper when it matters.</h2>
        </div>
        <div className="value-grid">
          <article>
            <span>01</span>
            <h3>Discover AI video</h3>
            <p>
              Search titles, creators, and tools, then move between trending,
              latest, category, Following, and vertical Quicks feeds.
            </p>
          </article>
          <article>
            <span>02</span>
            <h3>React and follow</h3>
            <p>
              Like, comment, follow a channel, and return to fresh uploads from
              the people whose work you care about.
            </p>
          </article>
          <article>
            <span>03</span>
            <h3>Go behind the render</h3>
            <p>
              Every video can carry an optional process card with tools,
              workflow, license, and creator notes. It supports the video; it
              does not replace it.
            </p>
          </article>
        </div>
      </section>

      <section className="how-section" id="how-it-works">
        <div className="how-heading">
          <span className="section-kicker">Watch. Upload. Interact.</span>
          <h2>A familiar video loop, reserved for AI-made work.</h2>
        </div>
        <ol className="how-steps">
          <li>
            <b>1</b>
            <div>
              <h3>Browse without an account</h3>
              <p>Search the feed, watch videos, and open creator channels.</p>
            </div>
          </li>
          <li>
            <b>2</b>
            <div>
              <h3>Create a channel and upload</h3>
              <p>Sign in only when you want to publish or participate.</p>
            </div>
          </li>
          <li>
            <b>3</b>
            <div>
              <h3>Build a real audience loop</h3>
              <p>Likes, comments, follows, and shareable video URLs stay together.</p>
            </div>
          </li>
        </ol>
      </section>

      <section className="open-source-band">
        <div>
          <span className="section-kicker">Built in public</span>
          <h2>Use the platform. Inspect the code.</h2>
          <p>
            Pumblo is AGPL-licensed, openly documented, and shipped with
            executable release gates.
          </p>
        </div>
        <a
          className="button button-primary button-large"
          href="https://github.com/IamOumarIbrahim/pumblo"
          rel="noreferrer"
          target="_blank"
        >
          Star Pumblo on GitHub ↗
        </a>
      </section>
    </main>
  );
}

function filterHref({
  query,
  category,
  sort,
}: {
  query: string;
  category: string;
  sort: string;
}) {
  const params = new URLSearchParams();
  if (query) params.set("q", query);
  if (category !== "all") params.set("category", category);
  if (sort !== "community") params.set("sort", sort);
  const value = params.toString();
  return value ? `/?${value}` : "/";
}
