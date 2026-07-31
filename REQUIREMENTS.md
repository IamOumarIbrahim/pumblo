# Pumblo v3 Release Requirements

## Product and audience

- `REQ-001` The main product is an AI-only video-sharing platform.
- `REQ-002` Public visitors can browse, query, watch, share, and open creator channels without authenticating.
- `REQ-003` The process card remains an optional supporting feature, not the main product.
- `REQ-004` Home exposes a feed with Trending, Latest, category, and text-query discovery.
- `REQ-005` Public search matches video text, generation tools, creator handles/names, and profiles.
- `REQ-006` Profile setup requires only a handle and display name.
- `REQ-007` The application has no total-profile signup cap.

## Publishing and interaction

- `REQ-008` An authenticated person can create and edit one public creator channel.
- `REQ-009` A creator can keep two active browser-ready MP4/WebM videos.
- `REQ-010` Each upload streams into R2 and is limited to 40 MiB.
- `REQ-011` Published video playback supports HTTP byte ranges.
- `REQ-012` Tool/model input is free text and supports hybrid workflows.
- `REQ-013` Another profile can persist one like, post a comment, and follow/unfollow the creator.
- `REQ-014` Signed-in profiles have a Following feed ordered newest-first.
- `REQ-015` Owners can delete their own media plus related likes/comments and recover a slot.
- `REQ-016` Trending uses observable likes, comments, capped views, and newest-time tie-breaking.
- `REQ-017` Likes, comments, follows, uploads, deletes, and profile writes reject anonymous requests.
- `REQ-018` Profile email addresses never appear on public pages.

## Hosting, queryability, and operations

- `REQ-019` Setup requires no repository user payment card or third-party secret.
- `REQ-020` `.openai/hosting.json` declares D1 as `DB` and R2 as `MEDIA`.
- `REQ-021` The worker creates required D1 tables/indexes idempotently and packages migrations.
- `REQ-022` Production authentication trusts dispatcher-provided identity headers.
- `REQ-023` `/api/dev-session` exists only when `NODE_ENV=development`.
- `REQ-024` The public site publishes robots, creator/video sitemap entries, a manifest, canonical metadata, `VideoObject` JSON-LD, and a 1200 × 630 social card.
- `REQ-025` `/api/videos` and `/api/profiles` provide public same-origin query endpoints.
- `REQ-026` The storage envelope is test-enforced at 100 × 2 × 40 MiB = 8,000 MiB.
- `REQ-027` CI runs install, lint, type checking, tests, production audit, and build.

## Product integrity

- `REQ-028` Every upload affirms material AI contribution and publishing rights.
- `REQ-029` Process information is labeled `creator-declared`.
- `REQ-030` Pumblo makes no forensic, C2PA, human-authorship, artistic-quality, indexing, uptime, or free-forever guarantee.
- `REQ-031` The repository documents provider research, capacity guards, no transcoding, and moderation limits.
- `REQ-032` Market promises are enforced by release-contract tests and production HTTP/API probes.
