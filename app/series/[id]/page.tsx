import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { VideoCard } from "@/app/components/VideoCard";
import { formatDuration } from "@/app/lib/format";
import { getSeries, listVideos } from "@/db";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const series = await getSeries(id);
  return series
    ? { title: series.title, description: series.description || `Watch ${series.title} in order.`, alternates: { canonical: `/series/${id}` } }
    : { title: "Series not found" };
}

export default async function SeriesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const series = await getSeries(id);
  if (!series) notFound();
  const episodes = await listVideos({ seriesId: id, limit: 100 });
  return (
    <main className="series-page">
      <header className="series-hero">
        <span className="section-kicker">{series.status} series · {series.episodeCount} episodes</span>
        <h1>{series.title}</h1>
        <p>{series.description || "A connected AI-video story from this creator."}</p>
        <div>
          <Link href={`/profile/${series.ownerHandle}`}>By {series.ownerDisplayName}</Link>
          <span>{formatDuration(series.totalSeconds)} total runtime</span>
          {episodes[0] ? <Link className="button button-primary" href={`/watch/${episodes[0].id}`}>Start episode 1</Link> : null}
        </div>
      </header>
      <section className="series-episodes">
        <div className="section-heading"><div><span className="section-kicker">Watch in order</span><h2>Episodes</h2></div></div>
        {episodes.length ? <div className="video-grid">{episodes.map((episode) => <VideoCard key={episode.id} video={episode} />)}</div> : <div className="empty-state"><h3>The story is announced</h3><p>The creator has not published episode one yet.</p></div>}
      </section>
    </main>
  );
}
