"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { DiffLine } from "@/components/resume/diff-line";
import { cn } from "@/lib/utils";
import type { ResumeDiff } from "@/lib/api/types";

/**
 * The trust surface for the whole candidate product (docs/03-ux-flows.md, Flow 2).
 *
 * Two things carry the weight: the summary leads with "0 new claims added", and approve
 * stays locked until every soft warning is individually acknowledged.
 */
export function DiffView({
  diff,
  onApprove,
  approving,
}: {
  diff: ResumeDiff;
  onApprove: () => void;
  approving: boolean;
}) {
  const [stacked, setStacked] = useState(false);
  const [acknowledged, setAcknowledged] = useState<Set<string>>(new Set());

  const warnings = useMemo(
    () => diff.validator_findings.filter((f) => f.severity === "soft"),
    [diff.validator_findings],
  );
  const outstanding = warnings.filter((w) => !acknowledged.has(w.line_id));
  const failed = diff.validator_status === "failed";

  if (failed) {
    return (
      <div role="alert" className="rounded-[var(--radius-base)] bg-danger-bg p-6">
        <h2 className="font-medium text-danger">We couldn&apos;t verify this version</h2>
        <p className="mt-2 text-sm text-text-muted">
          Part of the tailored CV made claims we couldn&apos;t trace back to your profile, so
          we haven&apos;t produced a document. Nothing was sent anywhere.
        </p>
        <ul className="mt-3 space-y-1 text-sm text-text-muted">
          {diff.validator_findings
            .filter((f) => f.severity === "hard")
            .map((f) => (
              <li key={`${f.line_id}-${f.check}`}>• {f.message}</li>
            ))}
        </ul>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-[var(--radius-base)] border border-border bg-surface px-4 py-3">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
          {/* The product's core promise, made visible. */}
          <span className="font-medium text-success">
            {diff.summary.added} new claims added
          </span>
          <span className="text-text-muted">{diff.summary.modified} reworded</span>
          <span className="text-text-muted">{diff.summary.reordered} moved</span>
          <span className="text-text-muted">{diff.summary.removed} removed</span>
        </div>
        <Button variant="ghost" size="sm" onClick={() => setStacked((v) => !v)}>
          {stacked ? "Side by side" : "Stacked"}
        </Button>
      </div>

      {diff.sections.map((section) => (
        <section key={section.name} className="rounded-[var(--radius-base)] border border-border bg-surface">
          <h3 className="border-b border-border px-4 py-2 text-sm font-medium capitalize">
            {section.name}
          </h3>
          <ul>
            {section.lines.map((line) => (
              <DiffLine
                key={line.line_id}
                line={line}
                findings={diff.validator_findings}
                stacked={stacked}
              />
            ))}
          </ul>
        </section>
      ))}

      {warnings.length > 0 && (
        <div className="rounded-[var(--radius-base)] border border-border bg-warning-bg p-4">
          <h3 className="text-sm font-medium">Confirm these before sending</h3>
          <p className="mt-1 text-sm text-text-muted">
            These lines use the job description&apos;s wording for something your profile
            describes differently. Check each one is accurate.
          </p>
          <ul className="mt-3 space-y-2">
            {warnings.map((warning) => (
              <li key={`${warning.line_id}-${warning.check}`} className="flex gap-2 text-sm">
                <input
                  id={`ack-${warning.line_id}`}
                  type="checkbox"
                  className="mt-1"
                  checked={acknowledged.has(warning.line_id)}
                  onChange={(event) =>
                    setAcknowledged((prev) => {
                      const next = new Set(prev);
                      if (event.target.checked) next.add(warning.line_id);
                      else next.delete(warning.line_id);
                      return next;
                    })
                  }
                />
                <label htmlFor={`ack-${warning.line_id}`} className="text-text-muted">
                  {warning.message}
                </label>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex items-center gap-3">
        <Button onClick={onApprove} disabled={approving || outstanding.length > 0}>
          {approving ? "Approving…" : "Approve and download"}
        </Button>
        <p className={cn("text-sm", outstanding.length > 0 ? "text-warning" : "text-text-muted")}>
          {outstanding.length > 0
            ? `Confirm ${outstanding.length} highlighted line${outstanding.length === 1 ? "" : "s"} first.`
            : "This version is what the employer will receive."}
        </p>
      </div>
    </div>
  );
}
