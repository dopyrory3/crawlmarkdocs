---
title: Open Score
description: How the open score is calculated from four weighted layers of checks.
---

The open score is a weighted average of four layer scores. It ranges from 0 to 100 and represents how well the site serves AI crawlers.

## Layer weights

| Layer | Weight |
|---|---|
| Layer 1 - Crawl Access | 25% |
| Layer 2 - Renderability | 25% |
| Layer 3 - Structured Data | 35% |
| Layer 4 - Advanced | 15% |

## Formula

Each layer score is calculated independently, then combined using the weights above:

```
scoreable    = checks where status is not "skip" or "info"
layer_score  = (passes + warns × 0.5) / count(scoreable) × 100
```

`skip` and `info` checks are excluded from the denominator - they do not penalise the score.

## Score labels

| Score | Label |
|---|---|
| ≥ 70 | Well optimised for AI |
| 40–69 | Partially AI-ready |
| < 40 | Poorly optimised for AI |
