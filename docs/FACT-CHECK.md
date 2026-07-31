# Fact Check and Positioning Notes

Checked July 31, 2026. Product copy is intentionally narrower than the available evidence.

## What adjacent products already do

- Runway can create public asset links that include generation details such as inputs and seeds. Source: [Runway, “How to share an asset”](https://help.runwayml.com/hc/en-us/articles/25562277393427-How-to-share-an-asset).
- Runway also operates a viewing destination for AI works. Source: [Runway, “Navigating Runway”](https://help.runwayml.com/hc/en-us/articles/24298206897043-Navigating-Runway).
- OpenAI states that the Sora product is no longer available as of April 26, 2026. Source: [OpenAI, “Sora feed philosophy”](https://openai.com/index/sora-feed-philosophy/).

**Product inference:** “Share an AI generation” is not a sufficient wedge. Pumblo differentiates through a tool-neutral film page, a creator-owned public profile, licensing/process context across hybrid workflows, feedback, and open-source inspectability. Sora is deliberately absent from suggestions; free-text entry prevents the UI from depending on a permanent vendor list.

## What provenance can and cannot prove

The C2PA explainer describes Content Credentials as tamper-evident provenance data and explicitly distinguishes that evidence from a judgment that content is true. Source: [C2PA Technical Specification 2.3 explainer](https://spec.c2pa.org/specifications/specifications/2.3/explainer/_attachments/Explainer.pdf).

Pumblo does not currently read or validate C2PA manifests. It records an authenticated creator's declaration and labels process fields `creator-declared`. It must not claim:

- that a film is forensically proven to be AI-generated;
- that a person created every part of it;
- that the depicted scene is true;
- or that a hidden score measures artistic quality.

## Hosting and capacity

Cloudflare documents free allowances for direct R2 and D1 usage:

- [R2 pricing](https://developers.cloudflare.com/r2/pricing/) lists a monthly free tier for standard storage, operations, and egress.
- [D1 pricing](https://developers.cloudflare.com/d1/platform/pricing/) and [D1 limits](https://developers.cloudflare.com/d1/platform/limits/) document Free-plan query, storage, and database limits.

**Deployment caveat:** this repository uses Sites-managed D1 and R2 bindings. Direct Cloudflare allowance numbers do not establish the Sites product's quotas, availability, or future pricing. Therefore Pumblo promises no-card setup for the configured path and conservative application guards; it does not promise “free forever,” a specific uptime, or unlimited users. “First ten users” is a launch test target, not a hard signup cap.

## Share metadata

Next.js documents file/function conventions for metadata, Open Graph images, and web manifests:

- [Metadata and Open Graph images](https://nextjs.org/docs/app/getting-started/metadata-and-og-images)
- [`generateMetadata`](https://nextjs.org/docs/app/api-reference/functions/generate-metadata)
- [Web app manifest](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/manifest)

Pumblo implements generated page metadata, canonical links, explicit Vinext routes for the manifest/robots/sitemap endpoints, and a checked 1200 × 630 social asset. Explicit routes are used because production probing showed that the Next.js metadata file conventions were not packaged by the current Vinext/Sites path. Tests verify the source contracts; production probes verify the public endpoints.

## Dependency security

The release locks Next.js and `eslint-config-next` to 16.2.12. The earlier 16.2.6 tree was rejected after `npm audit --omit=dev` reported published high-severity advisories affecting Next.js and transitive PostCSS/Sharp versions. The release gate reruns the production-only audit after the patch upgrade and records the result in [`VERIFICATION.md`](../VERIFICATION.md).
