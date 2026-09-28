"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { MatchedRequirement } from "@/lib/api/types";

/**
 * A matched requirement plus the CV wording behind it.
 *
 * The feature most likely to convert a sceptical recruiter: they check two or three, find
 * them accurate, and stop checking (docs/03-ux-flows.md, Flow 4).
 */
export function EvidenceChip({ match }: { match: MatchedRequirement }) {
  const [open, setOpen] = useState(false);

  return (
    <span className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className={cn(
          "rounded-full border border-border bg-surface-raised px-2 py-0.5 text-xs",
          "hover:border-border-strong",
        )}
      >
        {match.requirement}
      </button>
      {open && (
        <span className="absolute left-0 top-full z-10 mt-1 block w-64 rounded-[var(--radius-base)] border border-border bg-surface p-2 text-xs shadow-lg">
          <span className="block text-text-muted">From their CV:</span>
          <span className="mt-1 block">{match.evidence}</span>
        </span>
      )}
    </span>
  );
}
