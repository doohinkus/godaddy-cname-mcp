import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import axios from "axios";
import { z } from "zod";

const getApiBaseUrl = () => {
  const env = process.env.GODADDY_API_ENV || "production";
  return env === "ote"
    ? "https://api.ote-godaddy.com"
    : "https://api.godaddy.com";
};

// Input validation helpers (no lookahead, compatible with all JS envs)
const validateDomain = (domain: string): boolean => {
  const parts = domain.split(".");
  if (parts.length < 2) return false;
  const tld = parts[parts.length - 1];
  if (!/^[a-zA-Z]{2,}$/.test(tld)) return false;
  const domainPart = parts.slice(0, -1).join(".");
  return /^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?$/.test(domainPart);
};

const validateSubdomain = (subdomain: string): boolean => {
  return (
    /^[a-zA-Z0-9_]([a-zA-Z0-9_-]*[a-zA-Z0-9_])?$/.test(subdomain) &&
    subdomain.length <= 63
  );
};

const server = new McpServer({
  name: "godaddy-dns-mcp",
  version: "1.0.0",
});

// Schema for add tool
const addCNAMESchema = {
  domain: z
    .string()
    .describe("Domain to add CNAME record to (e.g., example.com)"),
  subdomain: z
    .string()
    .describe("CNAME subdomain (e.g., blog for blog.example.com)"),
  target: z
    .string()
    .describe("CNAME target domain (e.g., target.example.com)"),
  ttl: z
    .number()
    .optional()
    .default(3600)
    .describe("TTL in seconds (default: 3600)"),
};

server.tool(
  "addCNAMERecord",
  "Add a CNAME record to a GoDaddy-hosted domain and verify the addition",
  addCNAMESchema,
  async ({ domain, subdomain, target, ttl }) => {
    const apiKey = process.env.GODADDY_API_KEY;
    const apiSecret = process.env.GODADDY_API_SECRET;
    if (!apiKey || !apiSecret) {
      return {
        content: [
          {
            type: "text",
            text: "Error: GODADDY_API_KEY and GODADDY_API_SECRET environment variables must be set.",
          },
        ],
        isError: true,
      };
    }

    if (!validateDomain(domain)) {
      return {
        content: [{ type: "text", text: `Error: Invalid domain format: ${domain}` }],
        isError: true,
      };
    }
    if (!validateSubdomain(subdomain)) {
      return {
        content: [{ type: "text", text: `Error: Invalid subdomain format: ${subdomain}` }],
        isError: true,
      };
    }

    const baseUrl = getApiBaseUrl();
    const headers: Record<string, string> = {
      Authorization: `sso-key ${apiKey}:${apiSecret}`,
      "Content-Type": "application/json",
    };
    if (process.env.GODADDY_SHOPPER_ID) {
      headers["X-Shopper-Id"] = process.env.GODADDY_SHOPPER_ID;
    }

    const cnameRecord = { type: "CNAME", name: subdomain, data: target, ttl };

    try {
      const patchRes = await axios.patch(
        `${baseUrl}/v1/domains/${domain}/records`,
        [cnameRecord],
        { headers }
      );

      if (patchRes.status !== 200) {
        return {
          content: [
            {
              type: "text",
              text: `Failed to add CNAME record: API returned status ${patchRes.status}`,
            },
          ],
          isError: true,
        };
      }

      const verifyRes = await axios.get(
        `${baseUrl}/v1/domains/${domain}/records/CNAME/${subdomain}`,
        { headers }
      );

      const added = (verifyRes.data as Array<{ data: string }>).find(
        (r) => r.data === target
      );
      if (added) {
        return {
          content: [
            {
              type: "text",
              text: `Successfully added CNAME: ${subdomain}.${domain} → ${target} (TTL: ${ttl}s). Verified.`,
            },
          ],
        };
      } else {
        return {
          content: [
            {
              type: "text",
              text: `CNAME added (API success) but verification failed. No record matching ${target} found for ${subdomain}.${domain}.`,
            },
          ],
          isError: true,
        };
      }
    } catch (error) {
      let message = "Unknown error";
      if (axios.isAxiosError(error)) {
        const { status, data } = error.response || {};
        message = `GoDaddy API error (${status}): ${JSON.stringify(data)}`;
      } else if (error instanceof Error) {
        message = error.message;
      }
      return {
        content: [{ type: "text", text: `Error: ${message}` }],
        isError: true,
      };
    }
  }
);

