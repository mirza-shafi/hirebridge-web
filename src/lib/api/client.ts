/**
 * Typed fetch wrapper for the FastAPI backend.
 *
 * This app never calls an LLM provider and never holds a business rule
 * (docs/01-frontend-architecture.md §1). Everything goes through here.
 */

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

/** RFC 9457 problem details, as emitted by app/core/errors.py. */
export interface ProblemDetail {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance: string;
  request_id?: string | null;
  errors?: { field: string; code: string; message: string }[];
}

export class ApiError extends Error {
  constructor(
    readonly problem: ProblemDetail,
    readonly status: number,
  ) {
    super(problem.detail || problem.title);
    this.name = "ApiError";
  }

  /** Shown in a collapsed detail block so support messages can reference it. */
  get requestId(): string | null {
    return this.problem.request_id ?? null;
  }
}

export interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  token?: string | null;
  /** Required on any POST that costs money — see docs/04-api-contract.md §1. */
  idempotencyKey?: string;
}

export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, token, idempotencyKey, headers, ...rest } = options;

  const response = await fetch(`${BASE}${path}`, {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(idempotencyKey ? { "Idempotency-Key": idempotencyKey } : {}),
      ...headers,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  if (response.status === 204) return undefined as T;

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new ApiError(
      (payload as ProblemDetail | null) ?? {
        type: "about:blank",
        title: "Request failed",
        status: response.status,
        detail: response.statusText,
        instance: path,
      },
      response.status,
    );
  }

  return payload as T;
}

/** Structured query keys — docs/01-frontend-architecture.md §4. */
export const queryKeys = {
  me: () => ["me"] as const,
  run: (runId: string) => ["run", runId] as const,
  jobs: (filters?: Record<string, unknown>) => ["jobs", filters ?? {}] as const,
  job: (jobId: string) => ["job", jobId] as const,
  applicants: (jobId: string, params?: Record<string, unknown>) =>
    ["job", jobId, "applications", params ?? {}] as const,
  resumes: () => ["resumes"] as const,
  resumeVersion: (id: string) => ["resume-version", id] as const,
  interviews: () => ["interviews"] as const,
} as const;
