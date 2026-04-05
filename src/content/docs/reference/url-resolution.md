---
title: Canonical URL Resolution
description: How the scanner resolves the canonical base URL before performing any path-specific fetches.
---

Before any path-specific fetches, the scanner follows the root URL and records the final destination after all redirects. Specifically, it records the `scheme://host` of the terminal response. All subsequent fetches — `robots.txt`, `llms.txt`, `sitemap.xml`, etc. — use this canonical base.

## Why this matters

Without canonical URL resolution, a domain like `example.co.uk` that redirects to `example.com` would cause a problem: fetching `example.co.uk/robots.txt` would follow the redirect chain to `example.com/` (the homepage), not `example.com/robots.txt`.

By resolving the canonical base first, all path-specific fetches are constructed against the correct terminal host.

## Step in execution order

Canonical URL resolution is **Step 0** — sequential and blocking. No other fetches begin until the canonical base is known.

See [Execution Order](/reference/execution-order/) for the full scan sequence.
