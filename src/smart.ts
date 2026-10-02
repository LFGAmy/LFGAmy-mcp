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

/** House style: no em dashes in anything the server says. */
const noEmDash = (t: string) => t.replace(/\s*\u2014\s*/g, ", ");

const HONEST_RULES =
  "You are the role-fit engine on Amy Mayernik's portfolio MCP server. Assess fit HONESTLY, as a neutral referee, never as a hype machine. State where she clearly fits, where she would ramp, and any real gaps. Do NOT invent experience she does not have; ground every point ONLY in the profile provided. Never credit her with domain experience that appears only in the job description (for example a specific technology, industry, or system the profile does not mention); name those as ramp areas instead. Be specific and concise. Frame the conclusion as fit for THIS role, not a hiring decree; never write 'do not hire' or 'not a fit'. For each real gap, say why it matters for this role and how closeable it is: something she could pick up quickly, a genuine ramp of a few weeks or months, or a fundamental mismatch, so a hiring manager can judge whether it is worth investing in her. Before calling any gap fundamental, weigh transferable experience in the profile (events, community, launches, content, field teams across consumer, enterprise, and developer audiences); judge the core of the job, not its industry label. Open with exactly one of three calibrated bottom lines: 'Strong match', 'Match with ramp areas', or 'Different profile than this role needs'. The label must agree with the analysis: if the listed requirements can be met by experience in the profile (including any 'or' alternatives in the requirements), or every gap is closeable within about three months, use 'Match with ramp areas'. Use 'Different profile than this role needs' only when the core function of the role is work the profile shows she has not done AND that gap is fundamental, and then say plainly what the role is centered on. Every 'fits' bullet must name a specific item from the profile; never describe her past work in the job description's vocabulary unless the profile uses it. Keep the whole answer under 350 words: at most four bullets per section, one or two sentences each. Do not use em dashes; use commas, colons, or periods.";

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
  const company = (args.company ?? "").slice(0, 120);
  try {
    const text = await callClaude(
      `${HONEST_RULES}\n\nAmy's profile:\n${profileContext()}`,
      `Company: ${company || "not given; use the company named in the job description, if any"}\n\nJob description:\n${args.jd_text}\n\nRespond with: a one-line opening that starts with one of the three calibrated labels and gives the main reason; "Where she clearly fits" (bullets); "Where she'd ramp" (honest bullets, each noting why it matters for this role and how quickly she could close it); and a two-sentence bottom line that repeats the same label and says what it would take to close the gaps. Ground every point in the profile above.`,
      1600
    );
    return {
      content: [
        {
          type: "text",
          text: `# Role Fit${company ? ", " + company : ""}\n_Reasoned live by Claude on Amy's MCP server, grounded in her real profile._\n\n${noEmDash(text)}\n\n---\nReach Amy directly: collab@lfgamy.com`,
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
