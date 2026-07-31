# Hosting the First 100 Pumblo Creators

Checked July 31, 2026 against official provider documentation.

## Decision

Keep the existing Sites deployment with managed D1 (`DB`) and R2 (`MEDIA`) bindings.

It is the only already-connected path that keeps the public `chatgpt.site` domain live and crawlable, needs no new third-party account/secret/card from the repository owner, and supports authentication, SQL state, durable objects, and byte-range video playback in one deployment.

This is not a “free forever” guarantee. Sites-managed quotas, availability, and future pricing are platform-controlled. Direct Cloudflare product allowances are comparison evidence, not proof of identical Sites terms.

## Application capacity envelope

Pumblo enforces:

```text
100 creators × (80 MiB total video + 2 profile images × 3 MiB)
= 8,600 MiB
```

That is 9,017,753,600 bytes (about 8.40 GiB): 8,000 MiB for videos and 600 MiB for cropped profile media. Each creator gets 12 active video slots, each file remains capped at 40 MiB, and the 80 MiB per-channel total is the controlling bound. Deletion recovers both object storage and a slot; profile images can be replaced or removed. Profiles have no application-level count cap.

The 8,600 MiB envelope is below Cloudflare R2's published direct-account Standard-storage free allowance of 10 GB-month. This is a conservative benchmark, not a Sites quota promise.

## Official free-plan evidence

| Resource | Official published allowance | Pumblo interpretation |
| :--- | :--- | :--- |
| [Cloudflare R2](https://developers.cloudflare.com/r2/pricing/) | 10 GB-month Standard storage, 1 million Class A operations/month, 10 million Class B operations/month, free Internet egress | The modeled 9.02 decimal-GB media ceiling fits storage; operations and managed Sites terms still need monitoring |
| [Cloudflare D1](https://developers.cloudflare.com/d1/platform/pricing/) | 5 GB total, 5 million rows read/day, 100,000 rows written/day on Free | Ample metadata envelope for the first 100 creators; daily write exhaustion remains possible under abuse |
| [Cloudflare Workers](https://developers.cloudflare.com/workers/platform/limits/) | 100,000 requests/day, 10 ms CPU/invocation, 128 MB memory, 100 MB request bodies on Free | 40 MiB final uploads fit the body/memory boundary; this is not a concurrency or CPU load-test result |
| [Cloudflare Stream](https://developers.cloudflare.com/stream/pricing/) | Usage-priced stored and delivered minutes | Rejected for a zero-cost launch path |
| [Supabase Free](https://supabase.com/docs/guides/platform/billing-on-supabase) | 1 GB storage and 5 GB egress | Too small for the modeled media envelope |
| [Vercel Blob Hobby](https://vercel.com/docs/vercel-blob/usage-and-pricing) | 1 GB storage and 10 GB transfer | Too small for the modeled media envelope |
| [Firebase Storage](https://firebase.google.com/docs/storage/faqs-storage-changes-announced-sept-2024) | Current default-bucket access requires Blaze billing | Conflicts with no-card setup |
| [Cloudinary Free](https://cloudinary.com/pricing) | Advertised without a card and with shared monthly credits | Viable fallback, but adds an account/secret and a variable storage/bandwidth/transform budget |

## What “100 users” means

It means application storage guards contain 100 fully utilized creator accounts under the stated envelope. It does not mean:

- 100 simultaneous uploads or viewers have been load-tested;
- only the first 100 profiles may register;
- every creator receives unlimited playback;
- the host guarantees indexing, uptime, quota continuity, or permanent zero pricing.

Watch R2 storage, Class B reads, Worker requests/CPU, and D1 daily reads/writes during the beta. The most likely first constraint is playback/request volume, not D1 storage.
