"use client";

import { use, useEffect, useState } from "react";
import { AsyncRunStatus } from "@/components/shared/async-run-status";
import { DiffView } from "@/components/resume/diff-view";
import { Button } from "@/components/ui/button";
import { useAgentRun } from "@/lib/hooks/use-agent-run";
import { useApproveVersion, useResumeDiff, useTailor } from "@/lib/api/hooks";

export default function TailorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: resumeId } = use(params);

  const [jobDescription, setJobDescription] = useState("");
  const [runId, setRunId] = useState<string | null>(null);
  const [versionId, setVersionId] = useState<string | null>(null);

  const tailor = useTailor(resumeId);
  const approve = useApproveVersion(resumeId);
  const run = useAgentRun(runId);
  const { data: diff, isLoading } = useResumeDiff(versionId);

  // The run continues server-side; this only reacts to it finishing.
  useEffect(() => {
    if (run.status !== "succeeded" || versionId) return;
    const id = run.result?.["resume_version_id"];
    if (typeof id === "string") setVersionId(id);
  }, [run.status, run.result, versionId]);

  const busy = run.status === "queued" || run.status === "running";

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 md:px-8">
      <h1 className="text-2xl font-semibold tracking-tight">Tailor your CV</h1>
      <p className="mt-2 max-w-2xl text-text-muted">
        Paste the job description. We rewrite your CV to match it using only what&apos;s
        already in your profile — then show you exactly what changed.
      </p>

      {!runId && (
        <form
          className="mt-8 space-y-4"
          onSubmit={async (event) => {
            event.preventDefault();
            const result = await tailor.mutateAsync({ job_description_raw: jobDescription });
            setRunId(result.run_id);
          }}
        >
          <label htmlFor="jd" className="block text-sm font-medium">
            Job description
          </label>
          <textarea
            id="jd"
            required
            minLength={50}
            rows={10}
            value={jobDescription}
            onChange={(event) => setJobDescription(event.target.value)}
            placeholder="Paste the full job description here…"
            className="w-full rounded-[var(--radius-base)] border border-border bg-surface p-3 text-sm"
          />
          <Button type="submit" disabled={tailor.isPending || jobDescription.length < 50}>
            {tailor.isPending ? "Starting…" : "Tailor my CV"}
          </Button>
        </form>
      )}

      {busy && (
        <div className="mt-8">
          <AsyncRunStatus run={run} />
          <p className="mt-3 text-sm text-text-subtle">
            This takes up to a minute. You can leave this page — it keeps running.
          </p>
        </div>
      )}

      {run.status === "failed" && (
        <div className="mt-8 space-y-4">
          <AsyncRunStatus run={run} />
          {/* Never a dead end: retry, fix the profile, or send the base CV. */}
          <div className="flex flex-wrap gap-3">
            <Button
              variant="secondary"
              onClick={() => {
                setRunId(null);
                setVersionId(null);
              }}
            >
              Try again
            </Button>
            <Button variant="ghost" onClick={() => (window.location.href = "/app/profile")}>
              Edit my profile
            </Button>
            <Button variant="ghost" onClick={() => (window.location.href = "/app/resumes")}>
              Use my base CV instead
            </Button>
          </div>
        </div>
      )}

      {isLoading && versionId && <p className="mt-8 text-sm text-text-muted">Loading changes…</p>}

      {diff && (
        <div className="mt-8">
          <DiffView
            diff={diff}
            approving={approve.isPending}
            onApprove={() => versionId && approve.mutate(versionId)}
          />
        </div>
      )}
    </main>
  );
}
