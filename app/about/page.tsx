export default function AboutPage() {
  return (
    <main className="content-page">
      <span className="section-kicker">Trust & safety</span>
      <h1>A small beta with a hard line on accountability.</h1>
      <div className="prose-grid">
        <section>
          <h2>What belongs here</h2>
          <p>
            Pumblo is for original AI-generated video: text-to-video,
            image-to-video, animation, music visuals, and explainers. Creators
            disclose the tool and method used for every upload.
          </p>
        </section>
        <section>
          <h2>What does not</h2>
          <p>
            Camera footage, impersonation without consent, harassment, hate,
            sexual exploitation, and misleading provenance are not accepted.
            Beta uploads can be removed while moderation tooling evolves.
          </p>
        </section>
        <section>
          <h2>What “human” means today</h2>
          <p>
            Write access requires a signed-in ChatGPT identity. Pumblo stores a
            separate public profile and never exposes the identity email.
          </p>
        </section>
        <section>
          <h2>What “verified” means today</h2>
          <p>
            The beta records creator disclosures but does not yet
            cryptographically validate C2PA manifests. The interface labels
            these uploads honestly as self-declared.
          </p>
        </section>
      </div>
    </main>
  );
}
