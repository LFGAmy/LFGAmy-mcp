/**
 * Tool implementations — pure functions used by both stdio and HTTP entry points.
 * Each handler takes the parsed input and returns the MCP tool result shape.
 */

import {
  ALL_CONTENT,
  CAPABILITY_TABLE,
  CASE_STUDY_SYSTEM,
  CASE_STUDY_VAULT,
  lookupCapability,
} from "./content.js";

export interface ToolResult {
  content: Array<{ type: "text"; text: string }>;
  isError?: boolean;
  // Allow the MCP SDK's looser result union (which gained optional fields like
  // `task` and `_meta` in newer versions) to accept this shape without error.
  [key: string]: unknown;
}

/**
 * Tool: get_capability
 * Look up Amy's depth on a specific capability.
 */
export function getCapability(args: { capability: string }): ToolResult {
  if (!args.capability) {
    return {
      content: [{ type: "text", text: "Error: missing 'capability' argument." }],
      isError: true,
    };
  }
  const result = lookupCapability(args.capability);
  if (!result) {
    const availableKeys = Object.keys(CAPABILITY_TABLE).join(", ");
    return {
      content: [
        {
          type: "text",
          text: `No structured match for "${args.capability}". Available capability keys: ${availableKeys}.\n\nFor a broader profile, use the resource skill://amy-mayernik or the search_artifacts tool.`,
        },
      ],
    };
  }
  const { matched, data } = result;
  const text = [
    `# Capability: ${matched}`,
    ``,
    `**Years of practice:** ${data.years}`,
    ``,
    `**Companies where applied:** ${data.companies.join(", ")}`,
    ``,
    `**Examples:**`,
    ...data.examples.map((e) => `- ${e}`),
    ``,
    `**Depth:** ${data.depth}`,
    ``,
    `---`,
    `Source: Amy Mayernik (https://lfgamy.com)`,
  ].join("\n");
  return { content: [{ type: "text", text }] };
}

/**
 * Tool: get_case_study
 * Return the full content of a named case study.
 */
