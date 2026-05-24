/**
 * Vercel serverless function — remote MCP server over HTTP/SSE.
 *
 * Endpoint: https://mcp.lfgamy.com (rewrites everything to /api/index per vercel.json)
 *
 * Connect from Claude.ai:
 *   Settings → Connectors → Add custom MCP server → URL: https://mcp.lfgamy.com
 *
 * Connect from Claude Code:
 *   { "mcpServers": { "amy-mayernik-remote": { "url": "https://mcp.lfgamy.com" } } }
 *
 * MCP Streamable HTTP transport:
 *   - POST → client sends a JSON-RPC request; server returns a JSON-RPC response
 *   - GET (with text/event-stream Accept) → SSE keep-alive (no server push, just heartbeat)
 *   - GET (with text/html or other Accept) → friendly human-and-machine discovery page
 */

import type { VercelRequest, VercelResponse } from "@vercel/node";
import {
  TOOL_DEFINITIONS,
  RESOURCE_DEFINITIONS,
  PROMPT_DEFINITIONS,
  getCapability,
  getCaseStudy,
  checkRoleFit,
  searchArtifacts,
  readResource,
  getPrompt,
} from "../src/tools.js";

interface JsonRpcRequest {
  jsonrpc: "2.0";
  id?: string | number | null;
  method: string;
  params?: any;
}

interface JsonRpcResponse {
  jsonrpc: "2.0";
  id: string | number | null;
  result?: any;
  error?: { code: number; message: string; data?: any };
}

const SERVER_INFO = {
  name: "amy-mayernik",
  version: "1.0.0",
  description:
    "MCP server for Amy Mayernik — field marketing & events leader and founder of Dott. Tools and resources for agents to query her capabilities, case studies, philosophy, and role-fit.",
};

const PROTOCOL_VERSION = "2024-11-05";

/**
 * JSON-RPC handler. Dispatches MCP methods to local tool implementations.
 * Pure logic — no runtime-specific code, identical to the Workers version.
 */
async function handleRpc(request: JsonRpcRequest): Promise<JsonRpcResponse> {
  const id = request.id ?? null;

  try {
    switch (request.method) {
      case "initialize":
        return {
          jsonrpc: "2.0",
          id,
          result: {
            protocolVersion: PROTOCOL_VERSION,
            capabilities: {
              tools: {},
              resources: {},
              prompts: {},
            },
            serverInfo: SERVER_INFO,
          },
        };

      case "notifications/initialized":
        return { jsonrpc: "2.0", id, result: {} };

      case "tools/list":
        return {
          jsonrpc: "2.0",
          id,
          result: { tools: TOOL_DEFINITIONS },
        };

      case "tools/call": {
        const { name, arguments: args = {} } = request.params;
        let result;
        switch (name) {
          case "get_capability":
            result = getCapability(args);
            break;
          case "get_case_study":
            result = getCaseStudy(args);
            break;
          case "check_role_fit":
            result = checkRoleFit(args);
            break;
          case "search_artifacts":
            result = searchArtifacts(args);
            break;
          default:
            return {
              jsonrpc: "2.0",
              id,
              error: { code: -32601, message: `Unknown tool: ${name}` },
            };
        }
        return { jsonrpc: "2.0", id, result };
      }

      case "resources/list":
        return {
          jsonrpc: "2.0",
          id,
          result: { resources: RESOURCE_DEFINITIONS },
        };

      case "resources/read": {
        const result = readResource(request.params.uri);
        if (!result) {
          return {
            jsonrpc: "2.0",
            id,
            error: {
              code: -32602,
              message: `Resource not found: ${request.params.uri}`,
            },
          };
        }
        return { jsonrpc: "2.0", id, result };
      }

      case "prompts/list":
        return {
          jsonrpc: "2.0",
          id,
          result: { prompts: PROMPT_DEFINITIONS },
        };

      case "prompts/get": {
        const result = getPrompt(
          request.params.name,
          request.params.arguments ?? {}
        );
        if (!result) {
          return {
            jsonrpc: "2.0",
            id,
            error: {
              code: -32602,
              message: `Prompt not found: ${request.params.name}`,
            },
          };
        }
        return { jsonrpc: "2.0", id, result };
      }

      default:
        return {
          jsonrpc: "2.0",
          id,
          error: { code: -32601, message: `Method not found: ${request.method}` },
        };
    }
  } catch (err: any) {
    return {
      jsonrpc: "2.0",
      id,
      error: {
        code: -32603,
        message: `Internal error: ${err?.message ?? String(err)}`,
      },
    };
  }
}

