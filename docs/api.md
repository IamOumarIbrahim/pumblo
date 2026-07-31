# HTTP Route Reference

Pumblo's browser client uses same-origin HTTP routes. This beta does not expose API keys or a public SDK.

| Route | Method | Auth | Purpose |
| :--- | :--- | :--- | :--- |
| `/api/profile` | GET | Required | Return the signed-in person's Pumblo profile |
| `/api/profile` | POST JSON | Required | Create or update a profile |
| `/api/videos` | GET | Public | Query films with `q`, `category`, and `sort=community|newest` |
| `/api/videos` | POST video body | Required profile | Stream one MP4/WebM into R2 with `X-Pumblo-Metadata` |
| `/api/videos/:id/like` | POST | Required profile | Toggle the caller's like |
| `/api/videos/:id/comments` | POST JSON | Required profile | Save a 1-500 character comment |
| `/media/:id` | GET | Public | Return the source video, including byte ranges |
| `/api/dev-session?email=…` | GET | Development only | Switch local test identity |

Production identity is supplied by the Sites dispatcher. Do not send or trust `oai-authenticated-user-*` headers from an origin that bypasses that dispatcher.

The upload body is the raw video file. The client sends URL-encoded JSON in `X-Pumblo-Metadata` containing title, description, free-text generation tool, workflow mode, license, optional process notes, disclosure acknowledgement, and declared byte length. The route caps this header at 12 KB and verifies the stored R2 object size before inserting metadata.

`sort=community` is the default and uses likes, comments, capped views, and newest-time tie-breaking. The exact formula is documented in the root README and unit-tested.