// Schema for delete tool
const deleteCNAMESchema = {
  domain: z
    .string()
    .describe("Domain where the CNAME record exists (e.g., example.com)"),
  subdomain: z
    .string()
    .describe("CNAME subdomain to delete (e.g., blog for blog.example.com)"),
};

server.tool(
  "deleteCNAMERecord",
  "Delete a CNAME record from a GoDaddy-hosted domain and verify the removal",
  deleteCNAMESchema,
  async ({ domain, subdomain }) => {
    const apiKey = process.env.GODADDY_API_KEY;
    const apiSecret = process.env.GODADDY_API_SECRET;
    if (!apiKey || !apiSecret) {
      return {
        content: [
          {
            type: "text",
            text: "Error: GODADDY_API_KEY and GODADDY_API_SECRET environment variables must be set.",
          },
        ],
        isError: true,
      };
    }

    if (!validateDomain(domain)) {
      return {
        content: [{ type: "text", text: `Error: Invalid domain format: ${domain}` }],
        isError: true,
      };
    }
    if (!validateSubdomain(subdomain)) {
      return {
        content: [{ type: "text", text: `Error: Invalid subdomain format: ${subdomain}` }],
        isError: true,
      };
    }

    const baseUrl = getApiBaseUrl();
    const headers: Record<string, string> = {
      Authorization: `sso-key ${apiKey}:${apiSecret}`,
      "Content-Type": "application/json",
    };
    if (process.env.GODADDY_SHOPPER_ID) {
      headers["X-Shopper-Id"] = process.env.GODADDY_SHOPPER_ID;
    }

    try {
      // First, get existing records to show what will be deleted
      const getRes = await axios.get(
        `${baseUrl}/v1/domains/${domain}/records/CNAME/${subdomain}`,
        { headers }
      );

      const existingRecords = getRes.data as Array<{ data: string }>;
      if (!existingRecords || existingRecords.length === 0) {
        return {
          content: [
            {
              type: "text",
              text: `No CNAME record found for ${subdomain}.${domain}. Nothing to delete.`,
            },
          ],
        };
      }

      const recordTargets = existingRecords.map((r) => r.data).join(", ");

      // Delete the record
      const deleteRes = await axios.delete(
        `${baseUrl}/v1/domains/${domain}/records/CNAME/${subdomain}`,
        { headers }
      );

      if (deleteRes.status !== 200 && deleteRes.status !== 204) {
        return {
          content: [
            {
              type: "text",
              text: `Failed to delete CNAME record: API returned status ${deleteRes.status}`,
            },
          ],
          isError: true,
        };
      }

      // Verify deletion
      const verifyRes = await axios.get(
        `${baseUrl}/v1/domains/${domain}/records/CNAME/${subdomain}`,
        { headers }
      );

      if (verifyRes.status === 200 && verifyRes.data.length > 0) {
        return {
          content: [
            {
              type: "text",
              text: `CNAME record deleted but verification failed. Records may still exist for ${subdomain}.${domain}.`,
            },
          ],
          isError: true,
        };
      }

      return {
        content: [
          {
            type: "text",
            text: `Successfully deleted CNAME record: ${subdomain}.${domain} → ${recordTargets}. Verified removal.`,
          },
        ],
      };
    } catch (error) {
      let message = "Unknown error";
      if (axios.isAxiosError(error)) {
        const { status, data } = error.response || {};
        message = `GoDaddy API error (${status}): ${JSON.stringify(data)}`;
      } else if (error instanceof Error) {
        message = error.message;
      }
      return {
        content: [{ type: "text", text: `Error: ${message}` }],
        isError: true,
      };
    }
  }
);

// Start server - SDK handles stdio transport and graceful shutdown
const transport = new StdioServerTransport();
server.connect(transport).catch((err) => {
  console.error("Failed to start MCP server:", err);
  process.exit(1);
});
