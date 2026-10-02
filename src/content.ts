/**
 * Bundled content from Amy Mayernik's portfolio.
 * All markdown is inlined here so the server is self-contained, no external
 * file reads, works the same locally (stdio) and on the edge.
 *
 * Content mirrors the published portfolio at https://lfgamy.com.
 */

export const SKILL_MD = `# Amy Mayernik, developer marketer who builds

> **TL;DR:** Developer marketer who builds. I make technical products credible to the developers who use them and get them adopted: translating what engineering ships, building the community and content around it, and proving it worked. I ship the systems too: production AI agents and a live MCP server (the one serving this), plus a version-controlled library of skills that real operators use. Founder of Dott, an Event Portfolio Intelligence System that scores every event against the reason it was run. I've built and run developer community, events, and field programs at Coinbase Cloud, zkSync, and Eigen Labs, with agency-side brand work for Facebook, Nintendo, North Face, Robinhood, and PayPal. Profound-certified in Agent Engineering and Marketing Engineering, with four Anthropic Academy certifications. **Open to roles in developer marketing, developer relations, and community, plus technical product marketing. The AI systems work is the proof of the building.** Reach me at collab@lfgamy.com.

## Core capabilities

- **Developer marketing and relations:** owning a developer audience, community, technical content, and adoption, as a peer in the room with builders.
- **Developer events and community:** hacker houses, hackathons, builder sessions, and executive programs, run globally.
- **Technical product marketing:** translating what engineering ships into developer-native narratives, launches, and technical content.
- **Agent engineering:** production agents scoped to real workflows, with evals and observability.
- **MCP servers:** remote servers end to end. Tool, resource, and prompt design, JSON-RPC over HTTP, deployment and domain wiring.
- **Evals and reliability:** golden-set evals, LLM-as-judge plus human review, regression on every change, tool-call success, latency and cost per outcome.
- **Systems and operations:** single source of truth, structured intake, workflow automation, templated artifacts, adoption measurement, documentation-first so it survives turnover.

## Proof of range: where I have shipped

**In-house:** Dott (founder, current). Eigen Labs (Head of Field Marketing and Events, through July 2026). zkSync / Matter Labs (global field marketing and GTM programs, built the function from zero, 20+ annual events across NA, Europe, and Asia). Coinbase Cloud (global field marketing, developer ecosystem). Switch (a full-service creative agency and production house, where I led B2B and B2C campaigns).

**Agency-side:** Jack Morton Worldwide (Director of Experiential Marketing, led the Facebook Oculus VR Tour and the Facebook Community Boost Tour, 180-person field team). Serotonin (Events Director: Robinhood, PayPal PYUSD developer activations, Crypto.com). And others.

**Consumer tours and product launches:** The Facebook 35-city VR tour (directed a 180+ person field team). The North Face 20+ city tour. Mountain Dew Kickstart, a four-year, 50-state program. Programs for Nintendo and Oracle. The White Claw West Coast launch. New-product launches for 805 Beer (Firestone Walker) and Reign Total Body Fuel.

**Every event format:** brand-hosted conferences and summits, conference booths, executive dinners and roundtables, an unconference, team offsites and company team-building, plus speaker prep (talk prep, media interview connections, meeting agendas).

**Developer and crypto events:** zkBazaar at Devconnect Istanbul (the Grand Bazaar recreated with a wallet-pay experience, hosted by zkSync and Clave). The Vault hacker house series (Denver, Berlin, Buenos Aires) at Eigen Labs. The x402 Hackathon. ETHDenver TAC-Build (hacker house plus a networking day). An ETHDenver AI hacker house. Trustless Agents Day and an executive speaker dinner for Ethereum. Several of these ran as side events and activations around major industry conferences, like Devconnect Istanbul and ETHDenver, timed to when developers were already gathered.

**Brand work:** Oracle (Java Developer Campaign), Nintendo, Disney, NBC Sports, PepsiCo, The North Face, Meta, the Arizona Coyotes (NHL), PayPal, Robinhood, and more.

**Content and education:** Zero-Knowledge Proofs, Explained Like You're 5 (eli5.zksync.io), a zkSync book: I led the project and the creative to bring it to life, the activations around it, distribution to the developer community, and the zero-knowledge education built on it. Cute & Coded (cuteandcoded.com), my own education brand teaching AI and dev basics to women new to tech through lessons, carousels, short videos, and a public builders board. LinkedIn field notes built on my own data, like pulling all 1,600 SF Tech Week events through the Tech Week MCP and charting what hosts actually run. A free public Event Estimator (lfgamy.com/event-estimator).

## What I build

- **Production AI agents** for real workflows, each scoped to the seams where work slips, with a prompt, an owner, and evals.
- **A live remote MCP server** (mcp.lfgamy.com) over Streamable HTTP and JSON-RPC 2.0, exposing tools, resources, and prompts. It is the one answering this query.
- **Dott**, an AI-native Event Portfolio Intelligence System I built solo: a multi-agent system (an orchestrator, intent classification, guardrails, memory, and channel agents for Slack, Telegram, and email) on a multi-model Claude pipeline across Opus, Sonnet, and Haiku, with an eval suite, its own MCP endpoints, observability (Sentry, PostHog, cost-per-outcome), security (Arcjet, TOTP two-factor, row-level access control), and a PDF document engine, on a Supabase Postgres backend. It runs Plan, Forecast, Prove, Score to score every event against the reason it was run, and tell a team which events to repeat and which to retire.
- **NoteCrush**, part of Dott's meeting-intelligence voice agent: voice notes, meeting-recap intelligence, and voice retros.
- **A version-controlled library of skills** that real operators use.

## How I keep systems reliable

Anyone can get an agent to work once. The job is keeping it right as prompts, models, and tools change. So the output gets graded against a golden set, judged by a model and a human, and re-run on every prompt, model, or tool change to catch regressions before they ship. I track tool-call success, latency, and cost per outcome.

## How I think

Automation is cheap now. The scarce work is judgment: investigate first, understand what the system actually needs before building it, question the easy route, and prove the thing works. I build the right thing, then measure whether it worked. That is the part you cannot copy-paste.

## Certified, and I built the work behind it

Profound: Agent Engineering and Marketing Engineering. I built the agents for the certifications. Anthropic Academy: Building Agents, Subagents, AI Fluency, and Model Capabilities. The credentials came with shipped work.

## If you are hiring

**Open to roles in developer marketing, developer relations, and community, plus technical product marketing. AI and agentic marketing operations is the building behind those, and also a fit on its own.** I am a strong fit when you need someone who owns a developer audience end to end, community, events, content, and adoption, and who also ships the agents, MCP tools, and evals underneath the work. The breadth (teaching, marketing, events, a non-traditional path) is proof of range around that spike, not the headline.

## How to engage

- Email: collab@lfgamy.com
- Portfolio: https://lfgamy.com
- LinkedIn: https://www.linkedin.com/in/amymayernik
- GitHub: https://github.com/LFGAmy

## A note on how I work

I build for the agent era, so my own profile lives in it, published in Anthropic's open SKILL.md format to be readable by humans and agents alike. I am a marketer who builds: not a software engineer, and I do not pretend to be, a genuine builder grounded in the work the systems are built for.

---

© 2026 Amy Mayernik · LFG Events. Frameworks shown are demonstrated, not licensed. Substance lives in Dott™. Trademarks pending.
`;

