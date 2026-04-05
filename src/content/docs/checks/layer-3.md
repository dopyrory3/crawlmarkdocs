---
title: Layer 3 - Structured Data
description: Checks for machine-readable metadata that AI systems use for entity understanding.
---

**Weight: 35% of open score**

Layer 3 has the highest weight because structured data is the primary signal AI systems use for entity understanding - it converts prose into machine-readable facts.

---

## `json-ld-present` - JSON-LD structured data present

**Possible statuses:** `pass` / `fail`

Checks for one or more `<script type="application/ld+json">` blocks.

**Why it matters:** JSON-LD is the recommended format for Schema.org structured data. It is unambiguous, easy for machines to parse, and doesn't interfere with the visual layout of the page. Google, Bing, and AI indexers all use it as a primary source of entity facts.

---

## `schema-type` - Schema @type detected

**Possible statuses:** `pass` / `warn`

Attempts to parse the `@type` field from each JSON-LD block. Only emitted when JSON-LD is present.

**Why it matters:** The `@type` tells AI systems what kind of entity the page describes - `Article`, `Product`, `Organization`, `FAQPage`, etc. Without a type, the structured data provides less useful context.

---

## `open-graph` - Open Graph tags complete

**Possible statuses:** `pass` / `warn` / `fail`

Checks for all three core OG tags: `og:title`, `og:description`, `og:image`.

| Tags present | Status |
|---|---|
| All 3 | `pass` |
| 1–2 | `warn` |
| 0 | `fail` |

**Why it matters:** Open Graph is the most widely supported metadata format. When AI systems summarise or represent a page, `og:title` and `og:description` are frequently used as the canonical title and summary, and `og:image` as the representative visual.

---

## `meta-description` - Meta description present

**Possible statuses:** `pass` / `fail`

Checks for `<meta name="description">`.

**Why it matters:** The meta description is the oldest and most universally supported summary signal. It is used by search engines, AI assistants, and link-preview systems as the default page summary when no other description is available.

---

## `canonical` - Canonical tag present

**Possible statuses:** `pass` / `warn`

Checks for `<link rel="canonical">`.

**Why it matters:** Without a canonical tag, AI indexers may index multiple URL variants of the same page (with/without trailing slash, query strings, etc.) as separate documents, diluting the signal for any individual URL.

---

## `twitter-card` - Twitter/social card meta tags

**Possible statuses:** `pass` / `warn`

Checks for `<meta name="twitter:card">`.

**Why it matters:** Twitter card tags are read by many social platforms and AI link-preview tools beyond Twitter/X. Their presence indicates a site has invested in social metadata, which correlates with broader structured data quality.

---

## `rss-feed` - RSS/Atom feed present

**Possible statuses:** `pass` / `info`

Checks for `<link type="application/rss+xml">` or `<link type="application/atom+xml">` in the document `<head>`.

**Why it matters:** RSS/Atom feeds provide a structured, chronological stream of content changes that AI systems can subscribe to for efficient re-indexing without crawling the full site on every run.
