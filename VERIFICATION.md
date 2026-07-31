# Pumblo v2 Verification

Verification performed on July 31, 2026 against the release requirements.

| Requirement | Evidence | Result |
| :--- | :--- | :--- |
| Public browse/watch | Browser-opened feed, channel, and watch routes | PASS |
| First profile | Created `@alice_nova` and persisted profile details | PASS |
| Streaming upload | Published a 1,128,375-byte MP4 through Upload Studio | PASS |
| Range playback | `GET /media/:id` with `Range: bytes=0-99` returned `206`, 100 bytes, and a valid `Content-Range` | PASS |
| Second profile | Created and edited `@bob_meridian` in a separate local identity session | PASS |
| Like | Bob's like changed the saved state from `Like · 0` to `Liked · 1` | PASS |
| Comment | Bob's 83-character comment persisted and rendered with author attribution | PASS |
| First creator channel | Alice's public channel rendered the uploaded film | PASS |
| Production auth boundary | Source test verifies dispatcher header auth and development-only fallback | PASS |
| Managed durability | Source test verifies Sites project, D1 `DB`, and R2 `MEDIA` bindings | PASS |
| Upload memory behavior | Source test verifies `request.body` streams to `bucket.put` and multipart buffering is absent | PASS |
| Social preview | PNG header test verifies exactly 1200 × 630 | PASS |
| Release build | `npm run verify` | PASS |

The manual browser pass used the same interactions requested for launch testing: two profiles, profile changes, upload completion, playback, public-channel navigation, like, and comment.