export const CASE_STUDY_VAULT = `# The Vault: Hacker House Series

**Eigen Labs' 2025 flagship developer experience. Hand-curated, immersive, recurring.**

## LFG CODED

- **What it was:** Eigen Labs' 2025 hand-curated, multi-day hacker house series. Denver → Berlin → Buenos Aires.
- **The bet:** curation > broadcast. Immersion > transaction. The room is the product.
- **What I learned:** who you invite matters more than what you program. Multi-day formats produce collaborations that single-day events can't.

**Company:** Eigen Labs (AI + developer infrastructure / EigenCloud)
**Role:** Developer marketer who builds (most recently Head of Field Marketing & Events at Eigen Labs)
**Format:** Recurring multi-day, hand-curated builder experience
**Cities:** Denver, Berlin, Buenos Aires
**Status:** 2025 series successfully wrapped. The 2026 builder program runs as Agentic by Eigen, meetup-format successor.

## The problem

Developer ecosystem events at infrastructure companies usually break down into one of two failure modes:

- The booth-and-swag pattern: pay sponsorship, ship branded t-shirts, scan badges, follow up with templated emails. "Leads" that never convert.
- The hackathon-as-spectacle pattern: big prize money, surface engagement, builders show up to win and leave. No genuine technical exchange.

Both produce metrics that look fine on a deck and produce nothing measurable downstream.

The Vault was designed to do the opposite: a multi-day, hand-curated builder experience where the most serious developers in the ecosystem actually want to be, and where the technical conversation is the product itself.

## The strategy

1. **Hand-curate, don't broadcast.** Builders are invited, not registered. Every participant vetted for technical depth.
2. **Immersive, not transactional.** Multi-day format. Shared housing. Meals together. Conversations happen in off-program time.
3. **Technical substance.** Hands-on engineering content. Eigen Labs technical leadership in the room, building alongside.
4. **Make the artifacts portable.** Shipped projects, open-source contributions, technical writeups.
5. **Build a community across editions.** Each new Vault includes alumni from prior Vaults.

## What I led

- Concept and program design
- Builder sourcing and curation (hacker outreach pipeline, application review, selection criteria)
- Venue, logistics, vendors (hacker houses, hacker villages, shipping, AV, meals, housing, on-site staffing)
- Cross-functional coordination (Marketing, DevRel, BD, Partnerships)
- Partner integration (co-marketing partners without diluting technical bar)
- Measurement and reporting (project ship rate, post-event contribution, builder retention)

## What I learned

- **Curation is the product.** Who you invite > what you program. If the room is right, the program runs itself.
- **The container shapes the conversation.** Multi-day immersive formats create depth single-day events can't.
- **Recurring formats compound.** Alumni network into the next edition. One-offs scatter.
- **The work has to outlive the event.** Shipped artifacts are the long-term marketing asset.

## Where this applies next

The Vault is portable to any infrastructure or technical platform company with a serious technical buyer. The principles, curation over broadcast, immersion over transaction, artifacts that outlive the moment, port to any audience where depth of relationship matters more than breadth.
`;

