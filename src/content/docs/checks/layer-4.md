---
title: Layer 4 - Advanced
description: Next-generation AI integration signals. Absence is info, not failure - these checks reward early adopters.
---

**Weight: 15% of open score**

Layer 4 checks for next-generation AI integration signals. Most sites will not have these - absence is `info`, not a failure. These checks reward early adopters.

---

## `mcp-endpoint` - MCP endpoint detectable

**Possible statuses:** `pass` / `info`

Probes the following paths for a valid JSON response:

- `/mcp`
- `/mcp.json`
- `/.well-known/mcp.json`

**Why it matters:** The [Model Context Protocol](https://modelcontextprotocol.io) (MCP) is an open standard for AI agents to interact with services via structured tool calls. An MCP endpoint makes a site directly callable by AI agents, not just passively crawlable.

---

## `well-known-ai` - .well-known AI plugin manifest

**Possible statuses:** `pass` / `info`

Probes:

- `/.well-known/ai-plugin.json`
- `/.well-known/openai-manifest.json`

**Why it matters:** The `.well-known/ai-plugin.json` format was popularised by ChatGPT Plugins and is still used by several AI agent frameworks to discover service capabilities automatically.

---

## `llms-txt-mcp` - MCP server endpoint documented in llms.txt

**Possible statuses:** `pass` / `info`

Parses llms.txt for links pointing to an MCP endpoint. Matches on URL paths (`/mcp`, `/mcp.json`, `/.well-known/mcp*`) or keywords (`mcp`, `model context protocol`) in link text or section headings.

---

## `llms-txt-nlweb` - NLWeb endpoint documented in llms.txt

**Possible statuses:** `pass` / `info`

Parses llms.txt for links to a [NLWeb](https://github.com/microsoft/NLWeb) conversational endpoint. Matches URL paths (`/ask`, `/nlweb`) or the keyword `nlweb`. The keyword `ask` alone is excluded as it is too generic.

---

## `llms-txt-a2a` - A2A agent endpoint documented in llms.txt

**Possible statuses:** `pass` / `info`

Parses llms.txt for Agent-to-Agent (A2A) protocol endpoints. Matches URL paths (`/a2a`) or keywords (`a2a`, `agent2agent`, `agent-to-agent`).

---

## `llms-txt-chat-api` - Chat / completions API documented in llms.txt

**Possible statuses:** `pass` / `info`

Parses llms.txt for links to OpenAI-compatible chat APIs. Matches URL paths (`/chat/completions`, `/v1/completions`, `/v1/chat`) or keywords (`openai-compatible`, `openai compatible`, `chat completions`).
