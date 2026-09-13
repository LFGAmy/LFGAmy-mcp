/**
 * Golden-set eval for the LFGAmy MCP tools.
 * Runs the tool functions in-process (no network, no API key) and checks each
 * response contains facts that are TRUE about Amy. A failing case = the server
 * did not surface a fact it should. This is the number you can honestly show.
 *
 * Run:  npx tsx evals/run.ts
 * (Once the intelligent tools are deployed with ANTHROPIC_API_KEY, add cases
 *  that call ask()/checkRoleFitSmart() to grade the reasoned answers too.)
 */
import { getCapability, getCaseStudy, checkRoleFit, searchArtifacts } from "../src/tools.js";
import golden from "./golden.json" with { type: "json" };

const call = (tool: string, args: any): string => {
  const fn: any = {
    get_capability: getCapability,
    get_case_study: getCaseStudy,
    check_role_fit: checkRoleFit,
    search_artifacts: searchArtifacts,
  }[tool];
  if (!fn) throw new Error("Unknown tool in golden set: " + tool);
  return fn(args)?.content?.[0]?.text ?? "";
};

let pass = 0;
const fails: string[] = [];
for (const c of (golden as any).cases) {
  const text = call(c.tool, c.args).toLowerCase();
  const ok = (c.expect_any as string[]).some((s) => text.includes(s.toLowerCase()));
  if (ok) pass++;
  else fails.push(`${c.id} (wanted any of: ${c.expect_any.join(", ")})`);
  console.log((ok ? "PASS" : "FAIL").padEnd(5), c.id);
}
const total = (golden as any).cases.length;
console.log(`\n${pass}/${total} passed (${Math.round((pass / total) * 100)}%)`);
if (fails.length) {
  console.log("\nFailures:");
  fails.forEach((f) => console.log("  - " + f));
  process.exitCode = 1;
}
