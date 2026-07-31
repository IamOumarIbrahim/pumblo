# Product Gates

Pumblo uses one deliberately rude filter before a feature earns release scope:

> **“Bro, who's even gonna use this?”**

A gate fails when its answer depends on imaginary scale, fake activity, vendor drama, or a claim the system cannot observe.

## Gate 0 — Named audience

**Pass:** people making or intentionally watching AI video need an independent public home after generation.

**Fail:** “anyone who likes video,” or a process-documentation audience disguised as a social network.

## Gate 1 — Core video loop

**Pass:** guest feed/playback/search, creator uploads/profiles, likes/comments/follows, Following, and Quicks.

**Fail:** a static portfolio builder with a feed bolted on.

## Gate 2 — Return value

**Pass:** series, resume, next episode, Watch Later, creator notifications, and creator-facing evidence give people a reason to return.

**Fail:** disconnected 15-second clips are the only loop.

## Gate 3 — Cold start

**Pass:** empty states honestly invite the first upload; no fake creators or inflated counters.

## Gate 4 — Friction

**Pass:** viewing stays public; writes prompt Sign in with ChatGPT; profile setup requires only handle/display name; infrastructure is already configured without card setup.

**Fail:** viewing walls or a stack of third-party accounts before value.

## Gate 5 — Honest trust

**Pass:** distinguish dispatcher-authenticated identity, server-checked media facts, persisted activity, and creator declarations.

**Fail:** “provably AI,” “human verified,” “lossless compression,” or Story Tier as art quality.

## Gate 6 — Abuse resistance

**Pass:** server-read runtime, server timestamps, unique episode slots, duplicate-file hashes, one-like/follow/save/report constraints, bounded inputs, and owner checks.

**Fail:** a tier or activity signal controlled solely by client metadata.

## Gate 7 — Safety

**Pass:** viewers can submit categorized reports; missing review/appeal/block systems are disclosed.

**Fail:** presenting report intake as a complete moderation program.

## Gate 8 — Distribution

**Pass:** canonical video/profile/series URLs, public search, sitemap, robots, `VideoObject`, Open Graph, and progressive sharing.

## Gate 9 — Capacity

**Pass:** 100 creators × (80 MiB video total + 6 MiB profile media) = 8,600 MiB; 12 slots enable episodes without expanding the total.

**Fail:** “handles 100 users” without resource math or enforcement.

## Gate 10 — Evidence

**Pass:** `npm run verify`, CI, unit tests for tier/container parsing, migration inspection, local journey checks, and post-deployment HTTP/API probes.

## Change template

1. Which named viewer or creator problem changes?
2. Does it strengthen watching, publishing, connected storytelling, discovery, or interaction?
3. Which barrier is added or removed?
4. What can Pumblo truthfully observe or verify?
5. How can a bad actor game it, and which constraint makes that harder?
6. What is the capacity and privacy impact?
7. Which automated check proves the result?
