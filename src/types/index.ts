export interface CNAMERecord {
  data: string;
  name: string;
  ttl: number;
  type: "CNAME";
}

export interface GoDaddyResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  status?: number;
}

export interface AddCNAMERecordInput {
  domain: string;
  subdomain: string;
  target: string;
  ttl?: number;
}

export interface DeleteCNAMERecordInput {
  domain: string;
  subdomain: string;
  confirm?: boolean;
}
