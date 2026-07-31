# Product Gates

Pumblo uses one deliberately rude filter before a feature earns release scope:

> **“Bro, who's even gonna use this?”**

The question prevents a feed, badge, or growth loop from substituting for a useful product. A gate fails when its answer relies on hypothetical scale.

## Gate 0 — Named audience

**Question:** Who needs this today, and at what moment?

**Pass:** AI filmmakers, animators, music-visual creators, and small studios have a finished render and need one credible link that preserves its context.

**Fail:** “Anyone who likes AI” or another audience too broad to find and interview.

**Evidence:** The home page, metadata, README, and upload copy use the same audience and job.

## Gate 1 — Single-player value

**Question:** What does creator one get before creator two arrives?

**Pass:** A watchable film page, public creator profile, workflow record, license, canonical URL, and share action.

**Fail:** The only value is likes, rankings, or a feed that needs an existing audience.

**Evidence:** Release tests assert the publish routes, process fields, metadata, and share affordance.

## Gate 2 — Cold-start discovery

**Question:** Does an empty catalog still explain the next useful action?

**Pass:** The empty state promises a film page and creator link, then opens publishing.

**Fail:** An empty grid or inflated sample content pretends the community exists.

**Evidence:** The product-contract test checks the empty-state and primary CTA copy. No fake users or films ship in production.

## Gate 3 — Friction

**Question:** What can we remove before asking for commitment?

**Pass:** Browsing and playback need no account. Profile setup has two required fields. Tool input is free text. Local/deployed setup asks for no payment card.

**Fail:** Sign-in walls viewing, every profile field is mandatory, or a fixed model list becomes stale.

**Evidence:** Routes permit public reads; form markup and release tests enforce the short setup and free-text tool field.

## Gate 4 — Honest trust

**Question:** What does the system actually know?

**Pass:** It knows who authenticated, what they entered, and which file they uploaded. The UI says `creator-declared`.

**Fail:** “Human verified,” “provably AI,” an unexplained quality score, or a C2PA claim without validation.

**Evidence:** Tests reject those claims in market-facing source. [`FACT-CHECK.md`](FACT-CHECK.md) explains the boundary.

## Gate 5 — Distribution

**Question:** What leaves the product and brings a creator or viewer back?

**Pass:** Each film has a canonical link, useful metadata, a 1200 × 630 share card, and native/clipboard sharing.

**Fail:** Sharing means telling someone to find a title inside a feed.

**Evidence:** Metadata routes, image dimensions, and share-component source are release-tested.

## Gate 6 — Community without fake authority

**Question:** Can discovery use real behavior without pretending to measure art?

**Pass:** Community order uses likes, comments, capped views, and recency. It is documented as a heuristic.

**Fail:** An arbitrary “quality” badge tells creators a hidden formula understands their work.

**Evidence:** Unit tests cover weights, view caps, invalid values, and ordering SQL.

## Gate 7 — Evidence before launch

**Question:** Which executable check would catch this promise breaking?

**Pass:** `npm run verify`, CI, and post-deployment HTTP probes cover the marketed path.

**Fail:** A claim exists only in copy or a manual memory.

**Evidence:** [`VERIFICATION.md`](../VERIFICATION.md) records the dated result; `tests/` encodes durable contracts.

## Change template

Every market-facing pull request should answer:

1. Which named user problem changes?
2. Does it improve first-user value or require a network?
3. Which barrier is added or removed?
4. What can Pumblo truthfully observe?
5. Which automated check proves the result?
