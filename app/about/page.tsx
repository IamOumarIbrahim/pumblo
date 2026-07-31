import Link from "next/link";

export default function AboutPage() {
  return (
    <main className="content-page">
      <span className="section-kicker">Product philosophy</span>
      <h1>If it is useless with one creator, a feed will not save it.</h1>
      <p>
        Pumblo starts with single-player value: a public film page that keeps
        the work, maker, tools, process, license, and feedback together.
      </p>
      <div className="prose-grid">
        <section>
          <h2>Who it is for</h2>
          <p>
            AI motion artists, directors, animators, music-visual creators, and
            small studios with a finished clip and a process worth showing.
          </p>
        </section>
        <section>
          <h2>What belongs here</h2>
          <p>
            Work where AI materially shaped the moving image: generated,
            animated, transformed, composited, or built through a hybrid
            workflow. The creator names the tools and owns the disclosure.
          </p>
        </section>
        <section>
          <h2>What “accountable” means</h2>
          <p>
            Production writes are tied to a signed-in account and a persistent
            public creator profile. Pumblo keeps the sign-in email private; this
            is accountability, not proof-of-humanity certification.
          </p>
        </section>
        <section>
          <h2>What provenance means today</h2>
          <p>
            Process details are creator-declared. Pumblo does not currently
            validate C2PA Content Credentials and does not present a declaration
            as cryptographic proof.
          </p>
        </section>
        <section>
          <h2>What does not belong</h2>
          <p>
            Work published without the necessary rights, deceptive
            impersonation, harassment, hate, sexual exploitation, or materially
            false process information.
          </p>
        </section>
        <section>
          <h2>Why open source</h2>
          <p>
            The ranking, limits, and product claims should be inspectable.
            Marketing does not get to outrun the code.
          </p>
        </section>
      </div>
      <div className="content-actions">
        <Link className="button button-primary button-large" href="/upload">
          Create a film page
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
