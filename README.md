# Amy Mayernik: Portfolio MCP Server

> A queryable, agent-readable layer over Amy Mayernik's work. Developer marketer who builds, founder of Dott, Profound-certified in Agent Engineering and Marketing Engineering. Open to community, events, developer marketing, and creator program roles at AI and developer tool companies. The machine-readable companion to the open brand home at [lfgamy.com](https://lfgamy.com).

This is an MCP (Model Context Protocol) server that exposes Amy's portfolio as **structured tools and resources** any MCP-compatible agent can query: Claude.ai, Claude Code, Claude Desktop, or your own. It sits alongside the human-readable site at lfgamy.com and the `SKILL.md` / `llms.txt` files published there.

## Why this exists

lfgamy.com is built to be read two ways: by people, and by the AI assistants that increasingly answer on a person's behalf. This server is the programmatic surface of that, so an agent can fetch Amy's capabilities, case studies, and operating philosophy directly, and (if you're hiring) score a role against her portfolio.

Paste the server URL into Claude.ai and ask:

- *"What's Amy's depth on developer-community events?"*
- *"Score this JD against Amy's portfolio."* (paste a job description)
- *"What has Amy shipped as a builder?"*
- *"What's Amy's operating philosophy?"*

## Connect

### Remote (Claude.ai)

Settings → Connectors → Add custom MCP server:

```
https://mcp.lfgamy.com
```

### Local (Claude Code / Claude Desktop)

Clone this repo, then:

```bash
npm install
npm run build:stdio
```

and point your MCP config at `node dist/stdio.js`.

## Tools

| Tool | What it does |
|---|---|
| `get_capability` | Look up Amy's depth on a community / events / developer marketing / creator programs / developer relations capability |
| `get_case_study` | Return a named case study (`the-vault` or `field-marketing-system`) |
| `ask` | Ask any question about Amy's work; answers come only from her real profile, with citations |
| `check_role_fit` | Score a job description against Amy's portfolio (met / stretches / gaps + suggested angles) |
| `search_artifacts` | Search across all portfolio content |

## Resources

| URI | What |
|---|---|
| `skill://amy-mayernik` | Structured profile in the open SKILL.md format |
| `case-study://the-vault` | The Vault hacker house series at Eigen Labs |
| `case-study://field-marketing-system` | The operating function under the events |
| `philosophy://behind-the-scenes` | How Amy works |

## Prompts

- `candidate-summary`: a short role-fit summary for a given role and audience
- `interview-prep`: 5 questions Amy would ask a target company

## Develop locally

```bash
npm install
npm run dev:stdio
```

## Deploy

Hosted on Vercel; all paths rewrite to the `api/index` serverless function (see `vercel.json`). Deploy with the Vercel CLI from this folder:

```bash
vercel --prod
```

The custom domain `mcp.lfgamy.com` is added in the Vercel project's Domains settings, with a matching CNAME at the DNS provider (GoDaddy).

## License

© 2026 Amy Mayernik / LFG Events. Frameworks demonstrated here are not licensed for redistribution; the server code is provided for review. Dott™ trademarks pending (USPTO SN 99654762, SN 99788022, Classes 035/038/041).

## Contact

`collab@lfgamy.com`

