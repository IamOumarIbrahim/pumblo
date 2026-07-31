# Pumblo v2 Release Requirements

This checklist defines the small-beta release that is actually implemented and deployed. It replaces the earlier aspirational specification.

## Required user journey

- `REQ-001` Anyone with the URL can browse the feed, creator channels, and watch pages.
- `REQ-002` A production visitor can authenticate through Sign in with ChatGPT.
- `REQ-003` An authenticated person can create and later edit one public profile.
- `REQ-004` The service accepts at most 10 unique profiles.
- `REQ-005` A profile can upload up to five browser-ready MP4/WebM files.
- `REQ-006` A video upload streams to durable R2 storage and is limited to 90 MB.
- `REQ-007` A published video supports byte-range playback.
- `REQ-008` A second profile can watch the first profile's film, persist one like, and post comments.
- `REQ-009` Likes, comments, uploads, and profile writes reject anonymous requests.
- `REQ-010` Profile email addresses never appear in public page output.

## Hosting and operations

- `REQ-011` Setup requires no payment card or third-party service credentials.
- `REQ-012` `.openai/hosting.json` declares D1 as `DB` and R2 as `MEDIA`.
- `REQ-013` The deployed worker creates/updates its required D1 schema idempotently.
- `REQ-014` Production authentication trusts only dispatcher-provided identity headers.
- `REQ-015` `/api/dev-session` is available only when `NODE_ENV=development`.
- `REQ-016` CI runs install, lint, type checking, tests, and a production build.

## Product integrity

- `REQ-017` Every upload requires the creator to affirm that it is AI-generated.
- `REQ-018` Every current upload is labeled `self-declared`.
- `REQ-019` The product does not claim cryptographic C2PA verification.
- `REQ-020` The repository documents the beta's capacity, no-transcoding behavior, moderation limits, and lack of an uptime SLA.
