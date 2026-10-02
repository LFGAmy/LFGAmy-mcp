// src/llm.ts
// Optional LLM layer for the MCP server. Adds real reasoning to check_role_fit
// and powers the new `ask` tool. Fails GRACEFULLY: if no key is set or the API
// errors, callers fall back to the existing heuristic/keyword behavior, so the
// server never breaks in production.

const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";

export class NoLLMKeyError extends Error {
  constructor() {
    super("ANTHROPIC_API_KEY not set");
    this.name = "NoLLMKeyError";
  }
}

/**
 * Call Claude with a system prompt and a single user message.
 * Reads ANTHROPIC_API_KEY (required) and ANTHROPIC_MODEL (optional).
 * Throws NoLLMKeyError when no key is configured, so callers can fall back.
 */
export async function callClaude(system: string, user: string, maxTokens = 900): Promise<string> {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) throw new NoLLMKeyError();

  // Set ANTHROPIC_MODEL in Vercel to the exact model you have access to.
  // A small/fast model keeps cost low (a fraction of a cent per query).
  const model = process.env.ANTHROPIC_MODEL || "claude-haiku-4-5-20251001";

  const res = await fetch(ANTHROPIC_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": key,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      temperature: 0, // same question, same answer
      system,
      messages: [{ role: "user", content: user }],
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Anthropic API ${res.status}: ${body.slice(0, 300)}`);
  }

  const data: any = await res.json();
  const text = (data?.content ?? [])
    .filter((b: any) => b?.type === "text")
    .map((b: any) => b.text)
    .join("\n")
    .trim();

  if (!text) throw new Error("Empty LLM response");
  return text;
}
