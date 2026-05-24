#!/usr/bin/env node
/**
 * Stdio MCP server entry point.
 * For local installation via `npx @amy-mayernik/mcp-profile`.
 *
 * Add to Claude Code or Claude Desktop config:
 * {
 *   "mcpServers": {
 *     "amy-mayernik": {
 *       "command": "npx",
 *       "args": ["@amy-mayernik/mcp-profile"]
 *     }
 *   }
 * }
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
  ListPromptsRequestSchema,
  GetPromptRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

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
} from "./tools.js";

const server = new Server(
  {
    name: "amy-mayernik",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
      resources: {},
      prompts: {},
    },
  }
);

// ===== Tools =====
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: TOOL_DEFINITIONS,
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args = {} } = request.params;
  switch (name) {
    case "get_capability":
      return getCapability(args as { capability: string });
    case "get_case_study":
      return getCaseStudy(args as { case_study: string });
    case "check_role_fit":
      return checkRoleFit(args as { jd_text: string; company?: string });
    case "search_artifacts":
      return searchArtifacts(args as { query: string; limit?: number });
    default:
      return {
        content: [{ type: "text", text: `Unknown tool: ${name}` }],
        isError: true,
      };
  }
});

// ===== Resources =====
server.setRequestHandler(ListResourcesRequestSchema, async () => ({
  resources: RESOURCE_DEFINITIONS,
}));

server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const result = readResource(request.params.uri);
  if (!result) {
    throw new Error(`Resource not found: ${request.params.uri}`);
  }
  return result;
});

// ===== Prompts =====
server.setRequestHandler(ListPromptsRequestSchema, async () => ({
  prompts: PROMPT_DEFINITIONS,
}));

server.setRequestHandler(GetPromptRequestSchema, async (request) => {
  const result = getPrompt(request.params.name, request.params.arguments ?? {});
  if (!result) {
    throw new Error(`Prompt not found: ${request.params.name}`);
  }
  return result;
});

// ===== Start =====
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Amy Mayernik MCP server running on stdio.");
  console.error("Tools available: get_capability, get_case_study, check_role_fit, search_artifacts");
  console.error("Resources: skill://amy-mayernik, case-study://the-vault, case-study://field-marketing-system, philosophy://behind-the-scenes");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
