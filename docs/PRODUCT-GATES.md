# Product Gates

Pumblo uses one deliberately rude filter before a feature earns release scope:

> **“Bro, who's even gonna use this?”**

A gate fails when its answer relies on imaginary scale, fake activity, or a claim the system cannot observe.

## Gate 0 — Named audience

**Question:** Who needs this today?

**Pass:** People who make or intentionally seek AI video want one focused place to publish, discover, and interact across generation tools.

**Fail:** “Anyone who likes video” or a process-documentation audience disguised as a social network.

**Evidence:** Home, metadata, README, and upload copy consistently name an AI-only video platform.

## Gate 1 — Core video loop

**Question:** Does the main product work like a video-sharing platform?

**Pass:** Public feed, playback, uploads, customizable creator channels, search, likes, comments, follows, Following, and an interactive under-60-second Quicks feed.

**Fail:** A static film-page builder with a feed bolted on.

**Evidence:** Release tests assert each page, route, persistence path, and market-facing promise.

## Gate 2 — Cold start

**Question:** Is the empty network honest and actionable?

**Pass:** The empty feed asks for the first AI video and explains that viewers can watch without accounts.

**Fail:** Seeded fake creators or inflated activity pretend an audience exists.

**Evidence:** Production launches with no fake records; source tests check the empty-state and upload action.

## Gate 3 — Friction

**Question:** What can be removed before asking for commitment?

**Pass:** Browsing, search, playback, creator pages, Quicks, and sharing need no account. A write action prompts Sign in with ChatGPT. Profile setup needs two text fields; avatar/banner cropping remains optional. Tool input is free text. The configured deployment needs no new card or third-party secret.

**Fail:** Sign-in walls viewing or setup begins with infrastructure accounts.

## Gate 4 — Honest trust

**Question:** What does Pumblo actually know?

**Pass:** It knows the dispatcher-authenticated identity, the submitted metadata, and the stored file. The UI says `creator-declared`.

**Fail:** “Provably AI,” “human verified,” or an artistic-quality score.

## Gate 5 — Distribution and queryability

**Question:** Can the public web find and share the work?

**Pass:** Canonical video/channel URLs, public search APIs, creator/video sitemap entries, robots policy, `VideoObject` JSON-LD, Open Graph metadata, and progressive sharing.

**Fail:** Sharing means telling someone to search a title inside the app.

## Gate 6 — Network behavior without fake authority

**Question:** Can discovery use real activity without pretending to judge art?

**Pass:** Trending uses persisted likes, comments, capped views, and publication-time tie-breaking. Following uses explicit creator relationships.

**Fail:** A hidden “quality” grade.

## Gate 7 — Capacity

**Question:** Is the 100-user goal bounded in code?

**Pass:** 100 creators × (2 active uploads × 40 MiB + 2 profile images × 3 MiB) = 8,600 MiB; deletion/replacement recovers storage. There is no user-101 signup wall.

**Fail:** “Handles 100 users” without resource math or enforceable limits.

## Gate 8 — Evidence before launch

**Question:** Which check catches a broken promise?

**Pass:** `npm run verify`, CI, migration inspection, and post-deployment HTTP/API probes.

**Fail:** A claim exists only in copy.

## Change template

1. Which named viewer or creator problem changes?
2. Does it strengthen watching, publishing, discovery, or interaction?
3. Which barrier is added or removed?
4. What can Pumblo truthfully observe?
5. What is the capacity impact?
6. Which automated check proves the result?
