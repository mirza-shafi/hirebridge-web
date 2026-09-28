"use client";

import { ScoreBadge } from "@/components/shared/score-badge";
import { EvidenceChip } from "@/components/shared/evidence-chip";
import type { ApplicantListItem, ApplicationStage } from "@/lib/api/types";

const STAGES: ApplicationStage[] = [
  "new",
  "shortlisted",
  "interview",
  "offer",
  "hired",
  "rejected",
];

export function ApplicantRow({
  item,
  onStageChange,
}: {
  item: ApplicantListItem;
  onStageChange: (stage: ApplicationStage) => void;
}) {
  const score = item.score;

  return (
    <li className="flex gap-4 border-b border-border px-4 py-4 last:border-0">
      <ScoreBadge score={score?.composite ?? null} />

      <div className="min-w-0 flex-1">
        {/* The justification sits in the row, not behind a click — a recruiter scanning
            40 rows will not open 40 panels. */}
        <p className="text-sm">
          {score?.justification ?? (
            <span className="text-text-subtle">
              Not scored yet. Run ranking to see how this candidate matches.
            </span>
          )}
        </p>

        {score && (score.matched.length > 0 || score.missing.length > 0) && (
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            {score.matched.map((match) => (
              <EvidenceChip key={`${match.requirement}-${match.fact_id}`} match={match} />
            ))}
            {score.missing.map((requirement) => (
              <span
                key={requirement}
                className="rounded-full border border-dashed border-border px-2 py-0.5 text-xs text-text-subtle"
              >
                No evidence: {requirement}
              </span>
            ))}
          </div>
        )}
      </div>

      <label className="sr-only" htmlFor={`stage-${item.application_id}`}>
        Stage
      </label>
      <select
        id={`stage-${item.application_id}`}
        value={item.stage}
        onChange={(event) => onStageChange(event.target.value as ApplicationStage)}
        className="h-9 self-start rounded-[var(--radius-base)] border border-border bg-surface px-2 text-sm"
      >
        {STAGES.map((stage) => (
          <option key={stage} value={stage}>
            {stage}
          </option>
        ))}
      </select>
    </li>
  );
}
