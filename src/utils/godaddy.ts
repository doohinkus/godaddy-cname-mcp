import { config, BASE_URL, AUTH_HEADER } from "./config.js";
import type { CNAMERecord, GoDaddyResponse } from "../types/index.js";

interface RequestOptions {
  method?: string;
  body?: unknown;
}

async function apiRequest(
  endpoint: string,
  options: RequestOptions = {}
): Promise<GoDaddyResponse> {
  const { method = "GET", body } = options;

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method,
    headers: {
      Authorization: AUTH_HEADER,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    return {
      success: false,
      error: data?.message || data?.code || `HTTP ${response.status}`,
      status: response.status,
    };
  }

  return { success: true, data };
}

export async function getCNAMERecord(
  domain: string,
  subdomain: string
): Promise<GoDaddyResponse<CNAMERecord[]>> {
  const result = await apiRequest(`/v1/domains/${domain}/records/CNAME/${subdomain}`);
  return result as GoDaddyResponse<CNAMERecord[]>;
}

export async function addCNAMERecord(
  domain: string,
  subdomain: string,
  target: string,
  ttl: number = 3600
): Promise<GoDaddyResponse> {
  return apiRequest(`/v1/domains/${domain}/records`, {
    method: "PATCH",
    body: [{ type: "CNAME", name: subdomain, data: target, ttl }],
  });
}

export async function deleteCNAMERecord(
  domain: string,
  subdomain: string
): Promise<GoDaddyResponse> {
  return apiRequest(`/v1/domains/${domain}/records/CNAME/${subdomain}`, {
    method: "DELETE",
  });
}
