# Crawlmark Docs

Documentation site for [Crawlmark](https://crawlmark.report) — built with [Astro Starlight](https://starlight.astro.build).

The site is a structured, human- and agent-readable presentation of [`scanning-criteria.md`](./scanning-criteria.md), which is the authoritative reference for every check Crawlmark performs, how results are scored, and why each signal matters. The docs site must not contradict or extend that source — it only makes it more readable.

## Development

**Requires Node 22+.** If you use nvm:

```bash
nvm use   # picks up .nvmrc
```

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # static output → dist/
npm run preview  # serve dist/ locally
```

## Structure

```
src/content/docs/
├── index.mdx                 # landing page
├── scores/
│   ├── overview.md           # scores overview, stance, check statuses
│   ├── open-score.md         # formula, layer weights, labels
│   └── blocking-score.md     # formula, intentionality bonus, labels
├── checks/
│   ├── layer-1.md            # Crawl Access (25%)
│   ├── layer-2.md            # Renderability (25%)
│   ├── layer-3.md            # Structured Data (35%)
│   └── layer-4.md            # Advanced (15%)
└── reference/
    ├── check-statuses.md     # status types and scoring behaviour
    ├── url-resolution.md     # canonical URL resolution
    └── execution-order.md    # scan execution sequence
```

## Updating content

When scanning logic changes, update `scanning-criteria.md` first and increment its version number, then update the relevant docs page to match. The source file is the contract — the docs site follows it.
