import { http, HttpResponse } from "msw";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

/**
 * Default handlers mirror the shapes in hirebridge-api/docs/04-api-contract.md.
 * Override per test with `server.use(...)` rather than editing this file.
 */
export const handlers = [
  http.get(`${API}/v1/me`, () =>
    HttpResponse.json({
      user_id: "user_test",
      email: "test@example.com",
      org_id: null,
      role: "candidate",
      synced: true,
    }),
  ),

  http.get(`${API}/v1/runs/:runId`, ({ params }) =>
    HttpResponse.json({
      run_id: params.runId,
      agent: "cv_tailor",
      status: "running",
      step: "validating",
      progress: 85,
      output_ref: null,
      error_code: null,
      error_message: null,
    }),
  ),

  http.get(`${API}/v1/public/jobs`, () => HttpResponse.json({ data: [], next_cursor: null })),
];

/** Problem-detail responses, for exercising the error paths. */
export const problem = (status: number, type: string, detail: string) =>
  HttpResponse.json(
    {
      type: `https://hirebridge.dev/errors/${type}`,
      title: type.replace(/-/g, " "),
      status,
      detail,
      instance: "/v1/test",
      request_id: "req_test123",
    },
    { status, headers: { "Content-Type": "application/problem+json" } },
  );
