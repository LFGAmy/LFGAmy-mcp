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
          text: `# Role Fit${company ? ", " + company : ""}\n_Reasoned live by Claude on Amy's MCP server, grounded in her real profile. Every line from the job description and from her profile below is quoted word for word and checked in code._\n\n${noEmDash(renderRoleFit(parsed))}\n\n---\nReach Amy directly: collab@lfgamy.com`,
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
  "role_core": "an EXACT phrase of 3 to 15 words copied character for character from the job description that states what the job is centered on",
  "fits": [ { "requirement": "an EXACT phrase of 2 to 12 words copied character for character from the job description", "evidence": "an EXACT phrase of 3 to 12 words copied character for character from Amy's profile that shows she meets it" } ],
  "ramps": [ { "requirement": "an EXACT phrase of 2 to 12 words copied character for character from the job description that her profile does not show", "close": "quick" | "weeks" | "months" | "fundamental" } ],
  "core_is_new_work": true | false
}
Rules: at most 4 fits and 4 ramps. A fit is only allowed if its requirement phrase appears verbatim in the job description and its evidence phrase appears verbatim in the profile. Never describe her past work using the job description's vocabulary (for example do not call developer events "recruiting events"). "core_is_new_work" is true only if the central function of the job is work the profile shows she has never done. Treat 'or' alternatives in the requirements as satisfied if she meets any one of them. Use "fundamental" only for a gap that would take more than about three months to close.`;

type RoleFit = {
  role_core: string;
  fits: { requirement: string; evidence: string }[];
  ramps: { requirement: string; close: string }[];
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
    .filter((r: any) => r && typeof r.requirement === "string")
    .filter((r: any) => { const q = norm(r.requirement); return q.split(" ").length >= 2 && (!jd || norm(jd).includes(q)); })
    .map((r: any) => ({ requirement: r.requirement, close: CLOSE.has(r.close) ? r.close : "months" }))
    .slice(0, 4);
  const core = String(j.role_core ?? "");
  const coreOk = core && (!jd || norm(jd).includes(norm(core)));
  return { role_core: coreOk ? core : "", fits, ramps, core_is_new_work: j.core_is_new_work === true };
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
  const out: string[] = [`**${label}.**${r.role_core ? " The job description centers on: \"" + r.role_core.trim().replace(/[.:]$/, "") + ".\"" : ""}`];
  if (r.fits.length) {
    out.push("", "## Where she clearly fits");
    for (const f of r.fits) out.push(`- **${f.requirement.trim().replace(/[.:]$/, "")}:** "${f.evidence.trim()}"`);
  }
  if (r.ramps.length) {
    out.push("", "## Where she'd ramp");
    for (const x of r.ramps) out.push(`- **${x.requirement.trim().replace(/[.:]$/, "")}:** not shown in her profile. Closeable: ${CLOSE_TEXT[x.close]}.`);
  }
  const closing =
    label === "Strong match" ? "Her profile covers the core of this role."
    : label === "Match with ramp areas" && r.core_is_new_work ? "The center of this role is newer work for her, but every gap above is closeable within about three months, and the strengths above carry over."
    : label === "Match with ramp areas" ? "The core of the role is covered by work she has done; the ramp areas above are what she would learn on the job."
    : "The center of this role is work her profile does not show yet. Her transferable strengths are listed above.";
  out.push("", `**Bottom line: ${label}.** ${closing}`);
  return out.join("\n");
}

// ---------- ask: every sentence must carry a quote that exists in the content ----------
type AskLine = { sentence: string; quote: string; source: string };

export function parseAsk(raw: string, content: Record<string, string>): AskLine[] {
  const m = raw.match(/\{[\s\S]*\}/);
  if (!m) return [];
  let j: any;
  try { j = JSON.parse(m[0]); } catch { return []; }
  const all = Object.entries(content).map(([uri, c]) => [uri, norm(c)] as const);
  return (Array.isArray(j.answer) ? j.answer : [])
    .filter((a: any) => a && typeof a.sentence === "string" && typeof a.quote === "string")
    .map((a: any) => {
      const qn = norm(a.quote);
      if (qn.split(" ").length < 3) return null;
      const hit = all.find(([, c]) => c.includes(qn));
      return hit ? { sentence: a.sentence.trim(), quote: a.quote.trim(), source: hit[0] } : null;
    })
    .filter(Boolean)
    .slice(0, 5) as AskLine[];
}

export function renderAsk(lines: AskLine[]): string {
  if (!lines.length) return "Her portfolio content does not answer that. Reach Amy directly: collab@lfgamy.com";
  const body = lines.map((l) => `- ${l.sentence}\n  _"${l.quote}" (${l.source})_`).join("\n");
  return `${body}\n\n_Every answer above is paired with a quote from her portfolio, checked in code._`;
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
  // Grounding: the full portfolio content (all of it, so nothing late in a file is lost).
  const grounding = Object.entries(ALL_CONTENT)
    .map(([uri, c]) => `### ${uri}\n${c}`)
    .join("\n\n")
    .slice(0, 24000);
  try {
    const raw = await callClaude(
      "You answer questions about Amy Mayernik using ONLY the portfolio content provided. Be honest and specific, never invent anything. Do not use em dashes. Return ONLY a JSON object, no prose, no code fences: {\"answer\": [ { \"sentence\": \"one plain sentence answering part of the question\", \"quote\": \"an EXACT phrase of 3 to 20 words copied character for character from the content that supports the sentence\", \"source\": \"the resource URI the quote came from\" } ] }. At most 5 sentences. Every sentence must be supported by its quote; do not add claims the quote does not state. If the content does not answer the question, return {\"answer\": []}.",
      `Portfolio content:\n${grounding}\n\nQuestion: ${q}`,
      900
    );
    return { content: [{ type: "text", text: noEmDash(renderAsk(parseAsk(raw, ALL_CONTENT))) }] };
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
