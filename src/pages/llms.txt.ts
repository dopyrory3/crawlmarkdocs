import type { APIRoute } from 'astro';

export const GET: APIRoute = ({ site }) => {
  const base = site ? site.toString().replace(/\/$/, '') : 'https://docs.crawlmark.report';

  const content = `\
# Crawlmark Docs

> Authoritative reference for Crawlmark scanning criteria, scoring, and checks.

Crawlmark scans web pages for AI-crawler accessibility across four layers: crawl access, renderability, structured data, and advanced signals. Scores are expressed as an Open Score (0–100, higher is better) and a Blocking Score (0–100, lower is better).

## Machine-readable interfaces

- [MCP endpoint](${base}/mcp): Model Context Protocol server — tool-based programmatic access to Crawlmark docs data
- [NLWeb endpoint](${base}/ask): Natural-language query interface over Crawlmark documentation (NLWeb protocol)

## Scoring

- [Scoring Overview](${base}/scores/overview/): How Open Score and Blocking Score are calculated
- [Open Score](${base}/scores/open-score/): Definition and component breakdown of the Open Score
- [Blocking Score](${base}/scores/blocking-score/): Definition and component breakdown of the Blocking Score

## Checks

- [Layer 1 — Crawl Access](${base}/checks/layer-1/): robots.txt, crawl-delay, noindex, and related access controls
- [Layer 2 — Renderability](${base}/checks/layer-2/): JavaScript rendering, resource loading, and content visibility
- [Layer 3 — Structured Data](${base}/checks/layer-3/): Schema.org markup, OpenGraph, and machine-readable metadata
- [Layer 4 — Advanced](${base}/checks/layer-4/): Canonical signals, pagination, hreflang, and advanced signals

## Reference

- [Check Statuses](${base}/reference/check-statuses/): Meaning of pass, fail, warn, skip, and error statuses
- [URL Resolution](${base}/reference/url-resolution/): How Crawlmark resolves and normalises URLs before scanning
- [Execution Order](${base}/reference/execution-order/): The order in which checks are executed within a scan
`;

  return new Response(content, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
