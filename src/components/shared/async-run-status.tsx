"use client";

import { STEP_COPY, type RunState } from "@/lib/hooks/use-agent-run";

/**
 * The single async primitive. Named steps, never a bare spinner
 * (docs/01-frontend-architecture.md §5).
 */
export function AsyncRunStatus({ run, onCancel }: { run: RunState; onCancel?: () => void }) {
  const label = run.step ? (STEP_COPY[run.step] ?? run.step) : "Queued";

  if (run.status === "failed") {
    return (
      <div role="alert" className="rounded-[var(--radius-base)] bg-danger-bg p-4 text-sm">
        <p className="font-medium text-danger">Couldn&apos;t finish</p>
        <p className="mt-1 text-text-muted">{run.error?.message ?? "Something went wrong."}</p>
      </div>
    );
  }

  return (
    <div className="rounded-[var(--radius-base)] border border-border bg-surface p-4">
      <div className="flex items-center justify-between gap-4">
        <p aria-live="polite" className="text-sm text-text">
          {label}…
        </p>
        {onCancel && (
          <button onClick={onCancel} className="text-sm text-text-subtle hover:text-text">
            Cancel
          </button>
        )}
      </div>
      <div
        role="progressbar"
        aria-valuenow={run.pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
        className="mt-3 h-1.5 overflow-hidden rounded-full bg-surface-raised"
      >
        <div
          className="h-full rounded-full bg-primary transition-[width] duration-300"
          style={{ width: `${run.pct}%` }}
        />
      </div>
    </div>
  );
}
