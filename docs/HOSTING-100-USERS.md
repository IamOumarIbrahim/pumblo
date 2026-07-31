# Hosting the First 100 Pumblo Creators

Checked July 31, 2026 against official provider documentation.

## Decision

Keep the existing Sites deployment with managed D1 (`DB`) and R2 (`MEDIA`) bindings.

This is the only path already connected to the repository that:

- keeps the public `chatgpt.site` domain live and indexable;
- requires no new third-party account, API secret, OAuth application, or card from the repository user;
- supports server-rendered pages, authentication, SQL data, durable objects, and byte-range video playback;
- preserves one-command verification and one managed deployment.

This is not a “free forever” guarantee. Sites-managed quotas and future pricing are platform-controlled, and direct Cloudflare product allowances do not prove the allowance of the managed Sites bindings.

## Application capacity envelope

Pumblo enforces:

```text
100 creators × (2 active videos × 40 MiB + 2 profile images × 3 MiB)
= 8,600 MiB
```

That is 9,017,753,600 bytes (about 8.40 GiB): 8,000 MiB for videos and 600 MiB for cropped avatar/banner objects. Owners can delete a video to recover both its object storage and active slot, and can replace or remove profile media. Profiles themselves have no application-level count cap.

The 8,600 MiB envelope sits below Cloudflare R2's published direct-account free allowance of 10 GB-month for Standard storage. This is a conservative comparison benchmark, not a promise that Sites inherits the same quota.

## Official-plan comparison

| Provider | Official published position | Fit for this launch |
| :--- | :--- | :--- |
| [Cloudflare R2](https://developers.cloudflare.com/r2/pricing/) | 10 GB-month Standard storage, 1 million Class A operations, 10 million Class B operations, and free Internet egress are listed as monthly free usage. [Direct setup](https://developers.cloudflare.com/r2/get-started/) uses an R2 subscription/checkout flow. | Good technical fit; current Sites binding avoids new direct-account setup. |
| [Cloudflare D1](https://developers.cloudflare.com/d1/platform/pricing/) | Free includes 5 million rows read/day, 100,000 rows written/day, and 5 GB total storage. | Strong fit for 100-user metadata and social actions. |
| [Cloudflare Stream](https://developers.cloudflare.com/stream/pricing/) | Stored and delivered minutes are usage-priced. | Rejected: not an absolutely free launch path. |
| [Supabase Free](https://supabase.com/docs/guides/platform/billing-on-supabase) | Free includes 1 GB storage, 5 GB egress, and a 500 MB database. | Media storage is below the 8,600 MiB envelope. |
| [Vercel Blob Hobby](https://vercel.com/docs/vercel-blob/usage-and-pricing) | Hobby includes 1 GB storage and 10 GB data transfer. | Media storage is below the envelope. |
| [Firebase Storage](https://firebase.google.com/docs/storage/faqs-storage-changes-announced-sept-2024) | Current default-bucket access requires the Blaze pay-as-you-go plan and a linked billing account. | Rejected: conflicts with no-card setup. |
| [Cloudinary Free](https://cloudinary.com/pricing) | Free is advertised with no credit card and 25 monthly credits. [Credits](https://cloudinary.com/documentation/billing_and_plans) are shared by storage, bandwidth, and transformations. | Possible fallback, but adds an account/secret and a variable shared media budget. |

## What “100 users” means

It means the application storage guards can contain 100 fully utilized creator accounts under the stated envelope. It does not mean:

- 100 simultaneous uploads have been load-tested;
- only the first 100 profiles may register;
- every creator can receive unlimited playback bandwidth;
- or the host guarantees uptime, quota continuity, or permanent zero pricing.

The repository states these boundaries because a credible capacity target is more useful than an unsupported scale claim.