/**
 * Set the CORS headers that allow Claude.ai (and other browsers) to connect cross-origin.
 */
function setCors(res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Mcp-Session-Id, Mcp-Protocol-Version"
  );
  res.setHeader("Access-Control-Expose-Headers", "Mcp-Session-Id");
}

/**
 * Vercel serverless handler.
 * Single entry point — vercel.json rewrites all paths to /api/index, so we
 * dispatch based on request.method here.
 */
export default async function handler(
  req: VercelRequest,
  res: VercelResponse
): Promise<void> {
  setCors(res);

  // ----- CORS preflight -----
  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }

  // ----- GET — discovery page (human or machine) -----
  if (req.method === "GET") {
    const accept = (req.headers["accept"] as string | undefined) ?? "";

    // SSE keep-alive stream — Claude.ai opens this for server-initiated messages.
    // Vercel serverless functions can't hold a long-lived SSE connection (10-60s timeout),
    // so we send an initial connected event and a couple of keep-alives then close.
    // Claude.ai handles re-connection automatically.
    if (accept.includes("text/event-stream")) {
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache, no-transform");
      res.setHeader("Connection", "keep-alive");
      res.status(200);
      res.write(": connected\n\n");
      // Send a few keep-alive pings then close (Vercel will time out anyway).
      for (let i = 0; i < 3; i++) {
        await new Promise((resolve) => setTimeout(resolve, 8000));
        try {
          res.write(": ping\n\n");
        } catch {
          break;
        }
      }
      res.end();
      return;
    }

    // Friendly discovery page — HTML for humans, JSON for machines.
    const discovery = renderDiscoveryPage();
    if (accept.includes("text/html")) {
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      res.status(200).send(discovery.html);
      return;
    }
    res.setHeader("Content-Type", "application/json");
    res.status(200).send(JSON.stringify(discovery.json, null, 2));
    return;
  }

  // ----- POST — JSON-RPC request -----
  if (req.method === "POST") {
    let body: any = req.body;
    // Vercel's body parser usually does the JSON parse for us; defensively re-parse if a string slipped through.
    if (typeof body === "string") {
      try {
        body = JSON.parse(body);
      } catch {
        res
          .status(400)
          .setHeader("Content-Type", "application/json")
          .send(
            JSON.stringify({
              jsonrpc: "2.0",
              id: null,
              error: { code: -32700, message: "Parse error" },
            })
          );
        return;
      }
    }

    res.setHeader("Content-Type", "application/json");

    // JSON-RPC supports both single requests and batched arrays.
    if (Array.isArray(body)) {
      const responses = await Promise.all(body.map((r) => handleRpc(r)));
      res.status(200).send(JSON.stringify(responses));
      return;
    }

    const response = await handleRpc(body);
    res.status(200).send(JSON.stringify(response));
    return;
  }

  // ----- Unsupported method -----
  res.status(405).send("Method not allowed");
}

/**
 * Discovery page rendered at the root URL — human-readable AND machine-discoverable.
 * Same content as the Workers version, dual-content (HTML or JSON via Accept header).
 */
