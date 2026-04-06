---
title: Layer 1 - Crawl Access
description: Checks whether AI crawlers can reach the site and whether the site has explicitly declared its stance.
---

**Weight: 25% of open score**

Layer 1 checks whether AI crawlers can reach the site and whether the site has explicitly declared its stance.

---

## `robots-present` - robots.txt present

**Possible statuses:** `pass` / `fail` / `warn`

Fetches `{domain}/robots.txt` with `Accept: text/plain`. Passes if the file is present and contains recognisable directives (`User-agent`, `Disallow`, `Allow`, `Sitemap`, `Crawl-delay`). Content takes priority over `Content-Type` - some servers misconfigure the MIME type but serve valid content.

Fails if the URL returns HTTP 4xx/5xx, a network error, or an HTML page (indicating a WAF or SPA fallback intercept).

**Why it matters:** robots.txt is the foundational crawl contract. Without it, AI crawlers have no explicit guidance and must make assumptions. Its absence doesn't block crawling, but its presence - or absence - signals how deliberate a site's AI stance is.

---

## `sitemap-in-robots` - Sitemap linked from robots.txt

**Possible statuses:** `pass` / `warn`

Checks for a `Sitemap:` directive in robots.txt.

**Why it matters:** Linking to the sitemap from robots.txt is standard practice and ensures crawlers can discover all content from a single starting point, without relying on link traversal.

---

## `robots-{agent}` - Per-agent access

**Possible statuses:** `pass` (allowed) / `warn` (blocked)

One check per tracked AI agent. In open mode, blocked agents score as `warn` (half point); in blocking mode the same data feeds the blocking score formula separately.

### Tracked agents

| Agent ID | Operator |
|---|---|
| `GPTBot` | OpenAI |
| `ClaudeBot` | Anthropic |
| `anthropic-ai` | Anthropic |
| `PerplexityBot` | Perplexity |
| `Googlebot-Extended` | Google |
| `CCBot` | Common Crawl |
| `omgilibot` | Omgili/Webz.io |
| `FacebookBot` | Meta |

### Blocking logic

An agent is considered blocked if it has a specific `User-agent:` block with `Disallow: /` or `Disallow: /*`. If no specific block exists, the wildcard `User-agent: *` rules apply. If neither exists, the agent is treated as allowed.

**Why it matters:** Many sites block all bots via `User-agent: *` intending to block scrapers, but this also blocks legitimate AI crawlers. Each agent check makes this visible individually.

---

## `llms-txt-present` - llms.txt present

**Possible statuses:** `pass` / `fail`

Fetches `{domain}/llms.txt` with `Accept: text/plain`. Fails if the file is missing, returns an error status, or the response body is HTML.

**Why it matters:** [llms.txt](https://llmstxt.org) is an emerging standard for sites to communicate their AI stance and capabilities to LLM-based crawlers - analogous to robots.txt but purpose-built for AI agents. Its presence signals a deliberate, forward-looking approach to AI readiness.

---

llms.txt is validated against the [official spec](https://llmstxt.org/). The table below maps each criterion to its check:

| Criterion | Spec level | Check ID |
|---|---|---|
| H1 title present | Required | `llms-txt-format` |
| Blockquote summary | Recommended | `llms-txt-blockquote` |
| H2 sections present | Recommended | `llms-txt-sections` |
| File is concise | Implied | `llms-txt-concise` |
| Contains links | Expected | `llms-txt-links` |
| Links have descriptive anchor text | Recommended | `llms-txt-link-quality` |

---

## `llms-txt-format` - llms.txt has H1 title

**Possible statuses:** `pass` / `fail`

Checks that the file begins with an H1 heading (`# Title`). This is the only element the spec marks as required. A missing H1 is a `fail` — there is no partial credit for omitting the one mandatory field.

---

## `llms-txt-blockquote` - llms.txt has summary blockquote

**Possible statuses:** `pass` / `warn`

Checks for a blockquote (`> ...`) after the H1 title. The spec recommends a brief summary here containing key information about the site.

---

## `llms-txt-sections` - llms.txt has H2 sections

**Possible statuses:** `pass` / `warn`

Checks for H2 headings (`## Section Name`). The spec uses H2 sections to group related file lists (e.g. `## Docs`, `## API`, `## Optional`).

---

## `llms-txt-concise` - llms.txt is appropriately concise

**Possible statuses:** `pass` / `warn` / `fail`

The spec explicitly calls for "concise, clear language." A file containing thousands of product SKUs, every page URL, or other bulk content defeats the purpose — it cannot be efficiently consumed by an LLM and signals a misunderstanding of the format.

| Condition | Status |
|---|---|
| ≤ 500 lines and ≤ 50 KB | `pass` |
| 500–2,000 lines or 50–500 KB | `warn` |
| > 2,000 lines or > 500 KB | `fail` |

---

## `llms-txt-links` - llms.txt contains content links

**Possible statuses:** `pass` / `warn` / `fail`

Counts markdown links (`[text](url)`) in the file. An excessively high link count is treated as a quality failure — the file should curate key resources, not enumerate entire sitemaps or product catalogues.

| Links | Status |
|---|---|
| 1–500 | `pass` |
| 501–2,000 | `warn` |
| > 2,000 | `fail` |
| 0 | `warn` |

---

## `llms-txt-link-quality` - Links have descriptive anchor text

**Possible statuses:** `pass` / `warn` / `fail` / `info`

Checks that link anchor text is meaningful. The primary pattern caught is bare URL anchor text — links where the anchor is the raw URL itself (e.g. `[https://example.com/page](https://example.com/page)`). These provide no context to an LLM.

| Poor anchor ratio | Status |
|---|---|
| 0% | `pass` |
| 1–20% | `warn` |
| > 20% | `fail` |
| No links | `info` |

---

## `sitemap-present` - Sitemap present

**Possible statuses:** `pass` / `fail`

Probes candidates in this order:

1. URL from the `Sitemap:` directive in robots.txt (if found)
2. `{domain}/sitemap.xml`
3. `{domain}/sitemap_index.xml`

Validates that the response contains `<urlset` or `<sitemapindex` XML structure. Content takes priority over `Content-Type`.

**Why it matters:** A sitemap gives AI crawlers a complete, structured index of all pages, avoiding reliance on link discovery which may miss deep or orphaned content.

---

## `sitemap-lastmod` - Sitemap has lastmod dates

**Possible statuses:** `pass` / `warn`

Checks for at least one `<lastmod>` element in the sitemap XML.

**Why it matters:** `lastmod` dates let crawlers prioritise recently changed content and avoid re-crawling unchanged pages. Without them, crawlers must either crawl everything on every run or use heuristics.

---

## `waf-detected` - CDN or WAF detected

**Possible statuses:** `warn` (detected) / `info` (not detected)

Detects the following providers by their response headers:

| Provider | Header signals |
|---|---|
| Cloudflare | `cf-ray`, `cf-cache-status` |
| Akamai | `x-akamai-transformed`, `akamai-origin-hop` |
| Fastly | `x-served-by` containing `cache-` |
| Sucuri | `x-sucuri-id`, `x-sucuri-cache` |
| Imperva/Incapsula | `x-iinfo`, `incap_ses` cookie |
| AWS CloudFront | `x-amz-cf-id`, `x-amz-cf-pop` |

When detected, the status is `warn` because default WAF bot-management rules frequently block AI crawlers without the site owner realising.

Because "not detected" is not meaningful (unknown CDNs may still be in use), a clean result is `info` rather than `pass` and does not contribute to the score.
