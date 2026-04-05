---
title: Check Statuses
description: The five possible statuses a check can return and how each affects scoring.
---

Each individual check resolves to one of five statuses.

| Status | Meaning | Counts toward score? |
|---|---|---|
| `pass` | Criterion fully met | Yes - full point |
| `warn` | Partially met or best-practice gap | Yes - half point |
| `fail` | Criterion not met | Yes - zero points |
| `info` | Informational only; absence is not a problem | No |
| `skip` | Could not be evaluated | No |

## Scoring behaviour

Only `pass`, `warn`, and `fail` are **scoreable**. Checks with status `info` or `skip` are excluded from the denominator when calculating layer scores, so they do not penalise the result.

```
scoreable    = checks where status is not "skip" or "info"
layer_score  = (passes + warns × 0.5) / count(scoreable) × 100
```

## When `info` is used

`info` is used when the absence of a signal is not inherently problematic. Examples:

- `waf-detected` returns `info` when no WAF headers are detected, because unknown CDNs may still be in use - a clean result is not meaningful.
- `rss-feed` returns `info` when no feed is found, because not all site types benefit from RSS.
- All Layer 4 checks return `info` on absence - these reward early adopters but do not penalise sites that haven't adopted them yet.

## When `skip` is used

`skip` is returned when a check cannot be evaluated. For example, `schema-type` is only emitted when JSON-LD is present - if `json-ld-present` fails, `schema-type` is skipped rather than failed.