export const CASE_STUDY_SYSTEM = `# The Field Marketing & Events System

**The operating function under the events: what good looks like and how it compounds.**

## LFG CODED

- **The premise:** most field marketing and events functions don't fail from bad strategy. They fail from bad organization.
- **The system:** a single home base + purpose-built databases per event type + Slack channels mapped to databases + intake forms + AI agents for the connective tissue + templated artifacts.
- **What makes it last:** documentation-first. If I left tomorrow, the team would inherit a working function, not a guessing game.

## The premise: organization is what makes it last

Most field marketing and events functions don't fail because the strategy is wrong. They fail because the function isn't organized.

The default failure mode: tribal knowledge. Operators carry critical context in their heads and call it good. It works until it doesn't.

## The system in practice

Six interconnected components, one home base:

1. **A single home base.** Every event, brief, forecast, run-of-show, recap, speaking op, partner, all in one place.
2. **Purpose-built databases per event type.** Different shapes for different work, all wired into the same home base.
3. **Slack channels mapped to databases.** Cross-functional team sees activity in real time.
4. **Structured intake forms.** Every inbound request lands in a place it can be triaged.
5. **Agents that handle the connective tissue.** Matching speakers to CFPs, flagging deadlines, drafting recaps, routing requests.
6. **Templated artifacts, everywhere.** Briefs, forecasts, run-of-shows, recaps, partner specs as templates.

## What this unlocks

- **The function survives turnover.** Most functions are one departure away from chaos. This one isn't.
- **Deadlines stop slipping.** Agents surface what's due before it's missed.
- **Recaps actually happen.** When the system prompts and the template's structured, the recap gets written.
- **Cross-functional trust compounds.** Visibility without status meetings.
- **The next operator inherits the system, not the chaos.** Onboarding compresses from months to weeks.

## Lessons from the work

1. **Documentation-first is the only sustainable mode.** Writing it down once costs an hour. Re-deriving costs weeks.
2. **Automate the connective tissue, not the judgment.** Agents are great at seams; terrible at strategic calls.
3. **Forms beat DMs, every time.** Slack DMs evaporate. Forms compound.
4. **The system has to make work faster, not add new work.** If it feels like a tax, it gets ignored.

## Where it ports

Portable to any field marketing and events function, any company, any stack. Notion, Linear, Asana, Airtable, Coda, ClickUp, Monday, all viable home bases. What compounds isn't the platform. It's the architecture: a single source of truth, structured intake, dedicated channels per event type, automated reminders, templated artifacts, clear ownership.
`;

