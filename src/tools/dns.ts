import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { addCNAMERecord, getCNAMERecord, deleteCNAMERecord } from "../utils/godaddy.js";
import type { CNAMERecord } from "../types/index.js";

export function registerAddCNAMERecordTool(server: McpServer): void {
  server.tool(
    "addCNAMERecord",
    "Add a CNAME record to a GoDaddy domain",
    {
      domain: z.string().describe("The domain to add the CNAME record to (e.g., example.com)"),
      subdomain: z.string().describe("The CNAME subdomain (e.g., blog for blog.example.com)"),
      target: z.string().describe("The CNAME target domain (e.g., target.example.com)"),
      ttl: z.number().optional().default(3600).describe("TTL in seconds (default: 3600)"),
    },
    async ({ domain, subdomain, target, ttl }) => {
      const result = await addCNAMERecord(domain, subdomain, target, ttl);

      if (!result.success) {
        return {
          content: [{ type: "text" as const, text: `Failed to add CNAME record: ${result.error}` }],
          isError: true,
        };
      }

      return {
        content: [
          {
            type: "text" as const,
            text: `Successfully added CNAME record: ${subdomain}.${domain} -> ${target} (TTL: ${ttl})`,
          },
        ],
      };
    }
  );
}

export function registerDeleteCNAMERecordTool(server: McpServer): void {
  server.tool(
    "deleteCNAMERecord",
    "Delete a CNAME record from a GoDaddy domain (requires confirmation)",
    {
      domain: z.string().describe("The domain where the CNAME record exists (e.g., example.com)"),
      subdomain: z.string().describe("The CNAME subdomain to delete (e.g., blog for blog.example.com)"),
      confirm: z.boolean().optional().default(false).describe("Confirmation to delete the record"),
    },
    async ({ domain, subdomain, confirm }) => {
      const getResult = await getCNAMERecord(domain, subdomain);

      if (!getResult.success) {
        return {
          content: [{ type: "text" as const, text: `Failed to fetch CNAME record: ${getResult.error}` }],
          isError: true,
        };
      }

      const records = getResult.data as CNAMERecord[];

      if (!records || records.length === 0) {
        return {
          content: [{ type: "text" as const, text: `No CNAME record found for ${subdomain}.${domain}` }],
        };
      }

      if (!confirm) {
        return {
          content: [
            {
              type: "text" as const,
              text: `Found CNAME record to delete:\n${JSON.stringify(records, null, 2)}\n\nTo confirm deletion, call this tool again with confirm: true`,
            },
          ],
        };
      }

      const deleteResult = await deleteCNAMERecord(domain, subdomain);

      if (!deleteResult.success) {
        return {
          content: [{ type: "text" as const, text: `Failed to delete CNAME record: ${deleteResult.error}` }],
          isError: true,
        };
      }

      return {
        content: [{ type: "text" as const, text: `Successfully deleted CNAME record: ${subdomain}.${domain}` }],
      };
    }
  );
}
