# Crawlmark Scanning Criteria

**Version: 1.1.0**  
**Last updated: 2026-04-05**

This document is the authoritative reference for every check Crawlmark performs, how results are scored, and why each signal matters. It is intended as source material for user-facing documentation. Any change to scanning logic must update this document and increment the version number.

---

## Overview

Every scan produces two scores and a stance classification:

| Output | Range | Meaning |
|---|---|---|
| **Open score** | 0–100 | How well the site serves AI crawlers |
| **Blocking score** | 0–100 | How effectively the site blocks AI crawlers |
| **Stance** | OPEN / MIXED / BLOCKING / UNKNOWN | Derived from robots.txt agent rules |

The two scores are independent. A site can score high on both (blocks most agents intentionally via a well-structured robots.txt, but also has excellent structured data for the agents it does allow). The UI lets the user toggle between modes.

---

## Check statuses

| Status | Meaning | Counts toward score? |
|---|---|---|
| `pass` | Criterion fully met | Yes — full point |
| `warn` | Partially met or best-practice gap | Yes — half point |
| `fail` | Criterion not met | Yes — zero points |
| `info` | Informational only; absence is not a problem | No |
| `skip` | Could not be evaluated | No |

---

## Open score

The open score is a weighted average of four layer scores.

| Layer | Weight |
|---|---|
| Layer 1 — Crawl Access | 25% |
| Layer 2 — Renderability | 25% |
| Layer 3 — Structured Data | 35% |
| Layer 4 — Advanced | 15% |

Each layer score is calculated as:

```
scoreable = checks where status is not "skip" or "info"
layer_score = (passes + warns × 0.5) / count(scoreable) × 100
```

---

## Blocking score

The blocking score uses a separate formula that does not feed into the open score:

```
base         = (blocked_agents / total_agents) × 70
intentional  = llms.txt present ? 20 : 0
waf          = WAF/CDN detected ? 10 : 0
blocking_score = min(100, base + intentional + waf)
```

**Why intentionality matters:** A site with `Disallow: /` for all agents but no llms.txt may be blocking AI crawlers accidentally (e.g. a misconfigured WAF default). The presence of llms.txt signals a deliberate stance, which earns the 20-point bonus.

---

## Stance classification

Derived from the ratio of blocked to total known AI agents found in robots.txt:

| Stance | Condition |
|---|---|
| `BLOCKING` | ≥ 75% of known agents are blocked |
| `OPEN` | ≤ 25% of known agents are blocked |
| `MIXED` | Between 25% and 75% blocked |
| `UNKNOWN` | No agent-specific rules found at all |

---

## Layer 1 — Crawl Access (weight: 25%)

Checks whether AI crawlers can reach the site and whether the site has explicitly declared its stance.

### `robots-present` — robots.txt present

**Status:** `pass` / `fail` / `warn`

Fetches `{domain}/robots.txt` with `Accept: text/plain`. Passes if the file is present and contains recognisable directives (`User-agent`, `Disallow`, `Allow`, `Sitemap`, `Crawl-delay`). Content takes priority over `Content-Type` — some servers misconfigure the MIME type but serve valid content.

Fails if the URL returns HTTP 4xx/5xx, a network error, or an HTML page (indicating a WAF or SPA fallback intercept).

**Why it matters:** robots.txt is the foundational crawl contract. Without it, AI crawlers have no explicit guidance and must make assumptions. Its absence doesn't block crawling, but its presence — or absence — signals how deliberate a site's AI stance is.

---

### `sitemap-in-robots` — Sitemap linked from robots.txt

**Status:** `pass` / `warn`

Checks for a `Sitemap:` directive in robots.txt.

**Why it matters:** Linking to the sitemap from robots.txt is standard practice and ensures crawlers can discover all content from a single starting point, without relying on link traversal.

---

### Per-agent access — `robots-{agent}`

**Status:** `pass` (allowed) / `warn` (blocked)

One check per tracked AI agent. In open mode, blocked agents score as `warn` (half point); in blocking mode the same data feeds the blocking score formula separately.

**Tracked agents:**

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

**Blocking logic:** An agent is considered blocked if it has a specific `User-agent:` block with `Disallow: /` or `Disallow: /*`. If no specific block exists, the wildcard `User-agent: *` rules apply. If neither exists, the agent is treated as allowed.

**Why it matters:** Many sites block all bots via `User-agent: *` intending to block scrapers, but this also blocks legitimate AI crawlers. Each agent check makes this visible individually.

---

### `llms-txt-present` — llms.txt present

**Status:** `pass` / `fail`

Fetches `{domain}/llms.txt` with `Accept: text/plain`. Fails if the file is missing, returns an error status, or the response body is HTML.

