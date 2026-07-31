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
  const sort = params.sort === "newest" ? "newest" : "sqs";
  const videos = await listVideos({
    query,
    category,
    sort,
  });

  return (
    <main>
      <section className="hero">
        <div className="hero-grid">
          <div className="eyebrow">
            <span className="live-dot" />
            A new cinema is forming
          </div>
          <h1>
            The feed where
            <br />
            <em>imagination ships.</em>
          </h1>
          <p className="hero-copy">
            AI-generated films, animation, music, and explainers—published by
            accountable human creators and ranked for craft.
          </p>
          <div className="hero-actions">
            <Link className="button button-primary button-large" href="/upload">
              Publish your first film <span aria-hidden="true">↗</span>
            </Link>
            <a className="button button-ghost button-large" href="#discovery">
              Explore discovery
            </a>
          </div>
        </div>
        <aside className="hero-manifesto">
          <span className="manifesto-index">01 / 03</span>
          <p>
            Every upload states how it was made. Every creator stands behind
            their work.
          </p>
          <div className="manifesto-rule" />
          <div className="manifesto-stats">
            <span>
              <strong>10</strong>
              beta seats
            </span>
            <span>
              <strong>0</strong>
              paid rankings
            </span>
            <span>
              <strong>100%</strong>
              AI video
            </span>
          </div>
        </aside>
      </section>

      <section className="discovery" id="discovery">
        <div className="section-heading">
          <div>
            <span className="section-kicker">Discovery</span>
            <h2>{query ? `Results for “${query}”` : "Worth watching now"}</h2>
          </div>
          <div className="sort-links">
            <Link
              className={sort === "sqs" ? "active" : ""}
              href={filterHref({ query, category, sort: "sqs" })}
            >
              Curated
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
            <h3>{query ? "No films matched that search" : "The screen is yours"}</h3>
            <p>
              {query
                ? "Try a creator name, AI tool, or a broader phrase."
                : "Pumblo’s first ten creators are setting the tone. Publish the first film and claim your channel."}
            </p>
            <Link className="button button-primary" href="/upload">
              Upload a video
            </Link>
          </div>
        )}
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
  if (sort !== "sqs") params.set("sort", sort);
  const value = params.toString();
  return value ? `/?${value}` : "/";
}
