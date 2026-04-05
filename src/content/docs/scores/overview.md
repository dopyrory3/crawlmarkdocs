---
title: Scoring Overview
description: How the open score, blocking score, and stance classification are produced from scan results.
---

Every scan produces two scores and a stance classification. The two scores are **independent** — a site can score high on both. For example, a site may block most AI agents via a well-structured robots.txt (high blocking score) while also having excellent structured data for the agents it does allow (high open score). The UI lets the user toggle between modes.

## Outputs

| Output | Range | Meaning |
|---|---|---|
| **Open score** | 0–100 | How well the site serves AI crawlers |
| **Blocking score** | 0–100 | How effectively the site blocks AI crawlers |
| **Stance** | `OPEN` / `MIXED` / `BLOCKING` / `UNKNOWN` | Derived from robots.txt agent rules |

## Check statuses

Each individual check resolves to one of five statuses:

| Status | Meaning | Counts toward score? |
|---|---|---|
| `pass` | Criterion fully met | Yes — full point |
| `warn` | Partially met or best-practice gap | Yes — half point |
| `fail` | Criterion not met | Yes — zero points |
| `info` | Informational only; absence is not a problem | No |
| `skip` | Could not be evaluated | No |

## Stance classification

Stance is derived from the ratio of blocked to total known AI agents found in robots.txt:

| Stance | Condition |
|---|---|
| `BLOCKING` | ≥ 75% of known agents are blocked |
| `OPEN` | ≤ 25% of known agents are blocked |
| `MIXED` | Between 25% and 75% blocked |
| `UNKNOWN` | No agent-specific rules found at all |
