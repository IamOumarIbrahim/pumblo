# REQUIREMENTS.md — Pumblo Specification Checklist

This document extracts every verifiable claim from `C:\Dev\plumbo.md` to serve as the benchmark for Gate 7 verification.

---

## 1. Badges & License Specs
- **REQ-001**: License badge present: AGPL v3 (`https://img.shields.io/badge/License-AGPL%20v3-blue.svg`).
- **REQ-002**: Status badge present: Live (`https://img.shields.io/badge/status-live-brightgreen`).
- **REQ-003**: Open Source badge present: yes (`https://img.shields.io/badge/open%20source-yes-success`).
- **REQ-004**: Built with Next.js badge present (`https://img.shields.io/badge/built%20with-Next.js-000000?logo=next.js`).
- **REQ-005**: PRs Welcome badge present (`https://img.shields.io/badge/PRs-welcome-orange`).
- **REQ-006**: AGPL v3 `LICENSE` file present in root.

## 2. Core Functional Requirements
- **REQ-007**: **Watch without account**: Anonymous browsing, watching video, and searching works without authentication.
- **REQ-008**: **Account Creation & Security**: Email + password signup with `argon2id` hashing, email verification requirement, Proof-of-Humanity challenge, and Human Trust Token issuance.
- **REQ-009**: **Session Integrity**: Session cookies use `HttpOnly`, `Secure`, `SameSite=Strict`, no session data in URLs, session invalidation on logout.
- **REQ-010**: **Write Action Firewall**: Uploading, commenting, liking, and subscribing require a valid Human Trust Token.
- **REQ-011**: **Provenance Service & C2PA**: Validates C2PA manifests against trust list (`C2PA_TRUST_LIST_URL`), assigns full weight for verified manifest, partial for self-declared tool, holds missing/unverified manifest for moderation review.
- **REQ-012**: **Camera Footage Ingest Rejection**: Real camera footage or AI-upscaled/restored real footage is rejected at ingest.
- **REQ-013**: **Discovery Feed**: Renders SQS-ranked feed, supports filtering (tool/model, category, duration, license), supports toggle between "For You" (quality-ranked) and "Newest Verified" (chronological verified).
- **REQ-014**: **Watch Page**: SSR watch page rendering title, description, player, likes, comments, related videos, VideoObject structured data, Open Graph tags, and Provenance Panel (tool, C2PA status badge, creator Human-Verified badge, license, optional prompt disclosure).
- **REQ-015**: **Channel Page**: Displays creator profile, upload history, subscriber count, Human-Verified badge, account age, and Consistency score (% of uploads passing provenance without manual review).
- **REQ-016**: **Faceted Search**: Search filterable by generation tool, mode (`text-to-video`, `image-to-video`, `video-to-video`, `audio-to-video`), resolution, duration, license, and provenance status.
- **REQ-017**: **Upload Studio**: Drag-and-drop web uploader running exact same metadata schema as API and CLI, with API key management.
- **REQ-018**: **Consent Registry**: Uploads with `depicts_real_person: true` are held out of Discovery until documented consent is submitted and approved.
- **REQ-019**: **Trust & Safety / Strikes**: Automated CSAM hash check before publish. 3 active strikes result in permanent account ban.

## 3. Mathematical Foundations — Synthesis Quality Score (SQS)
- **REQ-020**: **SQS Formula Implementation**:
  $$\text{SQS} = (0.30 \times \text{TFS}) + (0.20 \times \text{PCS}) + (0.25 \times \text{HES}) + (0.15 \times \text{CTS}) + (0.10 \times \text{FDF}) - \text{MP}$$
  Where variables are bounded in $[0, 100]$:
  - `TFS` (Technical Fidelity Score): temporal coherence, resolution/bitrate efficiency, audio-video sync.
  - `PCS` (Provenance Completeness Score): 100 for valid C2PA, partial for self-declared tool.
  - `HES` (Human Engagement Score): watch-through rate, verified-human like ratio, comment depth (raw view count & CTR excluded).
  - `CTS` (Creator Trust Score): decaying reputation based on moderation history, strikes, account age.
  - `FDF` (Freshness Decay Factor): time decay with configurable half-life.
  - `MP` (Moderation Penalty): subtractive penalty for active flags.
