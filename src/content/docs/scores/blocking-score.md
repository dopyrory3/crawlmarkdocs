---
title: Blocking Score
description: How the blocking score is calculated and what intentionality signals add to it.
---

The blocking score is calculated using a separate formula that does not feed into the open score. It ranges from 0 to 100 and represents how effectively the site blocks AI crawlers.

## Formula

```
base           = (blocked_agents / total_agents) × 70
intentional    = llms.txt present ? 20 : 0
waf            = WAF/CDN detected ? 10 : 0
blocking_score = min(100, base + intentional + waf)
```

### Why intentionality matters

A site with `Disallow: /` for all agents but no llms.txt may be blocking AI crawlers accidentally - for example, a misconfigured WAF default. The presence of llms.txt signals a **deliberate** stance, which earns the 20-point intentionality bonus.

## Score labels

| Score | Condition | Label |
|---|---|---|
| ≥ 70 | - | Blocking effectively |
| 40–69 | - | Partially blocking |
| < 40 | With blocked agents | Blocking incompletely |
| 0 | No blocked agents | No agents blocked |
