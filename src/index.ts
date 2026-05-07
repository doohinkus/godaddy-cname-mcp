import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registerAddCNAMERecordTool, registerDeleteCNAMERecordTool } from "./tools/dns.js";

const server = new McpServer({
  name: "godaddy-dns-mcp",
  version: "1.0.0",
});

registerAddCNAMERecordTool(server);
registerDeleteCNAMERecordTool(server);

async function main(): Promise<void> {
  const transport = new StdioServerTransport();

  const shutdown = async (signal: string) => {
    console.error(`Received ${signal}, shutting down gracefully...`);
    await server.close();
    process.exit(0);
  };

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));

  process.on("uncaughtException", (error) => {
    console.error("Uncaught exception:", error);
    process.exit(1);
  });

  process.on("unhandledRejection", (reason) => {
    console.error("Unhandled rejection:", reason);
    process.exit(1);
  });

  try {
    await server.connect(transport);
    console.error("GoDaddy DNS MCP Server running on stdio");
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

main();
