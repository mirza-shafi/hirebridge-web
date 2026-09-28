"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api/client";

/**
 * Tracks a long-running agent run.
 *
 * Two rules from docs/01-frontend-architecture.md §5:
 *  - reconcile against GET /v1/runs/{id} on mount BEFORE trusting the stream, so a terminal
 *    event fired while the client was away is not missed;
 *  - the run continues server-side, so unmounting this hook must not cancel anything.
 */

export type RunStatus = "queued" | "running" | "succeeded" | "failed" | "aborted_budget";

export interface RunState {
  status: RunStatus;
  step: string | null;
  pct: number;
  result: Record<string, unknown> | null;
  error: { code: string; message: string } | null;
}

interface RunResponse {
  run_id: string;
  status: RunStatus;
  step: string | null;
  progress: number;
  output_ref: Record<string, unknown> | null;
  error_code: string | null;
  error_message: string | null;
}

const TERMINAL: ReadonlySet<RunStatus> = new Set(["succeeded", "failed", "aborted_budget"]);

export function useAgentRun(runId: string | null): RunState {
  const [state, setState] = useState<RunState>({
    status: "queued",
    step: null,
    pct: 0,
    result: null,
    error: null,
  });

  useEffect(() => {
    if (!runId) return;
    let source: EventSource | null = null;
    let cancelled = false;

    void (async () => {
      // 1. Reconcile.
      const run = await apiFetch<RunResponse>(`/v1/runs/${runId}`).catch(() => null);
      if (cancelled) return;

      if (run) {
        setState({
          status: run.status,
          step: run.step,
          pct: run.progress,
          result: run.output_ref,
          error: run.error_code
            ? { code: run.error_code, message: run.error_message ?? "" }
            : null,
        });
        if (TERMINAL.has(run.status)) return;
      }

      // 2. Stream.
      source = new EventSource(
        `${process.env.NEXT_PUBLIC_API_URL}/v1/runs/${runId}/events`,
        { withCredentials: true },
      );

      source.addEventListener("progress", (event) => {
        const data = JSON.parse((event as MessageEvent<string>).data) as {
          step: string | null;
          pct: number;
        };
        setState((prev) => ({ ...prev, status: "running", step: data.step, pct: data.pct }));
      });

      source.addEventListener("succeeded", (event) => {
        const data = JSON.parse((event as MessageEvent<string>).data) as Record<string, unknown>;
        setState((prev) => ({ ...prev, status: "succeeded", pct: 100, result: data }));
        source?.close();
      });

      source.addEventListener("failed", (event) => {
        const data = JSON.parse((event as MessageEvent<string>).data) as {
          code: string;
          message: string;
        };
        setState((prev) => ({ ...prev, status: "failed", error: data }));
        source?.close();
      });
    })();

    return () => {
      cancelled = true;
      source?.close(); // closes the stream only — server-side work continues
    };
  }, [runId]);

  return state;
}

/** Step name → user-facing copy. docs/03-ux-flows.md, "Waiting-state copy". */
export const STEP_COPY: Record<string, string> = {
  starting: "Starting",
  working: "Working",
  finishing: "Finishing up",
  reading_cv: "Reading your CV",
  extracting: "Extracting your experience",
  organizing: "Organizing your profile",
  reading_jd: "Reading the job description",
  matching: "Matching your experience",
  validating: "Checking every claim against your profile",
  scoring: "Scoring against the requirements",
  justifying: "Writing explanations",
};
