import { cn } from "@/lib/utils";

/**
 * Always shows the number. Tier colour is supporting information, never the message
 * (docs/04-design-system.md §2) — and an unscored applicant renders as "Not scored"
 * rather than as a zero, which would read as a judgement.
 */
export function ScoreBadge({ score, className }: { score: number | null; className?: string }) {
  if (score === null) {
    return (
      <span
        className={cn(
          "inline-flex h-9 w-14 items-center justify-center rounded-[var(--radius-base)] border border-dashed border-border text-xs text-text-subtle",
          className,
        )}
      >
        —
      </span>
    );
  }

  const tier =
    score >= 70 ? "text-score-strong" : score >= 45 ? "text-score-mid" : "text-score-weak";

  return (
    <span
      className={cn(
        "inline-flex h-9 w-14 items-center justify-center rounded-[var(--radius-base)] bg-surface-raised font-medium tabular-nums",
        tier,
        className,
      )}
      aria-label={`Match score ${Math.round(score)} out of 100`}
    >
      {Math.round(score)}
    </span>
  );
}