export function getCaseStudy(args: { case_study: string }): ToolResult {
  if (!args.case_study) {
    return {
      content: [{ type: "text", text: "Error: missing 'case_study' argument. Available: 'the-vault', 'field-marketing-system'." }],
      isError: true,
    };
  }
  const slug = args.case_study.toLowerCase().trim().replace(/^case-study:\/\//, "");
  let content: string;
  switch (slug) {
    case "the-vault":
    case "vault":
      content = CASE_STUDY_VAULT;
      break;
    case "field-marketing-system":
    case "system":
    case "field-marketing":
      content = CASE_STUDY_SYSTEM;
      break;
    default:
      return {
        content: [
          {
            type: "text",
            text: `No case study named "${args.case_study}". Available: 'the-vault' (Eigen Labs hacker house series), 'field-marketing-system' (operating function under the events).`,
          },
        ],
        isError: true,
      };
  }
  return { content: [{ type: "text", text: content }] };
}

/**
 * Tool: check_role_fit
 * Score a job description against Amy's profile.
 *
 * Note: This is a heuristic match (keyword-based). For a richer LLM-judged
 * assessment, a hosted version of this server could call Claude with the JD
 * and Amy's profile as context. The heuristic version is intentionally
 * conservative and clearly marked as a starting-point assessment.
 */
export function checkRoleFit(args: { jd_text: string; company?: string }): ToolResult {
  if (!args.jd_text || args.jd_text.length < 50) {
    return {
      content: [{ type: "text", text: "Error: 'jd_text' must be at least 50 characters." }],
      isError: true,
    };
  }
  const jd = args.jd_text.toLowerCase();
  const company = args.company ?? "the company";

  // Strong signals — phrases that map cleanly to Amy's experience
  const strongSignals: Array<[string, string[]]> = [
    ["Build-from-zero field marketing function", ["build", "from scratch", "first dedicated", "no established process", "zero"]],
    ["Multi-format event expertise (flagships, hacker houses, dinners)", ["flagship", "hacker", "executive dinner", "unconference", "roundtable", "workshop"]],
    ["ABM event strategy + named-account targeting", ["abm", "account-based", "target account", "named account"]],
    ["Pipeline attribution and forecasting", ["pipeline", "attribution", "sourced", "influenced", "forecast", "roi"]],
    ["Developer / technical audience fluency", ["developer", "technical", "engineer", "devrel", "builder", "platform"]],
    ["Cross-functional GTM coordination", ["cross-functional", "sales alignment", "bdr", "demand gen", "partnerships", "comms"]],
    ["Global execution across regions", ["global", "international", "regions", "north america", "emea", "apac"]],
    ["Documentation-first operating model", ["scalable", "repeatable", "playbook", "process", "documentation"]],
    ["Executive program design", ["executive", "c-suite", "senior leader", "vp", "cto"]],
    ["Vendor + venue + budget management", ["vendor", "venue", "budget", "logistics", "sponsorship"]],
    ["Marketing engineering / AI systems (certified Marketing Engineer, Profound)", ["ai agent", "agentic", "llm", "claude", "gpt", "mcp", "prompt", "ai workflow", "ai-powered", "generative ai"]],
    ["Marketing operations & systems design", ["marketing operations", "marketing ops", "revenue operations", "revops", "workflow", "systems", "operational", "intake", "tooling"]],
    ["Marketing automation & martech", ["automation", "automate", "martech", "tech stack", "integration", "salesforce", "hubspot", "marketo", "zapier", "airtable", "notion"]],
    ["Fintech / crypto ecosystem experience (zkSync, Coinbase, Robinhood, PayPal, Crypto.com)", ["fintech", "payments", "financial services", "crypto", "web3", "trading", "banking", "regulated"]],
  ];

  const met: string[] = [];
  const stretches: string[] = [];

  for (const [capability, keywords] of strongSignals) {
    const matchCount = keywords.filter((kw) => jd.includes(kw)).length;
    if (matchCount >= 2) met.push(capability);
    else if (matchCount === 1) stretches.push(capability);
  }

  // Years-of-experience check
  const yearsMatch = jd.match(/(\d+)\+?\s*years/);
  let yearsLine = "";
  if (yearsMatch) {
    const yearsRequired = parseInt(yearsMatch[1], 10);
    if (yearsRequired <= 20) {
      yearsLine = `\n**Years requirement:** ${yearsRequired}+ years required. Amy: 20 years. ✓ Exceeds.`;
    } else {
      yearsLine = `\n**Years requirement:** ${yearsRequired}+ years required. Amy: 20 years. ⚠ Below requirement.`;
    }
  }

  // Specific gap detection
  const gaps: string[] = [];
  if (jd.includes("salesforce") || jd.includes("hubspot") || jd.includes("marketo") || jd.includes("6sense")) {
    gaps.push("Specific martech tools named (Salesforce/HubSpot/Marketo/6sense) — Amy has cross-tool fluency and builds automations and AI workflows across stacks; confirm depth on the exact tools named.");
  }
  if (jd.includes("san francisco") && jd.includes("office")) {
    gaps.push("SF in-office requirement — Amy currently Vegas-based; willingness to relocate is a conversation, not an automatic yes.");
  }

  // Compose result
  const lines: string[] = [
    `# Role Fit Assessment — ${company}`,
    `**Generated by:** Amy Mayernik MCP portfolio (heuristic match)`,
    `**Availability:** Amy is available now — open to full-time and fractional/contract roles across field & event marketing leadership, marketing engineering, and marketing operations.`,
    yearsLine,
    "",
    "## ✓ Requirements Amy clearly meets",
    ...(met.length > 0 ? met.map((m) => `- ${m}`) : ["- (none found by heuristic; consider running search_artifacts with specific terms)"]),
    "",
    "## ⚠ Stretches / partial matches",
    ...(stretches.length > 0 ? stretches.map((s) => `- ${s}`) : ["- (none)"]),
    "",
    "## ⚠ Gaps / conversation items",
    ...(gaps.length > 0 ? gaps.map((g) => `- ${g}`) : ["- (none flagged by heuristic)"]),
    "",
    "## Suggested cover-letter angles",
    `- Lead with the build-from-zero motion if ${company} is hiring its first field marketing lead`,
    `- For marketing engineering / ops / AI roles, lead with the shipped systems: production AI agents, a live MCP server, version-controlled skill libraries — plus the Profound Marketing Engineer certification and four Anthropic Academy certifications`,
    `- Anchor to ${company}'s specific verticals + customer roster (cite real customer names)`,
    `- Reference Amy's dual perspective: in-house operator AND founder of Dott (Event Portfolio Intelligence)`,
    `- Frame "events are the real-world trust layer" as her organizing thesis`,
    "",
    "---",
    "**Note:** This is a heuristic keyword-match assessment. For deeper analysis, fetch the full profile via resource skill://amy-mayernik and reason about fit with Claude directly.",
  ];

  return { content: [{ type: "text", text: lines.filter((l) => l !== "").join("\n") }] };
}

/**
 * Tool: search_artifacts
 * Search across all portfolio content for a query.
 */
export function searchArtifacts(args: { query: string; limit?: number }): ToolResult {
  if (!args.query || args.query.length < 2) {
    return {
      content: [{ type: "text", text: "Error: 'query' must be at least 2 characters." }],
      isError: true,
    };
  }
  const q = args.query.toLowerCase();
  const limit = args.limit ?? 5;
  const results: Array<{ uri: string; excerpt: string; score: number }> = [];

  for (const [uri, content] of Object.entries(ALL_CONTENT)) {
    const lowerContent = content.toLowerCase();
    if (!lowerContent.includes(q)) continue;

    // Build excerpt around first match
    const idx = lowerContent.indexOf(q);
    const start = Math.max(0, idx - 80);
    const end = Math.min(content.length, idx + q.length + 200);
    const excerpt = (start > 0 ? "…" : "") + content.slice(start, end) + (end < content.length ? "…" : "");

    // Score = number of matches
    let score = 0;
    let searchIdx = 0;
    while ((searchIdx = lowerContent.indexOf(q, searchIdx)) !== -1) {
      score++;
      searchIdx += q.length;
    }
    results.push({ uri, excerpt: excerpt.trim(), score });
  }

  results.sort((a, b) => b.score - a.score);
  const topResults = results.slice(0, limit);

  if (topResults.length === 0) {
    return {
      content: [
        {
          type: "text",
          text: `No matches found for "${args.query}". Try a broader term, or fetch a specific resource (e.g., skill://amy-mayernik, case-study://the-vault).`,
        },
      ],
    };
  }

  const text = [
    `# Search results for "${args.query}"`,
    `Found ${results.length} match${results.length === 1 ? "" : "es"} across portfolio content. Showing top ${topResults.length}.`,
    "",
    ...topResults.flatMap((r) => [`## ${r.uri} (${r.score} match${r.score === 1 ? "" : "es"})`, "", r.excerpt, ""]),
  ].join("\n");

  return { content: [{ type: "text", text }] };
}

/**
 * Resource fetcher
 */
export function readResource(uri: string): { contents: Array<{ uri: string; mimeType: string; text: string }> } | null {
  const content = ALL_CONTENT[uri];
  if (!content) return null;
  return {
    contents: [
      {
        uri,
        mimeType: "text/markdown",
        text: content,
      },
    ],
  };
}

/**
 * Tool registry — used by both stdio and HTTP entry points
 */
export const TOOL_DEFINITIONS = [
  {
    name: "get_capability",
    description:
      "Look up Amy's depth and demonstrated experience on a specific field marketing, events, marketing engineering, or marketing operations capability (e.g., 'hacker houses', 'ABM event strategy', 'pipeline attribution', 'marketing engineering', 'ai agents', 'mcp servers', 'marketing operations'). Returns years of practice, companies where it was applied, example artifacts, and depth narrative.",
    inputSchema: {
      type: "object" as const,
      properties: {
        capability: {
          type: "string",
          description: "The capability to look up. Free-form text; the server will fuzzy-match against the profile.",
        },
      },
      required: ["capability"],
    },
  },
  {
    name: "get_case_study",
    description:
      "Return the full content of a named case study. Available: 'the-vault' (Eigen Labs hacker house series), 'field-marketing-system' (the operating function under the events).",
    inputSchema: {
      type: "object" as const,
      properties: {
        case_study: {
          type: "string",
          enum: ["the-vault", "field-marketing-system"],
          description: "Slug of the case study to return",
        },
      },
      required: ["case_study"],
    },
  },
  {
    name: "check_role_fit",
    description:
      "Score a job description against Amy's portfolio. Returns ✓ met / ⚠ stretches / ✗ gaps assessment plus suggested cover-letter angles. Heuristic match — for deeper analysis, fetch skill://amy-mayernik and reason with Claude directly.",
    inputSchema: {
      type: "object" as const,
      properties: {
        jd_text: {
          type: "string",
          description: "Full text of the job description (min 50 chars)",
        },
        company: {
          type: "string",
          description: "Company name, used for personalization",
        },
      },
      required: ["jd_text"],
    },
  },
  {
    name: "search_artifacts",
    description:
      "Search across all portfolio content — case studies, philosophy, and the structured SKILL profile — for a query. Returns ranked excerpts with resource URIs.",
    inputSchema: {
      type: "object" as const,
      properties: {
        query: {
          type: "string",
          description: "Search query (min 2 chars)",
        },
        limit: {
          type: "integer",
          default: 5,
          description: "Max results",
        },
      },
      required: ["query"],
    },
  },
];

export const RESOURCE_DEFINITIONS = [
  { uri: "skill://amy-mayernik", name: "Structured profile (SKILL.md)", description: "Anthropic open SKILL.md format. Full structured profile.", mimeType: "text/markdown" },
  { uri: "case-study://the-vault", name: "Case Study — The Vault Hacker House Series", description: "Eigen Labs' 2025 multi-city hand-curated developer experience.", mimeType: "text/markdown" },
  { uri: "case-study://field-marketing-system", name: "Case Study — The Field Marketing & Events System", description: "The operating function under the events.", mimeType: "text/markdown" },
  { uri: "philosophy://behind-the-scenes", name: "Behind the Scenes — how Amy works", description: "Philosophy and operating approach.", mimeType: "text/markdown" },
];

export const PROMPT_DEFINITIONS = [
  {
    name: "candidate-summary",
    description: "Generate a short summary of why Amy is a fit for a given role.",
    arguments: [
      { name: "role_title", description: "The role being hired for", required: true },
      { name: "audience", description: "Who's reading (recruiter / hiring manager / VP)", required: false },
    ],
  },
  {
    name: "interview-prep",
    description: "Generate 5 thoughtful interview questions Amy might want to ask.",
    arguments: [
      { name: "company", description: "Target company", required: true },
      { name: "role", description: "Role title", required: true },
    ],
  },
];

export function getPrompt(name: string, args: Record<string, string>): { description: string; messages: Array<{ role: "user"; content: { type: "text"; text: string } }> } | null {
  if (name === "candidate-summary") {
    const audience = args.audience ?? "hiring manager";
    return {
      description: `Candidate summary for ${args.role_title} (audience: ${audience})`,
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `You are reviewing Amy Mayernik's candidacy for the role of "${args.role_title}". The audience for this summary is a ${audience}.\n\nUse the resource skill://amy-mayernik to fetch Amy's structured profile, then write a 150-200 word summary tailored to the audience. Focus on the 2-3 strongest fit signals and what they should expect from working with her.`,
          },
        },
      ],
    };
  }
  if (name === "interview-prep") {
    return {
      description: `Interview questions for Amy to ask ${args.company} (${args.role})`,
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `Amy Mayernik is interviewing at ${args.company} for the role of ${args.role}.\n\nUsing her profile (skill://amy-mayernik) and her case studies (case-study://the-vault, case-study://field-marketing-system), generate 5 thoughtful interview questions she should ask. The questions should:\n1. Reveal genuine curiosity about ${args.company}'s field marketing maturity\n2. Surface information she'd actually need to do the job well\n3. Demonstrate her depth without being performative\n4. Open up conversation about the first 90 days\n5. Probe for cultural / team-fit signals`,
          },
        },
      ],
    };
  }
  return null;
}
