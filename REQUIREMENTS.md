# Pumblo Release Requirements

This checklist defines the market-ready small-beta release implemented by this repository.

## Audience and first value

- `REQ-001` The product names AI filmmakers, animators, music-visual creators, and small studios as its audience.
- `REQ-002` One creator with zero followers receives a useful public film page, creator profile, process card, and share link.
- `REQ-003` Public visitors can browse, search, open creator pages, and watch without authenticating.
- `REQ-004` A creator can reach publishing from the home page without configuring a third-party service or payment card.
- `REQ-005` Profile setup requires only a handle and display name and suggests a valid handle.
- `REQ-006` The application has no artificial total-profile cap.

## Publishing and community

- `REQ-007` An authenticated person can create and later edit one public profile.
- `REQ-008` A profile can upload up to five browser-ready MP4/WebM films.
- `REQ-009` A film upload streams to durable R2 storage and is limited to 90 MB.
- `REQ-010` A published film supports HTTP byte-range playback.
- `REQ-011` Tool/model input accepts free text and supports hybrid workflows.
- `REQ-012` A film page exposes a canonical URL, Open Graph metadata, and a share action.
- `REQ-013` Another profile can watch, persist one like, and post a comment.
- `REQ-014` Community order uses observable likes, comments, capped views, and newest-time tie-breaking.
- `REQ-015` Likes, comments, uploads, and profile writes reject anonymous requests.
- `REQ-016` Profile email addresses never appear in public page output.

## Hosting and operations

- `REQ-017` Setup requires no payment card or third-party service credentials.
- `REQ-018` `.openai/hosting.json` declares D1 as `DB` and R2 as `MEDIA`.
- `REQ-019` The deployed worker creates/updates its required D1 schema idempotently.
- `REQ-020` Production authentication trusts only dispatcher-provided identity headers.
- `REQ-021` `/api/dev-session` is available only when `NODE_ENV=development`.
- `REQ-022` The application publishes a robots policy, sitemap, web manifest, and 1200 × 630 social card.
- `REQ-023` CI runs install, lint, type checking, tests, and a production build.

## Product integrity

- `REQ-024` Every upload requires an affirmation that AI materially contributed and the creator has publishing rights.
- `REQ-025` Process information is visibly labeled `creator-declared`.
- `REQ-026` Pumblo makes no claim of forensic, C2PA, human-authorship, or artistic-quality verification.
- `REQ-027` The repository documents capacity guards, no-transcoding behavior, moderation limits, and lack of an uptime SLA.
- `REQ-028` Market promises are enforced by executable release-contract tests and a production smoke test.
