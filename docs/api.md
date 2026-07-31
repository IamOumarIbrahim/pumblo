# REST API Reference (/api/v1)

| Endpoint | Method | Auth Required | Purpose |
|---|---|---|---|
| `/api/v1/auth/signup` | POST | No | Register new account with email + password |
| `/api/v1/auth/login` | POST | No | Authenticate and set HttpOnly session cookie |
| `/api/v1/auth/verify` | POST | Yes | Complete Proof-of-Humanity bot check |
| `/api/v1/videos` | POST | Yes (Human Trust Token) | Upload AI-generated video |
| `/api/v1/videos/:id` | GET | No | Fetch video metadata, provenance, and SQS scores |
| `/api/v1/videos/:id/comments` | POST | Yes (Human Trust Token) | Post comment |
| `/api/v1/channels/:handle` | GET | No | Fetch channel profile and Consistency score |
| `/api/v1/search` | GET | No | Faceted video search |

Webhooks: `video.published`, `video.flagged`, `video.removed`.