function renderDiscoveryPage(): { html: string; json: object } {
  const json = {
    name: SERVER_INFO.name,
    version: SERVER_INFO.version,
    description: SERVER_INFO.description,
    protocol: "Model Context Protocol",
    protocolVersion: PROTOCOL_VERSION,
    transports: [
      "streamable-http (this endpoint)",
      "stdio (via npx @amy-mayernik/mcp-profile)",
    ],
    tools: TOOL_DEFINITIONS.map((t) => ({
      name: t.name,
      description: t.description,
    })),
    resources: RESOURCE_DEFINITIONS.map((r) => ({ uri: r.uri, name: r.name })),
    prompts: PROMPT_DEFINITIONS.map((p) => ({
      name: p.name,
      description: p.description,
    })),
    portfolio: "https://lfgamy.com",
    contact: "collab@lfgamy.com",
  };

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Amy Mayernik — MCP Server</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="robots" content="noindex, nofollow">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; max-width: 720px; margin: 60px auto; padding: 0 24px; line-height: 1.6; color: #1F1F1F; background: #FFFAF2; }
    h1 { font-size: 28px; margin-bottom: 8px; }
    .subtitle { color: #666; font-size: 14px; margin-bottom: 32px; }
    pre { background: #FFFFFF; border: 1.5px solid #E5DCC5; border-radius: 8px; padding: 16px; overflow-x: auto; font-size: 12px; line-height: 1.4; }
    code { background: #FFE8F0; padding: 2px 6px; border-radius: 3px; font-size: 13px; }
    h2 { margin-top: 32px; font-size: 18px; border-bottom: 2px dashed #F8A0C2; padding-bottom: 6px; }
    .badge { display: inline-block; background: #1F1F1F; color: #FFD93D; padding: 4px 10px; border-radius: 4px; font-family: monospace; font-size: 11px; font-weight: 700; letter-spacing: 1.5px; }
    .footer { margin-top: 48px; padding-top: 16px; border-top: 1px dashed #ccc; font-size: 11px; color: #999; }
    a { color: #FF8C42; }
  </style>
</head>
<body>
  <div class="badge">⚡ MCP PROFILE SERVER</div>
  <h1>Amy Mayernik — MCP Server</h1>
  <p class="subtitle">Remote MCP server exposing Amy's profile as queryable tools and resources — capabilities, case studies, philosophy, and role-fit. Built for the agent era.</p>

  <h2>Connect from Claude.ai</h2>
  <ol>
    <li>Settings → Connectors → Add custom MCP server</li>
    <li>Paste this URL: <code>https://mcp.lfgamy.com</code></li>
    <li>Ask Claude: <em>"What's Amy's depth on hacker houses?"</em> or <em>"Score this JD against Amy's profile."</em></li>
  </ol>

  <h2>Connect from Claude Code</h2>
  <pre>{
  "mcpServers": {
    "amy-mayernik": {
      "url": "https://mcp.lfgamy.com"
    }
  }
}</pre>

  <h2>Connect locally (stdio)</h2>
  <pre>{
  "mcpServers": {
    "amy-mayernik": {
      "command": "npx",
      "args": ["@amy-mayernik/mcp-profile"]
    }
  }
}</pre>

  <h2>Available tools</h2>
  <ul>
    ${TOOL_DEFINITIONS.map(
      (t) => `<li><strong>${t.name}</strong> — ${t.description.split(/(?<=\.)\s+(?=[A-Z])/)[0]}</li>`
    ).join("\n    ")}
  </ul>

  <h2>Available resources</h2>
  <ul>
    ${RESOURCE_DEFINITIONS.map(
      (r) => `<li><code>${r.uri}</code> — ${r.name}</li>`
    ).join("\n    ")}
  </ul>

  <h2>Machine-readable manifest</h2>
  <p>Fetch this URL with <code>Accept: application/json</code> to get the structured server info.</p>

  <div class="footer">
    © 2026 Amy Mayernik · LFG Events. Frameworks shown are demonstrated, not licensed. Substance lives in Dott™. Trademarks pending.<br>
    Built on Vercel using <a href="https://modelcontextprotocol.io">Model Context Protocol</a>.
  </div>
</body>
</html>`;

  return { html, json };
}
