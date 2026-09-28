"use client";

import { Button } from "@/components/ui/button";

export interface RedFlag {
  text: string;
  category: string;
  explanation: string;
  suggestion: string;
  resolved: boolean;
}

/**
 * Framed as a service, not a scolding.
 *
 * Phrasing like "male candidates preferred" is common in local postings and usually
 * thoughtless rather than deliberate. The employer edits or dismisses each one — the point
 * is that they see it, not that we quietly rewrite their words
 * (docs/03-ux-flows.md, Flow 4).
 */
export function RedFlagPanel({
  flags,
  onResolve,
  resolving,
}: {
  flags: RedFlag[];
  onResolve: (index: number) => void;
  resolving: boolean;
}) {
  const unresolved = flags.filter((f) => !f.resolved);
  if (flags.length === 0) return null;

  return (
    <section
      aria-labelledby="red-flags-heading"
      className="rounded-[var(--radius-base)] border border-border bg-warning-bg p-4"
    >
      <h2 id="red-flags-heading" className="font-medium">
        {unresolved.length > 0
          ? `${unresolved.length} phrase${unresolved.length === 1 ? "" : "s"} to review`
          : "All phrases reviewed"}
      </h2>
      <p className="mt-1 text-sm text-text-muted">
        These may exclude qualified candidates, and are unlawful in some markets. Publishing
        is blocked until each one is edited or dismissed.
      </p>

      <ul className="mt-4 space-y-3">
        {flags.map((flag, index) => (
          <li
            key={`${flag.text}-${index}`}
            className="rounded-[var(--radius-base)] border border-border bg-surface p-3"
          >
            <p className="text-sm font-medium">&ldquo;{flag.text}&rdquo;</p>
            <p className="mt-1 text-sm text-text-muted">{flag.explanation}</p>
            <p className="mt-2 text-sm">
              <span className="text-text-subtle">Suggested instead: </span>
              {flag.suggestion}
            </p>
            <div className="mt-3">
              {flag.resolved ? (
                <span className="text-sm text-success">Dismissed</span>
              ) : (
                <Button
                  size="sm"
                  variant="secondary"
                  disabled={resolving}
                  onClick={() => onResolve(index)}
                >
                  Dismiss this one
                </Button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
