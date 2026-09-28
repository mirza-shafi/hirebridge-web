import { afterEach, describe, expect, it, vi } from "vitest";
import { ApiError, apiFetch, queryKeys } from "@/lib/api/client";

afterEach(() => vi.unstubAllGlobals());

describe("apiFetch", () => {
  it("throws ApiError carrying the request id on a problem response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 422,
        statusText: "Unprocessable Entity",
        json: async () => ({
          type: "https://hirebridge.dev/errors/validation-failed",
          title: "Validation failed",
          status: 422,
          detail: "must_have_skills cannot be empty",
          instance: "/v1/jobs",
          request_id: "req_abc123",
        }),
      }),
    );

    expect.assertions(3);
    try {
      await apiFetch("/v1/jobs", { method: "POST", body: {} });
    } catch (error) {
      expect(error).toBeInstanceOf(ApiError);
      expect((error as ApiError).status).toBe(422);
      expect((error as ApiError).requestId).toBe("req_abc123");
    }
  });

  it("returns undefined for a 204", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, status: 204 }));
    await expect(apiFetch("/v1/resume-versions/abc", { method: "DELETE" })).resolves.toBeUndefined();
  });
});

describe("queryKeys", () => {
  it("scopes applicants under their job", () => {
    expect(queryKeys.applicants("job-1", { sort: "rank" })).toEqual([
      "job",
      "job-1",
      "applications",
      { sort: "rank" },
    ]);
  });
});
