import { describe, it, expect, vi, beforeEach } from "vitest";
import { addCNAMERecord, getCNAMERecord, deleteCNAMERecord } from "./godaddy.js";

vi.mock("./config.js", () => ({
  config: {
    GODADDY_API_KEY: "test-key",
    GODADDY_API_SECRET: "test-secret",
    GODADDY_API_ENV: "ote" as const,
  },
  BASE_URL: "https://api.ote-godaddy.com",
  AUTH_HEADER: "sso-key test-key:test-secret",
}));

describe("GoDaddy DNS Utilities", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe("addCNAMERecord", () => {
    it("should successfully add a CNAME record", async () => {
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve({}),
        } as Response)
      );

      const result = await addCNAMERecord("example.com", "test", "target.com", 3600);

      expect(result.success).toBe(true);
      expect(global.fetch).toHaveBeenCalledWith(
        "https://api.ote-godaddy.com/v1/domains/example.com/records",
        expect.objectContaining({
          method: "PATCH",
          headers: expect.objectContaining({
            Authorization: "sso-key test-key:test-secret",
            "Content-Type": "application/json",
          }),
          body: JSON.stringify([{ type: "CNAME", name: "test", data: "target.com", ttl: 3600 }]),
        })
      );
    });

    it("should return error when API fails", async () => {
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: false,
          status: 401,
          json: () => Promise.resolve({ message: "Unauthorized" }),
        } as Response)
      );

      const result = await addCNAMERecord("example.com", "test", "target.com");

      expect(result.success).toBe(false);
      expect(result.error).toContain("Unauthorized");
    });
  });

  describe("getCNAMERecord", () => {
    it("should fetch CNAME records", async () => {
      const mockData = [{ type: "CNAME", name: "test", data: "target.com" }];
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve(mockData),
        } as Response)
      );

      const result = await getCNAMERecord("example.com", "test");

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockData);
      expect(global.fetch).toHaveBeenCalledWith(
        "https://api.ote-godaddy.com/v1/domains/example.com/records/CNAME/test",
        expect.objectContaining({
          method: "GET",
          headers: expect.objectContaining({
            Authorization: "sso-key test-key:test-secret",
          }),
        })
      );
    });

    it("should return error when fetch fails", async () => {
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: false,
          status: 404,
          json: () => Promise.resolve({ message: "Not found" }),
        } as Response)
      );

      const result = await getCNAMERecord("example.com", "test");

      expect(result.success).toBe(false);
      expect(result.error).toContain("Not found");
    });
  });

  describe("deleteCNAMERecord", () => {
    it("should successfully delete a CNAME record", async () => {
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          status: 204,
          json: () => Promise.resolve({}),
        } as Response)
      );

      const result = await deleteCNAMERecord("example.com", "test");

      expect(result.success).toBe(true);
      expect(global.fetch).toHaveBeenCalledWith(
        "https://api.ote-godaddy.com/v1/domains/example.com/records/CNAME/test",
        expect.objectContaining({
          method: "DELETE",
          headers: expect.objectContaining({
            Authorization: "sso-key test-key:test-secret",
          }),
        })
      );
    });

    it("should return error when delete fails", async () => {
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: false,
          status: 500,
          json: () => Promise.resolve({ message: "Server error" }),
        } as Response)
      );

      const result = await deleteCNAMERecord("example.com", "test");

      expect(result.success).toBe(false);
      expect(result.error).toContain("Server error");
    });
  });
});
