// src/smart.ts
// Intelligent versions of the portfolio tools, layered on top of the existing
// heuristic tools. Every function falls back to the current behavior if the LLM
// is unavailable, so the server keeps working with or without a key.

import { callClaude, NoLLMKeyError } from "./llm.js";
import { checkRoleFit, searchArtifacts, type ToolResult } from "./tools.js";
import { SKILL_MD, CAPABILITY_TABLE, ALL_CONTENT } from "./content.js";

/** Compact, grounded profile context the model may reason over. */
function profileContext(): string {
  const caps = Object.entries(CAPABILITY_TABLE)
    .map(([k, v]) => `- ${k}: ${v.years}; applied at ${v.companies.join(", ")}`)
    .join("\n");
  return `${SKILL_MD}\n\n## Capability summary\n${caps}`;
}

const HONEST_RULES =
  "You are the role-fit engine on Amy Mayernik's portfolio MCP server. Assess fit HONESTLY, as a neutral referee, never as a hype machine. State where she clearly fits, where she would ramp, and any real gaps. Do NOT invent experience she does not have; ground every point ONLY in the profile provided. Be specific and concise. Do not use em dashes; use commas, colons, or periods.";

/**
 * check_role_fit, reasoned. Paste a real JD, get an honest, tailored read.
 * Falls back to the heuristic checkRoleFit if the LLM is unavailable.
 */
const MAX_JD = 8000; // cost guard: this is a public endpoint that spends the API key
const MAX_Q = 2000;

export async function checkRoleFitSmart(args: { jd_text: string; company?: string }): Promise<ToolResult> {
  if (!args.jd_text || args.jd_text.length < 50) return checkRoleFit(args);
  // Cap oversized input before it reaches the paid API.
  const jd_text = args.jd_text.slice(0, MAX_JD);
  args = { ...args, jd_text };
  const company = (args.company ?? "the company").slice(0, 120);
  try {
    const text = await callClaude(
      `${HONEST_RULES}\n\nAmy's profile:\n${profileContext()}`,
      `Company: ${company}\n\nJob description:\n${args.jd_text}\n\nRespond with: a one-line bottom line; "Where she clearly fits" (bullets); "Where she'd ramp" (honest bullets); and a short verdict. Ground every point in the profile above.`,
      1000
    );
    return {
      content: [
        {
          type: "text",
          text: `# Role Fit, ${company}\n_Reasoned live by Claude on Amy's MCP server, grounded in her real profile._\n\n${text}\n\n---\nReach Amy directly: collab@lfgamy.com`,
        },
      ],
    };
  } catch (e) {
    // Graceful: no key, or API error -> the existing heuristic still answers.
    return checkRoleFit(args);
  }
}

/**
 * ask: free-text question answered from Amy's real portfolio content (RAG).
 * Falls back to keyword search (searchArtifacts) if the LLM is unavailable.
 */
export async function ask(args: { question: string }): Promise<ToolResult> {
  const q = (args.question ?? "").trim().slice(0, MAX_Q);
  // TEMPORARY diagnostic: `ask "__diag__"` runs the real LLM path and reports OK
  // or the exact error (no secrets). Remove after debugging. Production users
  // never hit this because they don't send "__diag__".
  if (q === "__diag__") {
    const hasKey = !!process.env.ANTHROPIC_API_KEY;
    const model = process.env.ANTHROPIC_MODEL || "claude-3-5-haiku-latest";
    try {
      const t = await callClaude("Reply with the single word OK.", "Say OK.", 10);
      return { content: [{ type: "text", text: `DIAG_OK hasKey=${hasKey} model=${model} reply=${t}` }] };
    } catch (e: any) {
      return { content: [{ type: "text", text: `DIAG_ERR hasKey=${hasKey} model=${model} name=${e?.name || ""} msg=${(e?.message || String(e)).slice(0, 300)}` }] };
    }
  }
  if (q.length < 3) {
    return {
      content: [{ type: "text", text: "Ask a question about Amy's work, e.g. 'has she run developer events in EMEA?' or 'can she build agents?'" }],
      isError: true,
    };
  }
  // Grounding: the full portfolio content, capped so the request stays small.
  const grounding = Object.entries(ALL_CONTENT)
    .map(([uri, c]) => `### ${uri}\n${c.slice(0, 4500)}`)
    .join("\n\n")
    .slice(0, 18000);
  try {
    const text = await callClaude(
      "You answer questions about Amy Mayernik using ONLY the portfolio content provided. Be honest and specific. If the content does not support an answer, say so plainly and do not invent anything. Cite the resource URIs (e.g. case-study://the-vault) you drew from. Do not use em dashes.",
      `Portfolio content:\n${grounding}\n\nQuestion: ${q}`,
      800
    );
    return { content: [{ type: "text", text }] };
  } catch (e) {
    // Graceful: keyword search over the same content.
    return searchArtifacts({ query: q });
  }
}

/** Tool definition to register alongside the existing TOOL_DEFINITIONS. */
export const ASK_TOOL_DEFINITION = {
  name: "ask",
  description:
    "Ask a free-text question about Amy Mayernik (experience, skills, philosophy, specific work) and get an answer grounded in her real portfolio content, with citations. Example: 'Has she run developer events in EMEA?'",
  inputSchema: {
    type: "object" as const,
    properties: {
      question: { type: "string", description: "A natural-language question about Amy's work." },
    },
    required: ["question"],
  },
};
