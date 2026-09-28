"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DiffLine as DiffLineData, LineStatus, ValidatorFinding } from "@/lib/api/types";

/**
 * Status is carried by a text label, never by colour alone — an accessibility requirement
 * and a practical one: recruiters screenshot these into grayscale documents
 * (docs/04-design-system.md §2).
 */
const STATUS_LABEL: Record<LineStatus, string> = {
  unchanged: "Unchanged",
  modified: "Reworded",
  reordered: "Moved",
  removed: "Removed",
  added: "New",
};

const STATUS_STYLE: Record<LineStatus, string> = {
  unchanged: "text-text-subtle",
  modified: "text-info",
  reordered: "text-text-muted",
  removed: "text-danger",
  added: "text-warning",
};

export function DiffLine({
  line,
  findings,
  stacked,
}: {
  line: DiffLineData;
  findings: ValidatorFinding[];
  stacked: boolean;
}) {
  const [open, setOpen] = useState(false);
  const warnings = findings.filter((f) => f.line_id === line.line_id);
  const expandable = line.source_fact_ids.length > 0 || warnings.length > 0;

  return (
    <li className="border-b border-border last:border-0">
      <div className={cn("gap-4 px-4 py-3", stacked ? "flex flex-col" : "grid grid-cols-[1fr_1fr_7rem]")}>
        <p
          className={cn(
            "text-sm",
            line.status === "removed" ? "text-text-subtle line-through" : "text-text-muted",
          )}
        >
          {line.base ?? <span className="italic text-text-subtle">—</span>}
        </p>
        <p className={cn("text-sm", line.status === "removed" && "italic text-text-subtle")}>
          {line.tailored ?? <span className="italic">removed</span>}
        </p>

        <div className={cn("flex items-start gap-2", stacked && "justify-between")}>
          <span className={cn("text-xs font-medium", STATUS_STYLE[line.status])}>
            {STATUS_LABEL[line.status]}
          </span>
          {warnings.length > 0 && (
            <span className="rounded bg-warning-bg px-1.5 py-0.5 text-xs text-warning">
              Check
            </span>
          )}
          {expandable && (
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-label={open ? "Hide source" : "Show source"}
              className="text-text-subtle hover:text-text"
            >
              <ChevronDown
                size={14}
                aria-hidden
                className={cn("transition-transform", open && "rotate-180")}
              />
            </button>
          )}
        </div>
      </div>

      {open && (
        <div className="bg-surface-raised px-4 py-3 text-xs">
          {line.source_fact_ids.length > 0 && (
            <p className="text-text-muted">
              Built from your profile:{" "}
              <span className="font-mono">{line.source_fact_ids.join(", ")}</span>
            </p>
          )}
          {warnings.map((warning) => (
            <p key={warning.check} className="mt-2 text-warning">
              {warning.message}
            </p>
          ))}
        </div>
      )}
    </li>
  );
}