- **REQ-021**: **Severe Moderation Exclusion Hard Rule**: Any video carrying an unresolved severe moderation flag is excluded from Discovery regardless of its calculated SQS score.

## 4. CLI Commands
- **REQ-022**: `pumblo upload ./render_final.mp4 --title "Neon City Chase" --tool runway-gen4 --mode text-to-video --license cc-by-4.0 --depicts-real-person=false`
- **REQ-023**: `pumblo upload "$f" --title "$(basename "$f" .mp4)" --tool auto-detect --mode text-to-video --license all-rights-reserved --wait-for-verification`
- **REQ-024**: `npm run create-owner -- --email you@example.com`
- **REQ-025**: `npm run db:migrate`
- **REQ-026**: `npm run dev`

## 5. API Endpoints
- **REQ-027**: `POST /api/v1/auth/signup`
- **REQ-028**: `POST /api/v1/auth/login`
- **REQ-029**: `POST /api/v1/auth/verify`
- **REQ-030**: `POST /api/v1/videos` (multipart: file, title, generation_tool, generation_mode, c2pa_manifest, depicts_real_person, license, prompt_disclosure)
- **REQ-031**: `GET /api/v1/videos/:id`
- **REQ-032**: `POST /api/v1/videos/:id/comments`
- **REQ-033**: `GET /api/v1/channels/:handle`
- **REQ-034**: `GET /api/v1/search`
- **REQ-035**: Webhook events: `video.published`, `video.flagged`, `video.removed`.

## 6. Configuration & Environment Variables
- **REQ-036**: `DATABASE_URL` (Required connection string)
- **REQ-037**: `REDIS_URL` (Required connection string)
- **REQ-038**: `SESSION_SECRET` (Required signing key)
- **REQ-039**: `R2_ACCOUNT_ID` / `R2_ACCESS_KEY_ID` / `R2_SECRET_ACCESS_KEY` / `R2_BUCKET` (Required object storage credentials)
- **REQ-040**: `TURNSTILE_SITE_KEY` / `TURNSTILE_SECRET_KEY` (Required Proof-of-Humanity keys)
- **REQ-041**: `RESEND_API_KEY` (or `SMTP_HOST` / `SMTP_USER` / `SMTP_PASSWORD`) (Required email credentials)
- **REQ-042**: `NEXT_PUBLIC_APP_URL` (Required canonical app URL)
- **REQ-043**: `C2PA_TRUST_LIST_URL` (Optional custom trust list URL)

## 7. Repository File Tree
- **REQ-044**: Exact match to README "Repository Structure":
  - `app/(marketing)/`
  - `app/watch/[slug]/`
  - `app/channel/[handle]/`
  - `app/studio/upload/`
  - `app/api/v1/`
  - `lib/auth/`
  - `lib/provenance/`
  - `lib/quality/`
  - `lib/moderation/`
  - `lib/db/`
  - `jobs/`
  - `cli/`
  - `packages/sdk-js/`
  - `packages/sdk-python/`
  - `public/`
  - `docs/`
  - `CONTRIBUTING.md`
  - `CODE_OF_CONDUCT.md`
  - `SECURITY.md`
  - `LICENSE`

## 8. Verified Error Paths & Edge Cases
- **REQ-045**: Write request missing valid Human Trust Token returns 401/403 unauthorized.
- **REQ-046**: Upload with `depicts_real_person=true` without consent documentation is held out of Discovery.
- **REQ-047**: Severe moderation flag overrides SQS and excludes video from Discovery.
- **REQ-048**: Non-AI camera footage ingested is detected and rejected.
- **REQ-049**: Account accruing 3 active moderation strikes is marked banned and blocked from all write actions.
