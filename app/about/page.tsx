import Link from "next/link";

export default function AboutPage() {
  return (
    <main className="content-page">
      <span className="section-kicker">About Pumblo</span>
      <h1>The video platform where every upload is AI-made.</h1>
      <p>
        Pumblo is a searchable, public video network for work where AI
        materially shaped the moving image. The feed, creator channels, and
        interaction loop are the product. Process notes are a supporting
        feature for viewers who want to go deeper.
      </p>
      <div className="prose-grid">
        <section>
          <h2>Who it is for</h2>
          <p>
            People who make or enjoy AI films, animation, music visuals,
            experiments, and educational video.
          </p>
        </section>
        <section>
          <h2>What belongs here</h2>
          <p>
            Video generated, animated, transformed, composited, or built
            through a hybrid AI workflow. Uploaders name the tools and own the
            disclosure.
          </p>
        </section>
        <section>
          <h2>How the network works</h2>
          <p>
            Anyone can browse and watch. A signed-in creator profile unlocks
            uploads, likes, comments, follows, and a personalized following
            feed.
          </p>
        </section>
        <section>
          <h2>Behind the render</h2>
          <p>
            Creators can attach a tool, workflow, license, and optional notes
            to a video. These details add context without turning Pumblo into a
            prompt database.
          </p>
        </section>
        <section>
          <h2>Honest provenance</h2>
          <p>
            AI process details are creator-declared. Pumblo does not yet
            validate C2PA Content Credentials and never presents a declaration
            as cryptographic proof.
          </p>
        </section>
        <section>
          <h2>Why open source</h2>
          <p>
            Ranking, capacity limits, product claims, and tradeoffs should be
            inspectable. Marketing does not get to outrun the code.
          </p>
        </section>
      </div>
      <div className="content-actions">
        <Link className="button button-primary button-large" href="/#feed">
          Explore AI videos
        </Link>
        <a
          className="button button-ghost button-large"
          href="https://github.com/IamOumarIbrahim/pumblo"
          rel="noreferrer"
          target="_blank"
        >
          Inspect the repository ↗
        </a>
      </div>
    </main>
  );
}