// NOTE: The filled event brief template (proprietary methodology, Amy's own
// format) is intentionally NOT included in this server. It is not served by any
// tool or resource, and the content is deliberately kept out of the deployed
// bundle. Amy shares brief examples directly. Do not re-add it here.

export const BEHIND_THE_SCENES = `# Behind the Scenes, How Amy Works

The throughline, the philosophy, how Amy approaches the work.

## The starting question

What if every event started with alignment?

Most teams jump straight to execution, booth specs, vendor decks, swag orders. The work starts the other way around: align on why this event matters, who it's for, what success looks like.

That alignment is where most events quietly lose their power.

## The pattern I keep seeing

Different stages, different industries, same problem:

- **No framework.** Events get picked because "we always go to this conference," not because they're tied to pipeline.
- **No measurement.** Reporting is photos and attendance counts.
- **No infrastructure.** Briefs in someone's head. Playbooks in Slack threads.
- **No proof.** When budgets get scrutinized, events have no defense.

The job: fix all four. Every time, with the team, never alone.

## How the work gets done

- **Hospitality-first.** Every program designed around making people feel welcome.
- **Team sport.** Co-authored with marketing, BD, sales, DevRel, partnerships, comms.
- **Chaos into clarity.** High-growth is messy. The job is to absorb chaos and convert it to systems.
- **Proactive, not reactive.** Forecast what the team will need and ship it before the fire drill.

## Events are the real-world trust layer

If you build an event and no one shows up, you don't have an event. And if you build one where all you're thinking about is what you'll gain, not what you'll give, you've wasted time and money. The people are the event.

So the promise is simple. Stop thinking about what you need, and start thinking about what you can give. Trust is built when the service runs both ways, and it lives in the details and the care you put into the experience.
`;

