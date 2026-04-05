---
title: Scan Execution Order
description: The sequence in which the scanner fetches resources and evaluates checks.
---

Scans are structured in sequential steps and parallel batches to minimise total wall-clock time while respecting data dependencies.

## Sequence

```
Step 0 (sequential):   Resolve canonical base URL
Batch 1 (parallel):    robots.txt, llms.txt, WAF detection, page fetch
Step 2 (sequential):   Sitemap (depends on robots.txt Sitemap directive)
Batch 3 (parallel):    Structured data, Advanced signals
```

## Step 0 — Canonical URL resolution

Resolves the canonical `scheme://host` by following all redirects from the root URL. All subsequent fetches use this base. See [Canonical URL Resolution](/reference/url-resolution/).

## Batch 1 — Parallel fetches

These four operations run concurrently because they have no dependencies on each other:

- **robots.txt** — Layer 1 crawl access checks
- **llms.txt** — Layer 1 llms.txt checks
- **WAF detection** — Header inspection for known CDN/WAF providers
- **Page fetch** — Layer 2 renderability checks

## Step 2 — Sitemap

Run after Batch 1 because the preferred sitemap URL comes from the `Sitemap:` directive in robots.txt. If robots.txt is unavailable or contains no directive, the scanner falls back to probing `{canonical}/sitemap.xml` and `{canonical}/sitemap_index.xml`.

## Batch 3 — Parallel analysis

Structured data and advanced signal checks run concurrently after the page fetch (from Batch 1) has completed.

## Scan abort condition

If the page fetch in Batch 1 fails with a **network-level error** (timeout or unreachable host), the scan is aborted before steps 2 and 3, and no record is saved to the database. HTTP error responses (4xx/5xx) do not trigger an abort — the scan continues and individual checks record the failure.
