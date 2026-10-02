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
  "You are the role-fit engine on Amy Mayernik's portfolio MCP server. Assess fit HONESTLY, as a neutral referee, never as a hype machine. State where she clearly fits, where she would ramp, and any real gaps. Do NOT invent experience she does not have; ground every point ONLY in the profile provided. Never credit her with domain experience that appears only in the job description (for example a specific technology, industry, or system the profile does not mention); name those as ramp areas instead. Be specific and concise. Frame the conclusion as fit for THIS role, not a hiring decree; never write 'do not hire' or 'not a fit'. For each real gap, say why it matters for this role and how closeable it is: something she could pick up quickly, a genuine ramp of a few weeks or months, or a fundamental mismatch, so a hiring manager can judge whether it is worth investing in her. Before calling any gap fundamental, weigh transferable experience in the profile (events, community, launches, content, field teams across consumer, enterprise, and developer audiences); judge the core of the job, not its industry label. Industry context: she has real fintech and crypto experience (events and programs for Robinhood, PayPal PYUSD, Crypto.com, Coinbase), so never say she lacks a fintech background; name only the specific sub-domain she lacks (for example identity verification or fraud prevention). Do not use em dashes; use commas, colons, or periods.";

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
    const profile = profileContext();
    const raw = await callClaude(
      `${HONEST_RULES}\n\nAmy's profile:\n${profile}`,
      `Company: ${company || "not given; use the company named in the job description, if any"}\n\nJob description:\n${args.jd_text}\n\n${ROLE_FIT_JSON_SPEC}`,
      1600
    );
    const parsed = parseRoleFit(raw, profile, args.jd_text);
    if (!parsed) return checkRoleFit(args);
    return {
      content: [
        {
          type: "text",
          text: `# Role Fit${company ? ", " + company : ""}\n_Reasoned live by Claude on Amy's MCP server, grounded in her real profile. Each strength pairs a line from the job description with the line from her profile that meets it._\n\n${noEmDash(renderRoleFit(parsed))}\n\n---\nReach Amy directly: collab@lfgamy.com`,
        },
      ],
    };
  } catch (e) {
    // Graceful: no key, or API error -> the existing heuristic still answers.
    return checkRoleFit(args);
  }
}


// ---------- Role fit: structured output, checked in code ----------
// The model returns JSON. The code (not the model) verifies every strength
// against the profile, picks the label, and caps the length, so the public
// answer cannot invent experience or contradict itself.

const ROLE_FIT_JSON_SPEC = `Return ONLY a JSON object, no prose, no code fences, in exactly this shape:
{
  "role_core": "one sentence: what this job is centered on",
  "fits": [ { "requirement": "an EXACT phrase of 2 to 12 words copied character for character from the job description", "evidence": "an EXACT phrase of 3 to 12 words copied character for character from Amy's profile that shows she meets it" } ],
  "ramps": [ { "gap": "short name of the requirement she lacks", "why": "one sentence on why it matters for this role", "close": "quick" | "weeks" | "months" | "fundamental" } ],
  "core_is_new_work": true | false
}
Rules: at most 4 fits and 4 ramps. A fit is only allowed if its requirement phrase appears verbatim in the job description and its evidence phrase appears verbatim in the profile. Never describe her past work using the job description's vocabulary (for example do not call developer events "recruiting events"). "core_is_new_work" is true only if the central function of the job is work the profile shows she has never done. Treat 'or' alternatives in the requirements as satisfied if she meets any one of them. Use "fundamental" only for a gap that would take more than about three months to close.`;

type RoleFit = {
  role_core: string;
  fits: { requirement: string; evidence: string }[];
  ramps: { gap: string; why: string; close: string }[];
  core_is_new_work: boolean;
};

const norm = (t: string) => t.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

export function parseRoleFit(raw: string, profile: string, jd = ""): RoleFit | null {
  const m = raw.match(/\{[\s\S]*\}/);
  if (!m) return null;
  let j: any;
  try { j = JSON.parse(m[0]); } catch { return null; }
  const prof = norm(profile);
  const fits = (Array.isArray(j.fits) ? j.fits : [])
    .filter((f: any) => f && typeof f.requirement === "string" && typeof f.evidence === "string")
    .filter((f: any) => { const e = norm(f.evidence); return e.split(" ").length >= 3 && prof.includes(e); })
    .filter((f: any) => { const q = norm(f.requirement); return q.split(" ").length >= 2 && (!jd || norm(jd).includes(q)); })
    .slice(0, 4);
  const CLOSE = new Set(["quick", "weeks", "months", "fundamental"]);
  const ramps = (Array.isArray(j.ramps) ? j.ramps : [])
    .filter((r: any) => r && typeof r.gap === "string" && typeof r.why === "string")
    .map((r: any) => ({ gap: r.gap, why: r.why, close: CLOSE.has(r.close) ? r.close : "months" }))
    .slice(0, 4);
  return { role_core: String(j.role_core ?? ""), fits, ramps, core_is_new_work: j.core_is_new_work === true };
}

export function roleFitLabel(r: RoleFit): string {
  if (r.fits.length === 0) return "Different profile than this role needs";
  if (r.core_is_new_work && r.ramps.some((x) => x.close === "fundamental")) return "Different profile than this role needs";
  if (r.ramps.length === 0 || r.ramps.every((x) => x.close === "quick")) return "Strong match";
  return "Match with ramp areas";
}

const CLOSE_TEXT: Record<string, string> = {
  quick: "quick to pick up",
  weeks: "a few weeks of ramp",
  months: "a ramp of one to three months",
  fundamental: "a fundamental gap, more than three months",
};

export function renderRoleFit(r: RoleFit): string {
  const label = roleFitLabel(r);
  const out: string[] = [`**${label}.**${r.role_core ? " This role is centered on: " + r.role_core.replace(/\.$/, "") + "." : ""}`];
  if (r.fits.length) {
    out.push("", "## Where she clearly fits");
    for (const f of r.fits) out.push(`- **${f.requirement.trim().replace(/[.:]$/, "")}:** "${f.evidence.trim()}"`);
  }
  if (r.ramps.length) {
    out.push("", "## Where she'd ramp");
    for (const x of r.ramps) out.push(`- **${x.gap}:** ${x.why} Closeable: ${CLOSE_TEXT[x.close]}.`);
  }
  const closing =
    label === "Strong match" ? "Her profile covers the core of this role."
    : label === "Match with ramp areas" && r.core_is_new_work ? "The center of this role is newer work for her, but every gap above is closeable within about three months, and the strengths above carry over."
    : label === "Match with ramp areas" ? "The core of the role is covered by work she has done; the ramp areas above are what she would learn on the job."
    : "The center of this role is work her profile does not show yet. Her transferable strengths are listed above.";
  out.push("", `**Bottom line: ${label}.** ${closing}`);
  return out.join("\n");
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