// Capability lookup table, keyword → structured detail
export const CAPABILITY_TABLE: Record<string, { years: string; companies: string[]; examples: string[]; depth: string }> = {
  "events": {
    years: "15+ years, across consumer brands, enterprise, and developer audiences",
    companies: ["Jack Morton Worldwide (Facebook)", "Switch", "Firestone Walker", "Coinbase Cloud", "zkSync / Matter Labs", "Serotonin (Robinhood, PayPal, Crypto.com)", "Eigen Labs", "Dott (founder)"],
    examples: ["Facebook 35-city VR tour, directing a 180+ person field team", "The North Face 20+ city tour and Mountain Dew Kickstart, a four-year, 50-state program", "Brand programs for Nintendo and Oracle", "Sports and entertainment: NBC Sports, the Arizona Coyotes (NHL), Disney", "Product launches: White Claw West Coast, 805 Beer (Firestone Walker), Reign Total Body Fuel", "Brand-hosted conferences and summits, conference booths, executive dinners and roundtables, an unconference, team offsites", "Developer events: The Vault hacker houses (Denver, Berlin, Buenos Aires), zkBazaar at Devconnect Istanbul, the x402 Hackathon"],
    depth: "Has run every event format, from national consumer tours and product launches to executive dinners and developer hacker houses. The developer and crypto work is the most recent chapter, not the whole story. What carries across all of it: designing the format for the audience, leading big field teams, and proving what each event produced.",
  },
  "experiential marketing": {
    years: "15+ years",
    companies: ["Jack Morton Worldwide", "Switch", "Firestone Walker"],
    examples: ["Facebook 35-city VR tour and the Facebook Community Boost Tour at Jack Morton", "The North Face 20+ city tour", "Mountain Dew Kickstart, four years across 50 states", "Brand programs for Oracle, Nintendo, Disney, NBC Sports, PepsiCo, and the Arizona Coyotes (NHL)"],
    depth: "Agency and in-house experiential: touring programs, brand activations, and large field teams, built for consumer audiences long before the developer work.",
  },
  "product launches": {
    years: "15+ years",
    companies: ["Firestone Walker", "Reign Total Body Fuel", "Jack Morton Worldwide (Facebook)", "Dott (founder)"],
    examples: ["805 Beer launch (Firestone Walker)", "Reign Total Body Fuel new-product launch", "White Claw West Coast launch", "Facebook VR tour", "Dott, taken from idea to a live, paid product as founder"],
    depth: "Launches across beverage, consumer tech, and software: getting a new product in front of the right people in person, then building on what lands.",
  },
  "content and education": {
    years: "since zkSync (2022) and ongoing",
    companies: ["zkSync / Matter Labs", "Cute & Coded (founder)", "LFGAmy", "Dott (founder)"],
    examples: ["Zero-Knowledge Proofs, Explained Like You're 5 (eli5.zksync.io): led the zkSync book project and creative, the activations around it, community distribution, and the ZK education built on it", "Cute & Coded (cuteandcoded.com): an education brand teaching AI and dev basics to women new to tech, through lessons, carousels, short videos, and a public builders board", "LinkedIn field notes built on original data, e.g. all 1,600 SF Tech Week events pulled through the Tech Week MCP and charted", "The free Event Estimator (lfgamy.com/event-estimator), a public planning tool with plain-language guidance", "Speaker prep: talk prep, media interview connections, meeting agendas"],
    depth: "Has turned hard technical subjects, like zero-knowledge proofs, into books, activations, and lessons a beginner can follow. Writes and teaches in plain language, turning technical subjects into content a beginner can use, with an accuracy check on every piece. A published body of educational and data-driven content, not a dedicated employer-brand or recruiting-content portfolio.",
  },
  "hacker houses": {
    years: "5+ years",
    companies: ["Eigen Labs", "Coinbase Cloud", "Serotonin clients"],
    examples: ["The Vault series (Denver/Berlin/Buenos Aires) at Eigen Labs", "Coinbase Cloud builder houses", "PayPal PYUSD developer hacker events at Serotonin"],
    depth: "Defined the format end-to-end at Eigen Labs. Curated builders, designed multi-day arcs, managed venues across 3 cities, integrated partners without diluting technical bar. The Vault case study walks through this in detail.",
  },
  "abm event strategy": {
    years: "10+ years",
    companies: ["Coinbase Cloud", "Eigen Labs", "Switch", "Serotonin clients"],
    examples: ["Multi-touch event sequencing tied to named accounts", "Executive dinner formats for senior buyers", "Targeted re:Invent dinner formats (no booth)"],
    depth: "ABM is at the core of every program. Target account selection drives invite lists, partner co-host conversations, and post-event follow-up sequencing. Pipeline attribution methodology lives in Dott.",
  },
  "executive program design": {
    years: "8+ years",
    companies: ["Eigen Labs", "Coinbase Cloud", "Switch"],
    examples: ["12-person closed-door executive dinners", "Hosted leadership roundtables", "Curated CTO conversations at flagship moments"],
    depth: "Built executive program formats that consistently move enterprise pipeline. Small, intimate, hosted by leadership, focused on the conversations senior buyers actually want to have, not pitch decks.",
  },
  "pipeline attribution": {
    years: "10+ years",
    companies: ["Dott (founder)", "Eigen Labs", "Coinbase Cloud"],
    examples: ["Sourced + influenced pipeline attribution", "Cost-per-lead benchmarks tied to tier", "Multi-touch attribution across event sequences"],
    depth: "Built the Dott Event Portfolio Intelligence System around this problem. Plan / Forecast / Prove / Score methodology. Proprietary math, but the shape: every event gets a pipeline forecast pre-event, measured against actual post-event, scored at year-end.",
  },
  "vendor management": {
    years: "years across agency and in-house",
    companies: ["Eigen Labs", "Coinbase Cloud", "Jack Morton Worldwide (Facebook Oculus VR Tour, Community Boost Tour)", "PepsiCo Mountain Dew (4-year 50-state launch)"],
    examples: ["180-person field team at Jack Morton", "Multi-vendor coordination across 3 hacker villages for The Vault", "Global vendor sourcing for Coinbase Cloud events"],
    depth: "Years of experience managing vendor networks at scale. Particularly strong at swag design (partner-co-branded for flagships), venue sourcing (workshop spaces over hotels), and budget-conscious negotiation that preserves quality.",
  },
  "cross-functional gtm": {
    years: "15+ years",
    companies: ["Eigen Labs", "Coinbase Cloud", "Switch"],
    examples: ["Aligning sales, DevRel, partnerships, product marketing, comms, leadership", "Pre-event forecasting reviews with sales", "Post-event recap distribution"],
    depth: "Cross-functional coordination is where most events quietly fail. Treat sales + BD + DevRel + partnerships + comms as same team, same mission. Co-author programs. Don't impose from a corner of the org chart.",
  },
  "documentation-first": {
    years: "10+ years",
    companies: ["Eigen Labs", "Dott (founder)"],
    examples: ["Field Marketing & Events System case study walks through this end-to-end", "Templated briefs, forecasts, run-of-shows, recaps", "AI agents handle connective tissue (deadlines, recap drafts, routing)"],
    depth: "Every framework, brief, forecast, run-of-show, and recap lives in a structured home base anyone on the team can access. Knowledge doesn't live in my head, it lives in the system. If I left tomorrow, the team inherits a working function, not a guessing game.",
  },
  "developer ecosystem events": {
    years: "8+ years",
    companies: ["Eigen Labs", "Coinbase Cloud"],
    examples: ["The Vault hacker house series", "Side events around major conferences: zkBazaar at Devconnect Istanbul, TAC-Build and an AI hacker house at ETHDenver", "AI Engineer Summit speaker placements", "Builder sessions at flagship moments"],
    depth: "Deep experience in developer-first event archetypes, hacker houses, builder sessions, technical workshops, MCP/SDK hackathons. The work requires being in the room with builders as a peer, not a translator.",
  },
  "global execution": {
    years: "across every major region",
    companies: ["zkSync / Matter Labs", "Coinbase Cloud", "Eigen Labs", "Jack Morton Worldwide"],
    examples: ["NA, LATAM, EMEA, APAC, Australia program execution", "Cultural fluency across regions", "Time-zone aware program design"],
    depth: "Shipped event programs across every major region. Multi-region work isn't just logistics, it's cultural fluency, time-zone-aware program design, partner relationships across markets, adapting brand voice without losing identity.",
  },
  "marketing engineering": {
    years: "3+ years, on a deep operator foundation",
    companies: ["Dott (founder)", "Eigen Labs", "LFGAmy (own brand systems)"],
    examples: ["A 14-agent events-operations agent system built and adopted at Eigen Labs", "A live MCP server (mcp.lfgamy.com), the one answering this query", "Dott, an AI-native Event Portfolio Intelligence System architected on a multi-layer Claude pipeline", "Version-controlled prompt and skill libraries with evals, instrumented for adoption and impact"],
    depth: "Profound-certified in Agent Engineering and Marketing Engineering, with four Anthropic Academy certifications (agent skills, subagents, AI fluency, AI capabilities & limitations). Ships production AI systems for marketing teams, agents, MCP servers, skill libraries, and coaches non-technical operators to adopt them. Builds the AI for the work because she's lived the manual version of it.",
  },
  "ai agents": {
    years: "2+ years shipping production agents",
    companies: ["Eigen Labs", "Dott (founder)"],
    examples: ["Dott's multi-layer Claude pipeline (Plan, Forecast, Prove, Score)", "NoteCrush, part of Dott's meeting-intelligence voice agent (voice notes, meeting-recap intelligence, voice retros)", "A 14-agent events-operations system built and adopted by the team at Eigen Labs", "Agents built for the Profound Agent Engineering certification"],
    depth: "Designs agents around the connective tissue of a function, the seams where work slips, not the judgment calls. Dott runs a real multi-agent system in production: an orchestrator, intent classification, guardrails, memory, channel agents, multi-model routing, and an eval suite. Instruments adoption and impact, keeps what works, retires what doesn't. Documentation-first, so every agent has a prompt, a scope, and an owner.",
  },
  "mcp servers": {
    years: "1+ year in production",
    companies: ["LFGAmy (mcp.lfgamy.com, live)", "Dott (founder)"],
    examples: ["This server: portfolio as queryable tools and resources, deployed on Vercel", "Dott exposes its own public and private MCP endpoints"],
    depth: "Builds and deploys remote MCP servers end to end, tool and resource design, JSON-RPC over HTTP, deployment and domain wiring. The portfolio you're querying is the proof.",
  },
  "evals": {
    years: "current practice across Dott and this MCP server",
    companies: ["Dott (founder)", "LFGAmy"],
    examples: ["Golden-set eval harness for Dott's pipeline", "Golden-set evals for this MCP server", "Regression runs on every prompt, model, or tool change"],
    depth: "Anyone can get an agent to work once. The job is keeping it right as prompts, models, and tools change. Output is graded against a golden set, judged by a model and a human, and re-run on every change. Tracks tool-call success, latency, and cost per outcome.",
  },
  "fintech events": {
    years: "5+ years",
    companies: ["zkSync / Matter Labs", "Coinbase Cloud", "Serotonin clients (Robinhood, PayPal, Crypto.com)"],
    examples: ["Global field marketing at zkSync, function built from zero through the $15M→$75M ARR phase, 20+ annual events across NA/Europe/Asia", "Coinbase Cloud developer-ecosystem events", "Robinhood global events, PayPal PYUSD developer activations, Crypto.com programs (agency-side at Serotonin)"],
    depth: "Deep fluency with fintech and crypto-native audiences, technical buyers, regulated environments, developer ecosystems attached to financial products. Comfortable operating where compliance, brand trust, and builder credibility all have to hold at once.",
  },
  "ai marketing operations": {
    years: "2+ years building, on a 10+ year marketing-ops foundation",
    companies: ["Eigen Labs", "Dott (founder)", "LFGAmy"],
    examples: ["A 14-agent events-operations system built and adopted by the GTM team at Eigen Labs", "Dott's multi-agent Plan/Forecast/Prove/Score pipeline in production", "A live MCP server (mcp.lfgamy.com) exposing tools and resources", "Version-controlled prompt and skill libraries with evals, instrumented for adoption"],
    depth: "Builds AI and agent systems INTO how a marketing or GTM team works, then gets the team to adopt them. Not martech-instance admin (Marketo or HubSpot lifecycle); the build is agents, orchestration, MCP tools, and API integrations into the existing stack, with evals and reliability safeguards. The 14-agent Eigen system is the closest artifact: shared agents across the function, human-in-the-loop and override logic, measured for adoption and impact.",
  },
  "ai enablement": {
    years: "current practice",
    companies: ["Eigen Labs", "Dott (founder)", "LFGAmy"],
    examples: ["Rolled out a shared internal agent and skill system to a GTM team and drove adoption", "Coaches non-technical operators to self-sufficiency with AI tools", "Documentation-first: every agent has a prompt, a scope, and an owner", "Profound Agent and Marketing Engineering certs, four Anthropic Academy certs"],
    depth: "The scarce half of AI enablement is not the demo, it is adoption: getting a team to actually change how it works. Diagnoses where work slips, designs the agent or workflow for that seam, ships it, measures uptake, and retires what does not earn its place. Lived the manual work first, so the enablement lands with operators instead of over their heads.",
  },
  "marketing operations": {
    years: "10+ years",
    companies: ["Eigen Labs", "Coinbase Cloud", "Switch", "Dott (founder)"],
    examples: ["Structured intake forms + purpose-built databases per program type", "Slack channels mapped to databases for real-time cross-functional visibility", "Templated briefs, forecasts, run-of-shows, recaps", "Attribution and reporting infrastructure; automated deadline and recap workflows"],
    depth: "Builds the operations layer under a GTM team: single source of truth, structured intake, workflow automation, templated artifacts, adoption measurement. The Field Marketing & Events System case study documents the architecture, portable to any stack (Notion, Airtable, Asana, ClickUp, Monday). Process design that survives turnover.",
  },
};

