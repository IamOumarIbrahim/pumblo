# Fact Check and Positioning Notes

Checked July 31, 2026. Product copy is intentionally narrower than the available evidence.

## Product position

Some generation tools already expose public assets or galleries. That makes “share a generation” an insufficient product.

Pumblo's claim is narrower and testable: it is an open-source, tool-neutral, AI-only video-sharing platform with public watching, uploads, queryable discovery, creator channels, likes, comments, follows, and optional process context.

The process card is not the main product. It is a secondary **Behind the render** feature attached to a video-first experience.

## What provenance can and cannot prove

The [C2PA 2.3 explainer](https://spec.c2pa.org/specifications/specifications/2.3/explainer/_attachments/Explainer.pdf) describes Content Credentials as tamper-evident provenance information and distinguishes that evidence from a truth judgment.

Pumblo does not read or validate C2PA manifests. It records an authenticated creator's declaration and labels process fields `creator-declared`. It must not claim:

- that a video is forensically proven to be AI-generated;
- that a person created every part of it;
- that a depicted scene is true;
- or that its ranking formula measures artistic quality.

## Hosting and capacity

The current comparison uses official provider sources and is maintained in [`HOSTING-100-USERS.md`](HOSTING-100-USERS.md).

The application enforces a maximum media envelope of 8,000 MiB for 100 fully utilized creator accounts. This is below direct R2's published 10 GB-month Standard-storage free allowance, but direct Cloudflare allowance numbers do not establish Sites-managed quotas.

Therefore Pumblo claims:

- a currently working no-card path through the configured Sites project;
- an explicit 100-creator storage design target;
- and no application-level signup wall.

It does not claim free hosting forever, unlimited bandwidth, an uptime SLA, or 100 simultaneous uploads.

## Search-engine surfaces

Pumblo ships:

- canonical URLs for videos and creator channels;
- `VideoObject` structured data on watch pages;
- an XML sitemap containing public profiles and videos;
- a robots policy pointing to the sitemap;
- explicit Vinext routes for the web manifest, robots, sitemap, and favicon;
- and a checked 1200 × 630 Open Graph asset.

These surfaces make the domain crawlable and queryable. Search-engine indexing and ranking remain controlled by the search engines and are not guaranteed.

## Dependency security

The release locks Next.js and `eslint-config-next` to 16.2.12. `npm audit --omit=dev` is a required gate for deployed dependencies.

An unqualified `npm audit` currently reports development-only advisory paths through the ESLint toolchain. Those packages do not ship in the worker. Forcing an incompatible ESLint major is not used to manufacture a clean claim; the production audit remains the release boundary.
