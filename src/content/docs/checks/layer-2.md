---
title: Layer 2 — Renderability
description: Checks whether AI agents can extract meaningful content from the raw HTML without executing JavaScript.
---

**Weight: 25% of open score**

Layer 2 checks whether AI agents can extract meaningful content from the raw HTML without executing JavaScript.

---

## `page-returns-content` — Page returns content to plain HTTP GET

**Possible statuses:** `pass` / `warn` / `fail`

Fetches the root URL simulating a browser navigation (full `Accept`, `Sec-Fetch-*`, `Accept-Language` headers). Fails on HTTP errors or network failures. Warns if fewer than 50 words of body text are found.

**Why it matters:** Most AI crawlers do not execute JavaScript. A page that returns an empty `<div id="root"></div>` to a plain GET is effectively invisible to them, regardless of how rich its client-side content is.

---

## `heading-hierarchy` — Heading hierarchy present in raw HTML

**Possible statuses:** `pass` / `warn`

Counts `<h1>` and `<h2>` elements in the raw HTML.

**Why it matters:** Headings provide semantic structure that AI models use to understand document hierarchy and identify key topics. A page with no headings in raw HTML is likely JS-rendered.

---

## `image-alt-coverage` — Image alt text coverage

**Possible statuses:** `pass` / `warn` / `fail` / `info`

Calculates the percentage of `<img>` elements that have an `alt` attribute. Returns `info` if no images are present.

| Coverage | Status |
|---|---|
| 100% | `pass` |
| > 75% | `warn` |
| ≤ 75% | `fail` |

**Why it matters:** Alt text is the primary way AI models understand images. Missing alt text means visual content is opaque to language models indexing the page.

---

## `content-threshold` — Body content above minimum threshold

**Possible statuses:** `pass` / `warn` / `fail`

| Word count | Status |
|---|---|
| ≥ 200 | `pass` |
| 50–199 | `warn` |
| < 50 | `fail` |

**Why it matters:** Very low word counts almost always indicate a JavaScript-rendered page or a near-empty document. AI crawlers need sufficient text to build a meaningful representation of the page.