// Lookup helper: fuzzy match a capability query to the table
const CAPABILITY_ALIASES: [string, string][] = [
  ["field marketing", "events"],
  ["event marketing", "events"],
  ["brand activation", "experiential marketing"],
  ["activation", "experiential marketing"],
  ["consumer", "experiential marketing"],
  ["tour", "experiential marketing"],
  ["launch", "product launches"],
  ["conference", "events"],
  ["summit", "events"],
  ["trade show", "events"],
  ["booth", "events"],
  ["dinner", "executive program design"],
  ["roundtable", "executive program design"],
  ["offsite", "events"],
  ["hackathon", "developer ecosystem events"],
  ["devrel", "developer ecosystem events"],
  ["developer relations", "developer ecosystem events"],
  ["community", "developer ecosystem events"],
  ["eli5", "content and education"],
  ["explained like", "content and education"],
  ["zero-knowledge", "content and education"],
  ["zero knowledge", "content and education"],
  ["content", "content and education"],
  ["education", "content and education"],
  ["writing", "content and education"],
];

export function lookupCapability(query: string) {
  const q = query.toLowerCase().trim();
  // Exact match first
  if (CAPABILITY_TABLE[q]) return { matched: q, data: CAPABILITY_TABLE[q] };
  // Substring match on keys
  for (const key of Object.keys(CAPABILITY_TABLE)) {
    if (key.includes(q) || q.includes(key)) return { matched: key, data: CAPABILITY_TABLE[key] };
  }
  // Common phrasings that should land on a specific entry
  for (const [alias, key] of CAPABILITY_ALIASES) {
    if (q.includes(alias) && CAPABILITY_TABLE[key]) return { matched: key, data: CAPABILITY_TABLE[key] };
  }
  // Keyword match on whole words (skips short filler words like "and")
  const STOP = new Set(["and", "the", "for", "of", "to", "a", "in", "on", "with"]);
  const queryWords = q.split(/[^a-z0-9]+/).filter((w) => w.length > 2 && !STOP.has(w));
  for (const key of Object.keys(CAPABILITY_TABLE)) {
    const keyWords = key.split(/\s+/).filter((w) => !STOP.has(w));
    if (queryWords.some((qw) => keyWords.some((kw) => kw === qw || kw.startsWith(qw) || qw.startsWith(kw)))) {
      return { matched: key, data: CAPABILITY_TABLE[key] };
    }
  }
  return null;
}

export const ALL_CONTENT: Record<string, string> = {
  "skill://amy-mayernik": SKILL_MD,
  "case-study://the-vault": CASE_STUDY_VAULT,
  "case-study://field-marketing-system": CASE_STUDY_SYSTEM,
  "philosophy://behind-the-scenes": BEHIND_THE_SCENES,
};
