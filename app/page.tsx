import Link from "next/link";
import { VideoCard } from "@/app/components/VideoCard";
import { listVideos } from "@/db";

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
  const videos = await listVideos({ query, category, sort });

  return (
    <main>
      <section className="hero">
        <div className="hero-grid">
          <div className="eyebrow">
            <span className="live-dot" />
            For AI motion creators
          </div>
          <h1>
            Give the clip a home.
            <br />
            <em>Keep the process.</em>
          </h1>
          <p className="hero-copy">
            Turn a finished AI film into one clean, public page with the tool,
            workflow, license, creator profile, and feedback attached.
          </p>
          <div className="hero-actions">
            <Link className="button button-primary button-large" href="/upload">
              Create a film page <span aria-hidden="true">↗</span>
            </Link>
            <a
              className="button button-ghost button-large"
              href="#how-it-works"
            >
              See how it works
            </a>
          </div>
          <p className="hero-note">
            Free to browse · no follower minimum · open source
          </p>
        </div>
        <aside className="hero-manifesto">
          <span className="manifesto-index">THE “WHO USES THIS?” TEST</span>
          <p>
            A creator should get value from the first upload—even before a feed
            has an audience.
          </p>
          <div className="manifesto-rule" />
          <div className="manifesto-stats">
            <span>
              <strong>~2 min</strong>
              to publish
            </span>
            <span>
              <strong>90 MB</strong>
              per film
            </span>
            <span>
              <strong>AGPL</strong>
              open source
            </span>
          </div>
        </aside>
      </section>

      <section className="value-section" aria-labelledby="value-title">
        <div className="value-heading">
          <span className="section-kicker">Useful before it is popular</span>
          <h2 id="value-title">One upload. Three reasons to share it.</h2>
        </div>
        <div className="value-grid">
          <article>
            <span>01</span>
            <h3>A page, not a file dump</h3>
            <p>
              Send one watchable link to a client, collaborator, Discord, or
              portfolio without explaining the context again.
            </p>
          </article>
          <article>
            <span>02</span>
            <h3>The recipe stays attached</h3>
            <p>
              Credit any model or tool, describe a hybrid workflow, choose a
              license, and reveal as much prompt detail as you want.
            </p>
          </article>
          <article>
            <span>03</span>
            <h3>Feedback has a home</h3>
            <p>
              Likes and comments live beside the film instead of disappearing
              across group chats and temporary social posts.
            </p>
          </article>
        </div>
      </section>

      <section className="discovery" id="discovery">
        <div className="section-heading">
          <div>
            <span className="section-kicker">Made in public</span>
            <h2>{query ? `Results for “${query}”` : "Films with the process attached"}</h2>
          </div>
          <div className="sort-links" aria-label="Sort films">
            <Link
              className={sort === "community" ? "active" : ""}
              href={filterHref({ query, category, sort: "community" })}
            >
              Community
            </Link>
            <Link
              className={sort === "newest" ? "active" : ""}
              href={filterHref({ query, category, sort: "newest" })}
            >
              Newest
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

        {videos.length ? (
          <div className="video-grid">
            {videos.map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <span className="empty-glyph" aria-hidden="true">
              ◇
            </span>
            <h3>
              {query
                ? "No films matched that search"
                : "Start with one film, not a follower count"}
            </h3>
            <p>
              {query
                ? "Try a title, creator, tool, or broader phrase."
                : "Your first upload already gives you a polished film page, a public creator profile, and a link worth sharing."}
            </p>
            <Link className="button button-primary" href="/upload">
              Publish the first film
            </Link>
          </div>
        )}
      </section>

      <section className="how-section" id="how-it-works">
        <div className="how-heading">
          <span className="section-kicker">No growth-hack homework</span>
          <h2>From finished render to shareable page in three moves.</h2>
        </div>
        <ol className="how-steps">
          <li>
            <b>1</b>
            <div>
              <h3>Claim a creator handle</h3>
              <p>Sign in, choose a name, and skip every optional field.</p>
            </div>
          </li>
          <li>
            <b>2</b>
            <div>
              <h3>Upload a browser-ready clip</h3>
              <p>Add the tool, workflow, license, and optional process notes.</p>
            </div>
          </li>
          <li>
            <b>3</b>
            <div>
              <h3>Share the film page</h3>
              <p>Viewers watch without an account; sign-in is only for actions.</p>
            </div>
          </li>
        </ol>
      </section>

      <section className="open-source-band">
        <div>
          <span className="section-kicker">Built in public</span>
          <h2>Trust the product by reading the code.</h2>
          <p>
            Pumblo is AGPL-licensed, fact-checked in the repository, and shipped
            with executable release gates.
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