**Why it matters:** [llms.txt](https://llmstxt.org) is an emerging standard for sites to communicate their AI stance and capabilities to LLM-based crawlers — analogous to robots.txt but purpose-built for AI agents. Its presence signals a deliberate, forward-looking approach to AI readiness.

---

### `llms-txt-format` — llms.txt valid format

**Status:** `pass` / `warn`

Checks that the file contains at least one H1 heading (`# Title`), which the llms.txt spec requires as the document title.

---

### `llms-txt-links` — llms.txt contains content links

**Status:** `pass` / `warn`

Counts markdown-style links (`[text](url)`) in the file. A file with no links documents nothing useful for AI agents to follow.

---

### `sitemap-present` — Sitemap present

**Status:** `pass` / `fail`

Probes candidates in this order:
1. URL from the `Sitemap:` directive in robots.txt (if found)
2. `{domain}/sitemap.xml`
3. `{domain}/sitemap_index.xml`

Validates that the response contains `<urlset` or `<sitemapindex` XML structure (content takes priority over `Content-Type`).

**Why it matters:** A sitemap gives AI crawlers a complete, structured index of all pages, avoiding reliance on link discovery which may miss deep or orphaned content.

---

### `sitemap-lastmod` — Sitemap has lastmod dates

**Status:** `pass` / `warn`

Checks for at least one `<lastmod>` element in the sitemap XML.

**Why it matters:** `lastmod` dates let crawlers prioritise recently changed content and avoid re-crawling unchanged pages. Without them, crawlers must either crawl everything on every run or use heuristics.

---

### `waf-detected` — CDN or WAF detected

**Status:** `warn` (detected) / `info` (not detected)

Detects the following providers by their response headers:

| Provider | Signals |
|---|---|
| Cloudflare | `cf-ray`, `cf-cache-status` |
| Akamai | `x-akamai-transformed`, `akamai-origin-hop` |
| Fastly | `x-served-by` containing `cache-` |
| Sucuri | `x-sucuri-id`, `x-sucuri-cache` |
| Imperva/Incapsula | `x-iinfo`, `incap_ses` cookie |
| AWS CloudFront | `x-amz-cf-id`, `x-amz-cf-pop` |

When detected, the status is `warn` because default WAF bot-management rules frequently block AI crawlers without the site owner realising.

Because "not detected" is not meaningful (unknown CDNs may still be in use), a clean result is `info` rather than `pass` and does not contribute to the score.

---

## Layer 2 — Renderability (weight: 25%)

Checks whether AI agents can extract meaningful content from the raw HTML without executing JavaScript.

### `page-returns-content` — Page returns content to plain HTTP GET

**Status:** `pass` / `warn` / `fail`

Fetches the root URL simulating a browser navigation (full `Accept`, `Sec-Fetch-*`, `Accept-Language` headers). Fails on HTTP errors or network failures. Warns if fewer than 50 words of body text are found (likely a JavaScript-only SPA that renders no content server-side).

**Why it matters:** Most AI crawlers do not execute JavaScript. A page that returns an empty `<div id="root"></div>` to a plain GET is effectively invisible to them, regardless of how rich its client-side content is.

---

### `heading-hierarchy` — Heading hierarchy present in raw HTML

**Status:** `pass` / `warn`

Counts `<h1>` and `<h2>` elements in the raw HTML.

**Why it matters:** Headings provide semantic structure that AI models use to understand document hierarchy and identify key topics. A page with no headings in raw HTML is likely JS-rendered.

---

### `image-alt-coverage` — Image alt text coverage

**Status:** `pass` / `warn` / `fail` / `info`

Calculates the percentage of `<img>` elements that have an `alt` attribute. `info` if no images are present.

| Coverage | Status |
|---|---|
| 100% | `pass` |
| > 75% | `warn` |
| ≤ 75% | `fail` |

**Why it matters:** Alt text is the primary way AI models understand images. Missing alt text means visual content is opaque to language models indexing the page.

---

### `content-threshold` — Body content above minimum threshold

**Status:** `pass` / `warn` / `fail`

| Word count | Status |
|---|---|
| ≥ 200 | `pass` |
| 50–199 | `warn` |
| < 50 | `fail` |

**Why it matters:** Very low word counts almost always indicate a JavaScript-rendered page or a near-empty document. AI crawlers need sufficient text to build a meaningful representation of the page.

---

## Layer 3 — Structured Data (weight: 35%)

This layer has the highest weight because structured data is the primary signal AI systems use for entity understanding — it converts prose into machine-readable facts.

### `json-ld-present` — JSON-LD structured data present

**Status:** `pass` / `fail`

Checks for one or more `<script type="application/ld+json">` blocks.

**Why it matters:** JSON-LD is the recommended format for Schema.org structured data. It is unambiguous, easy for machines to parse, and doesn't interfere with the visual layout of the page. Google, Bing, and AI indexers all use it as a primary source of entity facts.

---

### `schema-type` — Schema @type detected

**Status:** `pass` / `warn`

Attempts to parse the `@type` field from each JSON-LD block. Only emitted when JSON-LD is present.

**Why it matters:** The `@type` tells AI systems what kind of entity the page describes — `Article`, `Product`, `Organization`, `FAQPage`, etc. Without a type, the structured data provides less useful context.

---

### `open-graph` — Open Graph tags complete

**Status:** `pass` / `warn` / `fail`

Checks for all three core OG tags: `og:title`, `og:description`, `og:image`.

| Tags present | Status |
|---|---|
| All 3 | `pass` |
| 1–2 | `warn` |
| 0 | `fail` |

**Why it matters:** Open Graph is the most widely supported metadata format. When AI systems summarise or represent a page, `og:title` and `og:description` are frequently used as the canonical title and summary, and `og:image` as the representative visual.

---

### `meta-description` — Meta description present

**Status:** `pass` / `fail`

Checks for `<meta name="description">`.

**Why it matters:** The meta description is the oldest and most universally supported summary signal. It is used by search engines, AI assistants, and link-preview systems as the default page summary when no other description is available.

---

### `canonical` — Canonical tag present

**Status:** `pass` / `warn`

Checks for `<link rel="canonical">`.

**Why it matters:** Without a canonical tag, AI indexers may index multiple URL variants of the same page (with/without trailing slash, query strings, etc.) as separate documents, diluting the signal for any individual URL.

---

### `twitter-card` — Twitter/social card meta tags

**Status:** `pass` / `warn`

Checks for `<meta name="twitter:card">`.

**Why it matters:** Twitter card tags are read by many social platforms and AI link-preview tools beyond Twitter/X. Their presence indicates a site has invested in social metadata, which correlates with broader structured data quality.

---

### `rss-feed` — RSS/Atom feed present

**Status:** `pass` / `info`

Checks for `<link type="application/rss+xml">` or `<link type="application/atom+xml">` in the document `<head>`.

**Why it matters:** RSS/Atom feeds provide a structured, chronological stream of content changes that AI systems can subscribe to for efficient re-indexing without crawling the full site on every run.

---

## Layer 4 — Advanced (weight: 15%)

Checks for next-generation AI integration signals. Most sites will not have these — absence is `info`, not a failure. These checks reward early adopters.

### `well-known-ai` — .well-known AI plugin manifest

**Status:** `pass` / `info`

Probes:
- `/.well-known/ai-plugin.json`
- `/.well-known/openai-manifest.json`

**Why it matters:** The `.well-known/ai-plugin.json` format was popularised by ChatGPT Plugins and is still used by several AI agent frameworks to discover service capabilities automatically.

---

### `llms-txt-mcp` — MCP server endpoint documented in llms.txt

**Status:** `pass` / `info`

Parses llms.txt for links pointing to an MCP endpoint. Matches on URL paths (`/mcp`, `/mcp.json`, `/.well-known/mcp*`) or keywords (`mcp`, `model context protocol`) in link text or section headings.

---

### `llms-txt-nlweb` — NLWeb endpoint documented in llms.txt

**Status:** `pass` / `info`

Parses llms.txt for links to a [NLWeb](https://github.com/microsoft/NLWeb) conversational endpoint. Matches URL paths (`/ask`, `/nlweb`) or the keyword `nlweb`. The keyword `ask` alone is excluded as it is too generic.

---

### `llms-txt-a2a` — A2A agent endpoint documented in llms.txt

**Status:** `pass` / `info`

Parses llms.txt for Agent-to-Agent (A2A) protocol endpoints. Matches URL paths (`/a2a`) or keywords (`a2a`, `agent2agent`, `agent-to-agent`).

---

### `llms-txt-chat-api` — Chat / completions API documented in llms.txt

**Status:** `pass` / `info`

Parses llms.txt for links to OpenAI-compatible chat APIs. Matches URL paths (`/chat/completions`, `/v1/completions`, `/v1/chat`) or keywords (`openai-compatible`, `openai compatible`, `chat completions`).

---

## Score labels

### Open score

| Score | Label |
|---|---|
| ≥ 70 | Well optimised for AI |
| 40–69 | Partially AI-ready |
| < 40 | Poorly optimised for AI |

### Blocking score

| Score | Label |
|---|---|
| ≥ 70 | Blocking effectively |
| 40–69 | Partially blocking |
| < 40 (with blocked agents) | Blocking incompletely |
| 0 (no blocked agents) | No agents blocked |

---

## Canonical URL resolution

Before any path-specific fetches, the scanner follows the root URL and records the final destination after all redirects (`scheme://host` of the terminal response). All subsequent fetches — `robots.txt`, `llms.txt`, `sitemap.xml`, etc. — use this canonical base.

This handles cases where a domain like `example.co.uk` redirects to `example.com`: without this step, `example.co.uk/robots.txt` would follow the redirect chain to `example.com/` (the homepage), not `example.com/robots.txt`.

---

## Scan execution order

```
Step 0 (sequential):   Resolve canonical base URL
Batch 1 (parallel):    robots.txt, llms.txt, WAF detection, page fetch
Step 2 (sequential):   Sitemap (depends on robots.txt Sitemap directive)
Batch 3 (parallel):    Structured data, Advanced signals
```

If the page fetch fails with a network-level error (timeout or unreachable host), the scan is aborted before steps 2 and 3 and no record is saved to the database.
