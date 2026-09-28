"use client";

import { use, useState } from "react";
import { ApplicantRow } from "@/components/employer/applicant-row";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { useApplicants, useChangeStage, useRankApplicants } from "@/lib/api/hooks";
import { cn } from "@/lib/utils";
import type { ApplicationStage } from "@/lib/api/types";

const STAGE_TABS: { value: ApplicationStage | undefined; label: string }[] = [
  { value: undefined, label: "All" },
  { value: "new", label: "New" },
  { value: "shortlisted", label: "Shortlisted" },
  { value: "interview", label: "Interview" },
  { value: "offer", label: "Offer" },
  { value: "rejected", label: "Rejected" },
];

export default function ApplicantsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: jobId } = use(params);

  const [sort, setSort] = useState<"rank" | "recent">("rank");
  const [stage, setStage] = useState<ApplicationStage | undefined>(undefined);

  const { data, isLoading } = useApplicants(jobId, { sort, stage });
  const rank = useRankApplicants(jobId);
  const changeStage = useChangeStage(jobId);

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 md:px-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Applicants</h1>
          <p className="mt-1 text-sm text-text-muted">
            {data ? `${data.total} applicant${data.total === 1 ? "" : "s"}` : "Loading…"}
            {data && !data.ranked && " · not yet ranked"}
          </p>
        </div>
        <Button onClick={() => rank.mutate()} disabled={rank.isPending || !data?.total}>
          {rank.isPending ? "Ranking…" : data?.ranked ? "Re-rank" : "Rank applicants"}
        </Button>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <nav aria-label="Stage" className="flex flex-wrap gap-1">
          {STAGE_TABS.map((tab) => (
            <button
              key={tab.label}
              type="button"
              onClick={() => setStage(tab.value)}
              aria-current={stage === tab.value ? "page" : undefined}
              className={cn(
                "rounded-[var(--radius-base)] px-3 py-1.5 text-sm",
                stage === tab.value
                  ? "bg-surface-raised font-medium"
                  : "text-text-muted hover:text-text",
              )}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        {/*
          Both sort options are always one click apart. A recruiter who can cheaply check
          the ranking against raw order trusts the ranking more, not less. There is no
          score filter here, and the API exposes no parameter for one.
        */}
        <div className="flex items-center gap-1 text-sm" role="group" aria-label="Sort order">
          {(["rank", "recent"] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setSort(option)}
              aria-pressed={sort === option}
              className={cn(
                "rounded-[var(--radius-base)] px-3 py-1.5",
                sort === option ? "bg-surface-raised font-medium" : "text-text-muted hover:text-text",
              )}
            >
              {option === "rank" ? "Best match" : "Most recent"}
            </button>
          ))}
        </div>
      </div>

      {isLoading && <p className="mt-8 text-sm text-text-muted">Loading applicants…</p>}

      {data && data.total === 0 && (
        <div className="mt-8">
          <EmptyState
            title="No applicants yet"
            description="Share the job link to start receiving applications. Everyone who applies will appear here."
          />
        </div>
      )}

      {data && data.total > 0 && (
        <ul className="mt-6 rounded-[var(--radius-base)] border border-border bg-surface">
          {data.data.map((item) => (
            <ApplicantRow
              key={item.application_id}
              item={item}
              onStageChange={(next) =>
                changeStage.mutate({ applicationId: item.application_id, stage: next })
              }
            />
          ))}
        </ul>
      )}
    </main>
  );
}
