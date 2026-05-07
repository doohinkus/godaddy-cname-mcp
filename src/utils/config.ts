import { z } from "zod";
import dotenv from "dotenv";

dotenv.config();

const configSchema = z.object({
  GODADDY_API_KEY: z.string().min(1, "GoDaddy API key is required"),
  GODADDY_API_SECRET: z.string().min(1, "GoDaddy API secret is required"),
  GODADDY_API_ENV: z.enum(["production", "ote"]).default("production"),
});

const parseResult = configSchema.safeParse(process.env);

if (!parseResult.success) {
  console.error("Configuration validation failed:");
  for (const issue of parseResult.error.issues) {
    console.error(`  - ${issue.path.join(".")}: ${issue.message}`);
  }
  process.exit(1);
}

export const config = parseResult.data;

export const BASE_URL =
  parseResult.data.GODADDY_API_ENV === "ote"
    ? "https://api.ote-godaddy.com"
    : "https://api.godaddy.com";

export const AUTH_HEADER = `sso-key ${parseResult.data.GODADDY_API_KEY}:${parseResult.data.GODADDY_API_SECRET}`;
