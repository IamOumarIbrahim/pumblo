# HTTP Route Reference

Pumblo's browser client uses same-origin routes. The open beta does not expose API keys or a public SDK.

| Route | Method | Auth | Purpose |
| :--- | :--- | :--- | :--- |
| `/api/profile` | GET | Required | Return the signed-in person's Pumblo profile |
| `/api/profile` | POST JSON | Required | Create or update a profile |
| `/api/profile/media/:kind` | POST image body | Required profile | Create or replace a cropped `avatar` or `banner` |
| `/api/profile/media/:kind` | DELETE | Required profile | Remove an `avatar` or `banner` reference and object |
| `/api/profiles?q=` | GET | Public | Query public creator profiles |
| `/api/profiles/:handle/follow` | POST | Required profile | Toggle a follow relationship |
| `/api/videos?q=&category=&sort=` | GET | Public | Query videos with `sort=community|newest` |
| `/api/videos` | POST video body | Required profile | Stream one MP4/WebM into R2 |
| `/api/videos/:id` | DELETE | Owner only | Delete media, metadata, likes, and comments |
| `/api/videos/:id/like` | POST | Required profile | Toggle the caller's like |
| `/api/videos/:id/comments` | POST JSON | Required profile | Save a 1–500 character comment |
| `/api/videos/:id/view` | POST | Public | Count a Quick becoming active in the viewer |
| `/api/quicks?offset=` | GET | Public | Page videos with verified duration greater than 0 and strictly below 60 seconds |
| `/media/:id` | GET | Public | Return source video, including byte ranges |
| `/profile-media/:handle/:kind` | GET | Public | Return the current cropped profile image |
| `/api/dev-session?email=…` | GET | Development only | Switch local test identity |

Production identity is supplied by the Sites dispatcher. Do not send or trust `oai-authenticated-user-*` headers from an origin that bypasses the dispatcher.

The upload body is the raw video. URL-encoded JSON in `X-Pumblo-Metadata` carries title, description, free-text generation tool, workflow mode, license, optional process notes, disclosure acknowledgement, declared byte length, and browser-read duration. The route caps that header at 12 KB, limits objects to 40 MiB, verifies duration is positive and no more than six hours, and verifies the stored object size before inserting metadata. Duration controls Quicks eligibility; exactly 60 seconds is not a Quick.

Profile-media bodies are the exact crop generated in the browser. The route accepts JPEG, PNG, or WebP up to 3 MiB, checks the declared/stored sizes and file signature, then switches the D1 reference. Replacing or removing media makes the profile change authoritative even if cleanup of a stale R2 object must be retried later.

`sort=community` powers the UI label **Trending** and uses likes, comments, capped views, and newest-time tie-breaking. The exact formula is documented and unit-tested.
